import {
  checkSensitiveTerms,
  checkPolicyDocNoFormat,
  validateExport,
} from '../utils/reportValidator';

describe('V1.6 公文校验器 - reportValidator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('敏感词检测 - checkSensitiveTerms', () => {
    test('TC-V16-048: 无敏感词时返回正常', () => {
      const result = checkSensitiveTerms('这是合规的采购方案');
      expect(result.hasForbiddenTerms).toBe(false);
      expect(result.forbiddenTerms).toEqual([]);
    });

    test('TC-V16-049: 检测到禁用词"购买"', () => {
      const result = checkSensitiveTerms('这是购买方案');
      expect(result.hasForbiddenTerms).toBe(true);
      expect(result.forbiddenTerms).toEqual([{ term: '购买', replacement: '采购' }]);
      expect(result.suggestedContent).toBe('这是采购方案');
    });

    test('TC-V16-050: 检测到多个禁用词', () => {
      const result = checkSensitiveTerms('购买商品，下单支付');
      expect(result.hasForbiddenTerms).toBe(true);
      expect(result.forbiddenTerms.length).toBeGreaterThan(1);
    });

    test('TC-V16-051: 禁用词列表完整检测', () => {
      const forbiddenTerms = ['购买', '下单', '支付', '商城', '购物车', '订单'];
      forbiddenTerms.forEach(term => {
        const result = checkSensitiveTerms(`使用${term}词汇`);
        expect(result.hasForbiddenTerms).toBe(true);
      });
    });
  });

  describe('政策文号格式校验 - checkPolicyDocNoFormat', () => {
    test('TC-V16-052: 正确格式的政策文号验证通过', () => {
      const result = checkPolicyDocNoFormat('新工办〔2019〕3号');
      expect(result.isValid).toBe(true);
      expect(result.policyDocNos).toContain('新工办〔2019〕3号');
    });

    test('TC-V16-053: 错误格式的政策文号检测失败', () => {
      const result = checkPolicyDocNoFormat('新工办[2019]3号');
      expect(result.policyDocNos.length).toBe(0);
    });

    test('TC-V16-054: 多个政策文号同时校验', () => {
      const result = checkPolicyDocNoFormat('新工办〔2019〕3号、新财购〔2025〕2号');
      expect(result.isValid).toBe(true);
      expect(result.policyDocNos.length).toBe(2);
    });

    test('TC-V16-055: 无政策文号时通过验证', () => {
      const result = checkPolicyDocNoFormat('这是一个没有文号的报告');
      expect(result.isValid).toBe(true);
      expect(result.policyDocNos).toEqual([]);
    });
  });

  describe('导出前综合校验 - validateExport', () => {
    test('TC-V16-056: 政策版本未确认时禁止导出', () => {
      localStorage.setItem('policy_version', '2025-01-01');
      const result = validateExport('测试报告内容');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('政策版本未确认或已过期，禁止导出公文');
    });

    test('TC-V16-057: 检测到敏感词时给出警告', () => {
      localStorage.setItem('policy_confirmed_version', '2025-01-01');
      const result = validateExport('这是购买方案');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('TC-V16-058: 政策文号格式错误时禁止导出', () => {
      localStorage.setItem('policy_confirmed_version', '2025-01-01');
      const result = validateExport('引用新工办[2019]3号文件');
      expect(result.isValid).toBe(false);
    });

    test('TC-V16-059: 人均预算超500元时给出警告', () => {
      localStorage.setItem('policy_confirmed_version', '2025-01-01');
      const result = validateExport('合规报告', {
        totalBudget: 6000,
        headCount: 10,
      } as any);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('TC-V16-060: 完全合规时允许导出', () => {
      localStorage.setItem('policy_confirmed_version', '2025-04-01');
      const result = validateExport('这是合规的采购方案，新工办〔2019〕3号');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});
