import React from 'react';

/**
 * 移动端底部导航栏
 * 专为移动端设计的底部导航，支持单手操作
 */
const MobileBottomNav = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'home', icon: '🏠', label: '首页' },
    { id: 'solution', icon: '📋', label: '方案' },
    { id: 'history', icon: '📚', label: '历史' },
    { id: 'settings', icon: '⚙️', label: '设置' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around py-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-colors ${
              currentPage === item.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;