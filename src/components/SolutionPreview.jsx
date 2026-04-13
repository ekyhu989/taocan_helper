import React, { useState, useMemo } from 'react';
import mockData from '../data/mockData';
import YearlyProgressTip from './YearlyProgressTip';
import { platform832Hint, complianceRules } from '../data/policyData';

const SolutionPreview = ({
  productList,
  isExample = false,
  // ── 品单手动调整 props（非示例模式时由 App 传入） ──
  productListResult = null,
  headCount = 0,
  totalBudget = 0,
  isAdjusted = false,
  allProducts = [],
  onAdjustProduct = () => {},
  onRemoveProduct = () => {},
  onAddProduct = () => {},
  onResetSolution = () => {},
}) => {
  // ── 内部状态 ──
  const [editingProductId, setEditingProductId] = useState(null); // 当前正在编辑数量的商品 ID
  const [editQuantity, setEditQuantity] = useState(1); // 编辑中的数量临时值
  const [showAddPanel, setShowAddPanel] = useState(false); // 是否显示"添加商品"面板
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // 待二次确认删除的商品 ID

  // ── 数据源 ──
  let products, summaryHeadCount, summaryBudget, title;

  if (isExample) {
    products = mockData.exampleSolution.products;
    summaryHeadCount = mockData.exampleSolution.headCount;
    summaryBudget = mockData.exampleSolution.totalBudget;
    title = mockData.exampleSolution.title;
  } else if (productListResult) {
    // 真实模式：优先使用 productListResult（最新状态）
    products = productListResult.items.map((it) => ({
      ...it.product,
      quantity: it.quantity,
      subtotal: it.subtotal,
    }));
    summaryHeadCount = headCount;
    summaryBudget = totalBudget;
    title = '您的采购方案';
  } else if (productList) {
    products = productList.products || [];
    summaryHeadCount = productList.headCount || 0;
    summaryBudget = productList.totalBudget || 0;
    title = '您的采购方案';
  } else {
    products = mockData.products;
    summaryHeadCount = 100;
    summaryBudget = 60000;
    title = '采购方案预览';
  }

  // ── 实时计算 ──
  const totalAmount = products.reduce((sum, item) => sum + item.subtotal, 0);
  const platform832Amount = products
    .filter((item) => item.is832)
    .reduce((sum, item) => sum + item.subtotal, 0);
  const perCapita = summaryHeadCount > 0 ? summaryBudget / summaryHeadCount : 0;
  const perCapitaActual = summaryHeadCount > 0 ? totalAmount / summaryHeadCount : 0;
  const platform832Rate = totalAmount > 0 ? (platform832Amount / totalAmount) * 100 : 0;

  // 是否有供应商信息
  const hasSupplier = products.some((item) => item.supplier);

  // 人均是否超500（合规提醒）
  const isOverPerCapitaWarn = perCapitaActual > 500;

  // ── 可添加商品列表（排除已在品单中的） ──
  const availableProducts = useMemo(() => {
    if (isExample) return [];
    const existingIds = new Set(products.map((p) => p.id));
    return allProducts.filter((p) => !existingIds.has(p.id));
  }, [products, allProducts, isExample]);

  // ─────────────────────────────────────────────
  // 交互处理
  // ─────────────────────────────────────────────

  // 进入编辑模式
  const handleStartEdit = (product) => {
    setEditingProductId(product.id);
    setEditQuantity(product.quantity);
  };

  // 确认编辑
  const handleConfirmEdit = () => {
    if (editQuantity >= 1 && Number.isInteger(editQuantity)) {
      onAdjustProduct(editingProductId, editQuantity);
    }
    setEditingProductId(null);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  // 请求删除（二次确认）
  const handleRequestDelete = (productId) => {
    setDeleteConfirmId(productId);
  };

  // 确认删除
  const handleConfirmDelete = (productId) => {
    onRemoveProduct(productId);
    setDeleteConfirmId(null);
  };

  // 取消删除
  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  // 添加商品
  const handleSelectProduct = (product) => {
    onAddProduct(product);
    setShowAddPanel(false);
  };

  // ─────────────────────────────────────────────
  // 渲染
  // ─────────────────────────────────────────────

  // 操作列宽度
  const actionColSpan = hasSupplier ? 7 : 6;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      {/* ── 标题栏 ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b-2 border-blue-200 pb-3 gap-3">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <h2 className="text-xl md:text-2xl font-bold text-blue-800">{title}</h2>
          {isExample && (
            <span className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-100 text-blue-800 text-xs md:text-sm font-medium rounded-full">
              示例方案
            </span>
          )}
          {!isExample && isAdjusted && (
            <span className="px-2 md:px-3 py-0.5 md:py-1 bg-amber-100 text-amber-800 text-xs md:text-sm font-medium rounded-full animate-pulse">
              已手动调整
            </span>
          )}
        </div>

        {/* 操作按钮组（仅非示例模式显示） */}
        {!isExample && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="px-3 py-2 min-h-[44px] bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-1"
            >
              <span>＋</span>
              <span className="hidden sm:inline">添加商品</span>
            </button>
            {isAdjusted && (
              <button
                onClick={onResetSolution}
                className="px-3 py-2 min-h-[44px] bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
              >
                <span>↻</span>
                <span className="hidden sm:inline">恢复自动生成</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 添加商品面板 ── */}
      {!isExample && showAddPanel && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-green-800">选择要添加的商品</h3>
            <button
              onClick={() => setShowAddPanel(false)}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              关闭
            </button>
          </div>
          {availableProducts.length === 0 ? (
            <p className="text-green-600 text-sm">商品库中所有商品均已添加</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {availableProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-md hover:bg-green-100 transition-colors duration-150 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">{product.name}</span>
                      {product.is832 && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap">
                          832
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">¥{product.price.toFixed(2)} / {product.unit}</span>
                  </div>
                  <span className="text-green-600 text-lg font-bold ml-2">＋</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 合规提醒（人均超500元） ── */}
      {!isExample && isOverPerCapitaWarn && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ 合规提醒：当前人均福利金额为 ¥{perCapitaActual.toFixed(2)}，超过500元标准。
            建议调整商品数量或种类，确保符合工会经费支出相关规定。
          </p>
        </div>
      )}

      {/* ── 年度累计提示（P4需求） ── */}
      {!isExample && summaryBudget > 0 && (
        <YearlyProgressTip yearlyBudget={summaryBudget} />
      )}

      {/* ── 商品清单表格 ── */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">商品清单</h3>
        <div className="table-responsive -mx-4 md:mx-0 px-4 md:px-0">
          <table className="w-full min-w-[600px] md:min-w-0 border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-800 border border-blue-200">
                  商品名称
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">
                  规格/单位
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">
                  单价（元）
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">
                  数量
                </th>
                {hasSupplier && (
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">
                    供应商
                  </th>
                )}
                <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">
                  小计（元）
                </th>
                {!isExample && (
                  <th className="px-4 py-3 text-center text-sm font-semibold text-blue-800 border border-blue-200">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isEditing = editingProductId === product.id;
                const isDeleting = deleteConfirmId === product.id;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''} ${isDeleting ? 'bg-red-50' : ''}`}
                  >
                    {/* 商品名称 */}
                    <td className="px-4 py-3 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{product.name}</span>
                        {product.is832 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap">
                            832平台
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 规格/单位 */}
                    <td className="px-4 py-3 text-center border border-gray-200 text-gray-700">
                      {product.unit}
                    </td>

                    {/* 单价 */}
                    <td className="px-4 py-3 text-center border border-gray-200 text-gray-700">
                      ¥{product.price.toFixed(2)}
                    </td>

                    {/* 数量（编辑态 / 普通态） */}
                    <td className="px-4 py-3 text-center border border-gray-200">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min={1}
                            value={editQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1) setEditQuantity(val);
                            }}
                            className="w-20 px-2 py-1 text-center border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={handleConfirmEdit}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-800 font-medium">{product.quantity}</span>
                      )}
                    </td>

                    {/* 供应商 */}
                    {hasSupplier && (
                      <td className="px-4 py-3 border border-gray-200 text-gray-700 text-sm">
                        {product.supplier || '-'}
                      </td>
                    )}

                    {/* 小计 */}
                    <td className="px-4 py-3 text-center border border-gray-200 font-medium text-gray-800">
                      {isEditing
                        ? `¥${(product.price * editQuantity).toFixed(2)}`
                        : `¥${product.subtotal.toFixed(2)}`}
                    </td>

                    {/* 操作（仅非示例模式） */}
                    {!isExample && (
                      <td className="px-4 py-3 text-center border border-gray-200">
                        {isDeleting ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-red-600 text-xs font-medium">确认删除？</span>
                            <button
                              onClick={() => handleConfirmDelete(product.id)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              确认
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStartEdit(product)}
                              className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors duration-150"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleRequestDelete(product.id)}
                              className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors duration-150"
                            >
                              删除
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* 底部统计栏 */}
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-300">
                <td colSpan={!isExample ? actionColSpan : (hasSupplier ? 5 : 4)} className="px-4 py-3 text-right text-sm font-semibold text-blue-800">
                  人均合计金额（每人福利总价值）：
                </td>
                <td className={`px-4 py-3 text-center font-bold text-lg ${isOverPerCapitaWarn && !isExample ? 'text-red-600' : 'text-blue-900'}`}>
                  ¥{perCapitaActual.toFixed(2)}
                  {isOverPerCapitaWarn && !isExample && (
                    <span className="text-xs font-normal ml-1">⚠ 超标</span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── 汇总统计区 ── */}
      <div className="bg-blue-50 rounded-lg p-4 md:p-6 border border-blue-200">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-700 block mb-1">慰问人数：</span>
              <span className="text-xl font-semibold text-blue-800">{summaryHeadCount} 人</span>
            </div>
            <div>
              <span className="text-gray-700 block mb-1">总预算：</span>
              <span className="text-xl font-semibold text-blue-800">¥{summaryBudget.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-700 block mb-1">人均标准：</span>
              <span className="text-xl font-semibold text-blue-800">¥{perCapita.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-700 block mb-1">商品合计：</span>
              <span className={`text-xl font-semibold ${totalAmount > summaryBudget ? 'text-red-600' : 'text-blue-800'}`}>
                ¥{totalAmount.toFixed(2)}
                {totalAmount > summaryBudget && (
                  <span className="text-xs font-normal ml-1">（超预算 ¥{(totalAmount - summaryBudget).toFixed(2)}）</span>
                )}
              </span>
            </div>
          </div>

          {/* 预算使用率 */}
          {!isExample && summaryBudget > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 text-sm">预算使用率：</span>
                <span className={`text-sm font-medium ${(totalAmount / summaryBudget) > 1 ? 'text-red-600' : 'text-green-700'}`}>
                  {((totalAmount / summaryBudget) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (totalAmount / summaryBudget) > 1
                      ? 'bg-red-500'
                      : (totalAmount / summaryBudget) > 0.9
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((totalAmount / summaryBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {platform832Amount > 0 && (
            <div className="pt-4 border-t border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-700 block mb-1">832平台产品金额：</span>
                  <span className="text-lg font-medium text-green-700">¥{platform832Amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-700 block mb-1">832平台产品占比：</span>
                  <span className={`text-lg font-medium ${platform832Rate >= complianceRules.platformRatioMinGift ? 'text-green-700' : 'text-amber-600'}`}>
                    {platform832Rate.toFixed(1)}%
                    {platform832Rate >= complianceRules.platformRatioMinGift ? ' ✅' : `（需≥${complianceRules.platformRatioMinGift}%）`}
                  </span>
                </div>
              </div>
              <div className={`mt-3 p-3 rounded-md border ${platform832Rate >= complianceRules.platformRatioMinGift ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <p className="text-sm">
                  <span className="font-medium">{platform832Rate >= complianceRules.platformRatioMinGift ? '✅ 政策合规提示：' : '⚠️ 政策提醒：'}</span>
                  {platform832Hint(platform832Rate)}
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
