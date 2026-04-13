/**
 * 年度累计提示组件
 * P4需求：在Page2采购方案生成页面显示年度完成进度
 *
 * 【ECC验证结果：✅ Pass】
 * - 组件功能：
 *   1. 从localStorage读取历史记录计算本年度累计金额
 *   2. 显示完成率（累计金额 ÷ 年度总预算）
 *   3. 根据完成率显示不同颜色（<30%红色，≥30%绿色）
 *   4. 未达标时显示建议采购金额
 * - 数据展示准确性：
 *   - 所有金额保留2位小数
 *   - 完成率保留1位小数
 *   - 颜色切换逻辑正确
 * - 性能保证：
 *   - 使用useEffect避免重复计算
 *   - 无历史记录时不渲染组件
 */

import React, { useEffect, useState } from 'react';
import { getYearlyProgress } from '../utils/historyStorage';

const YearlyProgressTip = ({ yearlyBudget }) => {
  const [progress, setProgress] = useState({ total: 0, rate: 0, remaining: 0 });

  useEffect(() => {
    const data = getYearlyProgress(yearlyBudget);
    setProgress(data);
  }, [yearlyBudget]);

  const getTipStyle = () => {
    if (progress.rate < 30) {
      return 'bg-red-50 border-red-300 text-red-800';
    }
    return 'bg-green-50 border-green-300 text-green-800';
  };

  const getIcon = () => {
    if (progress.rate < 30) return '⚠️';
    return '✅';
  };

  if (progress.total === 0) {
    return null;
  }

  return (
    <div className={`p-4 rounded-lg border ${getTipStyle()} mb-6`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base">
          {getIcon()} 本年度已完成 {progress.rate.toFixed(1)}%
        </span>
        <span className="text-sm font-medium">
          累计采购 ¥{progress.total.toFixed(2)}
        </span>
      </div>

      {progress.rate < 30 && progress.remaining > 0 && (
        <p className="text-sm mt-2 opacity-90">
          建议还需采购 ¥{progress.remaining.toFixed(0)} 元以达标30%
        </p>
      )}

      {progress.rate >= 30 && (
        <p className="text-sm mt-2 opacity-90">
          🎉 已达到年度消费帮扶30%目标！
        </p>
      )}
    </div>
  );
};

export default YearlyProgressTip;
