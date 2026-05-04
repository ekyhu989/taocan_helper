import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  is832: boolean;
}

interface PreviewPanelProps {
  totalBudget?: number;
  peopleCount?: number;
  products?: Product[];
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  totalBudget = 50000,
  peopleCount = 100,
  products = []
}) => {
  const totalAmount = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const perCapita = totalAmount / peopleCount;
  const remaining = totalBudget - totalAmount;
  const percentageUsed = (totalAmount / totalBudget) * 100;
  const count832 = products.filter(p => p.is832).length;
  const amount832 = products.filter(p => p.is832).reduce((sum, p) => sum + p.price * p.quantity, 0);
  const ratio832 = products.length > 0 ? (count832 / products.length) * 100 : 0;

  const isCompliant = perCapita <= 500 && ratio832 >= 60;

  return (
    <div className="bg-gray-50 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900">方案预览</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 合规状态 */}
        <div className={`p-5 rounded-xl border ${
          isCompliant
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">
              {isCompliant ? '✅' : '⚠️'}
            </span>
            <div>
              <h3 className={`font-bold ${
                isCompliant ? 'text-green-800' : 'text-red-800'
              }`}>
                {isCompliant ? '合规' : '需注意'}
              </h3>
              <p className={`text-sm ${
                isCompliant ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCompliant ? '方案符合要求' : '请检查合规指标'}
              </p>
            </div>
          </div>
        </div>

        {/* 金额汇总 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">金额明细</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总预算</span>
              <span className="font-medium text-gray-900">¥{totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">已使用</span>
              <span className="font-medium text-blue-600">¥{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">剩余</span>
              <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ¥{remaining.toLocaleString()}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    percentageUsed > 100 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                {percentageUsed.toFixed(1)}% 已使用
              </p>
            </div>
          </div>
        </div>

        {/* 合规指标 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">合规指标</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 text-sm">人均金额</span>
                <span className={`font-medium ${perCapita <= 500 ? 'text-green-600' : 'text-red-600'}`}>
                  ¥{perCapita.toFixed(0)} / 人
                </span>
              </div>
              <p className="text-xs text-gray-500">标准: ≤500元/人</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 text-sm">832产品占比</span>
                <span className={`font-medium ${ratio832 >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
                  {ratio832.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500">标准: ≥60%</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 text-sm">832产品金额</span>
                <span className="font-medium text-gray-900">¥{amount832.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500">{count832}件商品</p>
            </div>
          </div>
        </div>

        {/* 商品预览 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">商品预览</h3>
          <div className="space-y-3">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  {product.is832 && (
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                  <span className="text-sm text-gray-700">{product.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ¥{product.price} × {product.quantity}
                </span>
              </div>
            ))}
            {products.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                ...还有 {products.length - 5} 件商品
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
