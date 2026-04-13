import React, { useEffect, useState } from 'react';
import mockData from '../data/mockData';
import { complianceRules, singlePurchaseWarning } from '../data/policyData';

const BasicInfoForm = ({ formData, onDataChange, showExampleNotice = true, onClearForm }) => {
  const [perCapita, setPerCapita] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (formData.headCount && formData.headCount > 0 && formData.totalBudget) {
      const perCapitaVal = formData.totalBudget / formData.headCount;
      setPerCapita(perCapitaVal);
      setShowWarning(perCapitaVal > 500);
    } else {
      setPerCapita(0);
      setShowWarning(false);
    }
  }, [formData.headCount, formData.totalBudget]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value === '' ? '' : Number(value) || 0) : value;
    const newFormData = {
      ...formData,
      [name]: newValue
    };
    if (onDataChange) {
      onDataChange(newFormData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 提示条 */}
      {showExampleNotice && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 0 11-16 0 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-blue-800 font-medium">下方为示例方案</p>
            <p className="text-blue-700 text-sm mt-1">请在上方输入您的信息，点击"生成方案"以创建新方案</p>
          </div>
        </div>
      )}
      
      <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">基础信息录入</h2>
        
        <form className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <label htmlFor="region-field" className="block text-sm font-medium text-gray-700 mb-2">
                采购地区
              </label>
              <input
                type="text"
                id="region-field"
                name="region"
                value={formData.region || '新疆地区'}
                disabled
                data-testid="region-field"
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">默认为新疆地区</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                采购场景 <span className="text-red-500">*</span>
              </label>
              <select
                name="scene"
                value={formData.scene || mockData.basicInfo.sceneOptions[0].value}
                onChange={handleChange}
                data-testid="scene-selector"
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {mockData.basicInfo.sceneOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {formData.scene === 'holiday' && (
              <div>
                <label htmlFor="festival-selector" className="block text-sm font-medium text-gray-700 mb-2">
                  节日类型 <span className="text-red-500">*</span>
                </label>
                <select
                  id="festival-selector"
                  name="festival"
                  value={formData.festival || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择节日</option>
                  {mockData.basicInfo.festivalOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                人数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="headCount"
                value={formData.headCount || ''}
                onChange={handleChange}
                min="1"
                placeholder="请输入人数"
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                总预算（元） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalBudget"
                value={formData.totalBudget || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="请输入预算金额"
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                资金来源
              </label>
              <select
                name="fundSource"
                value={formData.fundSource || '行政福利费'}
                onChange={handleChange}
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="行政福利费">行政福利费</option>
                <option value="工会经费">工会经费</option>
                <option value="专项慰问费">专项慰问费</option>
                <option value="其他经费">其他经费</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">默认使用行政福利费，可根据实际情况选择</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预算模式
              </label>
              <select
                name="budgetMode"
                value={formData.budgetMode || 'per_capita'}
                onChange={handleChange}
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="per_capita">按人均标准（适用于绝大多数福利发放场景）</option>
                <option value="total_control">按总额控制（适用于特殊公用物资采购）</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">默认按人均标准，确保每人一份公平分配</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                意向品类
              </label>
              <select
                name="category"
                value={formData.category || '食品'}
                onChange={handleChange}
                className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="食品">食品</option>
                <option value="日用品">日用品</option>
                <option value="文体用品">文体用品</option>
                <option value="其它节日礼品">其它节日礼品</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">此选项将决定下方推荐商品的类型</p>
            </div>
          </div>

          {formData.headCount && formData.totalBudget && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 font-medium">人均预算：</span>
                <span className="text-xl font-bold text-blue-800">
                  ¥{perCapita.toFixed(2)}
                </span>
              </div>
              {showWarning && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700 text-sm font-medium">
                    {singlePurchaseWarning(perCapita)}
                  </p>
                </div>
              )}
              {!showWarning && perCapita > 0 && (
                <p className="mt-2 text-green-600 text-sm">
                  ✅ 人均预算在合理范围内（≤{complianceRules.singleWarningThreshold}元），符合新工办〔2019〕3号文件规定。年度累计总额不超过{complianceRules.annualMaxPerCapita}元/人。
                </p>
              )}
            </div>
          )}
        </form>

        {/* 底部操作栏 */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {onClearForm && (
            <button
              type="button"
              onClick={onClearForm}
              className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              清空表单
            </button>
          )}
          <span className="text-xs text-gray-400 sm:ml-auto text-center sm:text-left">
            数据自动保存在本地浏览器中
          </span>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;