/**
 * 视图状态管理Store
 * V2.0 双视图切换架构 - 管理快捷编辑视图和公文排版视图
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 视图模式 */
export type TViewMode = 'edit' | 'document';

/** 视图配置 */
export interface IViewConfig {
  editView: {
    sidebarWidth: number;
    showCompliancePanel: boolean;
    showPriceConstraints: boolean;
    autoSave: boolean;
  };
  documentView: {
    showPageNumbers: boolean;
    showWatermark: boolean;
    printMargins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    fontSize: 'small' | 'medium' | 'large';
  };
}

interface IViewState {
  // 状态
  currentView: TViewMode;
  viewConfig: IViewConfig;
  lastEditTime: Date | null;
  
  // 操作
  setCurrentView: (view: TViewMode) => void;
  toggleView: () => void;
  updateViewConfig: (config: Partial<IViewConfig>) => void;
  updateEditViewConfig: (config: Partial<IViewConfig['editView']>) => void;
  updateDocumentViewConfig: (config: Partial<IViewConfig['documentView']>) => void;
  setLastEditTime: (time: Date) => void;
  
  // 快捷操作
  switchToEditView: () => void;
  switchToDocumentView: () => void;
  
  // 状态检查
  hasUnsavedChanges: () => boolean;
  getViewTransitionClass: () => string;
}

/**
 * 默认视图配置
 */
const defaultViewConfig: IViewConfig = {
  editView: {
    sidebarWidth: 300,
    showCompliancePanel: true,
    showPriceConstraints: true,
    autoSave: true
  },
  documentView: {
    showPageNumbers: true,
    showWatermark: true,
    printMargins: {
      top: 20,
      bottom: 20,
      left: 25,
      right: 25
    },
    fontSize: 'medium'
  }
};

/**
 * 视图状态管理Store
 */
export const useViewStore = create<IViewState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentView: 'edit' as TViewMode,
      viewConfig: defaultViewConfig,
      lastEditTime: null,

      // 设置当前视图
      setCurrentView: (view) => {
        set({ currentView: view });
      },

      // 切换视图
      toggleView: () => {
        const { currentView } = get();
        const newView = currentView === 'edit' ? 'document' : 'edit';
        set({ currentView: newView });
      },

      // 更新视图配置
      updateViewConfig: (config) => {
        set({
          viewConfig: {
            ...get().viewConfig,
            ...config
          }
        });
      },

      // 更新编辑视图配置
      updateEditViewConfig: (config) => {
        const { viewConfig } = get();
        set({
          viewConfig: {
            ...viewConfig,
            editView: {
              ...viewConfig.editView,
              ...config
            }
          }
        });
      },

      // 更新公文视图配置
      updateDocumentViewConfig: (config) => {
        const { viewConfig } = get();
        set({
          viewConfig: {
            ...viewConfig,
            documentView: {
              ...viewConfig.documentView,
              ...config
            }
          }
        });
      },

      // 设置最后编辑时间
      setLastEditTime: (time) => {
        set({ lastEditTime: time });
      },

      // 快捷切换到编辑视图
      switchToEditView: () => {
        set({ currentView: 'edit' });
      },

      // 快捷切换到公文视图
      switchToDocumentView: () => {
        set({ currentView: 'document' });
      },

      // 检查是否有未保存的更改
      hasUnsavedChanges: () => {
        const { lastEditTime } = get();
        if (!lastEditTime) return false;
        
        // 如果最后编辑时间在5分钟内，认为有未保存的更改
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return lastEditTime > fiveMinutesAgo;
      },

      // 获取视图切换动画类名
      getViewTransitionClass: () => {
        const { currentView } = get();
        return currentView === 'edit' 
          ? 'view-transition-edit-to-document'
          : 'view-transition-document-to-edit';
      }
    }),
    {
      name: 'view-store',
      partialize: (state) => ({
        currentView: state.currentView,
        viewConfig: state.viewConfig
      })
    }
  )
);

/**
 * 视图工具函数
 */

/**
 * 注册视图切换快捷键
 */
export const registerViewShortcuts = (): (() => void) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl+1: 切换到编辑视图
    if (event.ctrlKey && event.key === '1') {
      event.preventDefault();
      useViewStore.getState().switchToEditView();
    }
    
    // Ctrl+2: 切换到公文视图
    if (event.ctrlKey && event.key === '2') {
      event.preventDefault();
      useViewStore.getState().switchToDocumentView();
    }
    
    // Ctrl+Tab: 切换视图
    if (event.ctrlKey && event.key === 'Tab') {
      event.preventDefault();
      useViewStore.getState().toggleView();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * 获取视图显示名称
 */
export const getViewDisplayName = (view: TViewMode): string => {
  const viewNames = {
    edit: '快捷编辑',
    document: '公文排版'
  };
  
  return viewNames[view];
};

/**
 * 获取视图图标
 */
export const getViewIcon = (view: TViewMode): string => {
  const viewIcons = {
    edit: '✏️',
    document: '📄'
  };
  
  return viewIcons[view];
};

/**
 * 检查是否支持视图切换
 */
export const isViewSwitchingSupported = (): boolean => {
  // 检查当前设备是否支持视图切换（桌面端支持）
  const isDesktop = window.innerWidth >= 1024;
  return isDesktop;
};

/**
 * 视图切换动画配置
 */
export const viewTransitionConfig = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  classNames: {
    enter: 'view-enter',
    enterActive: 'view-enter-active',
    exit: 'view-exit',
    exitActive: 'view-exit-active'
  }
};