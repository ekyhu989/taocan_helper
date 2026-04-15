import React, { useState } from 'react';
import PriceConstraintHint from '../../components/mobile/PriceConstraintHint';
import ComplianceDetailPanel from '../../components/mobile/ComplianceDetailPanel';

interface NewSchemeProps {
  onNavigate: (page: string) => void;
}

const NewScheme: React.FC<NewSchemeProps> = ({ onNavigate }) => {
  const [totalBudget, setTotalBudget] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [fundSource, setFundSource] = useState<'union' | 'other'>('union');
  const [scene, setScene] = useState('spring');

  const handleGenerate = () => {
    onNavigate('solution');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900">新建采购方案</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* 总预算 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            总预算
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-lg">¥</span>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="请输入总预算"
              className="flex-1 text-2xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <span className="text-gray-500">元</span>
          </div>
        </div>

        {/* 人数 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            人数
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
              placeholder="请输入人数"
              className="flex-1 text-2xl font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <span className="text-gray-500">人</span>
          </div>
        </div>

        {/* 资金来源 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            资金来源
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setFundSource('union')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                fundSource === 'union'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              工会经费
            </button>
            <button
              onClick={() => setFundSource('other')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                fundSource === 'other'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              其他资金
            </button>
          </div>

          {/* 价格约束提示 */}
          {totalBudget && peopleCount && (
            <div className="mt-4">
              <PriceConstraintHint
                fundSource={fundSource}
                totalBudget={Number(totalBudget)}
                peopleCount={Number(peopleCount)}
              />
            </div>
          )}
        </div>

        {/* 采购场景 */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            采购场景
          </label>
          <select
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="spring">春节慰问</option>
            <option value="midautumn">中秋慰问</option>
            <option value="special">专项活动</option>
            <option value="difficulty">困难帮扶</option>
          </select>
        </div>

        {/* 合规测算明细 */}
        {totalBudget && peopleCount && (
          <ComplianceDetailPanel
            totalBudget={Number(totalBudget)}
            peopleCount={Number(peopleCount)}
            fundSource={fundSource}
          />
        )}

        {/* 生成方案按钮 */}
        <button
          onClick={handleGenerate}
          disabled={!totalBudget || !peopleCount}
          className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          生成方案
        </button>
      </div>
    </div>
  );
};

export default NewScheme;
