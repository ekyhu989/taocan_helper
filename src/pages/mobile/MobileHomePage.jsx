import React from 'react';

/**
 * 移动端首页
 * 专为移动端设计的首页，采用卡片流布局，支持单手操作
 */
const MobileHomePage = ({ onPageChange }) => {
  const quickActions = [
    {
      id: 'new-scheme',
      icon: '➕',
      title: '新建采购方案',
      description: '快速创建符合审计要求的采购方案',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'spring-festival',
      icon: '🎉',
      title: '春节慰问',
      description: '春节慰问专项方案',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'mid-autumn',
      icon: '🌕',
      title: '中秋慰问',
      description: '中秋慰问专项方案',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'special-activity',
      icon: '🎯',
      title: '专项活动',
      description: '专项活动采购方案',
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题 */}
      <div className="bg-white px-6 py-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          智能采购助手
        </h1>
        <p className="text-gray-600 text-sm">
          基层工会采购智能合规工具
        </p>
      </div>

      {/* 快捷操作卡片 */}
      <div className="px-4 py-6 space-y-4">
        {quickActions.map((action) => (
          <div
            key={action.id}
            className={`bg-gradient-to-r ${action.color} rounded-2xl shadow-lg p-6 active:scale-95 transition-transform`}
            onClick={() => onPageChange('solution')}
          >
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{action.icon}</span>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{action.title}</h3>
                <p className="text-blue-100 text-sm mt-1">{action.description}</p>
              </div>
              <span className="text-white text-2xl">→</span>
            </div>
          </div>
        ))}
      </div>

      {/* 悬浮新建按钮 */}
      <button
        className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
        onClick={() => onPageChange('solution')}
      >
        ➕
      </button>
    </div>
  );
};

export default MobileHomePage;