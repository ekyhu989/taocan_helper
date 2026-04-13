import React, { useState, useEffect, useCallback, useRef } from 'react';
import BasicInfoForm from './components/BasicInfoForm';
import SolutionPreview from './components/SolutionPreview';
import ProcurementReport from './components/ProcurementReport';
import QuotationPreview from './components/QuotationPreview';
import ProductManager from './components/ProductManager';
import HistoryManager from './components/HistoryManager';
import CompliancePage from './pages/CompliancePage';
import mockData from './data/mockData';
import { loadProducts } from './utils/productStorage';
import { generateProductList, recalculateSolution } from './productListGenerator';
import { assembleReport, generateQuotationSheet } from './reportAssembler';
import { validateBudget } from './budgetValidator';
import { exportToWord, exportToPDF, generateExportFileName } from './utils/exportUtils';
import { saveHistory } from './utils/historyStorage';
import {
  saveSolutionForm,
  loadSolutionForm,
  saveReportForm,
  loadReportForm,
  clearSolutionForm,
  clearReportForm,
  debounce,
} from './utils/formStorage';

function App() {
  // 当前视图：'solution'（方案生成页）、'report'（公文生成页）、'compliance'（合规测算页）
  const [currentView, setCurrentView] = useState('solution');
  const [showProductManager, setShowProductManager] = useState(false);
  const [productsData, setProductsData] = useState([]);
  
  useEffect(() => {
    const products = loadProducts();
    setProductsData(products);
  }, [showProductManager]);
  
  // 方案生成页表单数据（第一步）
  const [solutionFormData, setSolutionFormData] = useState({
    region: '新疆地区',
    scene: mockData.basicInfo.sceneOptions[0].value,
    festival: '',
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
  const [isAdjusted, setIsAdjusted] = useState(false); // 品单是否被手动调整
  const [originalProductListResult, setOriginalProductListResult] = useState(null); // 原始自动生成结果（用于重置）
  const [showHistory, setShowHistory] = useState(false); // 历史方案面板
  const [showRestoreNotice, setShowRestoreNotice] = useState(false); // 恢复提示
  const [showClearedNotice, setShowClearedNotice] = useState(false); // 清空提示
  const [activeDoc, setActiveDoc] = useState('report'); // 公文生成页Tab：'report' | 'list' | 'quotation'

  // ─────────────────────────────────────────────
  // 表单持久化：防抖保存
  // ─────────────────────────────────────────────
  const debouncedSaveSolution = useRef(null);
  const debouncedSaveReport = useRef(null);

  useEffect(() => {
    debouncedSaveSolution.current = debounce((data) => saveSolutionForm(data), 300);
    debouncedSaveReport.current = debounce((data) => saveReportForm(data), 300);
    return () => {
      if (debouncedSaveSolution.current) debouncedSaveSolution.current.cancel();
      if (debouncedSaveReport.current) debouncedSaveReport.current.cancel();
    };
  }, []);

  // 监听 solutionFormData 变化 → 防抖保存
  useEffect(() => {
    if (debouncedSaveSolution.current) {
      debouncedSaveSolution.current(solutionFormData);
    }
  }, [solutionFormData]);

  // 监听 reportFormData 变化 → 防抖保存
  useEffect(() => {
    if (debouncedSaveReport.current) {
      debouncedSaveReport.current(reportFormData);
    }
  }, [reportFormData]);

  // ─────────────────────────────────────────────
  // 表单持久化：页面加载时自动恢复
  // ─────────────────────────────────────────────
  useEffect(() => {
    const savedSolution = loadSolutionForm();
    const savedReport = loadReportForm();
    let restored = false;

    if (savedSolution) {
      setSolutionFormData(savedSolution);
      restored = true;
    }
    if (savedReport) {
      setReportFormData(savedReport);
      restored = true;
    }
    if (restored) {
      setShowRestoreNotice(true);
      setTimeout(() => setShowRestoreNotice(false), 3000);
    }
  }, []);

  // ─────────────────────────────────────────────
  // 表单持久化：清空回调
  // ─────────────────────────────────────────────
  const getFestivalLabel = (festival) => {
    const labels = {
      spring: '春节',
      eid: '古尔邦节',
      nowruz: '肉孜节',
      other: '节日',
    };
    return labels[festival] || '节日';
  };

  const handleClearSolutionForm = () => {
    if (window.confirm('确定要清空基础信息表单中所有已填写的数据吗？')) {
      const defaults = {
        region: '新疆地区',
        scene: 'holiday',
        festival: '',
        headCount: '',
        totalBudget: '',
        fundSource: '行政福利费',
        budgetMode: 'per_capita',
        category: '食品',
      };
      setSolutionFormData(defaults);
      clearSolutionForm();
      setShowClearedNotice(true);
      setTimeout(() => setShowClearedNotice(false), 3000);
    }
  };

  const handleClearReportForm = () => {
    if (window.confirm('确定要清空公文信息表单中所有已填写的数据吗？')) {
      const defaults = {
        unitName: '',
        department: '',
        applicant: '',
        year: new Date().getFullYear(),
        festival: '',
      };
      setReportFormData(defaults);
      clearReportForm();
      setShowClearedNotice(true);
      setTimeout(() => setShowClearedNotice(false), 3000);
    }
  };

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
      setOriginalProductListResult(productResult); // 保存原始结果（用于"恢复自动生成"）
      setIsAdjusted(false); // 重置手动调整标记
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

      // ─── 自动保存到历史记录 ───
      try {
        const sceneLabel = report.sceneLabel || mergedFormData.scene;
        saveHistory({
          solutionData: {
            formData: {
              region: solutionFormData.region,
              scene: solutionFormData.scene,
              festival: solutionFormData.festival,
              headCount: Number(solutionFormData.headCount),
              totalBudget: Number(solutionFormData.totalBudget),
              fundSource: solutionFormData.fundSource,
              budgetMode: solutionFormData.budgetMode,
              category: solutionFormData.category,
            },
            reportFormData: {
              unitName: reportFormData.unitName,
              department: reportFormData.department,
              applicant: reportFormData.applicant,
              year: reportFormData.year,
            },
            productList: productListResult,
            report,
          },
          summary: {
            unitName: reportFormData.unitName,
            scene: solutionFormData.scene,
            sceneLabel,
            headCount: Number(solutionFormData.headCount),
            totalBudget: Number(solutionFormData.totalBudget),
            totalAmount: productListResult.totalAmount,
          },
        });
      } catch (historyErr) {
        console.warn('保存历史记录失败:', historyErr);
        // 历史保存失败不影响主流程
      }
    } catch (err) {
      setErrorMessage(err.message || '生成公文时出现错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 导出Word文档
  const handleExportWord = async () => {
    if (!reportResult?.body) {
      setErrorMessage('请先生成公文');
      return;
    }
    
    try {
      // 合并表单数据
      const mergedFormData = {
        ...solutionFormData,
        ...reportFormData
      };
      
      await exportToWord(reportResult.body, mergedFormData);
    } catch (error) {
      console.error('Word导出失败:', error);
      setErrorMessage(`Word导出失败: ${error.message}`);
    }
  };

  // 导出PDF文档
  const handleExportPDF = async () => {
    if (!reportResult?.body) {
      setErrorMessage('请先生成公文');
      return;
    }
    
    try {
      // 合并表单数据
      const mergedFormData = {
        ...solutionFormData,
        ...reportFormData
      };
      
      // PDF导出需要HTML元素ID
      const elementId = 'generated-report-content';
      exportToPDF(elementId, mergedFormData);
    } catch (error) {
      console.error('PDF导出失败:', error);
      setErrorMessage(`PDF导出失败: ${error.message}`);
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
    setOriginalProductListResult(null);
    setIsAdjusted(false);
    setIsReportGenerated(false);
    setReportResult(null);
    setErrorMessage('');
  };

  // ─────────────────────────────────────────────
  // 品单手动调整回调
  // ─────────────────────────────────────────────

  // 更新品单（通用：接收新的 items 数组，重新计算汇总）
  const handleUpdateProductItems = (updatedItems) => {
    if (!productListResult) return;
    const recalc = recalculateSolution(updatedItems, solutionFormData.totalBudget);
    setProductListResult({
      ...productListResult,
      items: updatedItems,
      ...recalc,
    });
    setIsAdjusted(true);
    // 品单变更后，已生成的公文标记为过期
    if (isReportGenerated) {
      setIsReportGenerated(false);
      setReportResult(null);
    }
  };

  // 修改商品数量
  const handleAdjustProduct = (productId, newQuantity) => {
    const updatedItems = productListResult.items.map(it =>
      it.product.id === productId
        ? { ...it, quantity: newQuantity, subtotal: Math.round(it.product.price * newQuantity * 100) / 100 }
        : it
    );
    handleUpdateProductItems(updatedItems);
  };

  // 删除商品
  const handleRemoveProduct = (productId) => {
    const filteredItems = productListResult.items.filter(it => it.product.id !== productId);
    if (filteredItems.length === 0) return; // 不允许删空
    handleUpdateProductItems(filteredItems);
  };

  // 添加商品（默认数量1）
  const handleAddProduct = (product) => {
    const newItem = {
      product,
      quantity: 1,
      subtotal: product.price,
    };
    const updatedItems = [...productListResult.items, newItem];
    handleUpdateProductItems(updatedItems);
  };

  // 恢复为系统自动生成的原始方案
  const handleResetSolution = () => {
    if (originalProductListResult) {
      setProductListResult(originalProductListResult);
      setIsAdjusted(false);
      // 品单变更后，已生成的公文标记为过期
      if (isReportGenerated) {
        setIsReportGenerated(false);
        setReportResult(null);
      }
    }
  };

  // ─────────────────────────────────────────────
  // 历史方案复用
  // ─────────────────────────────────────────────
  const handleReuseHistory = (historyItem) => {
    const { formData, reportFormData: rfd, productList: pl, report: rpt } = historyItem.solutionData;

    // 恢复方案表单
    setSolutionFormData({
      region: formData.region || '新疆地区',
      scene: formData.scene,
      festival: formData.festival || '',
      headCount: formData.headCount,
      totalBudget: formData.totalBudget,
      fundSource: formData.fundSource,
      budgetMode: formData.budgetMode,
      category: formData.category,
    });

    // 恢复公文表单
    setReportFormData({
      unitName: rfd.unitName,
      department: rfd.department,
      applicant: rfd.applicant,
      year: rfd.year,
    });

    // 恢复品单结果
    setProductListResult(pl);
    setOriginalProductListResult(pl);
    setIsAdjusted(false);

    // 恢复报告
    setReportResult(rpt);
    setIsReportGenerated(true);

    // 切换到公文生成页
    setCurrentView('report');
    setIsExampleMode(false);
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
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* 左侧返回/重新生成按钮 */}
            <div className="flex items-center gap-2">
              {currentView === 'report' && (
                <button
                  onClick={handleBackToSolution}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <span>←</span>
                  <span className="hidden sm:inline">返回修改</span>
                </button>
              )}
              {currentView === 'solution' && productListResult && !isExampleMode && (
                <button
                  onClick={handleRegenerateSolution}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <span>↻</span>
                  <span className="hidden sm:inline">重新生成</span>
                </button>
              )}
            </div>
            
            {/* 中间标题 */}
            <h1 className="text-xl md:text-2xl font-bold text-blue-900 text-center lg:text-left">AI采购方案生成工具</h1>
            
            {/* 右侧操作区 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* 步骤指示器 */}
              <div className="flex items-center justify-center gap-2">
                <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${currentView === 'solution' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  第一步：方案生成
                </div>
                <div className="text-gray-400">→</div>
                <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${currentView === 'report' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                  第二步：公文生成
                </div>
              </div>
              
              {/* 功能按钮 */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setShowHistory(true)}
                  className="px-3 md:px-4 py-2 min-h-[44px] bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <span>📋</span>
                  <span className="hidden md:inline">历史方案</span>
                </button>
                <button
                  onClick={() => setShowProductManager(true)}
                  className="px-3 md:px-4 py-2 min-h-[44px] bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <span>📦</span>
                  <span className="hidden md:inline">商品库管理</span>
                </button>
                <button
                  onClick={() => setCurrentView('compliance')}
                  className="px-3 md:px-4 py-2 min-h-[44px] bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <span>📊</span>
                  <span className="hidden md:inline">合规测算</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 恢复提示 */}
        {showRestoreNotice && (
          <div className="mb-6 max-w-4xl mx-auto p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center gap-2 animate-fade-in">
            <span className="text-green-600">✓</span>
            <span className="font-medium">已恢复上次填写的数据</span>
          </div>
        )}

        {/* 清空提示 */}
        {showClearedNotice && (
          <div className="mb-6 max-w-4xl mx-auto p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 flex items-center gap-2 animate-fade-in">
            <span className="text-gray-500">🗑</span>
            <span className="font-medium">表单已清空</span>
          </div>
        )}

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
              onClearForm={handleClearSolutionForm}
            />
            
            {/* 操作按钮区域（放在表单与预览之间） */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">
                <button
                  onClick={handleGenerateSolution}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 md:px-8 py-3 min-h-[44px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExampleMode ? '生成我的方案' : '重新生成方案'}
                </button>
                
                {productListResult && !isExampleMode && (
                  <button
                    onClick={handleNextToReport}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 md:px-8 py-3 min-h-[44px] bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
              productListResult={productListResult}
              headCount={solutionFormData.headCount}
              totalBudget={solutionFormData.totalBudget}
              isAdjusted={isAdjusted}
              allProducts={productsData}
              onAdjustProduct={handleAdjustProduct}
              onRemoveProduct={handleRemoveProduct}
              onAddProduct={handleAddProduct}
              onResetSolution={handleResetSolution}
            />
          </div>
        )}

        {/* 公文生成页 */}
        {currentView === 'report' && (
          <div className="space-y-8">
            {/* 表单摘要 */}
            <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-blue-800 mb-4">方案摘要</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <span className="text-gray-600 text-sm">采购地区：</span>
                  <span className="font-medium">{solutionFormData.region || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">采购场景：</span>
                  <span className="font-medium">
                    {mockData.basicInfo.sceneOptions.find(opt => opt.value === solutionFormData.scene)?.label || '-'}
                  </span>
                </div>
                {solutionFormData.scene === 'holiday' && solutionFormData.festival && (
                  <div>
                    <span className="text-gray-600 text-sm">节日类型：</span>
                    <span className="font-medium">
                      {mockData.basicInfo.festivalOptions?.find(opt => opt.value === solutionFormData.festival)?.label || '-'}
                    </span>
                  </div>
                )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      单位名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reportFormData.unitName}
                      onChange={(e) => handleReportFormDataChange({ unitName: e.target.value })}
                      placeholder="请输入单位全称"
                      className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
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
                      className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
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
                      className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
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
                      className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                    />
                  </div>
                  {solutionFormData.scene === 'holiday' && solutionFormData.festival && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        节日（从方案获取）
                      </label>
                      <input
                        type="text"
                        value={mockData.basicInfo.festivalOptions?.find(opt => opt.value === solutionFormData.festival)?.label || ''}
                        disabled
                        className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                {/* 公文表单清空按钮 */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearReportForm}
                    className="px-4 py-2 min-h-[44px] bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    清空表单
                  </button>
                  <span className="text-xs text-gray-400 sm:ml-auto text-center sm:text-left">
                    数据自动保存在本地浏览器中
                  </span>
                </div>
              </div>
            </div>
            
            {/* 操作按钮区域 - 放在方案摘要和采购申请报告之间 */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">
                {!isReportGenerated ? (
                  <button
                    onClick={handleGenerateReport}
                    disabled={loading || !productListResult}
                    className="flex-1 sm:flex-none px-6 md:px-8 py-3 min-h-[44px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    生成正式公文
                  </button>
                ) : (
                  <div className="text-center w-full sm:w-auto">
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-700 font-medium">✅ 公文已生成完成！</p>
                      <p className="text-green-600 text-sm mt-1">您可以直接复制使用此正式公文</p>
                    </div>
                    <button
                      onClick={() => setIsReportGenerated(false)}
                      className="px-6 py-2 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      重新生成公文
                    </button>
                  </div>
                )}
                
                <button
                  onClick={handleBackToSolution}
                  className="flex-1 sm:flex-none px-6 py-2 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
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
            
            {/* 公文预览区域 - 带Tab切换 */}
            <div className="max-w-6xl mx-auto">
              {/* Tab导航 */}
              {isReportGenerated && productListResult && (
                <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                  <button
                    onClick={() => setActiveDoc('report')}
                    className={`px-4 py-2 min-h-[44px] text-sm font-medium rounded-t-lg transition-colors ${
                      activeDoc === 'report'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📄 采购申请报告
                  </button>
                  <button
                    onClick={() => setActiveDoc('list')}
                    className={`px-4 py-2 min-h-[44px] text-sm font-medium rounded-t-lg transition-colors ${
                      activeDoc === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📋 物品清单
                  </button>
                  <button
                    onClick={() => setActiveDoc('quotation')}
                    className={`px-4 py-2 min-h-[44px] text-sm font-medium rounded-t-lg transition-colors ${
                      activeDoc === 'quotation'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📊 三方询价单
                  </button>
                </div>
              )}

              {/* Tab内容区域 */}
              {activeDoc === 'report' && (
                <ProcurementReport
                  report={reportResult?.body}
                  isExample={!isReportGenerated}
                  onExportWord={handleExportWord}
                  onExportPDF={handleExportPDF}
                  showExportButtons={isReportGenerated}
                />
              )}

              {activeDoc === 'list' && productListResult && (
                <SolutionPreview
                  productListResult={productListResult}
                  headCount={solutionFormData.headCount}
                  totalBudget={solutionFormData.totalBudget}
                  isAdjusted={isAdjusted}
                  allProducts={productsData}
                  onAdjustProduct={handleAdjustProduct}
                  onRemoveProduct={handleRemoveProduct}
                  onAddProduct={handleAddProduct}
                  onResetSolution={handleResetSolution}
                />
              )}

              {activeDoc === 'quotation' && productListResult && (
                <QuotationPreview
                  items={productListResult.items}
                  userInput={{ ...solutionFormData, ...reportFormData }}
                />
              )}
            </div>
          </div>
        )}

        {/* 合规测算页 */}
        {currentView === 'compliance' && (
          <CompliancePage onBack={handleBackToSolution} />
        )}
      </div>

      {showProductManager && (
        <ProductManager onClose={() => setShowProductManager(false)} />
      )}

      {showHistory && (
        <HistoryManager
          onClose={() => setShowHistory(false)}
          onReuse={handleReuseHistory}
        />
      )}
    </div>
  );
}

export default App;
