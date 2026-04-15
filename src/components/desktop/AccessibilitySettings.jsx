import React from 'react';
import { useAccessibility } from '../hooks/useAccessibility';

const AccessibilitySettings: React.FC = () => {
  const { settings, toggleLargeTextMode } = useAccessibility();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">显示设置</h2>
        <p className="text-gray-600">调整应用的显示方式，提升使用体验</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">大字模式</h3>
                  <p className="text-gray-500 text-sm">金额、单价、合规数据放大显示</p>
                </div>
              </div>
              <div className="ml-13 pl-0 mt-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-3">效果预览：</div>
                  <div className={`space-y-2 ${settings.largeTextMode ? 'large-text-mode' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">金额：</span>
                      <span className="text-[16px] lg:text-[16px] font-bold text-blue-600 large-text:text-[24px]">
                        ¥12,345.00
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">单价：</span>
                      <span className="text-[14px] lg:text-[14px] font-medium text-gray-800 large-text:text-[20px]">
                        ¥99.00/份
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">合规提示：</span>
                      <span className="text-[14px] lg:text-[14px] text-green-600 large-text:text-[18px]">
                        ✅ 合规通过
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-6 flex-shrink-0">
              <button
                onClick={toggleLargeTextMode}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.largeTextMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.largeTextMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="font-medium text-amber-800 mb-1">提示</h4>
              <p className="text-amber-700 text-sm">
                大字模式会放大显示核心数据，适合视力不佳的用户使用。设置会自动保存。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
