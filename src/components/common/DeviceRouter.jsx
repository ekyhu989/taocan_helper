import React, { useState, useEffect } from 'react';
import { detectDevice, getDeviceType, onDeviceChange } from '../../utils/helpers/deviceDetector';

/**
 * 双端路由组件
 * 根据设备类型自动渲染移动端或桌面端页面
 */
const DeviceRouter = ({ mobileComponent, desktopComponent, fallbackComponent }) => {
  const [deviceType, setDeviceType] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // 初始检测
    const initialDeviceInfo = detectDevice();
    setDeviceInfo(initialDeviceInfo);
    setDeviceType(getDeviceType());

    // 监听设备变化
    const cleanup = onDeviceChange((newDeviceInfo) => {
      setDeviceInfo(newDeviceInfo);
      setDeviceType(getDeviceType());
    });

    return cleanup;
  }, []);

  // 设备检测中显示加载状态
  if (deviceType === null) {
    return fallbackComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 根据设备类型渲染对应组件
  return deviceType === 'mobile' ? mobileComponent : desktopComponent;
};

export default DeviceRouter;