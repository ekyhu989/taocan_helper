import React, { useState } from 'react';

interface ConfigPanelProps {
  totalBudget?: number;
  peopleCount?: number;
  fundSource?: 'union' | 'other';
  onConfigChange?: (config: any) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  totalBudget = 50000,
  peopleCount = 100,
  fundSource = 'union',
  onConfigChange
}) => {
  const [budget, setBudget] = useState<string>(totalBudget.toString());
  const [count, setCount] = useState<string>(peopleCount.toString());
  const [source, setSource] = useState<'union' | 'other'>(fundSource);

  const perCapitaBudget = Number(budget) / Number(count) || 0;
  const discountRate = source === 'union' ? 0.8 : 0.9;
  const maxPrice = Math.ceil(perCapitaBudget / discountRate);

  const handleChange = () => {
    onConfigChange?.({
      totalBudget: Number(budget),
      peopleCount: Number(count),
      fundSource: source
    });
  };

  return (
    <div className="bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">方案配置</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 总预算 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            总预算
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <span className="px-4 text-gray-500 bg-gray-50 border-r border-gray-300">¥</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                handleChange();
              }}
              className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
            />
          </div>
        </div>

        {/* 人数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            人数
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <input
              type="number"
              value={count}
              onChange={(e) => {
                setCount(e.target.value);
                handleChange();
              }}
              className="flex-1 px-4 py-3 text-gray-900 focus:outline-none"
            />
            <span className="px-4 text-gray-500 bg-gray-50 border-l border-gray-300">人</span>
          </div>
        </div>

        {/* 资金来源 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            资金来源
          </label>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSource('union');
                handleChange();
              }}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                source === 'union'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">工会经费</div>
              <div className="text-sm text-gray-500">享受8折优惠</div>
            </button>
            <button
              onClick={() => {
                setSource('other');
                handleChange();
              }}
              className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                source === 'other'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">其他资金</div>
              <div className="text-sm text-gray-500">享受9折优惠</div>
            </button>
          </div>
        </div>

        {/* 价格约束提示 */}
        <div className={`p-4 rounded-lg border ${
          source === 'union' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  source === 'union' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                }`}>
                  {source === 'union' ? '8折' : '9折'}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={source === 'union' ? 'text-yellow-800' : 'text-blue-800'}>
                    人均预算
                  </span>
                  <span className="font-bold">¥{perCapitaBudget.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={source === 'union' ? 'text-yellow-800' : 'text-blue-800'}>
                    单品上限
                  </span>
                  <span className="font-bold text-red-600">¥{maxPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
