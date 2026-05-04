import React from 'react';

interface BottomActionBarProps {
  onRegenerate?: () => void;
  onSave?: () => void;
  onCheck?: () => void;
  onAddProduct?: () => void;
  regenerateText?: string;
  saveText?: string;
  checkText?: string;
  addProductText?: string;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  onRegenerate,
  onSave,
  onCheck,
  onAddProduct,
  regenerateText = '重新生成',
  saveText = '保存',
  checkText = '检查',
  addProductText = '添加商品'
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      {/* 主要操作按钮 */}
      <div className="flex items-center justify-around py-3 px-4 border-b border-gray-100">
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex-1 mx-1 min-h-[48px] min-w-[80px] px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors active:scale-[0.98]"
          >
            {regenerateText}
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            className="flex-1 mx-1 min-h-[48px] min-w-[80px] px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors active:scale-[0.98]"
          >
            {saveText}
          </button>
        )}
        {onCheck && (
          <button
            onClick={onCheck}
            className="flex-1 mx-1 min-h-[48px] min-w-[80px] px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors active:scale-[0.98]"
          >
            {checkText}
          </button>
        )}
      </div>

      {/* 添加商品按钮 */}
      {onAddProduct && (
        <div className="px-4 py-3">
          <button
            onClick={onAddProduct}
            className="w-full min-h-[48px] px-4 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="text-xl">➕</span>
            {addProductText}
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomActionBar;
