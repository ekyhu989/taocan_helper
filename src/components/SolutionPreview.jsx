import React from 'react';
import mockData from '../data/mockData';

const SolutionPreview = ({ productList, isExample = false }) => {
  // 如果是示例模式，使用示例数据；否则使用真实数据
  let products, headCount, totalBudget, title;
  
  if (isExample) {
    products = mockData.exampleSolution.products;
    headCount = mockData.exampleSolution.headCount;
    totalBudget = mockData.exampleSolution.totalBudget;
    title = mockData.exampleSolution.title;
  } else if (productList) {
    products = productList.products || [];
    headCount = productList.headCount || 0;
    totalBudget = productList.totalBudget || 0;
    title = '您的采购方案';
  } else {
    // 回退到默认示例数据
    products = mockData.products;
    headCount = 100;
    totalBudget = 60000;
    title = '采购方案预览';
  }
  
  const totalAmount = products.reduce((sum, item) => sum + item.subtotal, 0);
  const platform832Amount = products
    .filter(item => item.is832)
    .reduce((sum, item) => sum + item.subtotal, 0);
  const perCapita = headCount > 0 ? totalBudget / headCount : 0;
  const perCapitaActual = headCount > 0 ? totalAmount / headCount : 0; // 实际人均福利价值
  
  // 是否有供应商信息
  const hasSupplier = products.some(item => item.supplier);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6 border-b-2 border-blue-200 pb-3">
        <h2 className="text-2xl font-bold text-blue-800">{title}</h2>
        {isExample && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            示例方案
          </span>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">商品清单</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800 border border-blue-200">商品名称</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">规格/单位</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">单价（元）</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">数量</th>
                {hasSupplier && (
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">供应商</th>
                )}
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">小计（元）</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{product.name}</span>
                      {product.is832 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap">832平台</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border border-gray-200 text-gray-700">
                    {product.unit}
                  </td>
                  <td className="px-4 py-3 text-center border border-gray-200 text-gray-700">
                    ¥{product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center border border-gray-200 text-gray-700">
                    {product.quantity}
                  </td>
                  {hasSupplier && (
                    <td className="px-4 py-3 border border-gray-200 text-gray-700 text-sm">
                      {product.supplier || '-'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center border border-gray-200 font-medium text-gray-800">
                    ¥{product.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-300">
                <td colSpan={hasSupplier ? 5 : 4} className="px-4 py-3 text-right text-sm font-semibold text-blue-800">
                  人均合计金额（每人福利总价值）：
                </td>
                <td className="px-4 py-3 text-center font-bold text-blue-900 text-lg">
                  ¥{perCapitaActual.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-700 block mb-1">慰问人数：</span>
              <span className="text-xl font-semibold text-blue-800">{headCount} 人</span>
            </div>
            <div>
              <span className="text-gray-700 block mb-1">总预算：</span>
              <span className="text-xl font-semibold text-blue-800">¥{totalBudget.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-700 block mb-1">人均标准：</span>
              <span className="text-xl font-semibold text-blue-800">¥{perCapita.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-700 block mb-1">商品合计：</span>
              <span className="text-xl font-semibold text-blue-800">¥{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          {platform832Amount > 0 && (
            <div className="pt-4 border-t border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-700 block mb-1">832平台产品金额：</span>
                  <span className="text-lg font-medium text-green-700">¥{platform832Amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-700 block mb-1">832平台产品占比：</span>
                  <span className="text-lg font-medium text-green-700">
                    {totalAmount > 0 ? ((platform832Amount / totalAmount) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">
                  <span className="font-medium">消费帮扶提示：</span>
                  为完成年度消费帮扶任务，建议在食品类采购中优先选用832平台产品，便于集中完成全年指标。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolutionPreview;
