import React from 'react';
import { useVibration } from '../../hooks/useVibration';

const VibrationToggle: React.FC = () => {
  const { enabled, supported, toggle } = useVibration();

  if (!supported) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📳</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">振动反馈</h3>
              <p className="text-sm text-gray-500">设备不支持振动</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📳</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">振动反馈</h3>
            <p className="text-sm text-gray-500">
              {enabled ? '操作时有振动提示' : '振动已关闭'}
            </p>
          </div>
        </div>

        <button
          onClick={toggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default VibrationToggle;
