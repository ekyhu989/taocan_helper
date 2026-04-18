#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能采购助手 - 测试数据清洗器
用于清洗和验证测试数据
"""

import json
import re
from typing import Any, Dict, List, Tuple, Optional


class DataCleaner:
    """数据清洗器"""

    def __init__(self):
        self.errors = []
        self.warnings = []

    def clean_user_input(self, data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str], List[str]]:
        """
        清洗用户输入数据

        :param data: 原始用户输入数据
        :return: (清洗后的数据, 错误列表, 警告列表)
        """
        self.errors = []
        self.warnings = []
        cleaned = data.copy()

        # 必填项校验
        self._validate_required_fields(cleaned)

        # 数据类型清洗
        self._clean_numeric_fields(cleaned)

        # 字符串清洗
        self._clean_string_fields(cleaned)

        # 枚举值校验
        self._validate_enum_values(cleaned)

        # 逻辑一致性校验
        self._validate_logic_consistency(cleaned)

        return cleaned, self.errors, self.warnings

    def _validate_required_fields(self, data: Dict[str, Any]):
        """校验必填项"""
        required_fields = ['scene', 'headCount', 'totalBudget']

        for field in required_fields:
            if field not in data or data[field] in [None, '', 0]:
                self.errors.append(f'必填项缺失或无效: {field}')

    def _clean_numeric_fields(self, data: Dict[str, Any]):
        """清洗数值字段"""
        # headCount 必须是正整数
        if 'headCount' in data:
            try:
                hc = int(data['headCount'])
                if hc <= 0:
                    self.errors.append('人数必须大于0')
                else:
                    data['headCount'] = hc
            except (ValueError, TypeError):
                self.errors.append('人数必须是整数')

        # totalBudget 必须是正数
        if 'totalBudget' in data:
            try:
                tb = float(data['totalBudget'])
                if tb <= 0:
                    self.errors.append('总预算必须大于0')
                else:
                    data['totalBudget'] = round(tb, 2)
            except (ValueError, TypeError):
                self.errors.append('总预算必须是数字')

    def _clean_string_fields(self, data: Dict[str, Any]):
        """清洗字符串字段"""
        string_fields = ['unitName', 'fundSource', 'department', 'applicant', 'category']

        for field in string_fields:
            if field in data and isinstance(data[field], str):
                # 去除首尾空白
                cleaned = data[field].strip()
                # 移除特殊字符（保留中文、字母、数字、基本标点）
                cleaned = re.sub(r'[^\w\s\u4e00-\u9fff，。、；：""''（）【】]', '', cleaned)
                data[field] = cleaned

                if not cleaned:
                    self.warnings.append(f'{field} 为空字符串')

    def _validate_enum_values(self, data: Dict[str, Any]):
        """校验枚举值"""
        # scene 校验
        valid_scenes = ['holiday', 'activity', 'care']
        if 'scene' in data and data['scene'] not in valid_scenes:
            self.errors.append(f'无效的场景值: {data["scene"]}，必须是 {valid_scenes} 之一')

        # budgetMode 校验
        valid_modes = ['per_capita', 'total_control']
        if 'budgetMode' in data and data['budgetMode'] not in valid_modes:
            self.warnings.append(f'预算模式无效: {data["budgetMode"]}，使用默认值 per_capita')
            data['budgetMode'] = 'per_capita'

        # category 校验
        valid_categories = ['食品', '日用品', '文体用品', '其它节日礼品']
        if 'category' in data and data['category'] not in valid_categories:
            self.warnings.append(f'品类无效: {data["category"]}，使用默认值 食品')
            data['category'] = '食品'

    def _validate_logic_consistency(self, data: Dict[str, Any]):
        """校验逻辑一致性"""
        # 校验人均预算合理性
        if 'headCount' in data and 'totalBudget' in data:
            try:
                hc = int(data['headCount'])
                tb = float(data['totalBudget'])
                if hc > 0 and tb > 0:
                    per_capita = tb / hc
                    if per_capita > 5000:
                        self.warnings.append(f'人均预算过高: {per_capita:.2f}元，请确认是否正确')
                    if per_capita < 10:
                        self.warnings.append(f'人均预算过低: {per_capita:.2f}元，请确认是否正确')
            except (ValueError, TypeError):
                pass

    def clean_purchase_items(self, items: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[str], List[str]]:
        """
        清洗采购品单数据

        :param items: 原始品单数据
        :return: (清洗后的数据, 错误列表, 警告列表)
        """
        self.errors = []
        self.warnings = []
        cleaned_items = []

        for idx, item in enumerate(items):
            cleaned_item = self._clean_single_item(item, idx)
            if cleaned_item:
                cleaned_items.append(cleaned_item)

        return cleaned_items, self.errors, self.warnings

    def _clean_single_item(self, item: Dict[str, Any], index: int) -> Optional[Dict[str, Any]]:
        """清洗单个品单项"""
        try:
            cleaned = item.copy()

            # 校验product
            if 'product' not in cleaned:
                self.errors.append(f'品单项 {index + 1} 缺少 product 信息')
                return None

            product = cleaned['product']
            required_product_fields = ['id', 'name', 'price']
            for field in required_product_fields:
                if field not in product:
                    self.errors.append(f'品单项 {index + 1} 的 product 缺少 {field}')

            # 清洗数量
            if 'quantity' in cleaned:
                try:
                    qty = int(cleaned['quantity'])
                    if qty <= 0:
                        self.errors.append(f'品单项 {index + 1} 数量必须大于0')
                        return None
                    cleaned['quantity'] = qty
                except (ValueError, TypeError):
                    self.errors.append(f'品单项 {index + 1} 数量必须是整数')
                    return None
            else:
                self.errors.append(f'品单项 {index + 1} 缺少 quantity')
                return None

            # 重新计算小计（确保准确性）
            if 'product' in cleaned and 'quantity' in cleaned:
                price = float(product.get('price', 0))
                qty = cleaned['quantity']
                calculated_subtotal = round(price * qty, 2)

                if 'subtotal' in cleaned:
                    original_subtotal = float(cleaned['subtotal'])
                    if abs(original_subtotal - calculated_subtotal) > 0.01:
                        self.warnings.append(
                            f'品单项 {index + 1} 小计与计算值不符，已修正: {original_subtotal} -> {calculated_subtotal}'
                        )

                cleaned['subtotal'] = calculated_subtotal

            return cleaned

        except Exception as e:
            self.errors.append(f'清洗品单项 {index + 1} 时出错: {str(e)}')
            return None

    def validate_compliance_data(self, data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str], List[str]]:
        """
        校验合规测算数据

        :param data: 合规测算数据
        :return: (清洗后的数据, 错误列表, 警告列表)
        """
        self.errors = []
        self.warnings = []
        cleaned = data.copy()

        required_fields = ['annualBudget', 'completedAmount']
        for field in required_fields:
            if field not in cleaned:
                self.errors.append(f'缺少必填字段: {field}')
            else:
                try:
                    val = float(cleaned[field])
                    if val < 0:
                        self.errors.append(f'{field} 不能为负数')
                    else:
                        cleaned[field] = round(val, 2)
                except (ValueError, TypeError):
                    self.errors.append(f'{field} 必须是数字')

        if 'annualBudget' in cleaned and 'completedAmount' in cleaned:
            annual = float(cleaned['annualBudget'])
            completed = float(cleaned['completedAmount'])
            if completed > annual:
                self.warnings.append('已完成金额超过年度总预算')

        return cleaned, self.errors, self.warnings

    def load_and_clean_json(self, file_path: str, data_type: str = 'user_input') -> Tuple[Any, List[str], List[str]]:
        """
        从JSON文件加载并清洗数据

        :param file_path: JSON文件路径
        :param data_type: 数据类型 ('user_input', 'purchase_items', 'compliance')
        :return: (清洗后的数据, 错误列表, 警告列表)
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if data_type == 'user_input':
                return self.clean_user_input(data)
            elif data_type == 'purchase_items':
                return self.clean_purchase_items(data)
            elif data_type == 'compliance':
                return self.validate_compliance_data(data)
            else:
                return data, [], [f'未知的数据类型: {data_type}']

        except FileNotFoundError:
            return None, [f'文件不存在: {file_path}'], []
        except json.JSONDecodeError as e:
            return None, [f'JSON解析错误: {str(e)}'], []
        except Exception as e:
            return None, [f'加载文件时出错: {str(e)}'], []


def demo():
    """演示函数"""
    print("=" * 60)
    print("智能采购助手 - 数据清洗器演示")
    print("=" * 60)

    cleaner = DataCleaner()

    # 演示1：清洗用户输入
    print("\n【演示1】清洗用户输入数据")
    print("-" * 60)

    test_input = {
        'unitName': '  XX市财政局  ',
        'scene': 'holiday',
        'headCount': '50',
        'totalBudget': '25000.567',
        'fundSource': '工会经费',
        'budgetMode': 'invalid_mode',
        'category': '食品'
    }

    print("原始数据:")
    print(json.dumps(test_input, ensure_ascii=False, indent=2))

    cleaned, errors, warnings = cleaner.clean_user_input(test_input)

    print("\n清洗后数据:")
    print(json.dumps(cleaned, ensure_ascii=False, indent=2))

    if errors:
        print("\n错误:")
        for e in errors:
            print(f"  - {e}")

    if warnings:
        print("\n警告:")
        for w in warnings:
            print(f"  - {w}")

    # 演示2：清洗品单项
    print("\n\n【演示2】清洗采购品单项")
    print("-" * 60)

    test_items = [
        {
            'product': {'id': 'p001', 'name': '精选月饼礼盒', 'price': 89.9},
            'quantity': '10',
            'subtotal': 899
        },
        {
            'product': {'id': 'p002', 'name': '坚果大礼包', 'price': 69.5},
            'quantity': 10,
            'subtotal': 700  # 故意设置错误
        }
    ]

    cleaned_items, errors, warnings = cleaner.clean_purchase_items(test_items)

    print("清洗后品单项:")
    print(json.dumps(cleaned_items, ensure_ascii=False, indent=2))

    if warnings:
        print("\n警告:")
        for w in warnings:
            print(f"  - {w}")


if __name__ == '__main__':
    demo()
