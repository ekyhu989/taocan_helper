import React from 'react';
import SceneQuickEntry from '../../components/mobile/SceneQuickEntry';
import RecentSchemes from '../../components/mobile/RecentSchemes';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const handleSelectScene = (scene: string) => {
    onNavigate('solution');
  };

  const handleSelectScheme = (scheme: any) => {
    onNavigate('solution');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题 */}
      <div className="bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          智能采购助手
        </h1>
        <p className="text-gray-600 text-sm">
          基层工会采购智能合规工具
        </p>
      </div>

      {/* 场景快捷入口 */}
      <SceneQuickEntry onSelectScene={handleSelectScene} />

      {/* 应急模式入口 */}
      <div className="px-4 py-6">
        <button
          onClick={() => onNavigate('emergency')}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg p-6 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">⚡</span>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold mb-1">应急模式</h3>
              <p className="text-orange-100">10秒快速创建草稿</p>
            </div>
            <span className="text-2xl">→</span>
          </div>
        </button>
      </div>

      {/* 最近方案 */}
      <RecentSchemes onSelectScheme={handleSelectScheme} />

      {/* 超大悬浮按钮 */}
      <button
        className="fixed bottom-24 right-6 w-[72px] h-[72px] bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl active:scale-95 transition-transform z-50"
        onClick={() => onNavigate('solution')}
      >
        ➕
      </button>
    </div>
  );
};

export default Home;
