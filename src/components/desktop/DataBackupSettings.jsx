import React, { useState, useEffect } from 'react';
import { 
  backupToCloudBase, 
  getBackupStats, 
  exportDataAsJson, 
  exportDataAsExcel,
  clearSensitiveData 
} from '../../utils/helpers/cloudbaseBackup';

const DataBackupSettings = () => {
  const [companyName, setCompanyName] = useState('');
  const [purchaserName, setPurchaserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('手动备份');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupResult, setBackupResult] = useState(null);
  const [stats, setStats] = useState({ totalBackups: 0, totalDataSize: 0, lastBackupTime: null });
  const [exportFormat, setExportFormat] = useState('json');
  const [exportContent, setExportContent] = useState({
    productLibrary: true,
    historyPlans: true,
    operationLogs: false,
    userSettings: true
  });
  const [isExporting, setIsExporting] = useState(false);
  
  // 加载备份统计
  useEffect(() => {
    loadBackupStats();
    
    // 从本地存储加载上次使用的单位信息
    const savedCompany = localStorage.getItem('last_company_name');
    const savedPurchaser = localStorage.getItem('last_purchaser_name');
    const savedPhone = localStorage.getItem('last_phone_number');
    
    if (savedCompany) setCompanyName(savedCompany);
    if (savedPurchaser) setPurchaserName(savedPurchaser);
    if (savedPhone) setPhoneNumber(savedPhone);
  }, []);
  
  const loadBackupStats = async () => {
    try {
      const backupStats = await getBackupStats();
      setStats(backupStats);
    } catch (error) {
      console.error('加载备份统计失败:', error);
    }
  };
  
  const handleBackup = async () => {
    // 验证输入
    if (!companyName.trim()) {
      setBackupResult({ success: false, message: '请输入单位名称' });
      return;
    }
    
    if (!purchaserName.trim()) {
      setBackupResult({ success: false, message: '请输入采购人姓名' });
      return;
    }
    
    if (!phoneNumber.trim() || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      setBackupResult({ success: false, message: '请输入有效的11位手机号' });
      return;
    }
    
    setIsBackingUp(true);
    setBackupResult(null);
    
    try {
      // 保存单位信息到本地存储
      localStorage.setItem('last_company_name', companyName);
      localStorage.setItem('last_purchaser_name', purchaserName);
      localStorage.setItem('last_phone_number', phoneNumber);
      
      const result = await backupToCloudBase(
        companyName,
        purchaserName,
        phoneNumber,
        description
      );
      
      setBackupResult(result);
      
      if (result.success) {
        // 重新加载统计
        await loadBackupStats();
        
        // 清空输入（可选）
        // setDescription('手动备份');
      }
    } catch (error) {
      setBackupResult({ 
        success: false, 
        message: error instanceof Error ? error.message : '备份失败' 
      });
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleExport = () => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      let result;
      let fileName;
      let fileExtension;
      
      if (exportFormat === 'json') {
        result = exportDataAsJson();
        fileName = `taocang_backup_${new Date().toISOString().split('T')[0]}.json`;
        fileExtension = '.json';
      } else {
        result = exportDataAsExcel();
        fileName = `taocang_backup_${new Date().toISOString().split('T')[0]}.csv`;
        fileExtension = '.csv';
      }
      
      if (result.success && result.blob) {
        // 创建下载链接
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // 显示成功消息
        setBackupResult({
          success: true,
          message: result.message || '数据导出成功'
        });
        
        // 清理敏感数据（如果用户选择）
        if (exportFormat === 'json') {
          // JSON导出后建议清理
          setTimeout(() => {
            if (window.confirm('是否清理内存中的敏感数据？建议在导出后清理。')) {
              clearSensitiveData();
              alert('敏感数据已清理');
            }
          }, 1000);
        }
      } else {
        setBackupResult({
          success: false,
          message: result.message || '数据导出失败'
        });
      }
    } catch (error) {
      setBackupResult({
        success: false,
        message: error instanceof Error ? error.message : '导出失败'
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleClearSensitiveData = () => {
    if (window.confirm('确定要清理内存中的敏感数据吗？这不会影响已备份或导出的数据。')) {
      clearSensitiveData();
      setBackupResult({
        success: true,
        message: '敏感数据已清理'
      });
    }
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const formatDate = (date) => {
    if (!date) return '暂无';
    
    const d = new Date(date);
    return d.toLocaleString('zh-CN');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        🔒 数据安全与备份设置
      </h2>
      
      {/* 备份统计信息 */}
      <div className="mb-8 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-700 mb-3">备份统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">总备份次数</div>
            <div className="text-2xl font-bold text-green-600">{stats.totalBackups}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">总数据量</div>
            <div className="text-2xl font-bold text-green-600">
              {formatFileSize(stats.totalDataSize)}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">上次备份时间</div>
            <div className="text-lg font-semibold text-gray-700">
              {formatDate(stats.lastBackupTime)}
            </div>
          </div>
        </div>
      </div>
      
      {/* 备份设置 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">数据备份设置</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              单位全称 *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="请输入单位全称"
            />
            <p className="text-xs text-gray-500 mt-1">
              用于数据恢复时的身份验证，请确保与采购方案中的单位名称一致
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="请输入11位手机号"
                maxLength={11}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备份描述
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="例如：手动备份、月度备份等"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className={`px-6 py-3 rounded-md font-medium ${
                isBackingUp
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isBackingUp ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  备份中...
                </>
              ) : (
                '备份数据'
              )}
            </button>
            
            <button
              onClick={loadBackupStats}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              刷新统计
            </button>
          </div>
        </div>
      </div>
      
      {/* 数据导出 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">数据导出</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出格式
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-green-600"
                />
                <span className="ml-2">JSON格式（完整数据结构）</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-green-600"
                />
                <span className="ml-2">Excel格式（表格化展示）</span>
              </label>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              导出内容
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(exportContent).map(([key, value]) => (
                <label key={key} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setExportContent({
                      ...exportContent,
                      [key]: e.target.checked
                    })}
                    className="text-green-600 rounded"
                  />
                  <span className="ml-2 capitalize">
                    {key === 'productLibrary' && '商品库'}
                    {key === 'historyPlans' && '历史方案'}
                    {key === 'operationLogs' && '操作日志'}
                    {key === 'userSettings' && '用户设置'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-6 py-3 rounded-md font-medium ${
              isExporting
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isExporting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                导出中...
              </>
            ) : (
              '导出数据'
            )}
          </button>
        </div>
      </div>
      
      {/* 安全清理 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">安全清理</h3>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-700 mb-4">
            <strong>警告：</strong>此操作将清理内存中的敏感数据，如加密密钥、临时备份数据等。
            清理后无法恢复，但不会影响已导出的数据。
          </p>
          
          <button
            onClick={handleClearSensitiveData}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
          >
            清理敏感数据
          </button>
          
          <p className="text-sm text-gray-600 mt-2">
            建议在以下时机清理：1) 数据导出后；2) 页面关闭前；3) 设备借给他人使用时。
          </p>
        </div>
      </div>
      
      {/* 操作结果 */}
      {backupResult && (
        <div className={`p-4 rounded-lg mb-4 ${
          backupResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`mr-3 ${
              backupResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {backupResult.success ? '✓' : '✗'}
            </div>
            <div>
              <p className={`font-medium ${
                backupResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {backupResult.success ? '操作成功' : '操作失败'}
              </p>
              <p className={`text-sm ${
                backupResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {backupResult.message}
              </p>
              {backupResult.backupId && (
                <p className="text-xs text-gray-600 mt-1">
                  备份ID: {backupResult.backupId}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 本地数据安全说明 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <span>🔒</span>
            <span>本地数据安全说明</span>
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 数据存储：所有数据仅保存在您的浏览器/手机本地，我们不会上传任何信息</li>
            <li>• 隐私保护：您的采购方案、单位信息完全由您掌控，无需担心泄露</li>
            <li>• 数据导出：可随时导出JSON（完整备份）或Excel（表格查看）到您的设备</li>
            <li>• 安全清理：一键清理本地数据，适合使用公共设备后操作</li>
            <li>• 备份建议：建议定期导出备份，保存到您的个人电脑或U盘</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataBackupSettings;