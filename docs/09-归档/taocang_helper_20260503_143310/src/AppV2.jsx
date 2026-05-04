import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import DeviceRouter from './components/common/DeviceRouter';
import { detectDevice, getDeviceType } from './utils/helpers/deviceDetector';

import ViewSwitcher from './components/desktop/ViewSwitcher';
import { useViewStore } from './stores/viewStore';

const MobileHomePage = lazy(() => import('./pages/mobile/MobileHomePage'));
const NewScheme = lazy(() => import('./pages/mobile/NewScheme'));
const SolutionList = lazy(() => import('./pages/mobile/SolutionList'));
const MobileHistory = lazy(() => import('./pages/mobile/MobileHistory'));
const MobileBottomNav = lazy(() => import('./components/mobile/MobileBottomNav'));

import HomePage from './pages/desktop/HomePage';
import SolutionPage from './pages/desktop/SolutionPage';
import PolicyLibraryPage from './pages/desktop/PolicyLibraryPage';
import ProductManagerPage from './pages/desktop/ProductManagerPage';
import CompliancePage from './pages/desktop/CompliancePage';
import DiagnosisPage from './pages/desktop/DiagnosisPage';
import DocumentView from './pages/desktop/DocumentView';
import HistoryManager from './components/desktop/HistoryManager';
import BottomNav from './components/desktop/BottomNav';

import { loadProducts } from './utils/helpers/productStorage';

const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-gray-500 mt-4 text-sm">加载中...</p>
    </div>
  </div>
);

/**
 * 桌面端渲染组件
 * 独立定义在AppV2外部，避免闭包问题
 */
const DesktopApp = () => {
  const { currentView } = useViewStore();
  const [currentPage, setCurrentPage] = useState('home');
  const [formData, setFormData] = useState({});
  const [productListResult, setProductListResult] = useState(null);
  const [report, setReport] = useState(null);

  const handlePageChange = useCallback((page, data) => {
    console.log('页面切换:', page, data);
    setCurrentPage(page);
    if (data?.formData) setFormData(data.formData);
    if (data?.productListResult) setProductListResult(data.productListResult);
    if (data?.report) setReport(data.report);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-900">智能采购助手</h1>
                <span className="text-sm text-gray-500">桌面端</span>
              </div>

              <ViewSwitcher />

              <div className="flex space-x-4">
                <span className="text-sm text-gray-500">
                  {currentView === 'edit' ? '快捷编辑视图' : '公文排版视图'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {currentView === 'edit' ? (
            <div className="edit-view-container">
              {currentPage === 'home' && (
                <HomePage onNavigate={handlePageChange} />
              )}
              {currentPage === 'solution' && (
                <SolutionPage onNavigate={handlePageChange} />
              )}
              {currentPage === 'compliance' && (
                <CompliancePage onBack={() => handlePageChange('home')} />
              )}
              {currentPage === 'policy' && (
                <PolicyLibraryPage onNavigate={handlePageChange} />
              )}
              {currentPage === 'product' && (
                <ProductManagerPage onNavigate={handlePageChange} />
              )}
              {currentPage === 'diagnosis' && (
                <DiagnosisPage onFixCompliance={() => handlePageChange('compliance')} />
              )}
              {currentPage === 'history' && (
                <HistoryManager onClose={() => handlePageChange('home')} />
              )}
              {currentPage === 'settings' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">安全设置页面</h2>
                  <p>安全设置功能正在开发中...</p>
                  <button onClick={() => handlePageChange('home')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">返回首页</button>
                </div>
              )}
            </div>
          ) : (
            <div className="document-view-container">
              <DocumentView
                formData={formData}
                productListResult={productListResult}
                report={report}
                onNavigate={handlePageChange}
              />
            </div>
          )}
        </main>

        <footer className="bg-white border-t border-gray-200">
          <BottomNav
            currentPage={currentPage}
            onNavigate={handlePageChange}
          />
        </footer>
      </div>
    </div>
  );
};

function AppV2() {
  const [currentPage, setCurrentPage] = useState('home');
  const [deviceType, setDeviceType] = useState(null);
  const [mobileSchemeData, setMobileSchemeData] = useState(null);
  const [showProductManager, setShowProductManager] = useState(false);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    const deviceInfo = detectDevice();
    setDeviceType(getDeviceType());

    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const products = loadProducts();
    setProductsData(products);
  }, [showProductManager]);

  const handleMobilePageChange = useCallback((page, data) => {
    console.log('移动端页面切换:', page, data ? '(含数据)' : '');
    setCurrentPage(page);
    if (data) {
      setMobileSchemeData(data);
    }
  }, []);

  const renderMobileApp = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-16">
        <Suspense fallback={<PageLoading />}>
          {currentPage === 'home' && (
            <MobileHomePage onPageChange={handleMobilePageChange} />
          )}
          {currentPage === 'scheme' && (
            <NewScheme onNavigate={handleMobilePageChange} />
          )}
          {currentPage === 'solution' && (
            <SolutionList onNavigate={handleMobilePageChange} schemeData={mobileSchemeData} />
          )}
          {currentPage === 'history' && (
            <MobileHistory onNavigate={handleMobilePageChange} />
          )}
          {currentPage === 'settings' && (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">设置</h2>
                <p className="text-gray-600 mb-4">设置功能开发中</p>
                <button
                  onClick={() => handleMobilePageChange('home')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                  返回首页
                </button>
              </div>
            </div>
          )}
        </Suspense>
      </div>

      <Suspense fallback={<div className="h-16 bg-white"></div>}>
        <MobileBottomNav currentPage={currentPage} onPageChange={handleMobilePageChange} />
      </Suspense>
    </div>
  );

  return (
    <DeviceRouter
      mobileComponent={renderMobileApp()}
      desktopComponent={<DesktopApp />}
    />
  );
}

export default AppV2;
