import React from 'react';
import ComplianceCalculator from '../components/ComplianceCalculator';

const CompliancePage = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">合规测算</h1>
      
      {/* 内容区 - 直接显示合规测算 */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <ComplianceCalculator />
      </div>
      
      {/* 返回主页面按钮 */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack || (() => window.history.back())}
          className="px-6 py-2 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          ← 返回主页面
        </button>
      </div>
    </div>
  );
};

export default CompliancePage;
