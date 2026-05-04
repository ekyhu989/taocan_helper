/**
 * 微信浏览器检测工具
 * 提供微信内置浏览器的检测、版本获取和兼容性处理功能
 */

/**
 * 检测是否在微信内置浏览器中
 * @returns boolean 是否为微信浏览器
 */
export function isWechatBrowser(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('micromessenger');
}

/**
 * 获取微信版本号
 * @returns string | null 微信版本号，非微信浏览器返回 null
 */
export function getWechatVersion(): string | null {
  const ua = navigator.userAgent.toLowerCase();
  const match = ua.match(/micromessenger\/([\d.]+)/);
  return match ? match[1] : null;
}

/**
 * 微信兼容性处理
 * 在应用启动时调用，执行微信浏览器相关的兼容性处理
 */
export function handleWechatCompatibility(): void {
  if (!isWechatBrowser()) {
    console.log('[WeChatDetector] Not in WeChat browser');
    return;
  }

  const version = getWechatVersion();
  console.log(`[WeChatDetector] WeChat browser detected, version: ${version}`);

  // 1. 添加微信浏览器标识类名到 body
  document.body.classList.add('wechat-browser');

  // 2. 微信浏览器特殊处理
  // 禁用某些不兼容的功能或调整交互逻辑
  // 例如：微信内置浏览器对某些 CSS 属性支持不完整

  // 3. 设置微信浏览器特定的 meta 标签（如果尚未设置）
  ensureViewportMeta();

  // 4. 处理微信浏览器的字体大小调整问题
  document.documentElement.style.webkitTextSizeAdjust = '100%';

  console.log('[WeChatDetector] WeChat compatibility handlers applied');
}

/**
 * 确保 viewport meta 标签存在且配置正确
 * 微信浏览器需要正确的 viewport 配置
 */
function ensureViewportMeta(): void {
  let viewportMeta = document.querySelector('meta[name="viewport"]');

  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.head.appendChild(viewportMeta);
  }

  const content = viewportMeta.getAttribute('content') || '';
  const requiredProps = ['width=device-width', 'initial-scale=1.0'];

  requiredProps.forEach((prop) => {
    if (!content.includes(prop.split('=')[0])) {
      const newContent = content ? `${content}, ${prop}` : prop;
      viewportMeta.setAttribute('content', newContent);
    }
  });
}

/**
 * 获取微信浏览器的操作系统信息
 * @returns 'ios' | 'android' | 'unknown'
 */
export function getWechatOS(): 'ios' | 'android' | 'unknown' {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return 'ios';
  }

  if (ua.includes('android')) {
    return 'android';
  }

  return 'unknown';
}

/**
 * 比较微信版本号
 * @param targetVersion 目标版本号，如 '8.0.0'
 * @returns boolean 当前版本是否大于等于目标版本
 */
export function isWechatVersionAtLeast(targetVersion: string): boolean {
  const currentVersion = getWechatVersion();

  if (!currentVersion) {
    return false;
  }

  const currentParts = currentVersion.split('.').map(Number);
  const targetParts = targetVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, targetParts.length); i++) {
    const current = currentParts[i] || 0;
    const target = targetParts[i] || 0;

    if (current > target) return true;
    if (current < target) return false;
  }

  return true;
}
