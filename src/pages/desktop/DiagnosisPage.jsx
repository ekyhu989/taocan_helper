import React, { useState } from 'react';

const DiagnosisPage = ({ formData, onBack, onFixCompliance }) => {
  const [showFormulas, setShowFormulas] = useState(false);

  const risks = [
    {
      type: 'annual_limit',
      title: '年度人均超标',
      currentValue: 2500,
      limitValue: 2000,
      unit: '元/人',
      level: 'high',
      formula: '人均 = 总预算 ÷ 人数',
    },
    {
      type: 'platform832',
      title: '832平台占比不达标',
      currentValue: 25,
      limitValue: 30,
      unit: '%',
      level: 'medium',
      formula: '832占比 = 832平台商品金额 ÷ 总金额',
    },
  ];

  const getLevelColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      default:
        return '🟢';
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">合规诊断</h1>
              <p className="text-sm text-gray-500">风险自动检测与整改建议</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 风险概览卡片 */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">⚠️</div>
            <div>
              <div className="text-4xl font-bold text-red-600">{risks.length}</div>
              <div className="text-red-500 font-medium">项风险需要关注</div>
            </div>
          </div>
        </div>

        {/* 风险详情列表 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">风险详情</h2>
          {risks.map((risk, index) => (
            <div
              key={risk.type}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getLevelIcon(risk.level)}</span>
                    <h3 className="text-lg font-bold text-gray-800">{risk.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(risk.level)}`}>
                      {risk.level === 'high' ? '高风险' : '中风险'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">当前值</div>
                      <div className="text-2xl font-bold text-red-600">
                        {risk.currentValue.toLocaleString()}{risk.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">限制值</div>
                      <div className="text-2xl font-bold text-gray-700">
                        {risk.limitValue.toLocaleString()}{risk.unit}
                      </div>
                    </div>
                  </div>

                  {/* 核算逻辑 */}
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setShowFormulas(!showFormulas)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showFormulas ? '收起' : '展开'} 核算逻辑
                      <span>{showFormulas ? '▲' : '▼'}</span>
                    </button>
                    {showFormulas && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-4">
                        <code className="text-sm text-gray-700">{risk.formula}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 整改建议 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
            💡 整改建议
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">•</span>
              <span className="text-blue-700">人数不变的情况下，建议将总预算调整为 ≤ 2000 元/人 × 人数</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-0.5">•</span>
              <span className="text-blue-700">增加832平台商品采购占比至30%以上</span>
            </li>
          </ul>
        </div>

        {/* 一键整改按钮 */}
        <button
          onClick={onFixCompliance}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg"
        >
          🚀 一键整改（自动调整至合规范围）
        </button>
      </div>
    </div>
  );
};

export default DiagnosisPage;
