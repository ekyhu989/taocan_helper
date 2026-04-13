#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能采购助手 - 测试数据生成器
生成各种测试场景数据
"""

import json
import random
from typing import List, Dict, Any
from datetime import datetime

try:
    from faker import Faker
    FAKER_AVAILABLE = True
except ImportError:
    FAKER_AVAILABLE = False


class TestDataGenerator:
    """测试数据生成器"""

    def __init__(self, products_json_path: str = None):
        self.fake = None
        if FAKER_AVAILABLE:
            self.fake = Faker('zh_CN')
        self.products = []
        if products_json_path:
            self._load_products(products_json_path)

    def _load_products(self, json_path: str):
        """加载商品库"""
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                self.products = json.load(f)
        except Exception as e:
            print(f"加载商品库失败: {e}")

    def generate_user_input(
        self,
        scene: str = 'holiday',
        head_count: int = None,
        total_budget: float = None,
        budget_mode: str = 'per_capita'
    ) -> Dict[str, Any]:
        """
        生成用户基础信息录入数据

        :param scene: 采购场景 ('holiday', 'activity', 'care')
        :param head_count: 人数（随机生成如果为None）
        :param total_budget: 总预算（随机生成如果为None）
        :param budget_mode: 预算模式
        :return: 用户输入字典
        """
        if head_count is None:
            head_count = random.randint(5, 200)

        if total_budget is None:
            total_budget = round(head_count * random.uniform(100, 500), 2)

        scenes = ['holiday', 'activity', 'care']
        scene = scene if scene in scenes else random.choice(scenes)

        unit_names = [
            'XX市财政局', 'XX区教育局', 'XX街道办事处',
            'XX国有企业', 'XX中心学校', 'XX卫生院'
        ]

        festival_names = ['春节', '端午节', '中秋节', '劳动节', '国庆节']
        applicant_names = ['张三', '李四', '王五', '赵六', '陈七', '刘八']

        return {
            'unitName': random.choice(unit_names),
            'scene': scene,
            'headCount': head_count,
            'totalBudget': total_budget,
            'fundSource': '工会经费',
            'department': '办公室',
            'applicant': self.fake.name() if self.fake else random.choice(applicant_names),
            'year': datetime.now().year,
            'festival': random.choice(festival_names) if scene == 'holiday' else None,
            'budgetMode': budget_mode,
            'category': random.choice(['食品', '日用品', '文体用品'])
        }

    def generate_normal_scenario(self) -> Dict[str, Any]:
        """
        生成正常场景测试数据
        人数: 10-50人
        人均预算: 100-500元
        """
        head_count = random.randint(10, 50)
        per_capita = random.uniform(100, 500)
        total_budget = round(head_count * per_capita, 2)

        return self.generate_user_input(
            head_count=head_count,
            total_budget=total_budget
        )

    def generate_xinjiang_policy_scenario(self) -> Dict[str, Any]:
        """
        生成新疆政策场景测试数据
        人均预算 > 2000元
        """
        head_count = random.randint(5, 20)
        per_capita = random.uniform(2001, 3000)
        total_budget = round(head_count * per_capita, 2)

        return self.generate_user_input(
            head_count=head_count,
            total_budget=total_budget
        )

    def generate_low_832_ratio_scenario(self) -> Dict[str, Any]:
        """
        生成832占比不足场景测试数据
        用于测试一键优化功能
        """
        return self.generate_user_input(
            head_count=random.randint(10, 50),
            total_budget=round(random.randint(10, 50) * random.uniform(200, 400), 2)
        )

    def generate_high_832_ratio_scenario(self) -> Dict[str, Any]:
        """
        生成832占比达标场景测试数据
        """
        return self.generate_user_input(
            head_count=random.randint(10, 50),
            total_budget=round(random.randint(10, 50) * random.uniform(200, 400), 2)
        )

    def generate_empty_required_fields(self) -> Dict[str, Any]:
        """
        生成必填项为空的测试数据
        """
        return {
            'unitName': '测试单位',
            'scene': 'holiday',
            'headCount': 0,
            'totalBudget': 0,
            'fundSource': '',
            'budgetMode': 'per_capita'
        }

    def generate_performance_test_data(self) -> Dict[str, Any]:
        """
        生成性能测试大数据量数据
        人数: 1000人
        总预算: 200万
        """
        return self.generate_user_input(
            head_count=1000,
            total_budget=2000000.0
        )

    def generate_purchase_items(
        self,
        count: int = 6,
        platform832_ratio: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        生成采购品单项测试数据

        :param count: 商品数量
        :param platform832_ratio: 832商品占比目标
        :return: 品单项列表
        """
        if not self.products:
            return []

        # 分离832和非832商品
        products_832 = [p for p in self.products if p.get('is832', False)]
        products_non832 = [p for p in self.products if not p.get('is832', False)]

        items = []

        # 计算需要的832商品数量
        count_832 = int(count * platform832_ratio)
        count_non832 = count - count_832

        # 随机选择商品
        selected_832 = random.sample(products_832, min(count_832, len(products_832))) if products_832 else []
        selected_non832 = random.sample(products_non832, min(count_non832, len(products_non832))) if products_non832 else []

        selected_products = selected_832 + selected_non832
        random.shuffle(selected_products)

        # 生成品单项
        for product in selected_products[:count]:
            quantity = random.randint(5, 50)
            subtotal = round(product['price'] * quantity, 2)
            items.append({
                'product': product,
                'quantity': quantity,
                'subtotal': subtotal
            })

        return items

    def generate_all_test_scenarios(self) -> Dict[str, Any]:
        """
        生成所有测试场景数据包
        """
        return {
            'normal': self.generate_normal_scenario(),
            'xinjiang_policy': self.generate_xinjiang_policy_scenario(),
            'low_832': self.generate_low_832_ratio_scenario(),
            'high_832': self.generate_high_832_ratio_scenario(),
            'empty_fields': self.generate_empty_required_fields(),
            'performance': self.generate_performance_test_data()
        }

    def save_to_json(self, data: Any, filename: str):
        """保存数据到JSON文件"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    """演示函数"""
    print("=" * 60)
    print("智能采购助手 - 测试数据生成器演示")
    print("=" * 60)

    generator = TestDataGenerator('../../src/data/products.json')

    print("\n1. 生成正常场景数据:")
    normal_data = generator.generate_normal_scenario()
    print(f"   人数: {normal_data['headCount']}")
    print(f"   总预算: {normal_data['totalBudget']}元")
    print(f"   人均: {round(normal_data['totalBudget'] / normal_data['headCount'], 2)}元")

    print("\n2. 生成新疆政策场景数据:")
    xinjiang_data = generator.generate_xinjiang_policy_scenario()
    print(f"   人数: {xinjiang_data['headCount']}")
    print(f"   总预算: {xinjiang_data['totalBudget']}元")
    print(f"   人均: {round(xinjiang_data['totalBudget'] / xinjiang_data['headCount'], 2)}元")

    print("\n3. 生成采购品单项:")
    if generator.products:
        items = generator.generate_purchase_items(count=6, platform832_ratio=0.5)
        for idx, item in enumerate(items, 1):
            is832 = "[832]" if item['product'].get('is832') else "     "
            print(f"   {idx}. {is832} {item['product']['name']} x{item['quantity']} = {item['subtotal']}元")

    print("\n4. 保存所有测试场景到 test_scenarios.json")
    all_scenarios = generator.generate_all_test_scenarios()
    generator.save_to_json(all_scenarios, 'test_scenarios.json')

    print("\n完成!")


if __name__ == '__main__':
    main()
