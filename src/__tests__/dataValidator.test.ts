import { validatePrice, validateQuantity, validateBudget, validateHeadCount, validateMultiple, formatValidationError } from '../utils/dataValidator';

describe('V1.6 数据校验器 - dataValidator', () => {
  describe('单价校验 - validatePrice', () => {
    test('TC-V16-001: 正常价格验证通过', () => {
      const result = validatePrice(100);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('TC-V16-002: 单价不能小于0.01', () => {
      const result = validatePrice(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('单价不能小于0.01');
    });

    test('TC-V16-003: 单价不能大于10000', () => {
      const result = validatePrice(20000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('单价不能大于10000');
    });

    test('TC-V16-004: 单价不能为空', () => {
      const result = validatePrice('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('单价不能为空');
    });

    test('TC-V16-005: 单价必须是数字', () => {
      const result = validatePrice('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('单价必须是数字');
    });

    test('TC-V16-006: 边界值0.01验证通过', () => {
      const result = validatePrice(0.01);
      expect(result.isValid).toBe(true);
    });

    test('TC-V16-007: 边界值10000验证通过', () => {
      const result = validatePrice(10000);
      expect(result.isValid).toBe(true);
    });
  });

  describe('数量校验 - validateQuantity', () => {
    test('TC-V16-008: 正常数量验证通过', () => {
      const result = validateQuantity(100);
      expect(result.isValid).toBe(true);
    });

    test('TC-V16-009: 数量不能小于1', () => {
      const result = validateQuantity(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('数量不能小于1');
    });

    test('TC-V16-010: 数量不能大于10000', () => {
      const result = validateQuantity(20000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('数量不能大于10000');
    });

    test('TC-V16-011: 边界值1验证通过', () => {
      const result = validateQuantity(1);
      expect(result.isValid).toBe(true);
    });

    test('TC-V16-012: 边界值10000验证通过', () => {
      const result = validateQuantity(10000);
      expect(result.isValid).toBe(true);
    });
  });

  describe('预算校验 - validateBudget', () => {
    test('TC-V16-013: 正常预算验证通过', () => {
      const result = validateBudget(10000);
      expect(result.isValid).toBe(true);
    });

    test('TC-V16-014: 预算不能小于0.01', () => {
      const result = validateBudget(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('预算不能小于0.01');
    });

    test('TC-V16-015: 预算不能大于1000000', () => {
      const result = validateBudget(2000000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('预算不能大于1000000');
    });

    test('TC-V16-016: 边界值0.01验证通过', () => {
      const result = validateBudget(0.01);
      expect(result.isValid).toBe(true);
    });

    test('TC-V16-017: 边界值1000000验证通过', () => {
      const result = validateBudget(1000000);
      expect(result.isValid).toBe(true);
    });
  });

  describe('人数校验 - validateHeadCount', () => {
    test('TC-V16-018: 正常人数验证通过', () => {
      const result = validateHeadCount(100);
      expect(result.isValid).toBe(true);
    });

    test('TC-V16-019: 人数不能小于1', () => {
      const result = validateHeadCount(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('人数不能小于1');
    });

    test('TC-V16-020: 人数不能大于10000', () => {
      const result = validateHeadCount(20000);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('人数不能大于10000');
    });
  });

  describe('多项校验 - validateMultiple', () => {
    test('TC-V16-021: 多项全部通过', () => {
      const result = validateMultiple([
        { value: 100, validator: validatePrice },
        { value: 10, validator: validateQuantity },
      ]);
      expect(result.isValid).toBe(true);
    });

    test('TC-V16-022: 多项部分失败', () => {
      const result = validateMultiple([
        { value: -10, validator: validatePrice },
        { value: 10, validator: validateQuantity },
      ]);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('错误格式化 - formatValidationError', () => {
    test('TC-V16-023: 空错误返回空字符串', () => {
      expect(formatValidationError([])).toBe('');
    });

    test('TC-V16-024: 单个错误正常返回', () => {
      expect(formatValidationError(['错误1'])).toBe('错误1');
    });

    test('TC-V16-025: 多个错误用分号连接', () => {
      expect(formatValidationError(['错误1', '错误2'])).toBe('错误1；错误2');
    });
  });
});
