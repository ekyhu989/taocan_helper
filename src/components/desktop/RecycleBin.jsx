import React from 'react';

const RecycleBin = ({ products, onRestore, onPermanentDelete, onEmpty, onClose }) => {
  const getRemainingDays = (restoreDeadline) => {
    if (!restoreDeadline) return 0;
    const now = new Date();
    const deadline = new Date(restoreDeadline);
    const diff = deadline - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">回收站</h2>
          <div className="flex items-center gap-2">
            {products.length > 0 && (
              <button
                onClick={onEmpty}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                清空
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">回收站为空</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {product.name} {product.spec ? `(${product.spec})` : ''}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>¥{product.price.toFixed(2)}</span>
                      <span>•</span>
                      <span className="text-orange-600">
                        剩余 {getRemainingDays(product.restoreDeadline)} 天
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRestore(product.id)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                    >
                      恢复
                    </button>
                    <button
                      onClick={() => onPermanentDelete(product.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      彻底删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecycleBin;
