import React from 'react';
import mockData from '../data/mockData';

const SolutionPreview = () => {
  const products = mockData.products;
  const totalAmount = products.reduce((sum, item) => sum + item.subtotal, 0);
  const platform832Amount = products
    .filter(item => item.is832)
    .reduce((sum, item) => sum + item.subtotal, 0);
  const perCapita = mockData.basicInfo.totalBudget / mockData.basicInfo.headCount;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">采购方案预览</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">商品清单</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800 border border-blue-200">商品名称</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">单价</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">数量</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">小计</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{product.name}</span>
                      {product.is832 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">832平台</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border border-gray-200 text-gray-700">
                    ¥{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center border border-gray-200 text-gray-700">
                    {product.quantity} {product.unit}
                  </td>
                  <td className="px-4 py-3 text-center border border-gray-200 font-medium text-gray-800">
                    ¥{product.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">商品合计金额：</span>
            <span className="text-2xl font-bold text-blue-800">¥{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">人均标准：</span>
            <span className="text-xl font-semibold text-blue-800">¥{perCapita.toFixed(2)}</span>
          </div>
          {platform832Amount > 0 && (
            <div className="pt-4 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">832平台产品金额：</span>
                <span className="text-lg font-medium text-green-700">¥{platform832Amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700">832平台产品占比：</span>
                <span className="text-lg font-medium text-green-700">
                  {((platform832Amount / totalAmount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionPreview;
