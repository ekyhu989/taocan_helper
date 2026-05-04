import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/desktop/HomePage';
import SolutionPage from '@/pages/desktop/SolutionPage';
import PolicyLibraryPage from '@/pages/desktop/PolicyLibraryPage';
import ProductManagerPage from '@/pages/desktop/ProductManagerPage';
import CompliancePage from '@/pages/desktop/CompliancePage';

describe('HashRouter Routing', () => {
  const renderWithRouter = (initialEntries: string[]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/solution" element={<SolutionPage />} />
          <Route path="/policy" element={<PolicyLibraryPage />} />
          <Route path="/product" element={<ProductManagerPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Route Rendering', () => {
    it('renders HomePage at root path', () => {
      renderWithRouter(['/']);
      expect(screen.getByText('淘仓助手')).toBeInTheDocument();
      expect(screen.getByText('新疆地区智能采购助手')).toBeInTheDocument();
    });

    it('renders SolutionPage at /solution', () => {
      renderWithRouter(['/solution']);
      expect(screen.getByText('制定采购方案')).toBeInTheDocument();
    });

    it('renders PolicyLibraryPage at /policy', () => {
      renderWithRouter(['/policy']);
      expect(screen.getByText('政策文库')).toBeInTheDocument();
    });

    it('renders ProductManagerPage at /product', () => {
      renderWithRouter(['/product']);
      expect(screen.getByText('商品库')).toBeInTheDocument();
    });

    it('renders CompliancePage at /compliance', () => {
      renderWithRouter(['/compliance']);
      expect(screen.getByText('合规测算')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('has working navigation links on home page', () => {
      renderWithRouter(['/']);

      // 检查功能入口按钮存在
      expect(screen.getByText('制定采购方案')).toBeInTheDocument();
      expect(screen.getByText('政策文库')).toBeInTheDocument();
      expect(screen.getByText('商品库')).toBeInTheDocument();
      expect(screen.getByText('合规测算')).toBeInTheDocument();
    });

    it('has back button on sub pages', () => {
      renderWithRouter(['/solution']);
      expect(screen.getByText('首页')).toBeInTheDocument();
    });
  });
});
