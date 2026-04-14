import React, { useState, useEffect } from 'react';
import { getYearly832Total, getYearlyTotal } from '../utils/historyStorage';
import { platform832Hint } from '../data/policyData';
import {
  validateCompliance,
  calculatePerCapita,
  calculatePlatform832Ratio,
  calculateCompletionRate,
  validateDataSource,
  checkLockStatus,
  toggleCalculationBasis,
  getBasisDescription,
  getDataSourceStyle,
  formatCurrency,
  formatPercentage,
  SINGLE_WARNING_THRESHOLD,
  ANNUAL_WARNING_THRESHOLD,
  PLATFORM_832_REQUIREMENT,
  DEFAULT_CALCULATION_BASIS,
  lockData,
  unlockData,
} from '../utils/complianceValidator';

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
  const [calculationBasis, setCalculationBasis] = useState(DEFAULT_CALCULATION_BASIS);
  const [dataSource, setDataSource] = useState('auto');
  const [isLocked, setIsLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState('');
  const [lockedBy, setLockedBy] = useState('');
  const [complianceResult, setComplianceResult] = useState(null);

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

  // 获取数据锁定状态
  useEffect(() => {
    const isLocked = localStorage.getItem('compliance_data_locked') === 'true';
    const lockedAt = localStorage.getItem('compliance_locked_at');
    const lockedBy = localStorage.getItem('compliance_locked_by');
    setIsLocked(isLocked);
    setLockedAt(lockedAt || '');
    setLockedBy(lockedBy || '');
  }, []);

  // 使用complianceValidator进行综合验证
  useEffect(() => {
    const total = Number(totalBudget) || 0;
    const completed = Number(completedAmount) || 0;
    const total832 = getYearly832Total();
    
    // 计算完成率、还需采购金额、年度人均金额（保持原有UI显示）
    const rate = total > 0 ? (completed / total) * 100 : 0;
    setCompletionRate(rate);
    
    const remaining = total * 0.3 - completed;
    setRemainingAmount(remaining);
    
    const perCapita = headCount > 0 ? total / headCount : 0;
    setPerCapitaAmount(perCapita);
    
    setPlatform832Amount(total832);
    const rate832 = total > 0 ? (total832 / total) * 100 : 0;
    setPlatform832Rate(rate832);
    
    // 三色进度条逻辑（保持原有UI）
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
    
    // 使用complianceValidator进行综合验证
    const validationContext = {
      headCount,
      totalBudget: total,
      completedAmount: completed,
      platform832Amount: total832,
      dataSource,
      isLocked,
      lockedAt: lockedAt || undefined,
      lockedBy: lockedBy || undefined,
    };
    
    const result = validateCompliance(validationContext);
    setComplianceResult(result);
    
    // 设置年度预警状态
    setShowAnnualWarning(result.details.perCapita.exceedsAnnualWarning);
    
  }, [totalBudget, completedAmount, headCount, dataSource, isLocked, lockedAt, lockedBy]);

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

  const handleToggleCalculationBasis = () => {
    if (isLocked) return;
    const newBasis = toggleCalculationBasis(calculationBasis);
    setCalculationBasis(newBasis);
  };

  const handleToggleDataSource = (field) => {
    if (isLocked) return;
    if (field === 'total') {
      setDataSource(dataSource === 'auto' ? 'manual' : 'auto');
    }
    // 对于已完成金额，可以单独控制，这里简化处理
  };

  // 进度条宽度，最大100%
  const progressWidth = Math.min(completionRate, 100);

  const handleLockData = () => {
    if (!totalBudget || !headCount) {
      alert('请先填写预算和人数信息');
      return;
    }
    const result = lockData('管理员');
    if (result.success) {
      setIsLocked(true);
      setLockedAt(result.lockedAt);
      setLockedBy(result.lockedBy);
      alert('数据已锁定，不可修改');
    } else {
      alert('锁定失败，请重试');
    }
  };

  const handleUnlockData = () => {
    if (confirm('确定要解锁数据吗？解锁后可修改数据，但会失去锁定保护。')) {
      const result = unlockData(false);
      if (result.success) {
        setIsLocked(false);
        setLockedAt('');
        setLockedBy('');
        alert('数据已解锁');
      } else {
        alert('解锁失败，请重试');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 年度数据锁定状态 */}
      {isLocked ? (
        <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-xl">🔒</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">2026年度合规测算</h3>
                <div className="text-sm text-gray-600">
                  锁定时间: {lockedAt ? new Date(lockedAt).toLocaleString('zh-CN') : '未知'}
                  <span className="mx-2">•</span>
                  操作人: {lockedBy || '管理员'}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg">
                数据只读，不可修改
              </div>
              <button
                onClick={handleUnlockData}
                className="px-4 py-2 min-h-[40px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                申请解锁
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-blue-800 mb-1">2026年度合规测算</h3>
              <p className="text-sm text-blue-700">数据可编辑，年末建议锁定防止误改</p>
            </div>
            <button
              onClick={handleLockData}
              disabled={!totalBudget || !headCount}
              className={`px-4 py-2 min-h-[40px] font-medium rounded-lg transition-colors duration-200 ${
                !totalBudget || !headCount
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              锁定数据
            </button>
          </div>
        </div>
      )}

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
            <button
              type="button"
              onClick={() => handleToggleDataSource('total')}
              disabled={isLocked}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded ${getDataSourceStyle(dataSource).className} ${isLocked ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              {getDataSourceStyle(dataSource).label}
            </button>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">单位年度可支配的采购总金额</p>
            <p className="text-xs text-gray-500">
              数据来源：
              <span className={`ml-1 ${getDataSourceStyle(dataSource).className}`}>
                {dataSource === 'manual' ? '手动录入' : '系统核算'}
              </span>
            </p>
          </div>
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
            <div className="text-gray-600 text-sm mb-2">
              832平台占比
              <div className="mt-1">
                <button
                  onClick={handleToggleCalculationBasis}
                  disabled={isLocked}
                  className={`text-xs px-2 py-1 rounded ${isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                  [{calculationBasis === 'amount' ? '金额占比' : '数量占比'}]
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {calculationBasis === 'amount' 
                ? `累计 ¥${platform832Amount.toLocaleString()}`
                : '数量占比（需配置）'}
              {calculationBasis === 'amount' && (
                <div className="mt-1 text-blue-600">*新疆审计标准</div>
              )}
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