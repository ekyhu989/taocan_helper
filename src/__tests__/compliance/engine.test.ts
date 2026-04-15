/**
 * 合规规则引擎单元测试 (V2.0-003)
 * 测试覆盖：
 * - 832占比计算
 * - 预算分析
 * - 规则检查
 * - 引擎执行
 */

import {
  calculate832Ratio,
  analyzeBudget,
  calculateAnnualProgress,
  formatPercentage,
  formatCurrency
} from '../../utils/compliance/calculator';
import {
  complianceRules,
  getRuleById,
  getEnabledRules,
  getRulesByCategory,
  WARNING_LEVELS
} from '../../utils/compliance/rules';
import { runComplianceEngine, quickComplianceCheck } from '../../utils/compliance/engine';
import type { SchemeItem } from '../../utils/algorithm/combination';

// 测试用数据
const mockSchemeItems: SchemeItem[] = [
  {
    product: {
      id: '1',
      name: '832大米',
      price: 120,
      unit: '袋',
      category: '食品',
      scenes: ['holiday'],
      is832Platform: true,
      supplier: '黑龙江供应商'
    },
    quantity: 1,
    subtotal: 120
  },
  {
    product: {
      id: '2',
      name: '832花生油',
      price: 85,
      unit: '桶',
      category: '食品',
      scenes: ['holiday'],
      is832Platform: true,
      supplier: '山东供应商'
    },
    quantity: 2,
    subtotal: 170
  },
  {
    product: {
      id: '4',
      name: '普通牛奶',
      price: 68,
      unit: '箱',
      category: '食品',
      scenes: ['holiday'],
      is832Platform: false,
      supplier: '蒙牛'
    },
    quantity: 3,
    subtotal: 204
  }
];

describe('合规计算模块', () => {
  
  describe('calculate832Ratio', () => {
    
    it('应正确计算按金额的832占比', () => {
      const result = calculate832Ratio(mockSchemeItems, 'amount');
      
      // 832商品金额：120 + 170 = 290
      // 总金额：120 + 170 + 204 = 494
      // 占比：290 / 494 ≈ 58.7%
      
      expect(result.totalAmount).toBe(494);
      expect(result.total832Amount).toBe(290);
      expect(result.amountRatio).toBeCloseTo(58.7, 0);
    });

    it('应正确计算按数量的832占比', () => {
      const result = calculate832Ratio(mockSchemeItems, 'quantity');
      
      // 832商品数量：1 + 2 = 3
      // 总数量：1 + 2 + 3 = 6
      // 占比：3 / 6 = 50%
      
      expect(result.totalQuantity).toBe(6);
      expect(result.total832Quantity).toBe(3);
      expect(result.quantityRatio).toBeCloseTo(50.0, 0);
    });

    it('空列表时应返回0%', () => {
      const result = calculate832Ratio([], 'amount');
      
      expect(result.amountRatio).toBe(0);
      expect(result.quantityRatio).toBe(0);
      expect(result.totalAmount).toBe(0);
    });

    it('全部为832商品时应返回100%', () => {
      const all832Items: SchemeItem[] = mockSchemeItems.filter(
        item => item.product.is832Platform
      );
      
      const result = calculate832Ratio(all832Items, 'amount');
      expect(result.amountRatio).toBeCloseTo(100.0, 0);
    });
  });

  describe('analyzeBudget', () => {
    
    it('正常预算应返回none级别', () => {
      const result = analyzeBudget(50000, 100); // 人均500元
      
      expect(result.perCapitaBudget).toBe(500);
      expect(result.warningLevel).toBe('none');
      expect(result.warningMessage).toBeUndefined();
    });

    it('人均>500元应返回yellow级别', () => {
      const result = analyzeBudget(80000, 100); // 人均800元
      
      expect(result.perCapitaBudget).toBe(800);
      expect(result.warningLevel).toBe('yellow');
      expect(result.warningMessage).toBeDefined();
    });

    it('人均>1000元应返回orange级别', () => {
      const result = analyzeBudget(150000, 100); // 人均1500元
      
      expect(result.perCapitaBudget).toBe(1500);
      expect(result.warningLevel).toBe('orange');
    });

    it('人均>2000元应返回red级别', () => {
      const result = analyzeBudget(250000, 100); // 人均2500元
      
      expect(result.perCapitaBudget).toBe(2500);
      expect(result.warningLevel).toBe('red');
    });

    it('无效参数应返回错误信息', () => {
      const result = analyzeBudget(0, 100);
      
      expect(result.warningLevel).toBe('red');
      expect(result.warningMessage).toContain('无效');
    });
  });

  describe('calculateAnnualProgress', () => {
    
    it('正常进度应返回none级别', () => {
      const result = calculateAnnualProgress(50000, 200000); // 25%
      
      expect(result.completionRate).toBeCloseTo(25.0, 0);
      expect(result.warningLevel).toBe('none');
      expect(result.remainingAmount).toBe(150000);
    });

    it('高进度（>=70%）应返回yellow级别', () => {
      const result = calculateAnnualProgress(160000, 200000); // 80%
      
      expect(result.completionRate).toBeCloseTo(80.0, 0);
      expect(result.warningLevel).toBe('yellow');
    });

    it('超高进度（>=90%）应返回orange级别', () => {
      const result = calculateAnnualProgress(185000, 200000); // 92.5%
      
      expect(result.completionRate).toBeCloseTo(92.5, 0);
      expect(result.warningLevel).toBe('orange');
    });

    it('超额使用应返回red级别', () => {
      const result = calculateAnnualProgress(210000, 200000); // 105%
      
      expect(result.completionRate).toBeCloseTo(105.0, 0);
      expect(result.warningLevel).toBe('red');
      expect(result.remainingAmount).toBe(0);
    });
  });

  describe('格式化函数', () => {
    
    it('formatPercentage应正确格式化百分比', () => {
      expect(formatPercentage(35.678)).toBe('35.7%');
      expect(formatPercentage(30)).toBe('30.0%');
      expect(formatPercentage(100)).toBe('100.0%');
    });

    it('formatCurrency应正确格式化金额', () => {
      expect(formatCurrency(1234.56)).toBe('¥1234.56');
      expect(formatCurrency(100)).toBe('¥100.00');
    });
  });
});

describe('合规规则定义', () => {
  
  it('应包含所有预定义规则', () => {
    expect(complianceRules.length).toBeGreaterThanOrEqual(5);
    
    const ruleIds = complianceRules.map(r => r.id);
    expect(ruleIds).toContain('budget_per_capita');
    expect(ruleIds).toContain('ratio_832');
    expect(ruleIds).toContain('annual_accumulation');
    expect(ruleIds).toContain('category_diversity');
    expect(ruleIds).toContain('item_count_reasonable');
  });

  it('getRuleById应能找到规则', () => {
    const rule = getRuleById('budget_per_capita');
    expect(rule).toBeDefined();
    expect(rule!.name).toBe('人均预算检查');
  });

  it('getRuleById找不到时应返回undefined', () => {
    const rule = getRuleById('non_existent_rule');
    expect(rule).toBeUndefined();
  });

  it('getEnabledRules应只返回启用的规则', () => {
    const enabledRules = getEnabledRules();
    enabledRules.forEach(rule => {
      expect(rule.enabled).toBe(true);
    });
  });

  it('getRulesByCategory应按类别筛选', () => {
    const budgetRules = getRulesByCategory('budget');
    budgetRules.forEach(rule => {
      expect(rule.category).toBe('budget');
    });
  });

  it('WARNING_LEVELS应包含所有级别', () => {
    expect(WARNING_LEVELS).toHaveProperty('none');
    expect(WARNING_LEVELS).toHaveProperty('yellow');
    expect(WARNING_LEVELS).toHaveProperty('orange');
    expect(WARNING_LEVELS).toHaveProperty('red');
  });
});

describe('合规规则引擎', () => {
  
  describe('runComplianceEngine 基础功能', () => {
    
    it('应执行完整的合规检查', () => {
      const result = runComplianceEngine({
        items: mockSchemeItems,
        totalBudget: 494,
        peopleCount: 1,
        fundSource: 'union'
      });

      expect(result.isCompliant).toBeDefined();
      expect(result.overallLevel).toBeDefined();
      expect(result.ruleResults.length).toBeGreaterThan(0);
      expect(result.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.complianceScore).toBeLessThanOrEqual(100);
    });

    it('应正确计算832占比', () => {
      const result = runComplianceEngine({
        items: mockSchemeItems,
        totalBudget: 494,
        peopleCount: 1
      });

      expect(result.ratio832.amountRatio).toBeCloseTo(58.7, 0);
    });

    it('应生成汇总报告', () => {
      const result = runComplianceEngine({
        items: mockSchemeItems,
        totalBudget: 494,
        peopleCount: 1
      });

      expect(result.summaryReport).toContain('合规检查报告');
      expect(result.summaryReport).toContain('总体评级');
      expect(result.summaryReport).toContain('关键指标');
    });
  });

  describe('参数校验', () => {
    
    it('空商品列表应抛出错误', () => {
      expect(() => {
        runComplianceEngine({
          items: [],
          totalBudget: 5000,
          peopleCount: 100
        });
      }).toThrow('方案商品列表不能为空');
    });

    it('无效预算应抛出错误', () => {
      expect(() => {
        runComplianceEngine({
          items: mockSchemeItems,
          totalBudget: 0,
          peopleCount: 100
        });
      }).toThrow('总预算必须大于0');
    });
  });

  describe('quickComplianceCheck 快速模式', () => {
    
    it('快速模式应返回简化结果', () => {
      const result = quickComplianceCheck({
        items: mockSchemeItems,
        totalBudget: 494,
        peopleCount: 1
      });

      expect(result.isCompliant).toBeDefined();
      expect(result.level).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
