import React, { useState, useEffect } from 'react';
import { recoveryManager } from '../utils/dataRecovery';

const DataRecoveryPage = () => {
  const [companyName, setCompanyName] = useState('');
  const [purchaserName, setPurchaserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validationMessages, setValidationMessages] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [backupRecords, setBackupRecords] = useState([]);
  const [selectedBackupId, setSelectedBackupId] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);
  const [manualReviewMode, setManualReviewMode] = useState(false);
  const [companyCertImage, setCompanyCertImage] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // 从本地存储加载上次使用的单位信息
  useEffect(() => {
    const savedCompany = localStorage.getItem('last_company_name');
    const savedPurchaser = localStorage.getItem('last_purchaser_name');
    const savedPhone = localStorage.getItem('last_phone_number');
    
    if (savedCompany) setCompanyName(savedCompany);
    if (savedPurchaser) setPurchaserName(savedPurchaser);
    if (savedPhone) setPhoneNumber(savedPhone);
  }, []);
  
  const handleQueryBackups = async () => {
    // 验证输入
    const messages = [];
    
    if (!companyName.trim()) {
      messages.push('单位名称不能为空');
    }
    
    if (!purchaserName.trim()) {
      messages.push('采购人姓名不能为空');
    }
    
    if (!phoneNumber.trim() || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      messages.push('请输入有效的11位手机号');
    }
    
    if (messages.length > 0) {
      setValidationMessages(messages);
      return;
    }
    
    setIsQuerying(true);
    setValidationMessages([]);
    setBackupRecords([]);
    setSelectedBackupId('');
    setRestoreResult(null);
    
    try {
      // 设置三要素信息
      const validation = recoveryManager.setThreeFactors(
        companyName,
        purchaserName,
        phoneNumber
      );
      
      if (!validation.valid) {
        setValidationMessages(validation.messages || ['验证失败']);
        return;
      }
      
      // 查询备份记录
      const result = await recoveryManager.queryRecoveryRecords();
      
      if (result.success && result.records) {
        setBackupRecords(result.records);
        
        if (result.records.length === 0) {
          setValidationMessages(['未找到匹配的备份记录，请检查输入信息或尝试模糊匹配']);
        }
      } else {
        setValidationMessages([result.message || '查询失败']);
      }
    } catch (error) {
      setValidationMessages([error instanceof Error ? error.message : '查询失败']);
    } finally {
      setIsQuerying(false);
    }
  };
  
  const handleSelectBackup = (backupId) => {
    setSelectedBackupId(backupId);
    recoveryManager.selectBackup(backupId);
  };
  
  const handleRestore = async () => {
    if (!selectedBackupId) {
      setValidationMessages(['请先选择要恢复的备份记录']);
      return;
    }
    
    setIsRestoring(true);
    setRestoreResult(null);
    
    try {
      const result = await recoveryManager.performRecovery();
      
      setRestoreResult(result);
      
      if (result.success) {
        // 清空记录列表（可选）
        // setBackupRecords([]);
        // setSelectedBackupId('');
        
        // 显示成功提示
        setTimeout(() => {
          alert('数据恢复成功！页面将刷新以加载恢复的数据。');
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setRestoreResult({
        success: false,
        message: error instanceof Error ? error.message : '恢复失败'
      });
    } finally {
      setIsRestoring(false);
    }
  };
  
  const handleManualReviewSubmit = async () => {
    if (!companyCertImage.trim()) {
      setValidationMessages(['请上传单位证件照片']);
      return;
    }
    
    setIsSubmittingReview(true);
    
    try {
      // 设置三要素信息
      recoveryManager.setThreeFactors(companyName, purchaserName, phoneNumber);
      
      const result = await recoveryManager.manualReviewRecovery(
        companyCertImage,
        additionalInfo
      );
      
      if (result.success) {
        setRestoreResult({
          success: true,
          message: `人工审核请求已提交，请求ID：${result.requestId}。请等待管理员处理（通常在24小时内）。`
        });
        
        // 重置表单
        setCompanyCertImage('');
        setAdditionalInfo('');
        setManualReviewMode(false);
      } else {
        setRestoreResult({
          success: false,
          message: result.message || '提交失败'
        });
      }
    } catch (error) {
      setRestoreResult({
        success: false,
        message: error instanceof Error ? error.message : '提交失败'
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCompanyCertImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  const formatFileSize = (sizeStr) => {
    return sizeStr || '未知';
  };
  
  const clearAll = () => {
    setCompanyName('');
    setPurchaserName('');
    setPhoneNumber('');
    setValidationMessages([]);
    setBackupRecords([]);
    setSelectedBackupId('');
    setRestoreResult(null);
    setManualReviewMode(false);
    setCompanyCertImage('');
    setAdditionalInfo('');
    recoveryManager.clearSession();
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        数据恢复
      </h2>
      
      {/* 三要素输入 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">第一步：输入恢复信息</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              单位全称 *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入单位全称"
            />
            <p className="text-xs text-gray-500 mt-1">
              支持模糊匹配，可输入简称或包含部分名称
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                采购人姓名 *
              </label>
              <input
                type="text"
                value={purchaserName}
                onChange={(e) => setPurchaserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入采购人姓名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手机号 *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入11位手机号"
                maxLength={11}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleQueryBackups}
              disabled={isQuerying}
              className={`px-6 py-3 rounded-md font-medium ${
                isQuerying
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isQuerying ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  查询中...
                </>
              ) : (
                '查询可恢复数据'
              )}
            </button>
            
            <button
              onClick={clearAll}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              清空所有
            </button>
          </div>
        </div>
      </div>
      
      {/* 验证消息 */}
      {validationMessages.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">请检查以下问题：</h4>
          <ul className="list-disc pl-5 space-y-1">
            {validationMessages.map((msg, index) => (
              <li key={index} className="text-sm text-yellow-700">{msg}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 备份记录列表 */}
      {backupRecords.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            第二步：选择要恢复的备份记录
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              找到 {backupRecords.length} 条备份记录，请选择要恢复的备份：
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {backupRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedBackupId === record.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectBackup(record.id)}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <input
                        type="radio"
                        checked={selectedBackupId === record.id}
                        onChange={() => {}}
                        className="text-blue-600"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {record.description}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            单位：{record.companyName} | 采购人：{record.purchaserName} | 手机：{record.phoneNumber}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-gray-700">
                            {record.formattedTime}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            数据量：{formatFileSize(record.dataSize)} | {record.totalItems} 项
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleRestore}
                disabled={isRestoring || !selectedBackupId}
                className={`px-8 py-3 rounded-md font-medium ${
                  isRestoring || !selectedBackupId
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isRestoring ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    恢复中...
                  </>
                ) : (
                  '恢复选中数据'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 人工审核兜底方案 */}
      {!manualReviewMode && backupRecords.length === 0 && validationMessages.length > 0 && (
        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-800 mb-2">找不到匹配的备份记录？</h4>
          <p className="text-sm text-orange-700 mb-3">
            如果您确定曾经备份过数据，但无法通过三要素匹配，可以使用人工审核恢复通道。
            需要上传单位证件照片，管理员审核通过后为您手动恢复数据。
          </p>
          
          <button
            onClick={() => setManualReviewMode(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md"
          >
            申请人工审核恢复
          </button>
        </div>
      )}
      
      {manualReviewMode && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-300">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">人工审核恢复申请</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                单位证件照片 *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {companyCertImage ? (
                  <div>
                    <img 
                      src={companyCertImage} 
                      alt="单位证件预览" 
                      className="max-h-32 mx-auto mb-2"
                    />
                    <p className="text-sm text-green-600">照片已上传</p>
                    <button
                      type="button"
                      onClick={() => setCompanyCertImage('')}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      重新上传
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">请上传单位营业执照、组织机构代码证等证件照片</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                补充说明（可选）
              </label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="请说明情况，例如：单位名称变更、手机号变更等"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleManualReviewSubmit}
                disabled={isSubmittingReview || !companyCertImage}
                className={`px-6 py-3 rounded-md font-medium ${
                  isSubmittingReview || !companyCertImage
                    ? 'bg-orange-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                {isSubmittingReview ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    提交中...
                  </>
                ) : (
                  '提交人工审核申请'
                )}
              </button>
              
              <button
                onClick={() => setManualReviewMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 恢复结果 */}
      {restoreResult && (
        <div className={`p-4 rounded-lg mb-4 ${
          restoreResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`mr-3 ${
              restoreResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {restoreResult.success ? '✓' : '✗'}
            </div>
            <div>
              <p className={`font-medium ${
                restoreResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {restoreResult.success ? '操作成功' : '操作失败'}
              </p>
              <p className={`text-sm ${
                restoreResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {restoreResult.message}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* 使用说明 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">恢复流程说明</h4>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-5">
          <li><strong>输入三要素信息</strong>：单位名称、采购人姓名、手机号必须与备份时一致</li>
          <li><strong>查询备份记录</strong>：系统会查询匹配的备份记录并显示列表</li>
          <li><strong>选择恢复目标</strong>：从列表中选择要恢复的备份记录</li>
          <li><strong>执行恢复</strong>：数据将解密并恢复到本地存储中</li>
          <li><strong>人工审核（兜底）</strong>：如果三要素匹配失败，可申请人工审核恢复</li>
        </ol>
        
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-700">
            <strong>注意：</strong>恢复操作会覆盖当前的本地数据，请谨慎操作。建议在恢复前先导出当前数据作为备份。
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataRecoveryPage;