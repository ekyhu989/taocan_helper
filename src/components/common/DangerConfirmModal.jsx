import React, { useState } from 'react';

interface DangerConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  warningMessage?: string;
  requireTextConfirm?: boolean;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DangerConfirmModal: React.FC<DangerConfirmModalProps> = ({
  isOpen,
  title,
  description,
  warningMessage,
  requireTextConfirm = false,
  confirmText = '确认删除',
  onConfirm,
  onCancel,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const isConfirmDisabled = requireTextConfirm && inputText !== confirmText;

  const handleConfirm = () => {
    if (!isConfirmDisabled) {
      setInputText('');
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-red-200 bg-red-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-800">{title}</h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4 whitespace-pre-line">{description}</p>
          
          {warningMessage && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium">{warningMessage}</p>
            </div>
          )}

          {requireTextConfirm && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                请输入 "<span className="text-red-600 font-bold">{confirmText}</span>" 以继续：
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`请输入"${confirmText}"`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              isConfirmDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerConfirmModal;
