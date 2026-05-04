import { lazy } from 'react';
import type { ComponentType } from 'react';

// 懒加载页面
const HomePage = lazy(() => import('@/pages/desktop/HomePage'));
const SolutionPage = lazy(() => import('@/pages/desktop/SolutionPage'));
const PolicyLibraryPage = lazy(() => import('@/pages/desktop/PolicyLibraryPage'));
const ProductManagerPage = lazy(() => import('@/pages/desktop/ProductManagerPage'));
const CompliancePage = lazy(() => import('@/pages/desktop/CompliancePage'));

export interface RouteConfig {
  path: string;
  element: ComponentType;
  meta: {
    title: string;
    description?: string;
  };
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
    meta: { title: '首页', description: '淘仓助手 - 专业的AI采购方案生成工具' }
  },
  {
    path: '/solution',
    element: SolutionPage,
    meta: { title: '制定方案', description: '智能生成采购方案' }
  },
  {
    path: '/policy',
    element: PolicyLibraryPage,
    meta: { title: '政策文库', description: '工会采购政策文件查询' }
  },
  {
    path: '/product',
    element: ProductManagerPage,
    meta: { title: '商品库', description: '商品管理与配置' }
  },
  {
    path: '/compliance',
    element: CompliancePage,
    meta: { title: '合规测算', description: '采购合规性检查与测算' }
  }
];

// 路由路径常量
export const ROUTE_PATHS = {
  HOME: '/',
  SOLUTION: '/solution',
  POLICY: '/policy',
  PRODUCT: '/product',
  COMPLIANCE: '/compliance',
} as const;

// 路由标题映射
export const ROUTE_TITLES: Record<string, string> = {
  [ROUTE_PATHS.HOME]: '首页',
  [ROUTE_PATHS.SOLUTION]: '制定方案',
  [ROUTE_PATHS.POLICY]: '政策文库',
  [ROUTE_PATHS.PRODUCT]: '商品库',
  [ROUTE_PATHS.COMPLIANCE]: '合规测算',
};
