/**
 * 合规计算模块单元测试 (V2.0-003)
 * 测试覆盖：
 * - 832占比计算（金额/数量）
 * - 预算分析
 * - 年度进度计算
 * - 边界情况处理
 */

import {
  calculate832Ratio,
  analyzeBudget,
  calculateAnnualProgress,
  formatPercentage,
  formatCurrency,
  type ComplianceItem
} from '../../utils/compliance/calculator';

// 测试用商品数据
const mockComplianceItems: ComplianceItem[] = [
  { id: '1', name: '832大米', price: 120, quantity: 100, is832Platform: true, category: '食品' },
  { id: '2', name: '832花生油', price: 85, quantity: 100, is832Platform: true, category: '食品' },
  { id: '3', name: '普通牛奶', price: 68, quantity: 100, is832Platform: false, category: '食品' },
  { id: '4', name: '普通水果', price: 100, quantity: 100, is832Platform: false, category: '食品' }
];

describe('合规计算模块', () => {
  
  describe('calculate832Ratio 832占比计算', () => {
    
    it('应正确计算按金额的832占比', () => {
      const result = calculate832Ratio(mockComplianceItems, 'amount');
      
      // 832商品总金额: (120 + 85) * 100 = 20500
      // 普通商品总金额: (68 + 100) * 100 = 16800
      // 总金额: 20500 + 16800 = 37300
      // 832占比: 20500 / 37300 ≈ 54.96%
      expect(result.amountRatio).toBeGreaterThan(50);
      expect(result.amountRatio).toBeLessThan(60);
    });

    it('应正确计算按数量的832占比', () => {
      const result = calculate832Ratio(mockComplianceItems, 'quantity');
      
      // 832商品数量: 100 + 100 = 200
      // 总数量: 400
      // 832占比: 200 / 400 = 50%
      expect(result.quantityRatio).toBe(50);
    });

    it('空数据时所有占比应为0', () => {
      const result = calculate832Ratio([], 'amount');
      
      expect(result.amountRatio).toBe(0);
      expect(result.quantityRatio).toBe(0);
      expect(result.total832Amount).toBe(0);
      expect(result.total832Quantity).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.totalQuantity).toBe(0);
    });

    it('全部都是832平台商品时占比应为100%', () => {
      const all832Items = mockComplianceItems.map(item => ({
        ...item,
        is832Platform: true
      }));
      
      const result = calculate832Ratio(all832Items, 'amount');
      
      expect(result.amountRatio).toBe(100);
      expect(result.quantityRatio).toBe(100);
    });

    it('全部都不是832平台商品时占比应为0%', () => {
      const none832Items = mockComplianceItems.map(item => ({
        ...item,
        is832Platform: false
      }));
      
      const result = calculate832Ratio(none832Items, 'amount');
      
      expect(result.amountRatio).toBe(0);
      expect(result.quantityRatio).toBe(0);
    });

    it('832占比刚好30%的边界情况', () => {
      const items: ComplianceItem[] = [
        { id: '1', name: '832商品', price: 30, quantity: 1, is832Platform: true },
        { id: '2', name: '普通商品', price: 70, quantity: 1, is832Platform: false }
      ];
      
      const result = calculate832Ratio(items, 'amount');
      
      expect(result.amountRatio).toBe(30);
    });

    it('金额应保留2位小数精度', () => {
      const items: ComplianceItem[] = [
        { id: '1', name: '832商品', price: 123.456, quantity: 2, is832Platform: true }
      ];
      
      const result = calculate832Ratio(items, 'amount');
      
      expect(result.total832Amount.toFixed(2)).toBe(result.total832Amount.toString());
      expect(result.totalAmount.toFixed(2)).toBe(result.totalAmount.toString());
    });
  });

  describe('analyzeBudget 预算分析', () => {
    
    it('人均预算≤500元时不应有预警', () => {
      const result = analyzeBudget(50000, 100);
      
      expect(result.perCapitaBudget).toBe(500);
      expect(result.warningLevel).toBe('none');
      expect(result.warningMessage).toBeUndefined();
    });

    it('人均预算501-1000元时应为黄色预警', () => {
      const result = analyzeBudget(60000, 100);
      
      expect(result.perCapitaBudget).toBe(600);
      expect(result.warningLevel).toBe('yellow');
      expect(result.warningMessage).toContain('略高于一般标准');
    });

    it('人均预算1001-2000元时应为橙色预警', () => {
      const result = analyzeBudget(150000, 100);
      
      expect(result.perCapitaBudget).toBe(1500);
      expect(result.warningLevel).toBe('orange');
      expect(result.warningMessage).toContain('较高');
    });

    it('人均预算>2000元时应为红色预警', () => {
      const result = analyzeBudget(250000, 100);
      
      expect(result.perCapitaBudget).toBe(2500);
      expect(result.warningLevel).toBe('red');
      expect(result.warningMessage).toContain('严重超出年度上限');
    });

    it('边界值500元不应有预警', () => {
      const result = analyzeBudget(50000, 100);
      
      expect(result.perCapitaBudget).toBe(500);
      expect(result.warningLevel).toBe('none');
    });

    it('边界值1000元应为黄色预警', () => {
      const result = analyzeBudget(100000, 100);
      
      expect(result.perCapitaBudget).toBe(1000);
      expect(result.warningLevel).toBe('yellow');
    });

    it('边界值2000元应为橙色预警', () => {
      const result = analyzeBudget(200000, 100);
      
      expect(result.perCapitaBudget).toBe(2000);
      expect(result.warningLevel).toBe('orange');
    });

    it('无效预算参数应返回错误状态', () => {
      const result = analyzeBudget(0, 100);
      
      expect(result.warningLevel).toBe('red');
      expect(result.warningMessage).toContain('参数无效');
    });

    it('无效人数参数应返回错误状态', () => {
      const result = analyzeBudget(50000, 0);
      
      expect(result.warningLevel).toBe('red');
      expect(result.warningMessage).toContain('参数无效');
    });

    it('人均预算应保留2位小数', () => {
      const result = analyzeBudget(50000, 3);
      
      const perCapita = result.perCapitaBudget;
      expect(perCapita.toFixed(2)).toBe(perCapita.toString());
    });
  });

  describe('calculateAnnualProgress 年度进度计算', () => {
    
    it('完成率<70%时不应有预警', () => {
      const result = calculateAnnualProgress(50000, 100000);
      
      expect(result.completionRate).toBe(50);
      expect(result.warningLevel).toBe('none');
      expect(result.progressMessage).toContain('✅');
    });

    it('完成率70-89%时应为黄色预警', () => {
      const result = calculateAnnualProgress(75000, 100000);
      
      expect(result.completionRate).toBe(75);
      expect(result.warningLevel).toBe('yellow');
      expect(result.progressMessage).toContain('💡');
    });

    it('完成率90-99%时应为橙色预警', () => {
      const result = calculateAnnualProgress(95000, 100000);
      
      expect(result.completionRate).toBe(95);
      expect(result.warningLevel).toBe('orange');
      expect(result.progressMessage).toContain('⚠️');
    });

    it('完成率≥100%时应为红色预警', () => {
      const result = calculateAnnualProgress(105000, 100000);
      
      expect(result.completionRate).toBe(105);
      expect(result.warningLevel).toBe('red');
      expect(result.progressMessage).toContain('⛔');
    });

    it('边界值70%应为黄色预警', () => {
      const result = calculateAnnualProgress(70000, 100000);
      
      expect(result.completionRate).toBe(70);
      expect(result.warningLevel).toBe('yellow');
    });

    it('边界值90%应为橙色预警', () => {
      const result = calculateAnnualProgress(90000, 100000);
      
      expect(result.completionRate).toBe(90);
      expect(result.warningLevel).toBe('orange');
    });

    it('边界值100%应为红色预警', () => {
      const result = calculateAnnualProgress(100000, 100000);
      
      expect(result.completionRate).toBe(100);
      expect(result.warningLevel).toBe('red');
    });

    it('剩余额度计算应正确', () => {
      const result = calculateAnnualProgress(75000, 100000);
      
      expect(result.remainingAmount).toBe(25000);
    });

    it('超出年度上限时剩余额度应为0', () => {
      const result = calculateAnnualProgress(105000, 100000);
      
      expect(result.remainingAmount).toBe(0);
    });

    it('无效年度上限应返回错误状态', () => {
      const result = calculateAnnualProgress(50000, 0);
      
      expect(result.warningLevel).toBe('red');
      expect(result.progressMessage).toContain('设置无效');
    });

    it('完成率应保留2位小数', () => {
      const result = calculateAnnualProgress(33333, 100000);
      
      const completion = result.completionRate;
      expect(completion.toFixed(2)).toBe(completion.toString());
    });

    it('金额应保留2位小数', () => {
      const result = calculateAnnualProgress(12345.6789, 100000);
      
      expect(result.annualUsedAmount.toFixed(2)).toBe(result.annualUsedAmount.toString());
      expect(result.remainingAmount.toFixed(2)).toBe(result.remainingAmount.toString());
    });
  });

  describe('formatPercentage 百分比格式化', () => {
    
    it('应正确格式化百分比（默认1位小数）', () => {
      expect(formatPercentage(50)).toBe('50.0%');
      expect(formatPercentage(33.333)).toBe('33.3%');
    });

    it('应支持自定义小数位数', () => {
      expect(formatPercentage(50, 0)).toBe('50%');
      expect(formatPercentage(33.333, 2)).toBe('33.33%');
    });
  });

  describe('formatCurrency 金额格式化', () => {
    
    it('应正确格式化金额', () => {
      expect(formatCurrency(100)).toBe('¥100.00');
      expect(formatCurrency(123.45)).toBe('¥123.45');
    });

    it('应保留2位小数', () => {
      expect(formatCurrency(123.456)).toBe('¥123.46');
      expect(formatCurrency(123.4)).toBe('¥123.40');
    });
  });
});
