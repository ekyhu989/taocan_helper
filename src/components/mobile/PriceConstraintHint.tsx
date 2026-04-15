import React from 'react';

interface PriceConstraintHintProps {
  fundSource: 'union' | 'other';
  totalBudget: number;
  peopleCount: number;
}

const PriceConstraintHint: React.FC<PriceConstraintHintProps> = ({ 
  fundSource, 
  totalBudget, 
  peopleCount 
}) => {
  const discountRate = fundSource === 'union' ? 0.8 : 0.9;
  const perCapitaBudget = peopleCount > 0 ? totalBudget / peopleCount : 0;
  const maxPrice = peopleCount > 0 ? Math.ceil(perCapitaBudget / discountRate) : 0;

  return (
    <div className={`p-4 rounded-xl border ${
      fundSource === 'union' 
        ? 'bg-yellow-50 border-yellow-200' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <span className="text-2xl">💡</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              fundSource === 'union' 
                ? 'bg-yellow-200 text-yellow-800' 
                : 'bg-blue-200 text-blue-800'
            }`}>
              {fundSource === 'union' ? '工会经费 8折' : '其他资金 9折'}
            </span>
          </div>
          <p className={`text-sm ${
            fundSource === 'union' ? 'text-yellow-800' : 'text-blue-800'
          }`}>
            人均 {perCapitaBudget.toFixed(0)} 元 → 上限 {maxPrice} 元
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceConstraintHint;
