import React, { useState } from 'react';
import type { Scheme, SchemeSet } from '../../utils/schemeGenerator';
import { getDiscountRate, getDiscountLabel } from '../../utils/schemeGenerator';

interface SchemeCardSliderProps {
  schemes: SchemeSet;
  onSchemeSelect?: (schemeType: 'balanced' | 'costEffective' | 'highQuality') => void;
  selectedType?: 'balanced' | 'costEffective' | 'highQuality';
}

export const SchemeCardSlider: React.FC<SchemeCardSliderProps> = ({
  schemes,
  onSchemeSelect,
  selectedType = 'balanced'
}) => {
  const [selectedScheme, setSelectedScheme] = useState<'balanced' | 'costEffective' | 'highQuality'>(selectedType);

  const schemeList = [
    { type: 'balanced', name: '均衡推荐', scheme: schemes.balanced, color: 'blue' } as const,
    { type: 'costEffective', name: '高性价比', scheme: schemes.costEffective, color: 'green' } as const,
    { type: 'highQuality', name: '高品质甄选', scheme: schemes.highQuality, color: 'purple' } as const
  ];

  const handleSchemeSelect = (type: 'balanced' | 'costEffective' | 'highQuality') => {
    setSelectedScheme(type);
    onSchemeSelect?.(type);
  };

  const calculateSchemeStats = (scheme: Scheme) => {
    const actualPerCapita = scheme.items.reduce((sum, item) => sum + (item.product.price || 0), 0);

    const amount832 = scheme.items
      .filter(item => item.product.is832)
      .reduce((sum, item) => sum + (item.product.price || 0), 0);
    const ratio832 = actualPerCapita > 0 ? (amount832 / actualPerCapita) * 100 : 0;
    const categoryCount = new Set(scheme.items.map(item => item.product.category)).size;
    const totalItems = scheme.items.length;

    const perCapitaBudget = scheme.perCapitaBudget || 0;
    const perCapitaLimit = scheme.perCapitaLimit || 0;
    const discountRate = scheme.discountRate || getDiscountRate(scheme.fundingSource || 'union');
    const fundingSource = scheme.fundingSource || 'union';
    const totalBudget = scheme.totalBudget || 0;
    const personCount = scheme.personCount || 1;

    // ★ 预算使用率修复：不超过上限时显示100%
    const isOverLimit = actualPerCapita > perCapitaLimit;
    const budgetUsageRate = isOverLimit
      ? (actualPerCapita * personCount / totalBudget) * 100
      : 100;
    // 福利提升
    const welfareBonus = perCapitaBudget > 0 && actualPerCapita > perCapitaBudget
      ? ((actualPerCapita - perCapitaBudget) / perCapitaBudget) * 100
      : 0;

    const discountLabel = getDiscountLabel(fundingSource);

    const boostPercent = perCapitaBudget > 0 && actualPerCapita > perCapitaBudget
      ? ((actualPerCapita / perCapitaBudget - 1) * 100).toFixed(0)
      : null;

    return {
      actualPerCapita,
      ratio832,
      categoryCount,
      totalItems,
      perCapitaBudget,
      perCapitaLimit,
      discountRate,
      discountLabel,
      fundingSource,
      totalBudget,
      personCount,
      budgetUsageRate,
      welfareBonus,
      isOverLimit,
      boostPercent
    };
  };

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 mb-6">
        {schemeList.map((item) => (
          <button
            key={item.type}
            onClick={() => handleSchemeSelect(item.type)}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              selectedScheme === item.type
                ? `text-${item.color}-600 border-b-2 border-${item.color}-600`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {schemeList.map((item) => {
          const stats = calculateSchemeStats(item.scheme);
          const isSelected = selectedScheme === item.type;
          
          return (
            <div
              key={item.type}
              onClick={() => handleSchemeSelect(item.type)}
              className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? `border-${item.color}-500 shadow-md` 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${item.color}-100 text-${item.color}-700`}>
                  {item.name}
                </span>
                {stats.ratio832 < 30 && (
                  <span className="text-xs text-red-500 font-medium">832占比不足</span>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">人均总价</span>
                  <span className="text-lg font-bold text-gray-900">
                    ¥{stats.actualPerCapita.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">832占比</span>
                  <span className={`font-medium text-sm ${
                    stats.ratio832 >= 30 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {stats.ratio832.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">品类数</span>
                  <span className="font-medium text-gray-900">{stats.categoryCount}类</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">商品件数</span>
                  <span className="font-medium text-gray-900">{stats.totalItems}件</span>
                </div>
              </div>

              <div className="mx-4 mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">人均标准</span>
                  <span>¥{stats.perCapitaBudget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">折扣系数</span>
                  <span className="text-blue-600 font-medium">{stats.discountLabel}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">人均上限</span>
                  <span>¥{stats.perCapitaLimit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1 pt-1 border-t border-blue-200">
                  <span className="text-gray-600">实际人均</span>
                  <span className="text-green-600 font-bold">¥{stats.actualPerCapita.toFixed(2)}</span>
                </div>
                {stats.welfareBonus > 0 && (
                  <div className="mt-2 text-xs text-green-600">
                    ✅ 通过{stats.discountLabel.replace(' ', '')}，实际可采购金额提升 {stats.welfareBonus.toFixed(0)}%
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">包含商品:</p>
                <div className="flex flex-wrap gap-1">
                  {item.scheme.items.slice(0, 3).map((schemeItem, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {schemeItem.product.name}×1
                    </span>
                  ))}
                  {item.scheme.items.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{item.scheme.items.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
