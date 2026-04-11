import React, { useState, useEffect } from 'react';
import mockData from '../data/mockData';

const BasicInfoForm = () => {
  const [formData, setFormData] = useState({
    unitName: mockData.basicInfo.unitName,
    scene: mockData.basicInfo.sceneOptions[0].value,
    headCount: mockData.basicInfo.headCount,
    totalBudget: mockData.basicInfo.totalBudget,
    fundSource: mockData.basicInfo.fundSource,
    department: mockData.basicInfo.department,
    applicant: mockData.basicInfo.applicant
  });

  const [perCapita, setPerCapita] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (formData.headCount > 0) {
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) || 0 : value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">基础信息录入</h2>
      
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              单位名称
            </label>
            <input
              type="text"
              name="unitName"
              value={formData.unitName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              采购场景
            </label>
            <select
              name="scene"
              value={formData.scene}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {mockData.basicInfo.sceneOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              人数
            </label>
            <input
              type="number"
              name="headCount"
              value={formData.headCount}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              总预算（元）
            </label>
            <input
              type="number"
              name="totalBudget"
              value={formData.totalBudget}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              资金来源
            </label>
            <div className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
              {formData.fundSource}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              申请部门
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              申请人
            </label>
            <input
              type="text"
              name="applicant"
              value={formData.applicant}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">人均预算：</span>
            <span className="text-xl font-bold text-blue-800">
              ¥{perCapita.toFixed(2)}
            </span>
          </div>
          {showWarning && (
            <p className="mt-2 text-yellow-600 text-sm">
              当前人均标准较高，建议按单位规定核实调整。
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default BasicInfoForm;
