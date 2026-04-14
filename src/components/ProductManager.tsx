import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import RecycleBin from './RecycleBin';
import BatchOperationBar from './BatchOperationBar';
import ContactServiceModal from './ContactServiceModal';
import { SERVICE_MESSAGES } from '../config/serviceConfig';
import { festivalTemplates, getFestivalTemplateNames } from '../data/festivalTemplates';
import {
  loadProducts,
  saveProducts,
  resetToDefault,
  generateProductId,
  loadDeletedProducts,
  softDeleteProduct,
  restoreProduct,
  permanentDeleteProduct,
  emptyRecycleBin,
  sortProductsWith832Priority,
  isProductExists,
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
  const [deletedProducts, setDeletedProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const loadedProducts = loadProducts();
    const sortedProducts = sortProductsWith832Priority(loadedProducts);
    setProducts(sortedProducts);
    
    const loadedDeleted = loadDeletedProducts();
    setDeletedProducts(loadedDeleted);
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
        p.id === editingProduct.id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p
      );
      showSuccess('保存成功');
    } else {
      const newProduct: Product = {
        ...productData,
        id: generateProductId(),
        updatedAt: new Date().toISOString(),
      } as Product;
      updatedProducts = [...products, newProduct];
      showSuccess('新增商品成功');
    }
    const sortedProducts = sortProductsWith832Priority(updatedProducts);
    setProducts(sortedProducts);
    saveProducts(updatedProducts);
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDeleteConfirm = (product: Product) => {
    setDeleteProduct(product);
  };

  const handleDelete = () => {
    if (deleteProduct) {
      const updatedProducts = softDeleteProduct(deleteProduct.id);
      const sortedProducts = sortProductsWith832Priority(updatedProducts);
      setProducts(sortedProducts);
      setDeletedProducts(loadDeletedProducts());
      showSuccess('已移至回收站');
      setDeleteProduct(null);
    }
  };

  const handleRestore = (productId: string) => {
    const updatedProducts = restoreProduct(productId);
    const sortedProducts = sortProductsWith832Priority(updatedProducts);
    setProducts(sortedProducts);
    setDeletedProducts(loadDeletedProducts());
    showSuccess('已恢复');
  };

  const handlePermanentDelete = (productId: string) => {
    if (window.confirm('确定要彻底删除此商品吗？此操作不可逆。')) {
      const updatedDeleted = permanentDeleteProduct(productId);
      setDeletedProducts(updatedDeleted);
      showSuccess('已彻底删除');
    }
  };

  const handleEmptyRecycleBin = () => {
    if (window.confirm('确定要清空回收站吗？所有商品将永久删除。')) {
      const updatedDeleted = emptyRecycleBin();
      setDeletedProducts(updatedDeleted);
      showSuccess('回收站已清空');
    }
  };

  const handleResetConfirm = () => {
    setShowResetConfirm(true);
  };

  const handleReset = () => {
    const defaultProducts = resetToDefault();
    const sortedProducts = sortProductsWith832Priority(defaultProducts);
    setProducts(sortedProducts);
    setDeletedProducts([]);
    showSuccess('已恢复默认商品库');
    setShowResetConfirm(false);
  };

  const toggleSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handleBatchUpdate = (multiplier: number) => {
    const updatedProducts = products.map(p => {
      if (selectedProducts.includes(p.id)) {
        return {
          ...p,
          price: Number((p.price * multiplier).toFixed(2)),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    const sortedProducts = sortProductsWith832Priority(updatedProducts);
    setProducts(sortedProducts);
    saveProducts(updatedProducts);
    setSelectedProducts([]);
    setSelectAll(false);
    showSuccess('批量调价成功');
  };

  const handleBatchDelete = () => {
    if (window.confirm(`确定要删除选中的 ${selectedProducts.length} 个商品吗？它们将移至回收站。`)) {
      let updatedProducts = [...products];
      selectedProducts.forEach(id => {
        updatedProducts = softDeleteProduct(id);
      });
      const sortedProducts = sortProductsWith832Priority(updatedProducts);
      setProducts(sortedProducts);
      setDeletedProducts(loadDeletedProducts());
      setSelectedProducts([]);
      setSelectAll(false);
      showSuccess('批量删除成功');
    }
  };

  const handleImportTemplate = (templateKey: string) => {
    const template = festivalTemplates[templateKey];
    let importedCount = 0;
    
    const updatedProducts = [...products];
    template.products.forEach(templateProduct => {
      if (!isProductExists(templateProduct.name, updatedProducts)) {
        const newProduct: Product = {
          id: generateProductId(),
          name: templateProduct.name,
          price: templateProduct.price,
          unit: '份',
          category: templateProduct.category || '食品',
          category_tag: templateProduct.category || '食品',
          scenes: ['holiday'],
          is832: templateProduct.isPlatform832,
          updatedAt: new Date().toISOString(),
        };
        updatedProducts.push(newProduct);
        importedCount++;
      }
    });
    
    const sortedProducts = sortProductsWith832Priority(updatedProducts);
    setProducts(sortedProducts);
    saveProducts(updatedProducts);
    setShowTemplateModal(false);
    showSuccess(`已导入 ${importedCount} 个商品`);
  };

  const filteredProducts = sortProductsWith832Priority(products).filter(product => {
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
              <button
                onClick={() => setShowRecycleBin(true)}
                className="px-3 py-1.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
              >
                🗑️ 回收站 ({deletedProducts.length})
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
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
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                📦 导入模板
              </button>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <BatchOperationBar
              selectedCount={selectedProducts.length}
              onBatchUpdate={handleBatchUpdate}
              onBatchDelete={handleBatchDelete}
              onClearSelection={handleClearSelection}
            />
          )}

          <div className="flex-1 overflow-auto border border-gray-200 rounded-md mt-4">
            <table className="w-full">
              <thead className="bg-blue-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border-b border-blue-200 w-12">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
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
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelection(product.id)}
                        className="w-4 h-4"
                      />
                    </td>
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

          {/* 客服引导区域 — 替代原有的"新增商品"功能 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">💡</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {SERVICE_MESSAGES.productLibrary.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {SERVICE_MESSAGES.productLibrary.desc}
                </p>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  📞 {SERVICE_MESSAGES.productLibrary.btnText}
                </button>
              </div>
            </div>
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
              <span className="text-sm text-yellow-600">商品将移至回收站，7天后自动删除。</span>
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

      {showRecycleBin && (
        <RecycleBin
          products={deletedProducts}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onEmpty={handleEmptyRecycleBin}
          onClose={() => setShowRecycleBin(false)}
        />
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">选择节日模板</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              {getFestivalTemplateNames().map(({ key, name }) => (
                <button
                  key={key}
                  onClick={() => handleImportTemplate(key)}
                  className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-gray-800">{name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    包含 {festivalTemplates[key].products.length} 个商品
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 联系客服弹窗 */}
      <ContactServiceModal
        visible={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default ProductManager;
