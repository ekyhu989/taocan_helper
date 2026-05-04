import React from 'react';
import { useViewStore } from '../stores/viewStore';

/**
 * 桌面端路由配置
 * V2.0 双视图切换架构 - 支持快捷编辑视图和公文排版视图
 */

/** 路由配置 */
export interface IRouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  viewMode?: 'edit' | 'document';
  requiresAuth?: boolean;
  title?: string;
  icon?: string;
}

/** 桌面端路由配置 */
export const desktopRoutes: IRouteConfig[] = [
  {
    path: '/',
    component: () => <div>首页</div>,
    exact: true,
    title: '首页',
    icon: '🏠'
  },
  {
    path: '/edit',
    component: () => <EditView />,
    viewMode: 'edit',
    title: '快捷编辑',
    icon: '✏️'
  },
  {
    path: '/document',
    component: () => <DocumentView />,
    viewMode: 'document',
    title: '公文排版',
    icon: '📄'
  },
  {
    path: '/history',
    component: () => <div>历史方案</div>,
    title: '历史方案',
    icon: '📚'
  },
  {
    path: '/compliance',
    component: () => <div>合规测算</div>,
    title: '合规测算',
    icon: '✅'
  },
  {
    path: '/policy',
    component: () => <div>政策文库</div>,
    title: '政策文库',
    icon: '📖'
  },
  {
    path: '/products',
    component: () => <div>商品库</div>,
    title: '商品库',
    icon: '📦'
  },
  {
    path: '/settings',
    component: () => <div>设置</div>,
    title: '设置',
    icon: '⚙️'
  }
];

/**
 * 视图组件占位符
 * 这些组件将由Doubao-seek实现
 */
const EditView: React.FC = () => {
  return (
    <div className="edit-view">
      <div className="view-header">
        <h2>快捷编辑视图</h2>
        <p>三栏布局：配置面板 + 商品列表 + 预览面板</p>
      </div>
      <div className="view-content">
        <div className="config-panel">配置面板（20%）</div>
        <div className="product-list">商品列表（50%）</div>
        <div className="preview-panel">预览面板（30%）</div>
      </div>
    </div>
  );
};

const DocumentView: React.FC = () => {
  return (
    <div className="document-view">
      <div className="view-header">
        <h2>公文排版视图</h2>
        <p>专业公文格式，支持打印优化</p>
      </div>
      <div className="view-content">
        <div className="document-template">公文模板区域</div>
        <div className="print-preview">打印预览区域</div>
      </div>
    </div>
  );
};

/**
 * 路由守卫组件
 */
export const RouteGuard: React.FC<{
  route: IRouteConfig;
  children: React.ReactNode;
}> = ({ route, children }) => {
  const { currentView, setCurrentView } = useViewStore();
  
  // 视图模式检查
  React.useEffect(() => {
    if (route.viewMode && route.viewMode !== currentView) {
      setCurrentView(route.viewMode);
    }
  }, [route.viewMode, currentView, setCurrentView]);
  
  return <>{children}</>;
};

/**
 * 获取当前路由配置
 */
export const getCurrentRoute = (pathname: string): IRouteConfig | undefined => {
  return desktopRoutes.find(route => {
    if (route.exact) {
      return route.path === pathname;
    }
    return pathname.startsWith(route.path);
  });
};

/**
 * 路由导航工具
 */
export const navigateTo = (path: string): void => {
  // 这里可以集成React Router或其他路由库
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/**
 * 获取视图相关路由
 */
export const getViewRoutes = (viewMode: 'edit' | 'document'): IRouteConfig[] => {
  return desktopRoutes.filter(route => route.viewMode === viewMode);
};

/**
 * 路由变化监听
 */
export const useRouteChange = (callback: (route: IRouteConfig) => void): void => {
  React.useEffect(() => {
    const handleRouteChange = () => {
      const currentRoute = getCurrentRoute(window.location.pathname);
      if (currentRoute) {
        callback(currentRoute);
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [callback]);
};