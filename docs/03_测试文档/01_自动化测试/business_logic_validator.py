#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能采购助手 - 业务逻辑校验模块
职责：
1. 832平台占比计算校验
2. 人均预算校验（含新疆政策阈值2000元）
3. 总价误差≤±5%校验
4. 合规阈值判断
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import json


@dataclass
class Product:
    """商品数据结构"""
    id: str
    name: str
    price: float
    is832: bool
    category_tag: str


@dataclass
class PurchaseItem:
    """采购品单项"""
    product: Product
    quantity: int
    subtotal: float


@dataclass
class BudgetValidationResult:
    """预算校验结果"""
    is_valid: bool
    per_capita: float
    is_over_threshold: bool
    is_over_xinjiang_threshold: bool
    warn_message: Optional[str]
    error_message: Optional[str]


@dataclass
class ComplianceCheckResult:
    """合规校验结果"""
    platform832_rate: float
    is_832_compliant: bool
    total_amount: float
    budget_usage_rate: float
    is_price_error_acceptable: bool
    price_error_percent: float


class BusinessLogicValidator:
    """业务逻辑校验器"""

    # 新疆政策人均预算阈值
    XINJIANG_THRESHOLD = 2000.0
    # 普通预警阈值
    NORMAL_WARN_THRESHOLD = 500.0
    # 832平台合规占比阈值
    PLATFORM832_COMPLIANCE_RATE = 0.3  # 30%
    # 总价误差允许范围
    MAX_PRICE_ERROR_PERCENT = 0.05  # ±5%

    def __init__(self, products_json_path: str = None):
        """初始化校验器"""
        self.products = []
        if products_json_path:
            self._load_products(products_json_path)

    def _load_products(self, json_path: str):
        """加载商品库"""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.products = [
                Product(
                    id=p['id'],
                    name=p['name'],
                    price=p['price'],
                    is832=p.get('is832', False),
                    category_tag=p.get('category_tag', '食品')
                )
                for p in data
            ]
        except Exception as e:
            print(f"加载商品库失败: {e}")

    def validate_budget(
        self,
        total_budget: float,
        head_count: int
    ) -> BudgetValidationResult:
        """
        校验预算合法性（含新疆政策合规性）

        【计算过程】
        1. 检查总预算和人数是否为正数
        2. 计算人均预算 = 总预算 / 人数
        3. 检查是否超过普通阈值500元
        4. 检查是否超过新疆政策阈值2000元

        :param total_budget: 总预算（元）
        :param head_count: 人数
        :return: BudgetValidationResult
        """
        # 硬校验
        if not isinstance(total_budget, (int, float)) or total_budget <= 0:
            return BudgetValidationResult(
                is_valid=False,
                per_capita=0,
                is_over_threshold=False,
                is_over_xinjiang_threshold=False,
                warn_message=None,
                error_message='总预算必须为大于零的数字'
            )

        if not isinstance(head_count, int) or head_count <= 0:
            return BudgetValidationResult(
                is_valid=False,
                per_capita=0,
                is_over_threshold=False,
                is_over_xinjiang_threshold=False,
                warn_message=None,
                error_message='人数必须为大于零的整数'
            )

        # 核心计算
        per_capita = round(total_budget / head_count, 2)
        is_over_normal = per_capita > self.NORMAL_WARN_THRESHOLD
        is_over_xinjiang = per_capita > self.XINJIANG_THRESHOLD

        # 生成提示文案
        warn_message = None
        if is_over_xinjiang:
            warn_message = f'橙色警告：人均预算{per_capita}元＞2000元，建议832平台采购比例≥30%'
        elif is_over_normal:
            warn_message = f'黄色提醒：人均预算{per_capita}元较高，建议按单位规定核实调整'

        return BudgetValidationResult(
            is_valid=True,
            per_capita=per_capita,
            is_over_threshold=is_over_normal,
            is_over_xinjiang_threshold=is_over_xinjiang,
            warn_message=warn_message,
            error_message=None
        )

    def calculate_platform832_compliance(
        self,
        items: List[PurchaseItem]
    ) -> Tuple[float, float]:
        """
        计算832平台商品占比

        【计算过程】
        1. 统计所有商品总金额 = sum(item.subtotal for item in items)
        2. 统计832商品金额 = sum(item.subtotal for item in items if item.product.is832)
        3. 832占比 = 832商品金额 / 总金额（保留4位小数）

        :param items: 采购品单列表
        :return: (832商品金额, 832商品占比)
        """
        if not items:
            return 0.0, 0.0

        total_amount = sum(item.subtotal for item in items)
        platform832_amount = sum(
            item.subtotal for item in items if item.product.is832
        )

        if total_amount == 0:
            return 0.0, 0.0

        platform832_rate = round(platform832_amount / total_amount, 4)
        return platform832_amount, platform832_rate

    def check_price_error(
        self,
        actual_amount: float,
        expected_budget: float
    ) -> Tuple[bool, float]:
        """
        校验总价误差是否≤±5%

        【计算过程】
        1. 计算绝对误差 = |实际金额 - 预期预算|
        2. 计算误差率 = 绝对误差 / 预期预算
        3. 判断误差率是否≤5%

        :param actual_amount: 实际生成的总金额
        :param expected_budget: 预期预算
        :return: (是否达标, 误差率)
        """
        if expected_budget <= 0:
            return False, 0.0

        absolute_error = abs(actual_amount - expected_budget)
        error_percent = round(absolute_error / expected_budget, 4)
        is_acceptable = error_percent <= self.MAX_PRICE_ERROR_PERCENT

        return is_acceptable, error_percent

    def check_compliance(
        self,
        items: List[PurchaseItem],
        expected_budget: float
    ) -> ComplianceCheckResult:
        """
        综合合规性检查

        :param items: 采购品单列表
        :param expected_budget: 预期预算
        :return: ComplianceCheckResult
        """
        # 计算总金额
        total_amount = sum(item.subtotal for item in items)

        # 计算832占比
        platform832_amount, platform832_rate = self.calculate_platform832_compliance(items)
        is_832_compliant = platform832_rate >= self.PLATFORM832_COMPLIANCE_RATE

        # 计算预算使用率
        budget_usage_rate = round(total_amount / expected_budget, 4) if expected_budget > 0 else 0

        # 检查价格误差
        is_price_error_acceptable, price_error_percent = self.check_price_error(
            total_amount, expected_budget
        )

        return ComplianceCheckResult(
            platform832_rate=platform832_rate,
            is_832_compliant=is_832_compliant,
            total_amount=total_amount,
            budget_usage_rate=budget_usage_rate,
            is_price_error_acceptable=is_price_error_acceptable,
            price_error_percent=price_error_percent
        )

    def generate_test_items(
        self,
        product_indices: List[int],
        quantities: List[int]
    ) -> List[PurchaseItem]:
        """
        生成测试用的采购品单项

        :param product_indices: 商品索引列表（对应self.products）
        :param quantities: 数量列表
        :return: PurchaseItem列表
        """
        items = []
        for idx, qty in zip(product_indices, quantities):
            if 0 <= idx < len(self.products):
                product = self.products[idx]
                subtotal = round(product.price * qty, 2)
                items.append(PurchaseItem(
                    product=product,
                    quantity=qty,
                    subtotal=subtotal
                ))
        return items


def demo():
    """演示函数"""
    validator = BusinessLogicValidator('../../src/data/products.json')

    print("=" * 60)
    print("智能采购助手 - 业务逻辑校验演示")
    print("=" * 60)

    # 演示1：预算校验
    print("\n【演示1】预算校验")
    print("-" * 60)
    test_cases = [
        (5000, 10, "普通场景"),
        (25000, 10, "新疆政策场景（人均2500元）"),
    ]

    for budget, count, desc in test_cases:
        result = validator.validate_budget(budget, count)
        print(f"\n{desc}: 总预算={budget}元, 人数={count}人")
        print(f"  人均预算: {result.per_capita}元")
        print(f"  超过500元: {result.is_over_threshold}")
        print(f"  超过2000元: {result.is_over_xinjiang_threshold}")
        if result.warn_message:
            print(f"  提示: {result.warn_message}")

    # 演示2：832占比计算
    print("\n\n【演示2】832平台占比计算")
    print("-" * 60)

    # 生成测试品单（前6个商品，各10份）
    if validator.products:
        test_items = validator.generate_test_items([0, 1, 2, 3, 4, 5], [10, 10, 10, 10, 10, 10])

        for item in test_items:
            is832_tag = "[832]" if item.product.is832 else "     "
            print(f"  {is832_tag} {item.product.name} x{item.quantity} = {item.subtotal}元")

        platform832_amount, platform832_rate = validator.calculate_platform832_compliance(test_items)
        print(f"\n  832商品金额: {platform832_amount}元")
        print(f"  832商品占比: {platform832_rate * 100:.2f}%")
        print(f"  是否≥30%: {'是' if platform832_rate >= 0.3 else '否'}")

        # 演示3：总价误差校验
        print("\n\n【演示3】总价误差校验")
        print("-" * 60)
        total_amount = sum(item.subtotal for item in test_items)
        expected_budget = 5000

        is_acceptable, error_percent = validator.check_price_error(total_amount, expected_budget)
        print(f"  预期预算: {expected_budget}元")
        print(f"  实际金额: {total_amount}元")
        print(f"  误差率: {error_percent * 100:.2f}%")
        print(f"  是否≤±5%: {'是' if is_acceptable else '否'}")


if __name__ == '__main__':
    demo()
