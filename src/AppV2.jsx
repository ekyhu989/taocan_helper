import React, { useState, useEffect, useCallback, useRef } from 'react';
import DeviceRouter from './components/common/DeviceRouter';
import { detectDevice, getDeviceType } from './utils/helpers/deviceDetector';

// 双视图切换架构导入
import ViewSwitcher from './components/desktop/ViewSwitcher';
import { useViewStore } from './stores/viewStore';

// 移动端导入
import MobileHomePage from './pages/mobile/MobileHomePage';
import MobileBottomNav from './components/mobile/MobileBottomNav';

// 桌面端导入（保持现有导入）
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
import ContactServiceModal from './components/common/ContactServiceModal';
import DataBackupSettings from './components/desktop/DataBackupSettings';
import DataRecoveryPage from './pages/desktop/DataRecoveryPage';

// 工具函数导入
import mockData from './data/mockData';
import { loadProducts } from './utils/helpers/productStorage';
import { generateProductList, recalculateSolution } from './utils/algorithm/productListGenerator';
import { assembleReport, generateQuotationSheet } from './utils/helpers/reportAssembler';
import { validateBudget } from './utils/compliance/budgetValidator';
import { exportToWord, exportToPDF, generateExportFileName } from './utils/helpers/exportUtils';
import { saveHistory } from './utils/helpers/historyStorage';
import { SERVICE_MESSAGES } from './config/serviceConfig';
import { usePolicyVersion } from './hooks/usePolicyVersion';
import {
  saveSolutionForm,
  loadSolutionForm,
  saveReportForm,
  loadReportForm,
  clearSolutionForm,
  clearReportForm,
  debounce,
} from './utils/helpers/formStorage';

/**
 * V2.0 应用主组件
 * 支持双端架构（移动端优先 + 桌面端辅助）
 */
function AppV2() {
  const [currentPage, setCurrentPage] = useState('home');
  const [deviceType, setDeviceType] = useState(null);
  const [showProductManager, setShowProductManager] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [settingsTab, setSettingsTab] = useState('backup');

  // 设备检测
  useEffect(() => {
    const deviceInfo = detectDevice();
    setDeviceType(getDeviceType());
    
    // 监听窗口大小变化
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载商品数据
  useEffect(() => {
    const products = loadProducts();
    setProductsData(products);
  }, [showProductManager]);

  // 页面切换处理
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // 移动端渲染
  const renderMobileApp = () => (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端页面内容 */}
      <div className="pb-16">
        {currentPage === 'home' && (
          <MobileHomePage onPageChange={handlePageChange} />
        )}
        {/* 其他移动端页面待实现 */}
        {currentPage !== 'home' && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">开发中</h2>
              <p className="text-gray-600">移动端页面正在开发中</p>
              <button 
                onClick={() => handlePageChange('home')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                返回首页
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 移动端底部导航 */}
      <MobileBottomNav currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );

  // 桌面端渲染（集成双视图切换架构）
  const renderDesktopApp = () => {
    const { currentView } = useViewStore();
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 桌面端页面内容 */}
        <div className="flex flex-col min-h-screen">
          {/* 顶部导航区域 */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-bold text-gray-900">智能采购助手</h1>
                  <span className="text-sm text-gray-500">桌面端</span>
                </div>
                
                {/* 视图切换器 */}
                <ViewSwitcher />
                
                <div className="flex space-x-4">
                  <span className="text-sm text-gray-500">
                    {currentView === 'edit' ? '快捷编辑视图' : '公文排版视图'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* 主内容区域 */}
          <main className="flex-1">
            {/* 根据当前视图渲染对应内容 */}
            {currentView === 'edit' ? (
              <div className="edit-view-container">
                {currentPage === 'home' && (
                  <HomePage onPageChange={handlePageChange} />
                )}
                {/* 快捷编辑视图内容 */}
                {currentPage !== 'home' && (
                  <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <div className="text-6xl mb-4">✏️</div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">快捷编辑视图</h2>
                      <p className="text-gray-600">三栏布局：配置面板 + 商品列表 + 预览面板</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="document-view-container">
                {/* 公文排版视图内容 */}
                <div className="flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">公文排版视图</h2>
                    <p className="text-gray-600">专业公文格式，支持打印优化</p>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* 底部导航 */}
          <footer className="bg-white border-t border-gray-200">
            <BottomNav 
              currentPage={currentPage} 
              onPageChange={handlePageChange} 
            />
          </footer>
        </div>
      </div>
    );
  };

  // 使用双端路由
  return (
    <DeviceRouter
      mobileComponent={renderMobileApp()}
      desktopComponent={renderDesktopApp()}
    />
  );
}

export default AppV2;