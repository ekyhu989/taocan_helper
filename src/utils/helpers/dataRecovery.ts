/**
 * 三要素数据恢复工具
 * 提供单位名称模糊匹配、三要素验证、恢复流程管理
 */

import { queryBackupRecords, restoreFromBackup } from './cloudbaseBackup';

// 单位名称模糊匹配算法
export class CompanyNameFuzzyMatcher {
  /**
   * 计算两个字符串的编辑距离（Levenshtein距离）
   */
  static levenshteinDistance(a: string, b: string): number {
    const matrix = [];
    
    // 初始化矩阵
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // 计算距离
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // 替换
            matrix[i][j - 1] + 1,     // 插入
            matrix[i - 1][j] + 1      // 删除
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  /**
   * 计算相似度分数（0-1）
   */
  static similarityScore(a: string, b: string): number {
    const distance = this.levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    
    if (maxLength === 0) return 1.0;
    
    return 1.0 - distance / maxLength;
  }
  
  /**
   * 提取单位名称的关键词（去除行政区划等后缀）
   */
  static extractKeywords(companyName: string): string[] {
    // 常见后缀
    const suffixes = [
      '公司', '有限公司', '有限责任公司', '集团', '股份公司',
      '厂', '局', '所', '院', '中心', '委员会', '办公室',
      '省', '市', '区', '县', '镇', '乡', '街道'
    ];
    
    let processed = companyName;
    
    // 去除后缀
    suffixes.forEach(suffix => {
      if (processed.endsWith(suffix)) {
        processed = processed.slice(0, -suffix.length);
      }
    });
    
    // 分割关键词
    const keywords = processed.split(/[·\-_()（）【】\[\]]/).filter(k => k.length > 0);
    
    return keywords;
  }
  
  /**
   * 模糊匹配单位名称
   * @param input 用户输入的单位名称
   * @param candidates 候选单位名称列表
   * @param threshold 匹配阈值（0-1），默认0.6
   */
  static fuzzyMatch(
    input: string,
    candidates: string[],
    threshold: number = 0.6
  ): Array<{ name: string; score: number; matched: boolean }> {
    const results = [];
    
    // 预处理输入
    const inputLower = input.toLowerCase().trim();
    
    for (const candidate of candidates) {
      const candidateLower = candidate.toLowerCase().trim();
      
      let score = 0;
      
      // 1. 精确匹配
      if (inputLower === candidateLower) {
        score = 1.0;
      }
      // 2. 包含匹配
      else if (candidateLower.includes(inputLower) || inputLower.includes(candidateLower)) {
        score = 0.8;
      }
      // 3. 编辑距离匹配
      else {
        score = this.similarityScore(inputLower, candidateLower);
      }
      
      results.push({
        name: candidate,
        score,
        matched: score >= threshold
      });
    }
    
    // 按分数降序排序
    results.sort((a, b) => b.score - a.score);
    
    return results;
  }
}

// 三要素验证器
export class ThreeFactorValidator {
  /**
   * 验证单位名称格式
   */
  static validateCompanyName(companyName: string): { valid: boolean; message?: string } {
    if (!companyName || companyName.trim().length === 0) {
      return { valid: false, message: '单位名称不能为空' };
    }
    
    if (companyName.length < 2) {
      return { valid: false, message: '单位名称至少2个字符' };
    }
    
    if (companyName.length > 100) {
      return { valid: false, message: '单位名称不能超过100个字符' };
    }
    
    // 检查是否包含非法字符
    const illegalChars = /[<>'"\\]/;
    if (illegalChars.test(companyName)) {
      return { valid: false, message: '单位名称包含非法字符' };
    }
    
    return { valid: true };
  }
  
  /**
   * 验证采购人姓名
   */
  static validatePurchaserName(name: string): { valid: boolean; message?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, message: '采购人姓名不能为空' };
    }
    
    if (name.length < 2) {
      return { valid: false, message: '采购人姓名至少2个字符' };
    }
    
    if (name.length > 50) {
      return { valid: false, message: '采购人姓名不能超过50个字符' };
    }
    
    // 检查是否包含非法字符
    const illegalChars = /[<>'"\\]/;
    if (illegalChars.test(name)) {
      return { valid: false, message: '采购人姓名包含非法字符' };
    }
    
    return { valid: true };
  }
  
  /**
   * 验证手机号格式
   */
  static validatePhoneNumber(phone: string): { valid: boolean; message?: string } {
    if (!phone || phone.trim().length === 0) {
      return { valid: false, message: '手机号不能为空' };
    }
    
    // 中国手机号正则（11位数字，1开头）
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    if (!phoneRegex.test(phone)) {
      return { valid: false, message: '请输入有效的11位手机号' };
    }
    
    return { valid: true };
  }
  
  /**
   * 验证三要素组合
   */
  static validateAll(
    companyName: string,
    purchaserName: string,
    phoneNumber: string
  ): { valid: boolean; messages?: string[] } {
    const validations = [
      this.validateCompanyName(companyName),
      this.validatePurchaserName(purchaserName),
      this.validatePhoneNumber(phoneNumber)
    ];
    
    const invalid = validations.filter(v => !v.valid);
    
    if (invalid.length === 0) {
      return { valid: true };
    }
    
    return {
      valid: false,
      messages: invalid.map(v => v.message!)
    };
  }
}

// 数据恢复管理器
export class DataRecoveryManager {
  private companyName: string = '';
  private purchaserName: string = '';
  private phoneNumber: string = '';
  private backupRecords: any[] = [];
  private selectedBackupId: string = '';
  
  /**
   * 设置三要素信息
   */
  setThreeFactors(
    companyName: string,
    purchaserName: string,
    phoneNumber: string
  ): { valid: boolean; messages?: string[] } {
    const validation = ThreeFactorValidator.validateAll(
      companyName,
      purchaserName,
      phoneNumber
    );
    
    if (!validation.valid) {
      return validation;
    }
    
    this.companyName = companyName.trim();
    this.purchaserName = purchaserName.trim();
    this.phoneNumber = phoneNumber.trim();
    
    return { valid: true };
  }
  
  /**
   * 查询可恢复的备份记录
   */
  async queryRecoveryRecords(): Promise<{
    success: boolean;
    records?: any[];
    message?: string;
  }> {
    try {
      if (!this.companyName || !this.purchaserName || !this.phoneNumber) {
        return { 
          success: false, 
          message: '请先设置单位名称、采购人姓名和手机号' 
        };
      }
      
      const result = await queryBackupRecords(
        this.companyName,
        this.purchaserName,
        this.phoneNumber
      );
      
      if (!result.success || !result.records) {
        return result;
      }
      
      this.backupRecords = result.records;
      
      // 应用模糊匹配（如果精确匹配记录较少）
      if (this.backupRecords.length < 3) {
        // 可以扩展：从其他用户备份中模糊匹配单位名称
        // 简化实现：直接返回现有记录
      }
      
      return {
        success: true,
        records: this.backupRecords.map(record => ({
          id: record.id,
          companyName: record.companyName,
          purchaserName: record.purchaserName,
          phoneNumber: record.phoneNumber,
          timestamp: record.timestamp,
          description: record.description,
          dataSize: this.formatFileSize(record.dataSize),
          totalItems: record.totalItems,
          formattedTime: new Date(record.timestamp).toLocaleString('zh-CN')
        }))
      };
      
    } catch (error) {
      console.error('查询恢复记录失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '查询失败'
      };
    }
  }
  
  /**
   * 选择要恢复的备份
   */
  selectBackup(backupId: string): boolean {
    const backup = this.backupRecords.find(record => record.id === backupId);
    
    if (!backup) {
      return false;
    }
    
    this.selectedBackupId = backupId;
    return true;
  }
  
  /**
   * 执行数据恢复
   */
  async performRecovery(): Promise<{
    success: boolean;
    restoredData?: any;
    message?: string;
  }> {
    try {
      if (!this.selectedBackupId) {
        return { success: false, message: '请先选择要恢复的备份记录' };
      }
      
      if (!this.companyName || !this.purchaserName || !this.phoneNumber) {
        return { success: false, message: '三要素信息不完整' };
      }
      
      const result = await restoreFromBackup(
        this.selectedBackupId,
        this.companyName,
        this.purchaserName,
        this.phoneNumber
      );
      
      if (result.success) {
        // 记录恢复操作日志
        this.logRecoveryOperation(this.selectedBackupId);
      }
      
      return result;
      
    } catch (error) {
      console.error('执行恢复失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '恢复失败'
      };
    }
  }
  
  /**
   * 手动审核恢复（兜底方案）
   */
  async manualReviewRecovery(
    companyCertImage: string, // Base64图片数据
    additionalInfo?: string
  ): Promise<{ success: boolean; requestId?: string; message?: string }> {
    try {
      // 在实际应用中，这里会调用管理员API提交审核请求
      // 简化实现：返回模拟请求ID
      
      const requestId = 'MR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
      
      // 保存审核请求到本地（模拟）
      const reviewRequests = JSON.parse(localStorage.getItem('manual_review_requests') || '[]');
      reviewRequests.push({
        requestId,
        companyName: this.companyName,
        purchaserName: this.purchaserName,
        phoneNumber: this.phoneNumber,
        companyCertImage: companyCertImage.substring(0, 100) + '...', // 截断存储
        additionalInfo,
        timestamp: new Date(),
        status: 'pending'
      });
      localStorage.setItem('manual_review_requests', JSON.stringify(reviewRequests));
      
      return {
        success: true,
        requestId,
        message: '人工审核请求已提交，请等待管理员处理（通常在24小时内）'
      };
      
    } catch (error) {
      console.error('提交人工审核失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '提交失败'
      };
    }
  }
  
  /**
   * 检查人工审核状态
   */
  checkManualReviewStatus(requestId: string): {
    status: 'pending' | 'approved' | 'rejected' | 'not_found';
    message?: string;
    processedAt?: Date;
  } {
    try {
      const reviewRequests = JSON.parse(localStorage.getItem('manual_review_requests') || '[]');
      const request = reviewRequests.find((req: any) => req.requestId === requestId);
      
      if (!request) {
        return { status: 'not_found' };
      }
      
      return {
        status: request.status,
        message: request.status === 'approved' 
          ? '审核已通过，可以恢复数据' 
          : request.status === 'rejected'
          ? request.rejectReason || '审核未通过'
          : '审核处理中',
        processedAt: request.processedAt
      };
      
    } catch (error) {
      console.error('检查审核状态失败:', error);
      return { status: 'not_found' };
    }
  }
  
  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * 记录恢复操作日志
   */
  private logRecoveryOperation(backupId: string): void {
    try {
      const recoveryLogs = JSON.parse(localStorage.getItem('recovery_logs') || '[]');
      
      recoveryLogs.push({
        backupId,
        companyName: this.companyName,
        purchaserName: this.purchaserName,
        phoneNumber: this.phoneNumber,
        timestamp: new Date(),
        operation: 'restore'
      });
      
      // 保留最近100条记录
      if (recoveryLogs.length > 100) {
        recoveryLogs.splice(0, recoveryLogs.length - 100);
      }
      
      localStorage.setItem('recovery_logs', JSON.stringify(recoveryLogs));
      
    } catch (error) {
      console.error('记录恢复日志失败:', error);
    }
  }
  
  /**
   * 获取当前选中的备份信息
   */
  getSelectedBackupInfo(): any {
    return this.backupRecords.find(record => record.id === this.selectedBackupId);
  }
  
  /**
   * 清除当前恢复会话
   */
  clearSession(): void {
    this.companyName = '';
    this.purchaserName = '';
    this.phoneNumber = '';
    this.backupRecords = [];
    this.selectedBackupId = '';
  }
}

// 导出单例实例
export const recoveryManager = new DataRecoveryManager();