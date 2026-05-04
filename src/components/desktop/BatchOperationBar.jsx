import React, { useState } from 'react';

const BatchOperationBar = ({
  selectedCount,
  onBatchUpdate,
  onBatchDelete,
  onClearSelection,
}) => {
  const [priceMultiplier, setPriceMultiplier] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBatchPriceChange = () => {
    if (!priceMultiplier) return;
    const multiplier = parseFloat(priceMultiplier);
    if (isNaN(multiplier)) return;

    const changePercent = (multiplier - 1) * 100;
    const needsConfirmation = Math.abs(changePercent) > 100;

    if (needsConfirmation) {
      setShowConfirm(true);
    } else {
      onBatchUpdate(multiplier);
      setPriceMultiplier('');
    }
  };

  const confirmBatchUpdate = () => {
    const multiplier = parseFloat(priceMultiplier);
    onBatchUpdate(multiplier);
    setPriceMultiplier('');
    setShowConfirm(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-800 font-medium">已选择 {selectedCount} 个商品</span>
          <button
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            取消选择
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">批量调价：</span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={priceMultiplier}
            onChange={(e) => setPriceMultiplier(e.target.value)}
            placeholder="倍数 (如: 1.2 表示涨价20%)"
            className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleBatchPriceChange}
            disabled={!priceMultiplier}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            更新价格
          </button>
        </div>

        <button
          onClick={onBatchDelete}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
        >
          批量删除
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-xl font-bold text-gray-800 mt-2">批量修改确认</h3>
            </div>
            <p className="text-gray-600 text-center mb-6">
              价格变动幅度超过100%，确认修改后不可撤销，是否继续？
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={confirmBatchUpdate}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchOperationBar;
