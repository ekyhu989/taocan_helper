import React, { useState, useEffect, useCallback, useRef } from 'react';
import HomePage from './pages/desktop/HomePage';
import PolicyLibraryPage from './pages/desktop/PolicyLibraryPage';
import ProductManagerPage from './pages/desktop/ProductManagerPage';
import CompliancePage from './pages/desktop/CompliancePage';
import DiagnosisPage from './pages/desktop/DiagnosisPage';
import BasicInfoForm from './components/desktop/BasicInfoForm';
import SolutionPreview from './components/desktop/SolutionPreview';
import ProcurementReport from './components/desktop/ProcurementReport';
import QuotationPreview from './components/desktop/QuotationPreview';
import HistoryManager from './components/desktop/HistoryManager';
import BottomNav from './components/desktop/BottomNav';
import mockData from './data/mockData';
import { loadProducts } from './utils/helpers/productStorage';
import { generateProductList, recalculateSolution } from './utils/algorithm/productListGenerator';
import { assembleReport, generateQuotationSheet } from './utils/helpers/reportAssembler';
import { validateBudget } from './utils/compliance/budgetValidator';
import { exportToWord, exportToPDF, generateExportFileName } from './utils/helpers/exportUtils';
import { saveHistory } from './utils/helpers/historyStorage';
import { SERVICE_MESSAGES } from './config/serviceConfig';
import ContactServiceModal from './components/desktop/ContactServiceModal';
import {
  saveSolutionForm,
  loadSolutionForm,
  saveReportForm,
  loadReportForm,
  clearSolutionForm,
  clearReportForm,
  debounce,
} from './utils/helpers/formStorage';
import { usePolicyVersion } from './hooks/usePolicyVersion';
import DataBackupSettings from './components/desktop/DataBackupSettings';
import DataRecoveryPage from './pages/desktop/DataRecoveryPage';

function App() {
  // 当前页面：'home'（首页）、'solution'（方案生成页）、'report'（公文生成页）、'compliance'（合规测算页）、'policy'（政策文库）、'product'（商品库）、'history'（历史方案）、'settings'（设置）
  const [currentPage, setCurrentPage] = useState('home');
  const [previousPage, setPreviousPage] = useState('home');
  const [pageDirection, setPageDirection] = useState('forward');
  
  const [showProductManager, setShowProductManager] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [settingsTab, setSettingsTab] = useState('backup'); // 'backup' 或 'recovery'

  useEffect(() => {
    const products = loadProducts();
    setProductsData(products);
  }, [showProductManager]);

  // 页面切换时刷新商品数据（修复商品库页与方案生成页数据同步 Bug）
  useEffect(() => {
    if (currentPage === 'solution' || currentPage === 'product') {
      const products = loadProducts();
      setProductsData(products);
    }
  }, [currentPage]);
  
  // 方案生成页表单数据
  const [solutionFormData, setSolutionFormData] = useState({
    region: '新疆地区',
    scene: mockData.basicInfo.sceneOptions[0].value,
    festival: '',
    headCount: '',
    totalBudget: '',
    fundSource: '行政福利费',
    budgetMode: 'per_capita',
    category: '食品'
  });
  
  // 公文生成页表单数据
  const [reportFormData, setReportFormData] = useState({
    unitName: '',
    department: '',
    applicant: '',
    year: new Date().getFullYear(),
  });
  
  // 状态管理
  const { beforeAction } = usePolicyVersion();
  const [errorMessage, setErrorMessage] = useState('');
  const [productListResult, setProductListResult] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExampleMode, setIsExampleMode] = useState(true);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [isAdjusted, setIsAdjusted] = useState(false);
  const [originalProductListResult, setOriginalProductListResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showRestoreNotice, setShowRestoreNotice] = useState(false);
  const [showClearedNotice, setShowClearedNotice] = useState(false);
  const [activeDoc, setActiveDoc] = useState('report');
  const [showContactModal, setShowContactModal] = useState(false);

  // ─────────────────────────────────────────────
  // 页面导航
  // ─────────────────────────────────────────────
  const handleNavigate = (page) => {
    setPreviousPage(currentPage);
    if ((currentPage === 'home' && page !== 'home') || (currentPage !== 'home' && page === 'home')) {
      setPageDirection(page === 'home' ? 'backward' : 'forward');
    } else {
      setPageDirection('fade');
    }
    setCurrentPage(page);
    setErrorMessage('');
  };

  // ─────────────────────────────────────────────
  // 表单持久化
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

  useEffect(() => {
    if (debouncedSaveSolution.current) {
      debouncedSaveSolution.current(solutionFormData);
    }
  }, [solutionFormData]);

  useEffect(() => {
    if (debouncedSaveReport.current) {
      debouncedSaveReport.current(reportFormData);
    }
  }, [reportFormData]);

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
      };
      setReportFormData(defaults);
      clearReportForm();
      setShowClearedNotice(true);
      setTimeout(() => setShowClearedNotice(false), 3000);
    }
  };

  const handleSolutionFormDataChange = (data) => {
    setSolutionFormData(prev => ({ ...prev, ...data }));
  };
  
  const handleReportFormDataChange = (data) => {
    setReportFormData(prev => ({ ...prev, ...data }));
  };

  const handleGenerateSolution = async () => {
    if (!solutionFormData.headCount || !solutionFormData.totalBudget) {
      setErrorMessage('请填写人数和总预算（带 * 号为必填项）');
      return;
    }
    
    const budgetValidation = validateBudget(solutionFormData.totalBudget, solutionFormData.headCount);
    if (!budgetValidation.isValid) {
      setErrorMessage(budgetValidation.errorMessage);
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const productResult = generateProductList(
        productsData,
        solutionFormData.scene,
        solutionFormData.totalBudget,
        solutionFormData.headCount,
        solutionFormData.fundSource,
        solutionFormData.budgetMode,
        solutionFormData.category
      );
      
      setProductListResult(productResult);
      setOriginalProductListResult(productResult);
      setIsAdjusted(false);
      setIsExampleMode(false);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message || '生成方案时出现错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextToReport = () => {
    if (!productListResult) {
      setErrorMessage('请先生成采购方案');
      return;
    }
    setCurrentPage('report');
    setErrorMessage('');
  };

  const handleGenerateReport = async () => {
    if (!productListResult) {
      setErrorMessage('请先生成采购方案');
      return;
    }
    
    if (!reportFormData.unitName || !reportFormData.department || !reportFormData.applicant) {
      setErrorMessage('请填写单位名称、申请部门和申请人（公文生成页必填项）');
      return;
    }
    
    setLoading(true);
    
    try {
      const mergedFormData = {
        ...solutionFormData,
        ...reportFormData
      };
      
      const report = assembleReport(mergedFormData, productListResult);
      
      setReportResult(report);
      setIsReportGenerated(true);
      setCurrentPage('report');

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
      }
    } catch (err) {
      setErrorMessage(err.message || '生成公文时出现错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportWord = async () => {
    // 版本校验拦截
    if (!beforeAction()) return;
    
    if (!reportResult?.body) {
      setErrorMessage('请先生成公文');
      return;
    }
    
    try {
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

  const handleExportPDF = async () => {
    // 版本校验拦截
    if (!beforeAction()) return;
    
    if (!reportResult?.body) {
      setErrorMessage('请先生成公文');
      return;
    }
    
    try {
      const mergedFormData = {
        ...solutionFormData,
        ...reportFormData
      };
      
      const elementId = 'generated-report-content';
      exportToPDF(elementId, mergedFormData, reportResult.body);
    } catch (error) {
      console.error('PDF导出失败:', error);
      setErrorMessage(`PDF导出失败: ${error.message}`);
    }
  };

  const handleBackToSolution = () => {
    setCurrentPage('solution');
  };

  // 注意：旧版 handleRegenerateSolution 已移除
  // 导航栏和无匹配引导区的"重新生成"按钮统一绑定 handleGenerateSolution
  // 该函数内部会重新调用 generateProductList 并刷新 productListResult

  const handleUpdateProductItems = (updatedItems) => {
    if (!productListResult) return;
    const recalc = recalculateSolution(updatedItems, solutionFormData.totalBudget);
    setProductListResult({
      ...productListResult,
      items: updatedItems,
      ...recalc,
    });
    setIsAdjusted(true);
    if (isReportGenerated) {
      setIsReportGenerated(false);
      setReportResult(null);
    }
  };

  const handleAdjustProduct = (productId, newQuantity) => {
    const updatedItems = productListResult.items.map(it =>
      it.product.id === productId
        ? { ...it, quantity: newQuantity, subtotal: Math.round(it.product.price * newQuantity * 100) / 100 }
        : it
    );
    handleUpdateProductItems(updatedItems);
  };

  const handleRemoveProduct = (productId) => {
    const filteredItems = productListResult.items.filter(it => it.product.id !== productId);
    if (filteredItems.length === 0) return;
    handleUpdateProductItems(filteredItems);
  };

  const handleAddProduct = (product) => {
    const newItem = {
      product,
      quantity: 1,
      subtotal: product.price,
    };
    const updatedItems = [...productListResult.items, newItem];
    handleUpdateProductItems(updatedItems);
  };

  const handleResetSolution = () => {
    if (originalProductListResult) {
      setProductListResult(originalProductListResult);
      setIsAdjusted(false);
      if (isReportGenerated) {
        setIsReportGenerated(false);
        setReportResult(null);
      }
    }
  };

  const handleReuseHistory = (historyItem) => {
    const { formData, reportFormData: rfd, productList: pl, report: rpt } = historyItem.solutionData;

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

    setReportFormData({
      unitName: rfd.unitName,
      department: rfd.department,
      applicant: rfd.applicant,
      year: rfd.year,
    });

    setProductListResult(pl);
    setOriginalProductListResult(pl);
    setIsAdjusted(false);
    setReportResult(rpt);
    setIsReportGenerated(true);
    setCurrentPage('report');
    setIsExampleMode(false);
    setErrorMessage('');
    setShowHistory(false);
  };

  const productListForPreview = productListResult ? {
    products: productListResult.items.map(item => ({
      ...item.product,
      quantity: item.quantity,
      subtotal: item.subtotal
    })),
    headCount: solutionFormData.headCount,
    totalBudget: solutionFormData.totalBudget
  } : null;

  // 检测合规风险
  const hasComplianceRisk = () => {
    const count = Number(solutionFormData.headCount) || 0;
    const budget = Number(solutionFormData.totalBudget) || 0;
    const perCapita = count > 0 ? budget / count : 0;
    
    const totalAmount = productListResult?.totalAmount || 0;
    const platform832Amount = productListResult?.platform832Amount || 0;
    const platform832Rate = totalAmount > 0 ? platform832Amount / totalAmount : 0;

    return perCapita > 2000 || perCapita > 500 || (platform832Rate < 0.3 && totalAmount > 0);
  };

  const handleFixCompliance = () => {
    alert('一键整改功能将在后续版本完善！');
  };

  const getPageAnimation = () => {
    if (pageDirection === 'forward') {
      return 'animate-slide-in-right';
    } else if (pageDirection === 'backward') {
      return 'animate-slide-in-left';
    }
    return 'animate-fade-in';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 首页 */}
      {currentPage === 'home' && (
        <div className={getPageAnimation()}>
          <HomePage onNavigate={handleNavigate} />
        </div>
      )}

      {/* 政策文库页 */}
      {currentPage === 'policy' && (
        <div className={getPageAnimation()}>
          <PolicyLibraryPage onNavigate={handleNavigate} />
        </div>
      )}

      {/* 商品库页 */}
      {currentPage === 'product' && (
        <div className={getPageAnimation()}>
          <ProductManagerPage onNavigate={handleNavigate} />
        </div>
      )}

      {/* 历史方案页（简单占位） */}
      {currentPage === 'history' && (
        <div className={`min-h-screen bg-gray-50 pb-24 ${getPageAnimation()}`}>
          <div className="bg-white shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavigate('home')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
                <h1 className="text-xl font-bold text-gray-800">
                  历史方案
                </h1>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-500 text-lg">
                历史方案功能开发中...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 设置页（数据安全与恢复） */}
      {currentPage === 'settings' && (
        <div className={`min-h-screen bg-gray-50 pb-24 ${getPageAnimation()}`}>
          <div className="bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavigate('home')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
                <h1 className="text-xl font-bold text-gray-800">
                  数据安全与恢复
                </h1>
              </div>
              
              {/* 选项卡 */}
              <div className="mt-4 flex space-x-2 border-b border-gray-200">
                <button
                  onClick={() => setSettingsTab('backup')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    settingsTab === 'backup'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🔒 数据备份
                </button>
                <button
                  onClick={() => setSettingsTab('recovery')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    settingsTab === 'recovery'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🔄 数据恢复
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto px-4 py-8">
            {settingsTab === 'backup' && <DataBackupSettings />}
            {settingsTab === 'recovery' && <DataRecoveryPage />}
          </div>
        </div>
      )}

      {/* 合规诊断页 */}
      {currentPage === 'diagnosis' && (
        <div className={getPageAnimation()}>
          <DiagnosisPage
            formData={{ ...solutionFormData, ...reportFormData }}
            onBack={() => handleNavigate('home')}
            onFixCompliance={handleFixCompliance}
          />
        </div>
      )}

      {/* 方案生成、公文生成、合规测算页 */}
      {(currentPage === 'solution' || currentPage === 'report' || currentPage === 'compliance') && (
        <div className={`pb-24 ${getPageAnimation()}`}>
          {/* 头部导航 */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigate('home')}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    <span>←</span>
                    <span className="hidden sm:inline">首页</span>
                  </button>
                  {currentPage === 'report' && (
                    <button
                      onClick={handleBackToSolution}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <span>←</span>
                      <span className="hidden sm:inline">返回修改</span>
                    </button>
                  )}
                  {currentPage === 'solution' && productListResult && !isExampleMode && (
                    <button
                      onClick={handleGenerateSolution}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 min-h-[44px] bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{loading ? '⏳' : '↻'}</span>
                      <span className="hidden sm:inline">{loading ? '生成中...' : '重新生成'}</span>
                    </button>
                  )}
                </div>
                
                <h1 className="text-xl md:text-2xl font-bold text-blue-900 text-center lg:text-left">AI采购方案生成工具</h1>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {(currentPage === 'solution' || currentPage === 'report') && (
                    <div className="flex items-center justify-center gap-2">
                      <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${currentPage === 'solution' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                        第一步：方案生成
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${currentPage === 'report' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                        第二步：公文生成
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 py-8">
            {showRestoreNotice && (
              <div className="mb-6 max-w-4xl mx-auto p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="font-medium">已恢复上次填写的数据</span>
              </div>
            )}

            {showClearedNotice && (
              <div className="mb-6 max-w-4xl mx-auto p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700 flex items-center gap-2">
                <span className="text-gray-500">🗑</span>
                <span className="font-medium">表单已清空</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {errorMessage}
              </div>
            )}
            
            {loading && (
              <div className="mb-6 max-w-4xl mx-auto p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-center">
                正在处理，请稍候...
              </div>
            )}

            {currentPage === 'solution' && (
              <div className="space-y-8">
                {/* 优惠引导条 */}
                <div className="max-w-4xl mx-auto">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <p className="font-bold text-amber-800">联系客服获取折扣优惠，最低5折起</p>
                          <p className="text-sm text-amber-700">专业采购顾问为您定制最优方案</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowContactModal(true)}
                        className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        📞 联系客服
                      </button>
                    </div>
                  </div>
                </div>

                <BasicInfoForm 
                  formData={solutionFormData}
                  onDataChange={handleSolutionFormDataChange}
                  showExampleNotice={isExampleMode}
                  onClearForm={handleClearSolutionForm}
                />
                
                <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">
                    <button
                      onClick={handleGenerateSolution}
                      disabled={loading}
                      className="flex-1 sm:flex-none px-6 md:px-8 py-3 min-h-[44px] bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '⏳ 生成中...' : (isExampleMode ? '生成我的方案' : '重新生成方案')}
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
                  
                  {errorMessage && currentPage === 'solution' && (
                    <p className="mt-3 text-center text-sm text-red-600 font-medium">{errorMessage}</p>
                  )}
                  
                  {isExampleMode && (
                    <p className="mt-4 text-center text-gray-600 text-sm">
                      填写上方信息后点击"生成我的方案"，系统将为您创建定制化的采购方案
                    </p>
                  )}
                </div>
                
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

                {/* 商品匹配不足引导 */}
                {productListResult?.noMatchWarning && !isExampleMode && (
                  <div className="max-w-4xl mx-auto mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">⚠️</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {SERVICE_MESSAGES.schemeGenerator.title}
                        </p>
                        <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
                          {SERVICE_MESSAGES.schemeGenerator.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={handleGenerateSolution}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? '⏳ 生成中...' : SERVICE_MESSAGES.schemeGenerator.btnRegenerate}
                          </button>
                          <button
                            onClick={() => setShowContactModal(true)}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors inline-flex items-center gap-1"
                          >
                            📞 {SERVICE_MESSAGES.schemeGenerator.btnContact}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentPage === 'report' && (
              <div className="space-y-8">
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
                
                <div className="max-w-6xl mx-auto">
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

            {currentPage === 'compliance' && (
              <CompliancePage onBack={() => handleNavigate('home')} />
            )}
          </div>

          {showHistory && (
            <HistoryManager
              onClose={() => setShowHistory(false)}
              onReuse={handleReuseHistory}
            />
          )}

          {/* 联系客服弹窗（全局复用） */}
          <ContactServiceModal
            visible={showContactModal}
            onClose={() => setShowContactModal(false)}
          />
        </div>
      )}

      {/* 底部导航栏 */}
      <BottomNav 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        hasComplianceRisk={hasComplianceRisk()}
      />
    </div>
  );
}

export default App;
