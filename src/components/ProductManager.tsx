import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import {
  loadProducts,
  saveProducts,
  resetToDefault,
  generateProductId,
} from '../utils/productStorage';

interface ProductManagerProps {
  onClose: () => void;
}

const sceneLabels: Record<string, string> = {
  holiday: '节日',
  activity: '活动',
  care: '帮扶',
};

const ProductManager: React.FC<ProductManagerProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadedProducts = loadProducts();
    setProducts(loadedProducts);
  }, []);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSubmit = (productData: Partial<Product>) => {
    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p =>
        p.id === editingProduct.id ? { ...p, ...productData } : p
      );
      showSuccess('保存成功');
    } else {
      const newProduct: Product = {
        ...productData,
        id: generateProductId(),
      } as Product;
      updatedProducts = [...products, newProduct];
      showSuccess('新增商品成功');
    }
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDeleteConfirm = (product: Product) => {
    setDeleteProduct(product);
  };

  const handleDelete = () => {
    if (deleteProduct) {
      const updatedProducts = products.filter(p => p.id !== deleteProduct.id);
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
      showSuccess('删除成功');
      setDeleteProduct(null);
    }
  };

  const handleResetConfirm = () => {
    setShowResetConfirm(true);
  };

  const handleReset = () => {
    const defaultProducts = resetToDefault();
    setProducts(defaultProducts);
    showSuccess('已恢复默认商品库');
    setShowResetConfirm(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">商品库管理</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-center">
            {successMessage}
          </div>
        )}

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">共 {filteredProducts.length} 个商品</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="搜索商品名称"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部分类</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                + 新增商品
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto border border-gray-200 rounded-md">
            <table className="w-full">
              <thead className="bg-blue-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800 border-b border-blue-200">
                    商品名称
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border-b border-blue-200">
                    单价(元)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border-b border-blue-200">
                    单位
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border-b border-blue-200">
                    分类
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border-b border-blue-200">
                    适用场景
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border-b border-blue-200">
                    832
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border-b border-blue-200">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {product.unit}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {(product.scenes || []).map(scene => (
                          <span
                            key={scene}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {sceneLabels[scene] || scene}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.is832 ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          832平台
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteConfirm(product)}
                          className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <button
              onClick={handleResetConfirm}
              className="px-4 py-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors"
            >
              ⚠️ 恢复默认商品库
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {deleteProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除商品 "<span className="font-medium">{deleteProduct.name}</span>" 吗？
              <br />
              <span className="text-sm text-yellow-600">此操作不可逆，请谨慎操作。</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteProduct(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">确认恢复</h3>
            <p className="text-gray-600 mb-6">
              确定要恢复默认商品库吗？
              <br />
              <span className="text-sm text-yellow-600">所有自定义修改将丢失，请谨慎操作。</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                确认恢复
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
