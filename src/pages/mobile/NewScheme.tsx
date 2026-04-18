import React, { useState } from 'react';
import { generateThreeSchemes, mapFundingSource } from '../../utils/schemeGenerator';
import { loadProducts } from '../../utils/helpers/productStorage';
import { saveHistory } from '../../utils/helpers/historyStorage';
import PriceConstraintHint from '../../components/mobile/PriceConstraintHint';
import ComplianceDetailPanel from '../../components/mobile/ComplianceDetailPanel';

interface NewSchemeProps {
  onNavigate: (page: string, data?: any) => void;
}

const FUND_SOURCES = [
  { value: '工会经费', label: '工会经费', discount: '8折' },
  { value: '行政福利费', label: '行政福利费', discount: '9折' },
  { value: '专项慰问费', label: '专项慰问费', discount: '9折' },
  { value: '其他经费', label: '其他经费', discount: '9折' },
];

const SCENES = [
  { value: 'spring', label: '春节慰问' },
  { value: 'midautumn', label: '中秋慰问' },
  { value: 'special', label: '专项活动' },
  { value: 'difficulty', label: '困难帮扶' },
];

const NewScheme: React.FC<NewSchemeProps> = ({ onNavigate }) => {
  const [totalBudget, setTotalBudget] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [fundSource, setFundSource] = useState('行政福利费');
  const [scene, setScene] = useState('spring');
  const [unitName, setUnitName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const mappedFundSource = mapFundingSource(fundSource);

  const handleGenerate = () => {
    const budget = Number(totalBudget);
    const people = Number(peopleCount);

    if (!budget || budget <= 0) {
      setError('请输入有效的总预算');
      return;
    }
    if (!people || people <= 0) {
      setError('请输入有效的人数');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      const products = loadProducts();

      if (!products || products.length === 0) {
        setError('商品库为空，请先添加商品');
        setGenerating(false);
        return;
      }

      const schemeParams = {
        totalBudget: budget,
        peopleCount: people,
        fundingSource: mappedFundSource,
        budgetMode: 'per_capita' as const,
        scene,
      };

      const threeSchemes = generateThreeSchemes(products, schemeParams);

      const schemeData = {
        schemes: threeSchemes,
        formData: {
          totalBudget: budget,
          peopleCount: people,
          fundSource,
          scene,
          unitName,
          budgetMode: 'per_capita',
        },
      };

      onNavigate('solution', schemeData);
    } catch (err) {
      console.error('方案生成失败:', err);
      setError('方案生成失败，请检查输入参数');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">单位名称</label>
          <input
            type="text"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder="请输入单位名称（选填）"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">总预算</label>
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

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">人数</label>
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

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">资金来源</label>
          <div className="grid grid-cols-2 gap-3">
            {FUND_SOURCES.map((src) => (
              <button
                key={src.value}
                onClick={() => setFundSource(src.value)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                  fundSource === src.value
                    ? src.value === '工会经费'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {src.label}
                <span className="ml-1 text-xs opacity-80">{src.discount}</span>
              </button>
            ))}
          </div>

          {totalBudget && peopleCount && (
            <div className="mt-4">
              <PriceConstraintHint
                fundSource={mappedFundSource as 'union' | 'other'}
                totalBudget={Number(totalBudget)}
                peopleCount={Number(peopleCount)}
              />
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">采购场景</label>
          <select
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SCENES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {totalBudget && peopleCount && (
          <ComplianceDetailPanel
            totalBudget={Number(totalBudget)}
            peopleCount={Number(peopleCount)}
            fundSource={mappedFundSource as 'union' | 'other'}
          />
        )}

        <button
          onClick={handleGenerate}
          disabled={!totalBudget || !peopleCount || generating}
          className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {generating ? '生成中...' : '生成方案'}
        </button>
      </div>
    </div>
  );
};

export default NewScheme;
