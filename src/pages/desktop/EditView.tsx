import React, { useState } from 'react';
import ConfigPanel from '../../components/desktop/ConfigPanel';
import ProductTable from '../../components/desktop/ProductTable';
import PreviewPanel from '../../components/desktop/PreviewPanel';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  is832: boolean;
}

const EditView: React.FC = () => {
  const [config, setConfig] = useState({
    totalBudget: 50000,
    peopleCount: 100,
    fundSource: 'union' as const
  });
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: '东北大米 5kg', price: 68, quantity: 2, is832: true },
    { id: '2', name: '鲁花花生油 5L', price: 128, quantity: 1, is832: true },
    { id: '3', name: '新疆灰枣礼盒', price: 88, quantity: 1, is832: true },
    { id: '4', name: '牛奶 250ml×12盒', price: 45, quantity: 2, is832: false },
    { id: '5', name: '坚果礼盒 1kg', price: 168, quantity: 1, is832: false }
  ]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 顶部栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">快捷编辑视图</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
            保存草稿
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            生成方案
          </button>
        </div>
      </div>

      {/* 三栏布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 配置面板 - 20% */}
        <div className="w-[20%] min-w-[280px] flex-shrink-0">
          <ConfigPanel
            totalBudget={config.totalBudget}
            peopleCount={config.peopleCount}
            fundSource={config.fundSource}
            onConfigChange={setConfig}
          />
        </div>

        {/* 商品列表 - 50% */}
        <div className="w-[50%] flex-1">
          <ProductTable
            products={products}
            onProductsChange={setProducts}
          />
        </div>

        {/* 预览面板 - 30% */}
        <div className="w-[30%] min-w-[360px] flex-shrink-0">
          <PreviewPanel
            totalBudget={config.totalBudget}
            peopleCount={config.peopleCount}
            products={products}
          />
        </div>
      </div>
    </div>
  );
};

export default EditView;
