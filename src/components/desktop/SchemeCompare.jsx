import React from 'react';

const SchemeCompare = ({ originalScheme, currentScheme }) => {
  const compareNumbers = (oldVal, newVal, unit = '') => {
    const diff = newVal - oldVal;
    const isPositive = diff > 0;
    const isNegative = diff < 0;

    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{oldVal.toLocaleString()}{unit}</span>
        <span>→</span>
        <span className="font-semibold">{newVal.toLocaleString()}{unit}</span>
        {diff !== 0 && (
          <span className={`px-2 py-0.5 rounded text-sm font-medium ${
            isPositive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isPositive ? '+' : ''}{diff.toLocaleString()}{unit}
            {isPositive ? ' ↑' : ' ↓'}
          </span>
        )}
      </div>
    );
  };

  const suggestions = [];
  const headCountDiff = (currentScheme.headCount || 0) - (originalScheme.headCount || 0);
  const budgetDiff = (currentScheme.totalBudget || 0) - (originalScheme.totalBudget || 0);

  if (headCountDiff > 0) {
    suggestions.push(`人数增加${Math.round((headCountDiff / originalScheme.headCount) * 100)}%，建议相应调整商品数量`);
  }
  if (budgetDiff > 0 && (originalScheme.headCount || 0) > 0) {
    const oldPerCapita = originalScheme.totalBudget / originalScheme.headCount;
    const newPerCapita = currentScheme.totalBudget / currentScheme.headCount;
    if (newPerCapita < oldPerCapita) {
      suggestions.push('预算增加但人均反而下降，合理');
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-4">数据对比</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">人数:</span>
          {compareNumbers(originalScheme.headCount || 0, currentScheme.headCount || 0, '人')}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">预算:</span>
          {compareNumbers(originalScheme.totalBudget || 0, currentScheme.totalBudget || 0, '元')}
        </div>

        {originalScheme.headCount > 0 && currentScheme.headCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">人均:</span>
            {compareNumbers(
              Math.round(originalScheme.totalBudget / originalScheme.headCount * 100) / 100,
              Math.round(currentScheme.totalBudget / currentScheme.headCount * 100) / 100,
              '元'
            )}
          </div>
        )}

        {originalScheme.platform832Rate !== undefined && currentScheme.platform832Rate !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">832占比:</span>
            {compareNumbers(
              Math.round(originalScheme.platform832Rate * 100),
              Math.round(currentScheme.platform832Rate * 100),
              '%'
            )}
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">调整建议:</h4>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SchemeCompare;
