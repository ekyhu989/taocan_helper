import {
  isWechatBrowser,
  getWechatVersion,
  getWechatOS,
  isWechatVersionAtLeast,
  handleWechatCompatibility,
} from '@/utils/wechatDetector';

describe('WeChat Detector', () => {
  const originalUserAgent = navigator.userAgent;

  const mockUserAgent = (ua: string) => {
    Object.defineProperty(navigator, 'userAgent', {
      value: ua,
      writable: true,
      configurable: true,
    });
  };

  afterEach(() => {
    // 恢复原始 User-Agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true,
    });
    // 清理 body 类名
    document.body.classList.remove('wechat-browser');
  });

  describe('isWechatBrowser', () => {
    it('returns true for WeChat iOS browser', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.0(0x18000026) NetType/WIFI Language/zh_CN');
      expect(isWechatBrowser()).toBe(true);
    });

    it('returns true for WeChat Android browser', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36 MicroMessenger/8.0.0.1960(0x28000055)');
      expect(isWechatBrowser()).toBe(true);
    });

    it('returns false for regular Chrome browser', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      expect(isWechatBrowser()).toBe(false);
    });

    it('returns false for Safari browser', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1');
      expect(isWechatBrowser()).toBe(false);
    });
  });

  describe('getWechatVersion', () => {
    it('returns version number for WeChat browser', () => {
      mockUserAgent('MicroMessenger/8.0.0');
      expect(getWechatVersion()).toBe('8.0.0');
    });

    it('returns null for non-WeChat browser', () => {
      mockUserAgent('Mozilla/5.0 Chrome/120.0.0.0');
      expect(getWechatVersion()).toBeNull();
    });

    it('extracts version with multiple dots', () => {
      mockUserAgent('MicroMessenger/8.0.16.2040');
      expect(getWechatVersion()).toBe('8.0.16.2040');
    });
  });

  describe('getWechatOS', () => {
    it('returns ios for iPhone WeChat', () => {
      mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) MicroMessenger/8.0.0');
      expect(getWechatOS()).toBe('ios');
    });

    it('returns android for Android WeChat', () => {
      mockUserAgent('Mozilla/5.0 (Linux; Android 10) MicroMessenger/8.0.0');
      expect(getWechatOS()).toBe('android');
    });

    it('returns unknown for other platforms', () => {
      mockUserAgent('Mozilla/5.0 (Windows NT 10.0) MicroMessenger/8.0.0');
      expect(getWechatOS()).toBe('unknown');
    });
  });

  describe('isWechatVersionAtLeast', () => {
    it('returns true when version is higher', () => {
      mockUserAgent('MicroMessenger/8.0.0');
      expect(isWechatVersionAtLeast('7.0.0')).toBe(true);
    });

    it('returns true when version is equal', () => {
      mockUserAgent('MicroMessenger/8.0.0');
      expect(isWechatVersionAtLeast('8.0.0')).toBe(true);
    });

    it('returns false when version is lower', () => {
      mockUserAgent('MicroMessenger/7.0.0');
      expect(isWechatVersionAtLeast('8.0.0')).toBe(false);
    });

    it('returns false for non-WeChat browser', () => {
      mockUserAgent('Chrome/120.0.0.0');
      expect(isWechatVersionAtLeast('8.0.0')).toBe(false);
    });
  });

  describe('handleWechatCompatibility', () => {
    it('adds wechat-browser class to body when in WeChat', () => {
      mockUserAgent('MicroMessenger/8.0.0 (iPhone)');
      handleWechatCompatibility();
      expect(document.body.classList.contains('wechat-browser')).toBe(true);
    });

    it('does not add class when not in WeChat', () => {
      mockUserAgent('Chrome/120.0.0.0');
      handleWechatCompatibility();
      expect(document.body.classList.contains('wechat-browser')).toBe(false);
    });
  });
});
