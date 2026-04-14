import React from 'react';
import { policies, officialLinks } from '../data/policies';

/**
 * 政策版本更新强制弹窗
 * 
 * 功能：
 * 1. 红色警告样式，无法绕过
 * 2. 显示政策更新内容列表
 * 3. "查看更新"按钮（跳转官网）
 * 4. "我已确认"按钮（确认后关闭弹窗）
 * 5. 未确认前禁止核心操作（通过父组件控制）
 */

const PolicyUpdateModal = ({ 
  isOpen = true, 
  onConfirm, 
  onViewUpdates 
}) => {
  if (!isOpen) return null;

  // 获取有更新的政策（对比版本逻辑简化：假设所有政策都有更新）
  const updatedPolicies = policies.filter(policy => {
    // 实际项目中可对比版本号，这里简化处理
    return true;
  });

  const handleViewUpdates = () => {
    // 跳转到第一个官方链接（新疆财政厅）
    if (officialLinks.length > 0) {
      window.open(officialLinks[0].url, '_blank', 'noopener,noreferrer');
    }
    if (onViewUpdates) onViewUpdates();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      
      {/* 弹窗容器 */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-red-500">
          {/* 红色标题栏 */}
          <div className="bg-red-600 text-white p-5">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h2 className="text-xl font-bold">⚠️ 政策版本更新提醒</h2>
                <p className="text-red-100 text-sm mt-1">请确认查看最新版本后继续操作</p>
              </div>
            </div>
          </div>

          {/* 弹窗内容 */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                检测到政策文件已更新，为确保采购申请符合最新政策要求，请确认查看以下政策的最新版本：
              </p>
              
              {/* 更新内容列表 */}
              <div className="space-y-3 mb-6">
                {updatedPolicies.map(policy => (
                  <div 
                    key={policy.id}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-bold">!</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-800">{policy.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            文号：{policy.docNo}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            版本：{policy.version}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            发布单位：{policy.issuer}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 重要提示 */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <p className="text-yellow-800 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>重要提示</span>
                </p>
                <p className="text-yellow-700 text-sm mt-2">
                  根据新疆政府采购政策要求，所有采购申请必须基于最新版本的政策文件。未确认最新版本前，系统将禁止生成公文和导出文件。
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleViewUpdates}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  <span>查看更新内容</span>
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap —2 px-6 py-3 min-h-[44px] bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>我已确认最新版本</span>
                </button>
              </div>

              {/* 底部说明 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm text-center">
                  确认后，系统将记录您已阅读最新版本政策，并允许进行公文生成和导出操作。
                </p>
              </div>
            </div>
          </div>

          {/* 底部警告栏 */}
          <div className="bg-red-50 border-t border-red-200 p-4">
            <p className="text-red-700 text-sm font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>注意：未确认前无法生成公文和导出文件</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyUpdateModal;