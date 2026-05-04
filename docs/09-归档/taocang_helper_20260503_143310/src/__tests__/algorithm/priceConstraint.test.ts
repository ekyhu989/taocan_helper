/**
 * 价格约束算法单元测试 (V2.0-001)
 * 测试覆盖：
 * - 基本计算逻辑
 * - 不同资金来源的折扣系数
 * - 边界情况处理
 * - 计算明细完整性
 */

import {
  calculatePriceConstraint,
  isPriceInRange,
  getPriceDeviation,
  formatConstraintForDisplay
} from '../../utils/algorithm/priceConstraint';

describe('价格约束算法', () => {
  
  describe('calculatePriceConstraint 基础功能', () => {
    
    it('应正确计算工会经费场景的价格约束', () => {
      const result = calculatePriceConstraint({
        totalBudget: 50000,
        peopleCount: 100,
        fundSource: 'union'
      });

      expect(result.perCapitaBudget).toBe(500); // 50000 / 100
      expect(result.discountRate).toBe(0.8); // 工会经费8折
      expect(result.maxPerCapitaPrice).toBe(625); // 500 / 0.8 = 625
      expect(result.priceRange.min).toBe(312); // 625 * 0.5 = 312.5 → 312
      expect(result.priceRange.max).toBe(625);
    });

    it('应正确计算其他资金来源的价格约束', () => {
      const result = calculatePriceConstraint({
        totalBudget: 50000,
        peopleCount: 100,
        fundSource: 'other'
      });

      expect(result.perCapitaBudget).toBe(500);
      expect(result.discountRate).toBe(0.9); // 其他资金9折
      expect(result.maxPerCapitaPrice).toBe(556); // 500 / 0.9 ≈ 555.56 → 556
    });

    it('应正确处理非整除的情况', () => {
      const result = calculatePriceConstraint({
        totalBudget: 49999,
        peopleCount: 100,
        fundSource: 'union'
      });

      expect(result.perCapitaBudget).toBe(499); // 49999 / 100 = 499.99 → 499
      expect(result.maxPerCapitaPrice).toBe(624); // 499 / 0.8 = 623.75 → 624
    });

    it('应正确处理精确到分的边界情况', () => {
      const result = calculatePriceConstraint({
        totalBudget: 50001,
        peopleCount: 100,
        fundSource: 'union'
      });

      expect(result.perCapitaBudget).toBe(500); // 50001 / 100 = 500.01 → 500
      expect(result.maxPerCapitaPrice).toBe(625); // 500 / 0.8 = 625
    });

    it('金额计算应正确四舍五入到元', () => {
      const result = calculatePriceConstraint({
        totalBudget: 50049,
        peopleCount: 100,
        fundSource: 'union'
      });

      expect(result.perCapitaBudget).toBe(500); // 50049 / 100 = 500.49 → 500
    });

    it('价格上限应正确向上取整', () => {
      const result = calculatePriceConstraint({
        totalBudget: 49900,
        peopleCount: 100,
        fundSource: 'other'
      });

      // 人均499，9折后 = 499 / 0.9 ≈ 554.44 → 555
      expect(result.maxPerCapitaPrice).toBe(555);
    });
  });

  describe('参数校验', () => {
    
    it('总预算为0时应抛出错误', () => {
      expect(() => {
        calculatePriceConstraint({
          totalBudget: 0,
          peopleCount: 100,
          fundSource: 'union'
        });
      }).toThrow('总预算必须大于0');
    });

    it('总预算为负数时应抛出错误', () => {
      expect(() => {
        calculatePriceConstraint({
          totalBudget: -1000,
          peopleCount: 100,
          fundSource: 'union'
        });
      }).toThrow('总预算必须大于0');
    });

    it('人数为0时应抛出错误', () => {
      expect(() => {
        calculatePriceConstraint({
          totalBudget: 50000,
          peopleCount: 0,
          fundSource: 'union'
        });
      }).toThrow('人数必须大于0');
    });

    it('人数为负数时应抛出错误', () => {
      expect(() => {
        calculatePriceConstraint({
          totalBudget: 50000,
          peopleCount: -10,
          fundSource: 'union'
        });
      }).toThrow('人数必须大于0');
    });
  });

  describe('计算明细完整性', () => {
    
    it('应包含完整的计算步骤', () => {
      const result = calculatePriceConstraint({
        totalBudget: 50000,
        peopleCount: 100,
        fundSource: 'union'
      });

      const details = result.calculationDetails;
      
      expect(details.steps).toHaveLength(4);
      expect(details.formula).toContain('人均预算');
      expect(details.policyReference).toContain('新工办〔2019〕3号');
      
      // 验证每个步骤都有必要字段
      details.steps.forEach(step => {
        expect(step).toHaveProperty('stepNumber');
        expect(step).toHaveProperty('description');
        expect(step).toHaveProperty('formula');
        expect(step).toHaveProperty('result');
      });
    });

    it('政策依据应包含正确的折扣系数信息', () => {
      const unionResult = calculatePriceConstraint({
        totalBudget: 50000,
        peopleCount: 100,
        fundSource: 'union'
      });

      const otherResult = calculatePriceConstraint({
        totalBudget: 50000,
        peopleCount: 100,
        fundSource: 'other'
      });

      expect(unionResult.calculationDetails.policyReference).toContain('8折');
      expect(otherResult.calculationDetails.policyReference).toContain('9折');
    });
  });

  describe('边界情况', () => {
    
    it('极小预算时价格上限应为1元', () => {
      const result = calculatePriceConstraint({
        totalBudget: 50,
        peopleCount: 100,
        fundSource: 'union'
      });

      // 人均预算 = 0.5元，但最低单价限制为1元
      expect(result.maxPerCapitaPrice).toBeGreaterThanOrEqual(1);
    });

    it('极大预算时应正常计算', () => {
      const result = calculatePriceConstraint({
        totalBudget: 10000000, // 1000万
        peopleCount: 1000,
        fundSource: 'union'
      });

      expect(result.perCapitaBudget).toBe(10000);
      expect(result.maxPerCapitaPrice).toBe(12500);
    });

    it('单人也应正常计算', () => {
      const result = calculatePriceConstraint({
        totalBudget: 2000,
        peopleCount: 1,
        fundSource: 'union'
      });

      expect(result.perCapitaBudget).toBe(2000);
      expect(result.maxPerCapitaPrice).toBe(2500);
    });
  });
});

describe('isPriceInRange 辅助函数', () => {
  
  it('价格在范围内应返回true', () => {
    const constraint = calculatePriceConstraint({
      totalBudget: 50000,
      peopleCount: 100,
      fundSource: 'union'
    });

    expect(isPriceInRange(400, constraint)).toBe(true); // 在[312, 625]范围内
  });

  it('价格低于下限应返回false', () => {
    const constraint = calculatePriceConstraint({
      totalBudget: 50000,
      peopleCount: 100,
      fundSource: 'union'
    });

    expect(isPriceInRange(300, constraint)).toBe(false); // 低于312
  });

  it('价格高于上限应返回false', () => {
    const constraint = calculatePriceConstraint({
      totalBudget: 50000,
      peopleCount: 100,
      fundSource: 'union'
    });

    expect(isPriceInRange(700, constraint)).toBe(false); // 高于625
  });

  it('边界值应返回true', () => {
    const constraint = calculatePriceConstraint({
      totalBudget: 50000,
      peopleCount: 100,
      fundSource: 'union'
    });

    expect(isPriceInRange(constraint.priceRange.min, constraint)).toBe(true);
    expect(isPriceInRange(constraint.priceRange.max, constraint)).toBe(true);
  });
});

describe('getPriceDeviation 辅助函数', () => {
  
  it('价格在范围内应返回0', () => {
    const constraint = calculatePriceConstraint({
      totalBudget: 50000,
      peopleCount: 100,
      fundSource: 'union'
    });

    expect(getPriceDeviation(400, constraint)).toBe(0);
  });

  it('价格低于下限应返回负数', () => {
    const constraint = calculatePriceConstraint({
      totalBudget: 50000,
      peopleCount: 100,
      fundSource: 'union'
    });

    const deviation = getPriceDeviation(200, constraint);
    expect(deviation).toBeLessThan(0);
  });

  it('价格高于上限应返回正数', () => {
    const constraint = calculatePriceConstraint({
      totalBudget: 50000,
      peopleCount: 100,
      fundSource: 'union'
    });

    const deviation = getPriceDeviation(800, constraint);
    expect(deviation).toBeGreaterThan(0);
  });
});

describe('formatConstraintForDisplay 格式化函数', () => {
  
  it('应返回格式化的展示文本', () => {
    const constraint = calculatePriceConstraint({
      totalBudget: 50000,
      peopleCount: 100,
      fundSource: 'union'
    });

    const displayText = formatConstraintForDisplay(constraint);
    
    expect(displayText).toContain('💰');
    expect(displayText).toContain('📊');
    expect(displayText).toContain('⬆️');
    expect(displayText).toContain('📏');
    expect(displayText).toContain('8折'); // 工会经费
  });
});
