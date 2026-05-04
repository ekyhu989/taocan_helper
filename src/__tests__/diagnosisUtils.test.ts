import { calculateRisks, getAutoFixSuggestion } from '../utils/diagnosisUtils';

describe('V1.6 诊断工具 - diagnosisUtils', () => {
  describe('风险计算 - calculateRisks', () => {
    test('TC-V16-074: 完全合规无风险', () => {
      const result = calculateRisks(10, 5000, 3000, 10000);
      expect(result.isValid).toBe(true);
      expect(result.risks.length).toBe(0);
    });

    test('TC-V16-075: 年度人均超标风险（>2000元）', () => {
      const result = calculateRisks(10, 25000, 3000, 10000);
      expect(result.isValid).toBe(false);
      expect(result.totalRiskCount).toBe(1);
      const risk = result.risks.find(r => r.type === 'annual_limit');
      expect(risk).toBeDefined();
      expect(risk?.level).toBe('high');
      expect(risk?.currentValue).toBe(2500);
    });

    test('TC-V16-076: 单次人均预警风险（500-2000元）', () => {
      const result = calculateRisks(10, 6000, 3000, 10000);
      expect(result.isValid).toBe(false);
      expect(result.totalRiskCount).toBe(1);
      const risk = result.risks.find(r => r.type === 'single_warning');
      expect(risk).toBeDefined();
      expect(risk?.level).toBe('medium');
      expect(risk?.currentValue).toBe(600);
    });

    test('TC-V16-077: 832占比不达标风险（<30%）', () => {
      const result = calculateRisks(10, 5000, 2000, 10000);
      expect(result.isValid).toBe(false);
      expect(result.totalRiskCount).toBe(1);
      const risk = result.risks.find(r => r.type === 'platform832');
      expect(risk).toBeDefined();
      expect(risk?.level).toBe('medium');
      expect(risk?.currentValue).toBe(20);
    });

    test('TC-V16-078: 多个风险同时存在', () => {
      const result = calculateRisks(10, 25000, 2000, 10000);
      expect(result.isValid).toBe(false);
      expect(result.totalRiskCount).toBe(2);
    });

    test('TC-V16-079: 人数为空时处理', () => {
      const result = calculateRisks('', 5000, 3000, 10000);
      expect(result).toBeDefined();
    });

    test('TC-V16-080: 预算为空时处理', () => {
      const result = calculateRisks(10, '', 3000, 10000);
      expect(result).toBeDefined();
    });

    test('TC-V16-081: 总金额为0时不触发832风险', () => {
      const result = calculateRisks(10, 5000, 3000, 0);
      const risk = result.risks.find(r => r.type === 'platform832');
      expect(risk).toBeUndefined();
    });
  });

  describe('自动修复建议 - getAutoFixSuggestion', () => {
    test('TC-V16-082: 年度超标修复建议', () => {
      const risks = [
        {
          type: 'annual_limit',
          title: '年度人均超标',
          currentValue: 2500,
          limitValue: 2000,
          unit: '元/人',
          level: 'high',
          formula: '人均 = 总预算 ÷ 人数',
        },
      ];
      const suggestions = getAutoFixSuggestion(risks as any, 10);
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].type).toBe('annual_limit');
    });

    test('TC-V16-083: 单次预警修复建议', () => {
      const risks = [
        {
          type: 'single_warning',
          title: '单次人均超过预警线',
          currentValue: 600,
          limitValue: 500,
          unit: '元/人',
          level: 'medium',
          formula: '人均 = 总预算 ÷ 人数',
        },
      ];
      const suggestions = getAutoFixSuggestion(risks as any);
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].type).toBe('single_warning');
    });

    test('TC-V16-084: 832占比修复建议', () => {
      const risks = [
        {
          type: 'platform832',
          title: '832平台占比不达标',
          currentValue: 25,
          limitValue: 30,
          unit: '%',
          level: 'medium',
          formula: '832占比 = 832平台商品金额 ÷ 总金额',
        },
      ];
      const suggestions = getAutoFixSuggestion(risks as any);
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].type).toBe('platform832');
    });
  });

  describe('风险类型验证', () => {
    test('TC-V16-085: 三种风险类型都存在', () => {
      const result = calculateRisks(10, 25000, 2000, 10000);
      const riskTypes = result.risks.map(r => r.type);
      expect(riskTypes).toContain('annual_limit');
      expect(riskTypes).toContain('platform832');
    });

    test('TC-V16-086: 风险级别正确映射', () => {
      const result = calculateRisks(10, 25000, 3000, 10000);
      const highRisk = result.risks.find(r => r.level === 'high');
      expect(highRisk).toBeDefined();
    });
  });
});
