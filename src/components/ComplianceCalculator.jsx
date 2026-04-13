import React, { useState, useEffect } from 'react';
import { getYearly832Total, getYearlyTotal } from '../utils/historyStorage';
import { platform832Hint } from '../data/policyData';

const ComplianceCalculator = () => {
  const [totalBudget, setTotalBudget] = useState('');
  const [completedAmount, setCompletedAmount] = useState('');
  const [completionRate, setCompletionRate] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [progressColor, setProgressColor] = useState('bg-red-500');
  const [hintText, setHintText] = useState('');
  const [headCount, setHeadCount] = useState(0);
  const [perCapitaAmount, setPerCapitaAmount] = useState(0);
  const [showAnnualWarning, setShowAnnualWarning] = useState(false);
  const [platform832Amount, setPlatform832Amount] = useState(0);
  const [platform832Rate, setPlatform832Rate] = useState(0);

  // 从localStorage获取单位人数
  useEffect(() => {
    try {
      const stored = localStorage.getItem('taocang_solution_form');
      if (stored) {
        const solutionFormData = JSON.parse(stored);
        const count = Number(solutionFormData.headCount) || 0;
        setHeadCount(count);
      }
    } catch (err) {
      console.warn('读取单位人数失败:', err);
    }
  }, []);

  // 计算完成率、还需采购金额、年度人均金额
  useEffect(() => {
    const total = Number(totalBudget) || 0;
    const completed = Number(completedAmount) || 0;
    
    // 完成率 = 已完成金额 ÷ 年度总预算 × 100%
    const rate = total > 0 ? (completed / total) * 100 : 0;
    setCompletionRate(rate);
    
    // 还需采购金额 = 年度总预算 × 30% - 已完成金额
    const remaining = total * 0.3 - completed;
    setRemainingAmount(remaining);
    
    // 年度人均金额 = 年度总预算 ÷ 单位人数
    const perCapita = headCount > 0 ? total / headCount : 0;
    setPerCapitaAmount(perCapita);
    
    // 2000元年度上限校验
    const MAX_ANNUAL_PER_CAPITA = 2000;
    setShowAnnualWarning(perCapita > MAX_ANNUAL_PER_CAPITA);
    
    // 计算832平台累计采购金额和占比
    const total832 = getYearly832Total();
    setPlatform832Amount(total832);
    const rate832 = total > 0 ? (total832 / total) * 100 : 0;
    setPlatform832Rate(rate832);
    
    // 三色进度条逻辑
    if (rate < 30) {
      setProgressColor('bg-red-500');
      setHintText(`未达标，建议还需采购 ¥${remaining >= 0 ? remaining.toFixed(2) : '0.00'} 元`);
    } else if (rate < 100) {
      setProgressColor('bg-yellow-500');
      setHintText('进行中，已达到最低要求');
    } else {
      setProgressColor('bg-green-500');
      setHintText('已完成年度采购任务');
    }
  }, [totalBudget, completedAmount, headCount]);

  const handleTotalBudgetChange = (e) => {
    const value = e.target.value;
    // 允许空值或数字
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTotalBudget(value);
    }
  };

  const handleCompletedAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCompletedAmount(value);
    }
  };

  // 进度条宽度，最大100%
  const progressWidth = Math.min(completionRate, 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="total-budget-input" className="block text-sm font-medium text-gray-700 mb-2">
            年度总预算（元） <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
            <input
              id="total-budget-input"
              type="text"
              value={totalBudget}
              onChange={handleTotalBudgetChange}
              placeholder="请输入年度总预算"
              className="w-full pl-10 pr-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">单位年度可支配的采购总金额</p>
        </div>

        <div>
          <label htmlFor="completed-amount-input" className="block text-sm font-medium text-gray-700 mb-2">
            已完成采购金额（元）
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
            <input
              id="completed-amount-input"
              type="text"
              value={completedAmount}
              onChange={handleCompletedAmountChange}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">本年度已实际完成的采购支出</p>
        </div>
      </div>

      {/* 2000元年度上限警告 */}
      {showAnnualWarning && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-300 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-orange-600 text-xl">⚠️</span>
            <div>
              <p className="font-bold text-orange-800 mb-1">合规警告：年度人均预算超过2000元上限</p>
              <p className="text-orange-700 text-sm">
                年度人均预算 <span className="font-bold">{perCapitaAmount.toFixed(0)} 元</span>，超过 2000 元上限。
                根据新疆维吾尔自治区基层工会经费收支管理办法，年度人均福利支出不得超过2000元。
                请调整预算方案或咨询财务部门。
              </p>
              <div className="mt-2 text-xs text-orange-600">
                <span className="font-medium">单位人数：{headCount} 人</span>
                <span className="mx-2">•</span>
                <span className="font-medium">年度总预算：¥{Number(totalBudget || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 人均金额显示（无论是否超标都显示） */}
      {headCount > 0 && totalBudget && (
        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-gray-700 font-medium">年度人均预算：</span>
              <span className={`text-lg font-bold ${showAnnualWarning ? 'text-orange-600' : 'text-gray-800'}`}>
                {perCapitaAmount.toFixed(0)} 元
              </span>
              {showAnnualWarning && <span className="ml-2 text-orange-600 font-medium">（超标）</span>}
            </div>
            <div className="text-sm text-gray-600">
              单位人数：{headCount} 人，年度总预算：¥{Number(totalBudget || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* 进度展示区域 */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="text-center mb-6">
          <div className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
            {completionRate.toFixed(1)}%
          </div>
          <div className="text-gray-600 font-medium">年度采购完成率</div>
        </div>

        {/* 三色进度条 */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div 
              className={`h-6 rounded-full ${progressColor} transition-all duration-500 ease-out`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>0%</span>
            <span>30%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 提示文字 */}
        <div className="text-center">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            progressColor === 'bg-red-500' ? 'bg-red-100 text-red-800' :
            progressColor === 'bg-yellow-500' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {hintText}
          </div>
        </div>

        {/* 详细数据 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-700">¥{totalBudget ? Number(totalBudget).toLocaleString() : '0'}</div>
            <div className="text-gray-600 text-sm">年度总预算</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-700">¥{Number(completedAmount || 0).toLocaleString()}</div>
            <div className="text-gray-600 text-sm">已完成金额</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className={`text-2xl font-bold ${remainingAmount >= 0 ? 'text-orange-700' : 'text-gray-700'}`}>
              ¥{remainingAmount.toFixed(2)}
            </div>
            <div className="text-gray-600 text-sm">还需采购金额（满足30%要求）</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className={`text-2xl font-bold ${platform832Rate >= 30 ? 'text-purple-700' : 'text-gray-700'}`}>
              {platform832Rate.toFixed(1)}%
            </div>
            <div className="text-gray-600 text-sm">832平台占比</div>
            <div className="text-xs text-gray-500 mt-1">
              累计 ¥{platform832Amount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 832平台占比提示 */}
      <div className={`mt-6 p-4 rounded-lg border ${platform832Rate === 0 ? 'bg-gray-50 border-gray-200' : platform832Rate >= 30 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-start gap-3">
          <span className="text-xl">
            {platform832Rate === 0 ? '📊' : platform832Rate >= 30 ? '✅' : '⚠️'}
          </span>
          <div>
            <p className="font-medium text-gray-800">
              {platform832Rate === 0 
                ? '本年度尚未采购832平台产品，建议在后续采购中增加脱贫地区农副产品比例'
                : platform832Hint(platform832Rate)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              政策要求：工会慰问品中脱贫地区农副产品占比应≥30%（新财购〔2025〕2号）。
              {platform832Rate === 0 && ' 当前累计832平台采购金额为0元。'}
            </p>
          </div>
        </div>
      </div>

      {/* 解释说明 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 合规测算说明</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <span className="font-medium">30%最低要求</span>：根据政府采购规定，年度采购金额需达到总预算的30%以上。</li>
          <li>• <span className="font-medium">红色进度条</span>：完成率低于30%，表示尚未达到最低合规要求。</li>
          <li>• <span className="font-medium">黄色进度条</span>：完成率在30%-100%之间，表示已达到最低要求但未完成全年任务。</li>
          <li>• <span className="font-medium">绿色进度条</span>：完成率大于等于100%，表示已超额完成年度采购任务。</li>
          <li>• 建议根据"还需采购金额"合理规划剩余预算，确保合规达标。</li>
        </ul>
      </div>
    </div>
  );
};

export default ComplianceCalculator;