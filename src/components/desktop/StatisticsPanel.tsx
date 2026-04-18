import React from 'react';

interface StatisticsPanelProps {
  year?: number;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ year = 2026 }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">{year}年度数据统计</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">采购方案数</p>
          <p className="text-3xl font-bold text-blue-700">12</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">总预算</p>
          <p className="text-3xl font-bold text-green-700">¥60万</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 mb-1">总人数</p>
          <p className="text-3xl font-bold text-orange-700">1,200</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 mb-1">832占比</p>
          <p className="text-3xl font-bold text-purple-700">72%</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-4">月度采购趋势</h4>
        <div className="h-40 flex items-end gap-2">
          {[60, 45, 70, 55, 80, 65, 50, 75, 58, 68, 52, 72].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-gray-500 mt-1">{i + 1}月</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
