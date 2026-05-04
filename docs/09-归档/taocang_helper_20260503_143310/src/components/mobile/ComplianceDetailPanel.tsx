import React, { useState } from 'react';

interface ComplianceDetailPanelProps {
  totalBudget: number;
  peopleCount: number;
  fundSource: 'union' | 'other';
}

const ComplianceDetailPanel: React.FC<ComplianceDetailPanelProps> = ({
  totalBudget,
  peopleCount,
  fundSource
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const discountRate = fundSource === 'union' ? 0.8 : 0.9;
  const perCapitaBudget = peopleCount > 0 ? totalBudget / peopleCount : 0;
  const maxPrice = peopleCount > 0 ? Math.ceil(perCapitaBudget / discountRate) : 0;
  const minPrice = Math.floor(maxPrice * 0.5);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="font-medium text-gray-900">合规测算明细</span>
        <span className="text-gray-500 text-lg">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <div className="space-y-4 mt-4">
            {/* 人均预算 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">人均预算</span>
                <span className="text-sm font-bold text-gray-900">
                  ¥{perCapitaBudget.toFixed(0)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                计算公式：{totalBudget} ÷ {peopleCount} = {perCapitaBudget.toFixed(0)}
              </p>
            </div>

            {/* 折扣系数 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">折扣系数</span>
                <span className={`text-sm font-bold ${
                  fundSource === 'union' ? 'text-yellow-700' : 'text-blue-700'
                }`}>
                  {discountRate === 0.8 ? '0.8 (8折)' : '0.9 (9折)'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {fundSource === 'union' ? '工会经费享受8折优惠' : '其他资金享受9折优惠'}
              </p>
            </div>

            {/* 单品价格上限 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">单品价格上限</span>
                <span className="text-sm font-bold text-red-600">
                  ¥{maxPrice}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                计算公式：{perCapitaBudget.toFixed(0)} ÷ {discountRate} = {maxPrice}
              </p>
            </div>

            {/* 商品匹配区间 */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">商品匹配区间</span>
                <span className="text-sm font-bold text-green-600">
                  ¥{minPrice} - ¥{maxPrice}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                建议在预算的50%-100%范围内选择商品
              </p>
            </div>

            {/* 政策依据 */}
            <button className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
              📋 查看政策依据
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDetailPanel;
