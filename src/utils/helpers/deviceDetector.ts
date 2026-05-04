/**
 * 设备检测工具
 * 用于检测当前设备类型，支持双端架构
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

/**
 * 检测设备类型
 */
export const detectDevice = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // 移动设备检测
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // 平板设备检测
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) || 
                  (screenWidth >= 768 && screenWidth <= 1024);
  
  // 桌面设备检测
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile: isMobile || isTablet, // 平板也视为移动端
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
    userAgent
  };
};

/**
 * 获取设备类型（移动端优先原则）
 */
export const getDeviceType = (): 'mobile' | 'desktop' => {
  const device = detectDevice();
  return device.isMobile ? 'mobile' : 'desktop';
};

/**
 * 监听设备变化
 */
export const onDeviceChange = (callback: (device: DeviceInfo) => void): (() => void) => {
  const handleResize = () => {
    callback(detectDevice());
  };

  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};