import React, { useEffect } from 'react';
import { 
  useViewStore, 
  TViewMode, 
  getViewDisplayName, 
  getViewIcon, 
  registerViewShortcuts,
  isViewSwitchingSupported 
} from '../../stores/viewStore';

/**
 * 视图切换组件
 * V2.0 双视图切换架构 - 快捷编辑视图 + 公文排版视图
 */
const ViewSwitcher: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    toggleView,
    hasUnsavedChanges 
  } = useViewStore();

  // 注册快捷键
  useEffect(() => {
    const cleanup = registerViewShortcuts();
    return cleanup;
  }, []);

  // 检查是否支持视图切换
  const isSupported = isViewSwitchingSupported();
  
  if (!isSupported) {
    return null; // 移动端不显示视图切换
  }

  const handleViewChange = (view: TViewMode) => {
    // 检查是否有未保存的更改
    if (hasUnsavedChanges() && currentView === 'edit') {
      const confirmChange = window.confirm(
        '当前编辑内容尚未保存，确定要切换视图吗？'
      );
      
      if (!confirmChange) {
        return;
      }
    }
    
    setCurrentView(view);
  };

  const views: TViewMode[] = ['edit', 'document'];

  return (
    <div className="view-switcher">
      <div className="view-switcher-container">
        {views.map((view) => (
          <button
            key={view}
            className={`view-switch-button ${
              currentView === view ? 'active' : ''
            }`}
            onClick={() => handleViewChange(view)}
            title={`${getViewDisplayName(view)} (Ctrl+${view === 'edit' ? '1' : '2'})`}
          >
            <span className="view-icon">{getViewIcon(view)}</span>
            <span className="view-label">{getViewDisplayName(view)}</span>
            {currentView === view && (
              <span className="view-indicator"></span>
            )}
          </button>
        ))}
        
        {/* 切换按钮 */}
        <button
          className="view-toggle-button"
          onClick={toggleView}
          title="切换视图 (Ctrl+Tab)"
        >
          <span className="toggle-icon">↔</span>
        </button>
      </div>
      
      {/* 未保存更改提示 */}
      {hasUnsavedChanges() && (
        <div className="unsaved-changes-indicator">
          <span className="indicator-dot"></span>
          <span className="indicator-text">未保存</span>
        </div>
      )}
      
      <style>{`
        .view-switcher {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .view-switcher-container {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }
        
        .view-switch-button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          color: #6c757d;
        }
        
        .view-switch-button:hover {
          background: #e9ecef;
          color: #495057;
        }
        
        .view-switch-button.active {
          background: #007bff;
          color: white;
        }
        
        .view-switch-button.active .view-icon {
          filter: brightness(0) invert(1);
        }
        
        .view-icon {
          font-size: 16px;
        }
        
        .view-label {
          white-space: nowrap;
        }
        
        .view-indicator {
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: currentColor;
          border-radius: 1px;
        }
        
        .view-toggle-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: #e9ecef;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6c757d;
        }
        
        .view-toggle-button:hover {
          background: #dee2e6;
          color: #495057;
        }
        
        .toggle-icon {
          font-size: 14px;
          font-weight: bold;
        }
        
        .unsaved-changes-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          font-size: 12px;
          color: #856404;
        }
        
        .indicator-dot {
          width: 6px;
          height: 6px;
          background: #ffc107;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        .indicator-text {
          font-weight: 500;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
          .view-switcher {
            display: none; /* 移动端隐藏视图切换 */
          }
        }
        
        /* 动画效果 */
        .view-switch-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .view-switch-button.active {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ViewSwitcher;