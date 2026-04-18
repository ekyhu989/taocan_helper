import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  is832: boolean;
}

interface ProductTableProps {
  products?: Product[];
  onProductsChange?: (products: Product[]) => void;
}

const defaultProducts: Product[] = [
  { id: '1', name: '东北大米 5kg', price: 68, quantity: 2, is832: true },
  { id: '2', name: '鲁花花生油 5L', price: 128, quantity: 1, is832: true },
  { id: '3', name: '新疆灰枣礼盒', price: 88, quantity: 1, is832: true },
  { id: '4', name: '牛奶 250ml×12盒', price: 45, quantity: 2, is832: false },
  { id: '5', name: '坚果礼盒 1kg', price: 168, quantity: 1, is832: false }
];

const ProductTable: React.FC<ProductTableProps> = ({
  products = defaultProducts,
  onProductsChange
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleQuantityChange = (id: string, quantity: number) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, quantity: Math.max(1, quantity) } : p
    );
    onProductsChange?.(updated);
  };

  const handlePriceChange = (id: string, price: number) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, price: Math.max(0, price) } : p
    );
    onProductsChange?.(updated);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const totalAmount = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const count832 = products.filter(p => p.is832).length;
  const amount832 = products.filter(p => p.is832).reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <div className="bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">商品列表</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            添加商品
          </button>
          {selectedIds.length > 0 && (
            <button className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
              删除选中 ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === products.length && products.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">商品名称</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">单价</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">数量</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">小计</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">832</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => handlePriceChange(product.id, Number(e.target.value))}
                    className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                      className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  ¥{(product.price * product.quantity).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  {product.is832 ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">是</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">否</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            832产品: {count832}件, 占比 {((count832 / products.length) * 100).toFixed(1)}%
          </div>
          <div className="text-right">
            <span className="text-gray-600 text-sm">总计: </span>
            <span className="text-xl font-bold text-blue-600">¥{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
