import React, { useState } from 'react';
import ComplianceCalculator from '../components/ComplianceCalculator';
import PolicyLibrary from '../components/PolicyLibrary';

const CompliancePage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'policy'
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">合规测算与政策库</h1>
      
      {/* Tab切换 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button 
          className={`px-4 py-3 font-medium text-sm md:text-base transition-colors duration-200 ${activeTab === 'calculator' 
            ? 'text-blue-700 border-b-2 border-blue-700' 
            : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('calculator')}
        >
          年度进度测算
        </button>
        <button 
          className={`px-4 py-3 font-medium text-sm md:text-base transition-colors duration-200 ${activeTab === 'policy' 
            ? 'text-blue-700 border-b-2 border-blue-700' 
            : 'text-gray-600 hover:text-gray-900'}`}
          onClick={() => setActiveTab('policy')}
        >
          政策文库
        </button>
      </div>
      
      {/* 内容区 */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        {activeTab === 'calculator' && <ComplianceCalculator />}
        {activeTab === 'policy' && <PolicyLibrary />}
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