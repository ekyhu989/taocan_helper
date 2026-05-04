import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/desktop/HomePage'));
// const SolutionPage = lazy(() => import('./pages/desktop/SolutionPage'));
const PolicyLibraryPage = lazy(() => import('./pages/desktop/PolicyLibraryPage'));
const ProductManagerPage = lazy(() => import('./pages/desktop/ProductManagerPage'));
const CompliancePage = lazy(() => import('./pages/desktop/CompliancePage'));
const TemplateListPage = lazy(() => import('./pages/template/TemplateListPage'));
const SolutionEditorPage = lazy(() => import('./pages/solution/SolutionEditorPage'));
const PolicyListPage = lazy(() => import('./pages/policy/PolicyListPage'));
const PolicyDetailPage = lazy(() => import('./pages/policy/PolicyDetailPage'));
const FavoritesPage = lazy(() => import('./pages/favorites/FavoritesPage'));

// 页面加载占位组件
const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
    <div className="animate-pulse space-y-4 w-full max-w-4xl px-4">
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/solution" element={<SolutionEditorPage />} />
          <Route path="/templates" element={<TemplateListPage />} />
          <Route path="/policy" element={<PolicyLibraryPage />} />
          <Route path="/policies" element={<PolicyListPage />} />
          <Route path="/policy/:id" element={<PolicyDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/product" element={<ProductManagerPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

// 404页面
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-[var(--color-primary)] mb-4">404</h1>
      <p className="text-xl text-[var(--color-text-secondary)] mb-8">页面未找到</p>
      <a
        href="#/"
        className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] text-white font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        返回首页
      </a>
    </div>
  </div>
);

export default App;
