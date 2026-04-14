import React from 'react';
import { SERVICE_CONFIG } from '../config/serviceConfig';

/**
 * 联系客服弹窗组件
 * 
 * 复用组件，可在商品库页、方案生成页等多处调用。
 * 点击"联系客服"按钮后弹出，展示电话、微信、邮箱等信息。
 * 
 * @param {boolean} visible - 是否显示弹窗
 * @param {function} onClose - 关闭回调
 * @param {string} [title='联系客服'] - 自定义标题
 */

const ContactServiceModal = ({
  visible,
  onClose,
  title = '联系客服',
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      {/* 使用绝对定位，top-[25%] 确保弹窗在移动端视觉上靠上显示 */}
      <div className="absolute top-[25%] left-1/2 -translate-y-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📞 {title}
              </h3>
              <button
                onClick={onClose}
                className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              {SERVICE_CONFIG.companyName} · 专属客服
            </p>
          </div>

          {/* 联系方式列表 */}
          <div className="p-6 space-y-4">
            {/* 客服电话 */}
            <div className="flex items-start gap-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-sm font-medium text-gray-800">客服电话</p>
                <p className="text-lg font-bold text-blue-700 mt-0.5">
                  {SERVICE_CONFIG.phone}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {SERVICE_CONFIG.workHours}
                </p>
              </div>
            </div>

            {/* 微信号 */}
            <div className="flex items-start gap-4 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-sm font-medium text-gray-800">客服微信</p>
                <p className="text-lg font-bold text-green-700 mt-0.5">
                  {SERVICE_CONFIG.wechat}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  搜索微信号或扫描二维码添加
                </p>
              </div>
            </div>

            {/* 邮箱 */}
            <div className="flex items-start gap-4 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-sm font-medium text-gray-800">客服邮箱</p>
                <p className="text-base font-medium text-purple-700 mt-0.5">
                  {SERVICE_CONFIG.email}
                </p>
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="px-6 pb-4">
            <p className="text-center text-xs text-gray-400">
              工作人员将在工作时间内尽快为您处理
            </p>
          </div>

          {/* 关闭按钮 */}
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactServiceModal;
