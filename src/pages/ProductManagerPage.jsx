import React, { useState } from 'react';
import ProductManager from '../components/ProductManager';
import { loadProducts } from '../utils/productStorage';

/**
 * 商品库管理页面
 * 
 * 2026-04-14 ADJ-V1.6-006 重构：
 * - 替换硬编码假数据为真实的 ProductManager 组件
 * - 添加联系客服引导（替代"添加商品"功能）
 * - 确保与方案生成页数据同步（共用 localStorage）
 */

const ProductManagerPage = ({ onNavigate }) => {
  const [showManager, setShowManager] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-800">商品库管理</h1>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          💡 提示：商品库中的所有商品均由官方审核后入库。如需添加新商品，请联系客服。
        </div>
      </div>

      {/* 嵌入 ProductManager 组件 */}
      {showManager && (
        <ProductManager onClose={() => onNavigate('home')} />
      )}
    </div>
  );
};

export default ProductManagerPage;
