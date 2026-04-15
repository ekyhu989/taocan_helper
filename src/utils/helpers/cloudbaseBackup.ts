/**
 * 腾讯云CloudBase备份工具
 * 提供数据加密备份、恢复、导出功能
 */

import cloudbase from '@cloudbase/js-sdk';
import CryptoJS from 'crypto-js';

// CloudBase环境配置
const CLOUDBASE_ENV = 'taocang-helper-6g9ad4x31a5351d5';

// 初始化CloudBase
let app: any = null;
let db: any = null;

/**
 * 初始化CloudBase SDK
 */
export const initCloudBase = async (): Promise<boolean> => {
  try {
    app = cloudbase.init({
      env: CLOUDBASE_ENV
    });
    
    // 匿名登录（免费额度内）
    await app.auth().anonymousAuthProvider().signIn();
    
    db = app.database();
    console.log('CloudBase初始化成功');
    return true;
  } catch (error) {
    console.error('CloudBase初始化失败:', error);
    return false;
  }
};

/**
 * 生成用户唯一ID（基于本地存储）
 */
export const generateUserId = (): string => {
  let userId = localStorage.getItem('taocang_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('taocang_user_id', userId);
  }
  return userId;
};

/**
 * 生成加密密钥（基于用户三要素）
 */
export const generateEncryptionKey = (
  companyName: string,
  purchaserName: string,
  phoneNumber: string
): string => {
  // 使用三要素组合生成密钥
  const rawKey = `${companyName}_${purchaserName}_${phoneNumber}`;
  // 使用SHA256哈希确保固定长度
  return CryptoJS.SHA256(rawKey).toString();
};

/**
 * AES加密数据
 */
export const encryptData = (data: any, key: string): string => {
  try {
    const dataStr = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(dataStr, key).toString();
    return encrypted;
  } catch (error) {
    console.error('数据加密失败:', error);
    throw new Error('数据加密失败');
  }
};

/**
 * AES解密数据
 */
export const decryptData = (encryptedData: string, key: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedStr) {
      throw new Error('解密失败，密钥可能不正确');
    }
    
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error('数据解密失败:', error);
    throw new Error('数据解密失败');
  }
};

/**
 * 获取本地所有数据
 */
export const getAllLocalData = () => {
  try {
    const data = {
      // 商品库数据
      productLibrary: JSON.parse(localStorage.getItem('product_library') || '[]'),
      // 历史方案
      historyPlans: JSON.parse(localStorage.getItem('history_plans') || '[]'),
      // 用户设置
      userSettings: JSON.parse(localStorage.getItem('user_settings') || '{}'),
      // 操作日志
      operationLogs: JSON.parse(localStorage.getItem('operation_logs') || '[]'),
      // 备份元数据
      backupMetadata: {
        timestamp: new Date().toISOString(),
        totalItems: 0,
        dataSize: 0
      }
    };
    
    // 计算统计信息
    data.backupMetadata.totalItems = 
      data.productLibrary.length + 
      data.historyPlans.length + 
      data.operationLogs.length;
    
    data.backupMetadata.dataSize = new Blob([JSON.stringify(data)]).size;
    
    return data;
  } catch (error) {
    console.error('获取本地数据失败:', error);
    throw new Error('获取本地数据失败');
  }
};

/**
 * 备份数据到CloudBase
 */
export const backupToCloudBase = async (
  companyName: string,
  purchaserName: string,
  phoneNumber: string,
  description?: string
): Promise<{ success: boolean; backupId?: string; message?: string }> => {
  try {
    // 初始化CloudBase
    const initialized = await initCloudBase();
    if (!initialized) {
      return { success: false, message: 'CloudBase初始化失败' };
    }
    
    // 生成用户ID
    const userId = generateUserId();
    
    // 生成加密密钥
    const encryptionKey = generateEncryptionKey(companyName, purchaserName, phoneNumber);
    
    // 获取本地数据
    const localData = getAllLocalData();
    
    // 加密数据
    const encryptedData = encryptData(localData, encryptionKey);
    
    // 准备备份记录
    const backupRecord = {
      userId,
      companyName,
      purchaserName,
      phoneNumber,
      encryptedData,
      description: description || '手动备份',
      timestamp: new Date(),
      dataSize: localData.backupMetadata.dataSize,
      totalItems: localData.backupMetadata.totalItems,
      version: '1.0'
    };
    
    // 保存到CloudBase
    const result = await db.collection('backups').add(backupRecord);
    
    console.log('数据备份成功，备份ID:', result.id);
    
    // 保存备份ID到本地
    const backupList = JSON.parse(localStorage.getItem('backup_list') || '[]');
    backupList.push({
      id: result.id,
      timestamp: backupRecord.timestamp,
      description: backupRecord.description,
      companyName,
      purchaserName,
      phoneNumber
    });
    localStorage.setItem('backup_list', JSON.stringify(backupList));
    
    return { 
      success: true, 
      backupId: result.id,
      message: `数据备份成功，共${localData.backupMetadata.totalItems}项数据`
    };
    
  } catch (error) {
    console.error('数据备份失败:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 查询用户的备份记录
 */
export const queryBackupRecords = async (
  companyName: string,
  purchaserName: string,
  phoneNumber: string
): Promise<{ success: boolean; records?: any[]; message?: string }> => {
  try {
    // 初始化CloudBase
    const initialized = await initCloudBase();
    if (!initialized) {
      return { success: false, message: 'CloudBase初始化失败' };
    }
    
    // 模糊匹配查询（支持部分匹配）
    const query = db.collection('backups')
      .where({
        companyName: db.RegExp({
          regexp: companyName,
          options: 'i' // 不区分大小写
        })
      })
      .where({
        purchaserName: db.RegExp({
          regexp: purchaserName,
          options: 'i'
        })
      })
      .where({
        phoneNumber: db.RegExp({
          regexp: phoneNumber,
          options: 'i'
        })
      })
      .orderBy('timestamp', 'desc')
      .limit(20);
    
    const result = await query.get();
    
    return {
      success: true,
      records: result.data.map((item: any) => ({
        id: item._id,
        companyName: item.companyName,
        purchaserName: item.purchaserName,
        phoneNumber: item.phoneNumber,
        timestamp: item.timestamp,
        description: item.description,
        dataSize: item.dataSize,
        totalItems: item.totalItems
      }))
    };
    
  } catch (error) {
    console.error('查询备份记录失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 从备份恢复数据
 */
export const restoreFromBackup = async (
  backupId: string,
  companyName: string,
  purchaserName: string,
  phoneNumber: string
): Promise<{ success: boolean; restoredData?: any; message?: string }> => {
  try {
    // 初始化CloudBase
    const initialized = await initCloudBase();
    if (!initialized) {
      return { success: false, message: 'CloudBase初始化失败' };
    }
    
    // 查询备份记录
    const result = await db.collection('backups').doc(backupId).get();
    
    if (!result.data) {
      return { success: false, message: '备份记录不存在' };
    }
    
    const backupRecord = result.data;
    
    // 验证三要素匹配
    if (backupRecord.companyName !== companyName ||
        backupRecord.purchaserName !== purchaserName ||
        backupRecord.phoneNumber !== phoneNumber) {
      return { 
        success: false, 
        message: '单位名称、采购人姓名或手机号不匹配，无法恢复数据' 
      };
    }
    
    // 生成加密密钥
    const encryptionKey = generateEncryptionKey(companyName, purchaserName, phoneNumber);
    
    // 解密数据
    const restoredData = decryptData(backupRecord.encryptedData, encryptionKey);
    
    // 恢复数据到本地存储
    if (restoredData.productLibrary) {
      localStorage.setItem('product_library', JSON.stringify(restoredData.productLibrary));
    }
    
    if (restoredData.historyPlans) {
      localStorage.setItem('history_plans', JSON.stringify(restoredData.historyPlans));
    }
    
    if (restoredData.userSettings) {
      localStorage.setItem('user_settings', JSON.stringify(restoredData.userSettings));
    }
    
    if (restoredData.operationLogs) {
      localStorage.setItem('operation_logs', JSON.stringify(restoredData.operationLogs));
    }
    
    console.log('数据恢复成功，恢复ID:', backupId);
    
    return {
      success: true,
      restoredData,
      message: `数据恢复成功，共恢复${restoredData.backupMetadata?.totalItems || 0}项数据`
    };
    
  } catch (error) {
    console.error('数据恢复失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 导出数据为JSON文件
 */
export const exportDataAsJson = (): { success: boolean; blob?: Blob; message?: string } => {
  try {
    const data = getAllLocalData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    
    return {
      success: true,
      blob,
      message: `数据导出成功，共${data.backupMetadata.totalItems}项数据`
    };
  } catch (error) {
    console.error('数据导出失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 导出数据为Excel文件（简化版，实际需要xlsx库）
 */
export const exportDataAsExcel = (): { success: boolean; blob?: Blob; message?: string } => {
  try {
    const data = getAllLocalData();
    
    // 创建CSV格式的Excel数据（简化实现）
    let csvContent = '';
    
    // 商品库数据
    if (data.productLibrary.length > 0) {
      csvContent += '商品库数据\n';
      const headers = Object.keys(data.productLibrary[0]).join(',');
      csvContent += headers + '\n';
      
      data.productLibrary.forEach((item: any) => {
        const row = Object.values(item).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',');
        csvContent += row + '\n';
      });
      
      csvContent += '\n';
    }
    
    // 历史方案数据
    if (data.historyPlans.length > 0) {
      csvContent += '历史方案数据\n';
      const headers = Object.keys(data.historyPlans[0]).join(',');
      csvContent += headers + '\n';
      
      data.historyPlans.forEach((item: any) => {
        const row = Object.values(item).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',');
        csvContent += row + '\n';
      });
    }
    
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8' 
    });
    
    return {
      success: true,
      blob,
      message: `数据导出成功，共${data.backupMetadata.totalItems}项数据`
    };
  } catch (error) {
    console.error('数据导出失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 清理内存中的敏感数据
 */
export const clearSensitiveData = (): void => {
  try {
    // 清理临时变量
    const sensitiveKeys = [
      'temp_encryption_key',
      'temp_backup_data',
      'temp_recovery_data',
      'last_encryption_key'
    ];
    
    sensitiveKeys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    
    // 触发垃圾回收（仅建议）
    if (window.gc) {
      window.gc();
    }
    
    console.log('敏感数据清理完成');
  } catch (error) {
    console.error('敏感数据清理失败:', error);
  }
};

/**
 * 获取备份统计信息
 */
export const getBackupStats = async (): Promise<{
  totalBackups: number;
  totalDataSize: number;
  lastBackupTime?: Date;
}> => {
  try {
    const initialized = await initCloudBase();
    if (!initialized) {
      return { totalBackups: 0, totalDataSize: 0 };
    }
    
    const userId = generateUserId();
    const query = db.collection('backups')
      .where({ userId })
      .orderBy('timestamp', 'desc')
      .limit(1);
    
    const result = await query.get();
    
    if (result.data.length === 0) {
      return { totalBackups: 0, totalDataSize: 0 };
    }
    
    const lastBackup = result.data[0];
    
    // 获取总数（简化版，实际可能需要分页查询）
    const countQuery = db.collection('backups').where({ userId });
    const countResult = await countQuery.count();
    
    return {
      totalBackups: countResult.total,
      totalDataSize: lastBackup.dataSize,
      lastBackupTime: lastBackup.timestamp
    };
    
  } catch (error) {
    console.error('获取备份统计失败:', error);
    return { totalBackups: 0, totalDataSize: 0 };
  }
};