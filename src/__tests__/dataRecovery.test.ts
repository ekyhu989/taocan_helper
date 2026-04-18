import {
  CompanyNameFuzzyMatcher,
  ThreeFactorValidator,
  DataRecoveryManager,
  recoveryManager,
} from '../utils/dataRecovery';

describe('V1.6 数据恢复工具 - dataRecovery', () => {
  describe('模糊匹配器 - CompanyNameFuzzyMatcher', () => {
    describe('编辑距离计算 - levenshteinDistance', () => {
      test('TC-V16-099: 相同字符串距离为0', () => {
        const distance = CompanyNameFuzzyMatcher.levenshteinDistance('新疆公司', '新疆公司');
        expect(distance).toBe(0);
      });

      test('TC-V16-100: 不同字符串距离正确', () => {
        const distance = CompanyNameFuzzyMatcher.levenshteinDistance('新疆公司', '新疆有限公司');
        expect(distance).toBeGreaterThan(0);
      });
    });

    describe('相似度计算 - similarityScore', () => {
      test('TC-V16-101: 相同字符串相似度1.0', () => {
        const score = CompanyNameFuzzyMatcher.similarityScore('新疆公司', '新疆公司');
        expect(score).toBe(1.0);
      });

      test('TC-V16-102: 相似字符串相似度高', () => {
        const score = CompanyNameFuzzyMatcher.similarityScore('新疆公司', '新疆有限公司');
        expect(score).toBeGreaterThan(0.5);
      });

      test('TC-V16-103: 完全不同字符串相似度低', () => {
        const score = CompanyNameFuzzyMatcher.similarityScore('新疆公司', '北京公司');
        expect(score).toBeLessThan(0.8);
      });
    });

    describe('关键词提取 - extractKeywords', () => {
      test('TC-V16-104: 去除公司后缀', () => {
        const keywords = CompanyNameFuzzyMatcher.extractKeywords('新疆有限公司');
        expect(keywords).toContain('新疆');
      });

      test('TC-V16-105: 去除行政区划后缀', () => {
        const keywords = CompanyNameFuzzyMatcher.extractKeywords('新疆维吾尔自治区公司');
        expect(keywords.length).toBeGreaterThan(0);
      });
    });

    describe('模糊匹配 - fuzzyMatch', () => {
      test('TC-V16-106: 精确匹配分数1.0', () => {
        const results = CompanyNameFuzzyMatcher.fuzzyMatch('新疆公司', ['新疆公司', '北京公司']);
        expect(results[0].score).toBe(1.0);
        expect(results[0].matched).toBe(true);
      });

      test('TC-V16-107: 包含匹配分数0.8', () => {
        const results = CompanyNameFuzzyMatcher.fuzzyMatch('新疆', ['新疆公司', '北京公司']);
        expect(results[0].score).toBe(0.8);
      });

      test('TC-V16-108: 低于阈值不匹配', () => {
        const results = CompanyNameFuzzyMatcher.fuzzyMatch('新疆', ['北京公司'], 0.9);
        expect(results[0].matched).toBe(false);
      });

      test('TC-V16-109: 结果按分数降序', () => {
        const results = CompanyNameFuzzyMatcher.fuzzyMatch('新疆', ['新疆公司', '新疆维吾尔自治区公司', '北京公司']);
        expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
        expect(results[1].score).toBeGreaterThanOrEqual(results[2].score);
      });
    });
  });

  describe('三要素验证器 - ThreeFactorValidator', () => {
    describe('单位名称验证', () => {
      test('TC-V16-110: 正常单位名称通过', () => {
        const result = ThreeFactorValidator.validateCompanyName('新疆有限公司');
        expect(result.valid).toBe(true);
      });

      test('TC-V16-111: 单位名称不能为空', () => {
        const result = ThreeFactorValidator.validateCompanyName('');
        expect(result.valid).toBe(false);
      });

      test('TC-V16-112: 单位名称至少2个字符', () => {
        const result = ThreeFactorValidator.validateCompanyName('新');
        expect(result.valid).toBe(false);
      });

      test('TC-V16-113: 单位名称不能超过100字符', () => {
        const longName = 'x'.repeat(101);
        const result = ThreeFactorValidator.validateCompanyName(longName);
        expect(result.valid).toBe(false);
      });

      test('TC-V16-114: 单位名称不能包含非法字符', () => {
        const result = ThreeFactorValidator.validateCompanyName('新疆<公司>');
        expect(result.valid).toBe(false);
      });
    });

    describe('采购人姓名验证', () => {
      test('TC-V16-115: 正常姓名通过', () => {
        const result = ThreeFactorValidator.validatePurchaserName('张三');
        expect(result.valid).toBe(true);
      });

      test('TC-V16-116: 姓名不能为空', () => {
        const result = ThreeFactorValidator.validatePurchaserName('');
        expect(result.valid).toBe(false);
      });
    });

    describe('手机号验证', () => {
      test('TC-V16-117: 正常手机号通过', () => {
        const result = ThreeFactorValidator.validatePhoneNumber('13800138000');
        expect(result.valid).toBe(true);
      });

      test('TC-V16-118: 手机号不能为空', () => {
        const result = ThreeFactorValidator.validatePhoneNumber('');
        expect(result.valid).toBe(false);
      });

      test('TC-V16-119: 手机号格式错误', () => {
        const result = ThreeFactorValidator.validatePhoneNumber('12345');
        expect(result.valid).toBe(false);
      });
    });

    describe('三要素组合验证', () => {
      test('TC-V16-120: 三要素全部通过', () => {
        const result = ThreeFactorValidator.validateAll('新疆公司', '张三', '13800138000');
        expect(result.valid).toBe(true);
      });

      test('TC-V16-121: 三要素部分失败', () => {
        const result = ThreeFactorValidator.validateAll('', '张三', '13800138000');
        expect(result.valid).toBe(false);
        expect(result.messages?.messages?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('数据恢复管理器 - DataRecoveryManager', () => {
    let manager: DataRecoveryManager;

    beforeEach(() => {
      manager = new DataRecoveryManager();
      localStorage.clear();
    });

    describe('设置三要素', () => {
      test('TC-V16-122: 设置有效三要素', () => {
        const result = manager.setThreeFactors('新疆公司', '张三', '13800138000');
        expect(result.valid).toBe(true);
      });

      test('TC-V16-123: 设置无效三要素', () => {
        const result = manager.setThreeFactors('', '张三', '13800138000');
        expect(result.valid).toBe(false);
      });
    });

    describe('人工审核功能', () => {
      test('TC-V16-124: 提交人工审核请求', async () => {
        manager.setThreeFactors('新疆公司', '张三', '13800138000');
        const result = await manager.manualReviewRecovery('base64-image-data');
        expect(result.success).toBe(true);
        expect(result.requestId).toBeDefined();
      });

      test('TC-V16-125: 检查审核状态', () => {
        const status = manager.checkManualReviewStatus('nonexistent');
        expect(status.status).toBe('not_found');
      });
    });

    describe('会话管理', () => {
      test('TC-V16-126: 清除会话', () => {
        manager.setThreeFactors('新疆公司', '张三', '13800138000');
        manager.clearSession();
        expect(manager.getSelectedBackupInfo()).toBeUndefined();
      });
    });
  });
});