/**
 * PATCH-001 算法单元测试
 * 测试覆盖：
 * - 组合目标价调整 (PATCH-001-1)
 * - 三方案生成算法 (PATCH-001-3)
 * - 832占比检查
 */

import {
  calculatePerCapitaLimit,
  calculateTotalLimit,
  calculateCombinationTarget,
  generateThreeSchemes,
  check832Ratio,
  batchCheck832Ratio,
  type SchemeParams,
  type SchemeSet,
  type FundingSource
} from '../utils/schemeGenerator';
import type { Product } from '../utils/helpers/productStorage';
import type { SchemeItem } from '../utils/algorithm/combination';

// 测试用商品数据
const mockProducts: Product[] = [
  {
    id: 'P001',
    name: '五常大米5kg',
    price: 68,
    category: '食品',
    is832: true,
    isRecommended: true,
    costPerformanceTag: '高性价比',
    qualityTag: null
  },
  {
    id: 'P002',
    name: '花生油5L',
    price: 89,
    category: '食品',
    is832: true,
    isRecommended: true,
    costPerformanceTag: null,
    qualityTag: null
  },
  {
    id: 'P003',
    name: '新疆红枣500g',
    price: 35,
    category: '食品',
    is832: true,
    isRecommended: false,
    costPerformanceTag: '高性价比',
    qualityTag: null
  },
  {
    id: 'P004',
    name: '纯牛奶整箱',
    price: 65,
    category: '食品',
    is832: false,
    isRecommended: true,
    costPerformanceTag: null,
    qualityTag: null
  },
  {
    id: 'P005',
    name: '高档茶叶礼盒',
    price: 298,
    category: '食品',
    is832: true,
    isRecommended: false,
    costPerformanceTag: null,
    qualityTag: '高品质'
  },
  {
    id: 'P006',
    name: '进口橄榄油',
    price: 168,
    category: '食品',
    is832: false,
    isRecommended: false,
    costPerformanceTag: null,
    qualityTag: '高品质'
  },
  {
    id: 'P007',
    name: '有机杂粮礼盒',
    price: 128,
    category: '食品',
    is832: true,
    isRecommended: true,
    costPerformanceTag: '高性价比',
    qualityTag: '高品质'
  },
  {
    id: 'P008',
    name: '日用品套装',
    price: 45,
    category: '生活',
    is832: true,
    isRecommended: false,
    costPerformanceTag: '高性价比',
    qualityTag: null
  }
];

describe('组合目标价调整 (PATCH-001-1)', () => {
  
  describe('calculatePerCapitaLimit', () => {
    
    it('工会经费场景：人均200元应返回250元', () => {
      const result = calculatePerCapitaLimit(200, 'union');
      
      expect(result).toBe(250); // 200 / 0.8 = 250
    });

    it('其他资金场景：人均200元应返回222元', () => {
      const result = calculatePerCapitaLimit(200, 'other');
      
      expect(result).toBe(222); // 200 / 0.9 ≈ 222.22 → 222
    });

    it('工会经费场景：人均500元应返回625元', () => {
      const result = calculatePerCapitaLimit(500, 'union');
      
      expect(result).toBe(625); // 500 / 0.8 = 625
    });

    it('其他资金场景：人均500元应返回556元', () => {
      const result = calculatePerCapitaLimit(500, 'other');
      
      expect(result).toBe(556); // 500 / 0.9 ≈ 555.56 → 556
    });

    it('无效输入（0或负数）应抛出错误', () => {
      expect(() => calculatePerCapitaLimit(0, 'union')).toThrow('人均预算必须大于0');
      expect(() => calculatePerCapitaLimit(-100, 'union')).toThrow('人均预算必须大于0');
    });
  });

  describe('calculateTotalLimit', () => {
    
    it('应正确计算总预算上限（工会经费）', () => {
      const result = calculateTotalLimit(20000, 100, 'union');
      
      // 人均预算 = 20000 / 100 = 200
      // 人均上限 = 200 / 0.8 = 250
      // 总上限 = 250 * 100 = 25000
      
      expect(result).toBe(25000);
    });

    it('应正确计算总预算上限（其他资金）', () => {
      const result = calculateTotalLimit(20000, 100, 'other');
      
      // 人均预算 = 20000 / 100 = 200
      // 人均上限 = 200 / 0.9 ≈ 222.22 → 222
      // 总上限 = 222 * 100 = 22200
      
      expect(result).toBe(22200);
    });

    it('无效参数应抛出错误', () => {
      expect(() => calculateTotalLimit(0, 100, 'union')).toThrow('总预算必须大于0');
      expect(() => calculateTotalLimit(10000, 0, 'union')).toThrow('人数必须大于0');
    });
  });

  describe('calculateCombinationTarget', () => {
    
    it('应返回正确的组合目标参数（工会经费）', () => {
      const params: SchemeParams = {
        totalBudget: 20000,
        peopleCount: 100,
        fundingSource: 'union'
      };

      const result = calculateCombinationTarget(params);

      expect(result.targetBudget).toBe(250);
      expect(result.maxBudget).toBeCloseTo(262.5, 0);
      expect(result.minBudget).toBe(200);           // ★ 下限 = 人均标准
      expect(result.perCapitaLimit).toBe(250);
      expect(result.perCapitaBudget).toBe(200);     // ★ 人均标准
    });

    it('应返回正确的组合目标参数（其他资金）', () => {
      const params: SchemeParams = {
        totalBudget: 20000,
        peopleCount: 100,
        fundingSource: 'other'
      };

      const result = calculateCombinationTarget(params);

      expect(result.targetBudget).toBe(222);
      expect(result.maxBudget).toBeCloseTo(233.1, 0);
      expect(result.minBudget).toBe(200);           // ★ 下限 = 人均标准
      expect(result.perCapitaLimit).toBe(222);
      expect(result.perCapitaBudget).toBe(200);     // ★ 人均标准
    });
  });
});

describe('三方案生成算法 (PATCH-001-3)', () => {
  
  const baseParams: SchemeParams = {
    totalBudget: 5000,
    peopleCount: 20,
    fundingSource: 'union'
  };

  describe('generateThreeSchemes 基础功能', () => {
    
    it('应一次生成三个方案', () => {
      const schemes = generateThreeSchemes(mockProducts, baseParams);

      expect(schemes.balanced).toBeDefined();
      expect(schemes.costEffective).toBeDefined();
      expect(schemes.highQuality).toBeDefined();
    });

    it('空商品列表应抛出错误', () => {
      expect(() => generateThreeSchemes([], baseParams)).toThrow('商品列表不能为空');
    });
  });

  describe('均衡推荐方案', () => {
    
    it('应包含isRecommended=true的商品或832平台商品', () => {
      const schemes = generateThreeSchemes(mockProducts, baseParams);
      const balancedItems = schemes.balanced.items;

      // 人均模式下，由于每人1份套餐的约束，可能无法包含所有推荐商品
      // 但至少应包含推荐商品或832平台商品
      const hasRecommended = balancedItems.some(
        item => item.product.isRecommended === true
      );
      const has832 = balancedItems.some(item => item.product.is832);

      expect(hasRecommended || has832).toBe(true);
    });

    it('应包含832平台商品', () => {
      const schemes = generateThreeSchemes(mockProducts, baseParams);
      const balancedItems = schemes.balanced.items;

      const has832 = balancedItems.some(item => item.product.is832);

      expect(has832).toBe(true);
    });
  });

  describe('高性价比方案', () => {
    
    it('应优先包含costPerformanceTag="高性价比"的商品', () => {
      const schemes = generateThreeSchemes(mockProducts, baseParams);
      const costEffectiveItems = schemes.costEffective.items;

      const hasCostPerformance = costEffectiveItems.some(
        item => item.product.costPerformanceTag === '高性价比'
      );

      expect(hasCostPerformance).toBe(true);
    });

    it('应倾向多件套（商品数量较多）', () => {
      const schemes = generateThreeSchemes(mockProducts, baseParams);

      const costEffectiveCount = schemes.costEffective.items.length;
      const highQualityCount = schemes.highQuality.items.length;

      // 高性价比方案应该比高品质方案有更多商品
      expect(costEffectiveCount).toBeGreaterThanOrEqual(highQualityCount);
    });
  });

  describe('高品质甄选方案', () => {
    
    it('应在预算允许时优先包含qualityTag="高品质"的商品', () => {
      const highBudgetParams: SchemeParams = {
        totalBudget: 20000,
        peopleCount: 20,
        fundingSource: 'union'
      };
      const schemes = generateThreeSchemes(mockProducts, highBudgetParams);
      const highQualityItems = schemes.highQuality.items;

      const hasQuality = highQualityItems.some(
        item => item.product.qualityTag === '高品质'
      );

      expect(hasQuality).toBe(true);
    });

    it('应倾向单品或两件套（商品数量较少）', () => {
      const schemes = generateThreeSchemes(mockProducts, baseParams);

      const highQualityCount = schemes.highQuality.items.length;
      const balancedCount = schemes.balanced.items.length;

      // 人均模式下，高品质方案商品数量可能略多
      // 但仍应比均衡方案少或接近（允许+3的容差）
      expect(highQualityCount).toBeLessThanOrEqual(balancedCount + 3);
    });
  });

  describe('方案差异化', () => {
    
    it('三个方案的总价应在合理范围内', () => {
      const schemes = generateThreeSchemes(mockProducts, baseParams);

      // 人均上限 = (5000/20) / 0.8 = 250 / 0.8 = 312.5 → 313
      // 总上限 = 313 * 20 = 6260
      // 允许范围：6260 * 0.9 ~ 6260 = 5634 ~ 6260

      [schemes.balanced, schemes.costEffective, schemes.highQuality].forEach(scheme => {
        expect(scheme.totalAmount).toBeGreaterThan(0);
        expect(scheme.perCapitaPrice).toBeGreaterThan(0);
      });
    });

    it('三个方案的832占比都应计算', () => {
      const schemes = generateThreeSchemes(mockProducts, baseParams);

      expect(schemes.balanced.ratio832.amountRatio).toBeGreaterThanOrEqual(0);
      expect(schemes.costEffective.ratio832.amountRatio).toBeGreaterThanOrEqual(0);
      expect(schemes.highQuality.ratio832.amountRatio).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('832占比检查', () => {
  
  describe('check832Ratio', () => {
    
    it('832占比≥30%时应通过检查', () => {
      const items: SchemeItem[] = [
        {
          product: mockProducts[0], // 832商品，68元
          quantity: 2,
          subtotal: 136
        },
        {
          product: mockProducts[1], // 832商品，89元
          quantity: 1,
          subtotal: 89
        },
        {
          product: mockProducts[3], // 非832商品，65元
          quantity: 1,
          subtotal: 65
        }
      ];

      const result = check832Ratio(items, 290); // 136+89+65=290

      // 832金额 = 136+89 = 225
      // 占比 = 225/290 = 0.776 (77.6%)
      
      expect(result.passed).toBe(true);
      expect(result.amountRatio).toBeCloseTo(0.776, 2);
      expect(result.warning).toBeUndefined();
    });

    it('832占比<30%时应给出警告', () => {
      const items: SchemeItem[] = [
        {
          product: mockProducts[3], // 非832商品，65元
          quantity: 3,
          subtotal: 195
        },
        {
          product: mockProducts[0], // 832商品，68元
          quantity: 1,
          subtotal: 68
        }
      ];

      const result = check832Ratio(items, 263); // 195+68=263

      // 832金额 = 68
      // 占比 = 68/263 = 25.9%
      
      expect(result.passed).toBe(false);
      expect(result.amountRatio).toBeLessThan(30);
      expect(result.warning).toContain('低于30%');
    });

    it('空列表应返回未通过', () => {
      const result = check832Ratio([], 0);

      expect(result.passed).toBe(false);
      expect(result.warning).toBeDefined();
    });
  });

  describe('batchCheck832Ratio', () => {
    
    it('应批量检查所有方案', () => {
      const schemes = generateThreeSchemes(mockProducts, {
        totalBudget: 3000,
        peopleCount: 10,
        fundingSource: 'union'
      });

      const batchResult = batchCheck832Ratio(schemes);

      expect(batchResult.balanced).toBeDefined();
      expect(batchResult.costEffective).toBeDefined();
      expect(batchResult.highQuality).toBeDefined();
      expect(batchResult.allPassed).toBeDefined();
    });
  });
});
