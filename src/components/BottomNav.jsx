import React, { useState } from 'react';

const BottomNav = ({ currentPage, onNavigate }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navItems = [
    { id: 'home', icon: '🏠', label: '首页' },
    { id: 'solution', icon: '📝', label: '方案' },
    { id: 'compliance', icon: '📊', label: '合规' },
  ];

  const moreItems = [
    { id: 'policy', icon: '📚', label: '政策文库' },
    { id: 'product', icon: '📦', label: '商品库' },
    { id: 'history', icon: '📋', label: '历史方案' },
    { id: 'settings', icon: '⚙️', label: '设置' },
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setShowMoreMenu(false)}
        />
      )}

      {/* More Menu */}
      {showMoreMenu && (
        <div className="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4">
            {moreItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-gray-800 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
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
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all ${
                showMoreMenu
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl">➕</span>
              <span className="text-xs mt-1 font-medium">更多</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
