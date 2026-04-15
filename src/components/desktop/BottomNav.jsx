import React from 'react';

const BottomNav = ({ currentPage, onNavigate, hasComplianceRisk = false }) => {
  const navItems = [
    { id: 'home', icon: '🏠', label: '首页' },
    { id: 'solution', icon: '📝', label: '方案' },
    { id: 'compliance', icon: '📊', label: '合规' },
    { id: 'policy', icon: '📚', label: '政策' },
    { id: 'product', icon: '📦', label: '商品' },
    { id: 'settings', icon: '⚙️', label: '安全' },
  ];

  const desktopNavItems = [
    ...navItems,
    { id: 'history', icon: '📋', label: '历史' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
      <div className="max-w-6xl mx-auto">
        {/* 桌面端导航（lg:1024px+） */}
        <div className="hidden lg:flex items-center justify-around h-16">
          {desktopNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all ${
              currentPage === item.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          ))}
          
          {/* 合规预警按钮（桌面端） */}
          {hasComplianceRisk && (
            <button
              onClick={() => onNavigate('diagnosis')}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg animate-pulse"
            >
              <span>⚠️</span>
              <span className="text-sm font-medium">合规预警</span>
            </button>
          )}
        </div>

        {/* 移动端导航（<1024px） */}
        <div className="lg:hidden flex items-center justify-around h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all ${
                currentPage === item.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
