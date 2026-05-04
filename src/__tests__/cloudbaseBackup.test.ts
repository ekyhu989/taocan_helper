import {
  generateUserId,
  generateEncryptionKey,
  encryptData,
  decryptData,
  getAllLocalData,
  exportDataAsJson,
  clearSensitiveData,
} from '../utils/cloudbaseBackup';

describe('V1.6 云备份工具 - cloudbaseBackup', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('用户ID生成 - generateUserId', () => {
    test('TC-V16-127: 生成新用户ID', () => {
      const userId = generateUserId();
      expect(userId).toBeDefined();
      expect(userId.startsWith('user_')).toBe(true);
    });

    test('TC-V16-128: 已存在用户ID保持不变', () => {
      const existingId = 'user_12345_test';
      localStorage.setItem('taocang_user_id', existingId);
      
      const userId = generateUserId();
      expect(userId).toBe(existingId);
    });
  });

  describe('加密密钥生成 - generateEncryptionKey', () => {
    test('TC-V16-129: 生成加密密钥', () => {
      const key = generateEncryptionKey('新疆公司', '张三', '13800138000');
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    test('TC-V16-130: 相同三要素生成相同密钥', () => {
      const key1 = generateEncryptionKey('新疆公司', '张三', '13800138000');
      const key2 = generateEncryptionKey('新疆公司', '张三', '13800138000');
      expect(key1).toBe(key2);
    });

    test('TC-V16-131: 不同三要素生成不同密钥', () => {
      const key1 = generateEncryptionKey('新疆公司', '张三', '13800138000');
      const key2 = generateEncryptionKey('北京公司', '李四', '13900139000');
      expect(key1).not.toBe(key2);
    });
  });

  describe('数据加密 - encryptData', () => {
    test('TC-V16-132: 加密数据成功', () => {
      const data = { test: 'value' };
      const key = generateEncryptionKey('新疆公司', '张三', '13800138000');
      const encrypted = encryptData(data, key);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(JSON.stringify(data));
    });
  });

  describe('数据解密 - decryptData', () => {
    test('TC-V16-133: 解密数据成功', () => {
      const originalData = { test: 'value', id: 123 };
      const key = generateEncryptionKey('新疆公司', '张三', '13800138000');
      const encrypted = encryptData(originalData, key);
      const decrypted = decryptData(encrypted, key);
      
      expect(decrypted).toEqual(originalData);
    });

    test('TC-V16-134: 错误密钥解密失败', () => {
      const originalData = { test: 'value' };
      const key1 = generateEncryptionKey('新疆公司', '张三', '13800138000');
      const key2 = generateEncryptionKey('北京公司', '李四', '13900139000');
      const encrypted = encryptData(originalData, key1);
      
      expect(() => {
        decryptData(encrypted, key2);
      }).toThrow();
    });
  });

  describe('获取本地数据 - getAllLocalData', () => {
    test('TC-V16-135: 获取本地数据成功', () => {
      localStorage.setItem('product_library', JSON.stringify([{ id: 1 }]));
      localStorage.setItem('history_plans', JSON.stringify([{ id: 1 }]));
      
      const data = getAllLocalData();
      expect(data).toBeDefined();
      expect(data.productLibrary).toBeDefined();
      expect(data.historyPlans).toBeDefined();
      expect(data.backupMetadata).toBeDefined();
    });

    test('TC-V16-136: 空数据时返回默认值', () => {
      const data = getAllLocalData();
      expect(data.productLibrary).toEqual([]);
      expect(data.historyPlans).toEqual([]);
    });

    test('TC-V16-137: 计算数据统计信息', () => {
      localStorage.setItem('product_library', JSON.stringify([{ id: 1 }, { id: 2 }]));
      localStorage.setItem('history_plans', JSON.stringify([{ id: 1 }]));
      
      const data = getAllLocalData();
      expect(data.backupMetadata.totalItems).toBeGreaterThan(0);
      expect(data.backupMetadata.dataSize).toBeGreaterThan(0);
    });
  });

  describe('导出数据 - exportDataAsJson', () => {
    test('TC-V16-138: 导出JSON数据成功', () => {
      localStorage.setItem('product_library', JSON.stringify([{ id: 1 }]));
      
      const result = exportDataAsJson();
      expect(result.success).toBe(true);
      expect(result.blob).toBeDefined();
    });
  });

  describe('清理敏感数据 - clearSensitiveData', () => {
    test('TC-V16-139: 清理临时加密密钥', () => {
      sessionStorage.setItem('temp_encryption_key', 'test-key');
      localStorage.setItem('last_encryption_key', 'test-key');
      
      clearSensitiveData();
      
      expect(sessionStorage.getItem('temp_encryption_key')).toBeNull();
      expect(localStorage.getItem('last_encryption_key')).toBeNull();
    });
  });

  describe('数据完整性验证', () => {
    test('TC-V16-140: 加密解密数据完整性', () => {
      const testData = {
        string: '测试',
        number: 123,
        array: [1, 2, 3],
        object: { nested: 'value' }
      };
      const key = generateEncryptionKey('新疆公司', '张三', '13800138000');
      
      const encrypted = encryptData(testData, key);
      const decrypted = decryptData(encrypted, key);
      
      expect(decrypted).toEqual(testData);
    });
  });
});
