import React from 'react';
import FeatureCard from '../../components/desktop/FeatureCard';

const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🛒</div>
            <div>
              <h1 className="text-2xl font-bold text-blue-800">AI采购方案生成工具</h1>
              <p className="text-sm text-gray-500">智能 · 高效 · 合规</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 md:p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">新疆地区智能采购助手</h2>
          <p className="text-blue-100 text-lg mb-6">
            快速生成合规的采购方案，包含品单、询价单和正式公文，满足工会慰问、专项活动等多种场景需求。
          </p>
          <button
            onClick={() => {
              if (onNavigate && typeof onNavigate === 'function') {
                onNavigate('solution');
              }
            }}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            🚀 立即制定方案
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">功能入口</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <FeatureCard
            icon="📝"
            title="制定方案"
            description="生成采购方案、品单和正式公文"
            bgColor="bg-blue-50"
            onClick={() => {
              if (onNavigate && typeof onNavigate === 'function') {
                onNavigate('solution');
              }
            }}
          />
          <FeatureCard
            icon="📊"
            title="合规测算"
            description="年度合规度计算和政策依据查询"
            bgColor="bg-green-50"
            onClick={() => {
              if (onNavigate && typeof onNavigate === 'function') {
                onNavigate('compliance');
              }
            }}
          />
          <FeatureCard
            icon="📚"
            title="政策文库"
            description="查看最新的采购政策和法规文件"
            bgColor="bg-purple-50"
            onClick={() => {
              if (onNavigate && typeof onNavigate === 'function') {
                onNavigate('policy');
              }
            }}
          />
          <FeatureCard
            icon="📦"
            title="商品库"
            description="管理采购商品库，添加或编辑商品"
            bgColor="bg-amber-50"
            onClick={() => {
              if (onNavigate && typeof onNavigate === 'function') {
                onNavigate('product');
              }
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500 text-sm">
          <p>版本 v1.5</p>
          <p className="mt-1">新疆地区政府采购智能助手</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
