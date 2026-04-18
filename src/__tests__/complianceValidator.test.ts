import {
  calculatePerCapita,
  calculatePlatform832Ratio,
  calculateCompletionRate,
  validateDataSource,
  lockData,
  unlockData,
  validateCompliance,
  SINGLE_WARNING_THRESHOLD,
  ANNUAL_WARNING_THRESHOLD,
  PLATFORM_832_REQUIREMENT,
} from '../utils/complianceValidator';

describe('V1.6 合规验证器 - complianceValidator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('人均预算计算 - calculatePerCapita', () => {
    test('TC-V16-026: 人均预算正常（≤500元）', () => {
      const result = calculatePerCapita(5000, 10);
      expect(result.perCapitaAmount).toBe(500);
      expect(result.exceedsSingleWarning).toBe(false);
      expect(result.exceedsAnnualWarning).toBe(false);
      expect(result.result.warningLevel).toBe('none');
    });

    test('TC-V16-027: 人均预算超过单次预警线（>500元）', () => {
      const result = calculatePerCapita(6000, 10);
      expect(result.perCapitaAmount).toBe(600);
      expect(result.exceedsSingleWarning).toBe(true);
      expect(result.exceedsAnnualWarning).toBe(false);
      expect(result.result.warningLevel).toBe('yellow');
    });

    test('TC-V16-028: 人均预算超过年度预警线（>2000元）', () => {
      const result = calculatePerCapita(25000, 10);
      expect(result.perCapitaAmount).toBe(2500);
      expect(result.exceedsSingleWarning).toBe(true);
      expect(result.exceedsAnnualWarning).toBe(true);
      expect(result.result.warningLevel).toBe('orange');
    });

    test('TC-V16-029: 人数为0时返回0', () => {
      const result = calculatePerCapita(5000, 0);
      expect(result.perCapitaAmount).toBe(0);
    });
  });

  describe('832占比计算 - calculatePlatform832Ratio', () => {
    test('TC-V16-030: 832占比达标（≥30%）', () => {
      const result = calculatePlatform832Ratio(300, 1000);
      expect(result.amountRatio).toBe(30);
      expect(result.isCompliant).toBe(true);
      expect(result.result.warningLevel).toBe('none');
    });

    test('TC-V16-031: 832占比不达标（<30%）', () => {
      const result = calculatePlatform832Ratio(250, 1000);
      expect(result.amountRatio).toBe(25);
      expect(result.isCompliant).toBe(false);
      expect(result.result.warningLevel).toBe('red');
    });

    test('TC-V16-032: 总预算为0时返回0占比', () => {
      const result = calculatePlatform832Ratio(300, 0);
      expect(result.amountRatio).toBe(0);
    });
  });

  describe('年度完成率计算 - calculateCompletionRate', () => {
    test('TC-V16-033: 完成率达标（≥30%）', () => {
      const result = calculateCompletionRate(300, 1000);
      expect(result.completionRate).toBe(30);
      expect(result.result.isValid).toBe(true);
    });

    test('TC-V16-034: 完成率不达标（<30%）', () => {
      const result = calculateCompletionRate(250, 1000);
      expect(result.completionRate).toBe(25);
      expect(result.result.isValid).toBe(false);
      expect(result.result.warningLevel).toBe('red');
    });

    test('TC-V16-035: 总预算为0时返回0完成率', () => {
      const result = calculateCompletionRate(300, 0);
      expect(result.completionRate).toBe(0);
    });
  });

  describe('数据来源验证 - validateDataSource', () => {
    test('TC-V16-036: 自动核算数据', () => {
      const result = validateDataSource('auto', 0, 5);
      expect(result.hasManualData).toBe(false);
      expect(result.result.isValid).toBe(true);
    });

    test('TC-V16-037: 包含手动录入数据', () => {
      const result = validateDataSource('manual', 2, 3);
      expect(result.hasManualData).toBe(true);
      expect(result.manualCount).toBe(2);
      expect(result.autoCount).toBe(3);
    });
  });

  describe('数据锁定 - lockData & unlockData', () => {
    test('TC-V16-038: 锁定数据成功', () => {
      const result = lockData('admin');
      expect(result.success).toBe(true);
      expect(localStorage.getItem('compliance_data_locked')).toBe('true');
    });

    test('TC-V16-039: 解锁数据成功', () => {
      lockData('admin');
      const result = unlockData(false);
      expect(result.success).toBe(true);
      expect(localStorage.getItem('compliance_data_locked')).toBeNull();
    });
  });

  describe('综合验证 - validateCompliance', () => {
    test('TC-V16-040: 完全合规（无预警）', () => {
      const result = validateCompliance({
        headCount: 10,
        totalBudget: 5000,
        completedAmount: 5000,
        platform832Amount: 3000,
        dataSource: 'auto',
        isLocked: false,
      });
      expect(result.isValid).toBe(true);
      expect(result.warningLevel).toBe('none');
    });

    test('TC-V16-041: 黄色预警（单次人均超500元）', () => {
      const result = validateCompliance({
        headCount: 10,
        totalBudget: 6000,
        completedAmount: 6000,
        platform832Amount: 3000,
        dataSource: 'auto',
        isLocked: false,
      });
      expect(result.isValid).toBe(true);
      expect(result.warningLevel).toBe('yellow');
    });

    test('TC-V16-042: 橙色预警（年度人均超2000元）', () => {
      const result = validateCompliance({
        headCount: 10,
        totalBudget: 25000,
        completedAmount: 25000,
        platform832Amount: 15000,
        dataSource: 'auto',
        isLocked: false,
      });
      expect(result.isValid).toBe(false);
      expect(result.warningLevel).toBe('orange');
    });

    test('TC-V16-043: 红色预警（832占比<30%）', () => {
      const result = validateCompliance({
        headCount: 10,
        totalBudget: 5000,
        completedAmount: 5000,
        platform832Amount: 1000,
        dataSource: 'auto',
        isLocked: false,
      });
      expect(result.isValid).toBe(false);
      expect(result.warningLevel).toBe('red');
    });

    test('TC-V16-044: 多预警同时存在时取最高级别（红色优先）', () => {
      const result = validateCompliance({
        headCount: 10,
        totalBudget: 6000,
        completedAmount: 6000,
        platform832Amount: 1000,
        dataSource: 'auto',
        isLocked: false,
      });
      expect(result.warningLevel).toBe('red');
    });
  });

  describe('常量验证', () => {
    test('TC-V16-045: 单次预警线为500元', () => {
      expect(SINGLE_WARNING_THRESHOLD).toBe(500);
    });

    test('TC-V16-046: 年度预警线为2000元', () => {
      expect(ANNUAL_WARNING_THRESHOLD).toBe(2000);
    });

    test('TC-V16-047: 832占比要求为30%', () => {
      expect(PLATFORM_832_REQUIREMENT).toBe(30);
    });
  });
});
