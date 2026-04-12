import React, { useState } from 'react';
import BasicInfoForm from './components/BasicInfoForm';
import SolutionPreview from './components/SolutionPreview';
import ProcurementReport from './components/ProcurementReport';
import mockData from './data/mockData';
import productsData from './data/products.json';
import { generateProductList } from './productListGenerator';
import { assembleReport } from './reportAssembler';
import { validateBudget } from './budgetValidator';

function App() {
  // 当前视图：'solution'（方案生成页）、'report'（公文生成页）
  const [currentView, setCurrentView] = useState('solution');
  
  // 方案生成页表单数据（第一步） - 只包含6个字段
  const [solutionFormData, setSolutionFormData] = useState({
    scene: mockData.basicInfo.sceneOptions[0].value,
    headCount: '',
    totalBudget: '',
    fundSource: '行政福利费',
    budgetMode: 'per_capita', // 'per_capita' 或 'total_control'
    category: '食品' // '食品'、'日用品'、'文体用品'、'其它节日礼品'
  });
  
  // 公文生成页表单数据（第二步） - 包含单位名称、申请部门、申请人
  const [reportFormData, setReportFormData] = useState({
    unitName: '',
    department: '',
    applicant: '',
    year: new Date().getFullYear(),
    festival: ''
  });
  
  // 状态管理
  const [errorMessage, setErrorMessage] = useState('');
  const [productListResult, setProductListResult] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExampleMode, setIsExampleMode] = useState(true); // 是否显示示例数据
  const [isReportGenerated, setIsReportGenerated] = useState(false); // 公文是否已生成

  // 处理方案表单数据变化
  const handleSolutionFormDataChange = (data) => {
    setSolutionFormData(prev => ({ ...prev, ...data }));
  };
  
  // 处理公文表单数据变化
  const handleReportFormDataChange = (data) => {
    setReportFormData(prev => ({ ...prev, ...data }));
  };

  // 生成采购方案
  const handleGenerateSolution = async () => {
    // 基本校验（只验证方案生成页的必填字段）
    if (!solutionFormData.headCount || !solutionFormData.totalBudget) {
      setErrorMessage('请填写人数和总预算（带 * 号为必填项）');
      return;
    }
    
    // 预算校验
    const budgetValidation = validateBudget(solutionFormData.totalBudget, solutionFormData.headCount);
    if (!budgetValidation.isValid) {
      setErrorMessage(budgetValidation.errorMessage);
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      // 生成品单
      const productResult = generateProductList(
        productsData,
        solutionFormData.scene,
        solutionFormData.totalBudget,
        solutionFormData.headCount,
        solutionFormData.budgetMode,
        solutionFormData.category
      );
      
      // 更新状态
      setProductListResult(productResult);
      setIsExampleMode(false); // 切换到真实数据模式
      setErrorMessage(''); // 清空错误信息
    } catch (err) {
      setErrorMessage(err.message || '生成方案时出现错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 切换到公文生成页
  const handleNextToReport = () => {
    if (!productListResult) {
      setErrorMessage('请先生成采购方案');
      return;
    }
    setCurrentView('report');
    setErrorMessage(''); // 清空错误信息
  };

  // 生成公文
  const handleGenerateReport = async () => {
    if (!productListResult) {
      setErrorMessage('请先生成采购方案');
      return;
    }
    
    // 验证公文生成页的必填字段
    if (!reportFormData.unitName || !reportFormData.department || !reportFormData.applicant) {
      setErrorMessage('请填写单位名称、申请部门和申请人（公文生成页必填项）');
      return;
    }
    
    setLoading(true);
    
    try {
      // 合并表单数据（用于组装报告）
      const mergedFormData = {
        ...solutionFormData,
        ...reportFormData
      };
      
      // 组装报告
      const report = assembleReport(mergedFormData, productListResult);
      
      // 更新状态
      setReportResult(report);
      setIsReportGenerated(true);
      setCurrentView('report');
    } catch (err) {
      setErrorMessage(err.message || '生成公文时出现错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 返回方案页
  const handleBackToSolution = () => {
    setCurrentView('solution');
  };

  // 重新生成方案
  const handleRegenerateSolution = () => {
    setIsExampleMode(true);
    setProductListResult(null);
    setErrorMessage('');
  };

  // 转换品单数据为SolutionPreview组件期望的格式
  const productListForPreview = productListResult ? {
    products: productListResult.items.map(item => ({
      ...item.product,
      quantity: item.quantity,
      subtotal: item.subtotal
    })),
    headCount: solutionFormData.headCount,
    totalBudget: solutionFormData.totalBudget
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {currentView === 'report' && (
              <button
                onClick={handleBackToSolution}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <span>←</span>
                <span>返回修改</span>
              </button>
            )}
            {currentView === 'solution' && productListResult && !isExampleMode && (
              <button
                onClick={handleRegenerateSolution}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <span>↻</span>
                <span>重新生成</span>
              </button>
            )}
            {currentView === 'solution' && (!productListResult || isExampleMode) && <div className="w-32"></div>}
            
            <h1 className="text-2xl font-bold text-blue-900">AI采购方案生成工具</h1>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentView === 'solution' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                第一步：方案生成
              </div>
              <div className="text-gray-400">→</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${currentView === 'report' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                第二步：公文生成
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 错误提示 */}
        {errorMessage && (
          <div className="mb-6 max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {errorMessage}
          </div>
        )}
        
        {/* 加载提示 */}
        {loading && (
          <div className="mb-6 max-w-4xl mx-auto p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-center">
            正在处理，请稍候...
          </div>
        )}

        {/* 方案生成页 */}
        {currentView === 'solution' && (
          <div className="space-y-8">
            {/* 表单区域 */}
            <BasicInfoForm 
              formData={solutionFormData}
              onDataChange={handleSolutionFormDataChange}
              showExampleNotice={isExampleMode}
            />
            
            {/* 操作按钮区域（放在表单与预览之间） */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleGenerateSolution}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExampleMode ? '生成我的方案' : '重新生成方案'}
                </button>
                
                {productListResult && !isExampleMode && (
                  <button
                    onClick={handleNextToReport}
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一步：生成公文 →
                  </button>
                )}
              </div>
              
              {isExampleMode && (
                <p className="mt-4 text-center text-gray-600 text-sm">
                  填写上方信息后点击"生成我的方案"，系统将为您创建定制化的采购方案
                </p>
              )}
            </div>
            
            {/* 方案预览区域 */}
            <SolutionPreview 
              productList={productListForPreview}
              isExample={isExampleMode}
            />
          </div>
        )}

        {/* 公文生成页 */}
        {currentView === 'report' && (
          <div className="space-y-8">
            {/* 表单摘要 */}
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-blue-800 mb-4">方案摘要</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">采购场景：</span>
                  <span className="font-medium">
                    {mockData.basicInfo.sceneOptions.find(opt => opt.value === solutionFormData.scene)?.label || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">慰问人数：</span>
                  <span className="font-medium">{solutionFormData.headCount || '-'} 人</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">总预算：</span>
                  <span className="font-medium">¥{solutionFormData.totalBudget || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">资金来源：</span>
                  <span className="font-medium">{solutionFormData.fundSource || '-'}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">公文信息（请填写以下信息生成正式公文）</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      单位名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reportFormData.unitName}
                      onChange={(e) => handleReportFormDataChange({ unitName: e.target.value })}
                      placeholder="请输入单位全称"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      申请部门 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reportFormData.department}
                      onChange={(e) => handleReportFormDataChange({ department: e.target.value })}
                      placeholder="例如：行政部、工会办公室"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      申请人 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reportFormData.applicant}
                      onChange={(e) => handleReportFormDataChange({ applicant: e.target.value })}
                      placeholder="请输入申请人姓名"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      年份
                    </label>
                    <input
                      type="number"
                      value={reportFormData.year}
                      onChange={(e) => handleReportFormDataChange({ year: e.target.value === '' ? '' : Number(e.target.value) || 0 })}
                      placeholder="例如：2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      节日（如适用）
                    </label>
                    <input
                      type="text"
                      value={reportFormData.festival}
                      onChange={(e) => handleReportFormDataChange({ festival: e.target.value })}
                      placeholder="例如：春节、中秋节"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus-ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 操作按钮区域 - 放在方案摘要和采购申请报告之间 */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!isReportGenerated ? (
                  <button
                    onClick={handleGenerateReport}
                    disabled={loading || !productListResult}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    生成正式公文
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-700 font-medium">✅ 公文已生成完成！</p>
                      <p className="text-green-600 text-sm mt-1">您可以直接复制使用此正式公文</p>
                    </div>
                    <button
                      onClick={() => setIsReportGenerated(false)}
                      className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      重新生成公文
                    </button>
                  </div>
                )}
                
                <button
                  onClick={handleBackToSolution}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  ← 返回修改方案
                </button>
              </div>
              
              {!isReportGenerated && (
                <p className="mt-4 text-center text-gray-600 text-sm">
                  点击"生成正式公文"将替换示例内容，为您生成定制化的正式采购申请报告
                </p>
              )}
            </div>
            
            {/* 公文预览区域 */}
            <ProcurementReport 
              report={reportResult?.body}
              isExample={!isReportGenerated}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
