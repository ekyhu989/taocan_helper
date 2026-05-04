/**
 * Store统一导出文件
 * V2.0 状态管理架构 - 统一导出所有状态管理Store
 */

// 导出方案状态管理
export { useSchemeStore } from './schemeStore';

// 导出年度数据管理
export { 
  useAnnualDataStore, 
  getAvailableYears, 
  isYearLocked, 
  getAnnualStorageKey, 
  cleanupExpiredAnnualData 
} from './annualDataStore';

// 导出设置状态管理
export { 
  useSettingsStore, 
  getSettingsByCategory, 
  getSettingCategories, 
  validateSettingValue, 
  exportSettings, 
  importSettings 
} from './settingsStore';

/**
 * Store初始化函数
 * 应用启动时初始化所有Store
 */
export const initializeStores = async (): Promise<void> => {
  try {
    // 清理过期年度数据
    cleanupExpiredAnnualData();
    
    // 初始化设置
    const { getSetting } = useSettingsStore.getState();
    
    // 应用主题设置
    const theme = getSetting('theme.mode', 'auto');
    applyTheme(theme);
    
    // 应用字体大小设置
    const fontSize = getSetting('display.fontSize', 'medium');
    applyFontSize(fontSize);
    
    console.log('Store初始化完成');
  } catch (error) {
    console.error('Store初始化失败:', error);
  }
};

/**
 * 应用主题设置
 */
const applyTheme = (theme: 'light' | 'dark' | 'auto'): void => {
  const root = document.documentElement;
  
  if (theme === 'auto') {
    // 根据系统偏好自动选择
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

/**
 * 应用字体大小设置
 */
const applyFontSize = (fontSize: 'small' | 'medium' | 'large'): void => {
  const root = document.documentElement;
  
  // 移除现有字体大小类
  root.classList.remove('text-sm', 'text-base', 'text-lg');
  
  // 添加新的字体大小类
  switch (fontSize) {
    case 'small':
      root.classList.add('text-sm');
      break;
    case 'medium':
      root.classList.add('text-base');
      break;
    case 'large':
      root.classList.add('text-lg');
      break;
  }
};

/**
 * Store性能监控
 */
export const monitorStorePerformance = (): void => {
  // 监听Store状态变化，监控性能
  const originalSetState = useSchemeStore.setState;
  
  useSchemeStore.setState = function(...args) {
    const startTime = performance.now();
    const result = originalSetState.apply(this, args);
    const endTime = performance.now();
    
    if (endTime - startTime > 10) {
      console.warn('Store状态更新耗时较长:', endTime - startTime, 'ms');
    }
    
    return result;
  };
};

/**
 * Store数据备份和恢复
 */
export const backupStoreData = (): Record<string, any> => {
  const schemeState = useSchemeStore.getState();
  const annualState = useAnnualDataStore.getState();
  const settingsState = useSettingsStore.getState();
  
  return {
    schemeStore: {
      schemeHistory: schemeState.schemeHistory,
      drafts: schemeState.drafts,
      filter: schemeState.filter
    },
    annualDataStore: {
      currentYear: annualState.currentYear,
      annualData: annualState.annualData
    },
    settingsStore: {
      settings: settingsState.settings
    },
    backupTime: new Date().toISOString()
  };
};

export const restoreStoreData = (backupData: Record<string, any>): void => {
  if (backupData.schemeStore) {
    useSchemeStore.setState({
      schemeHistory: backupData.schemeStore.schemeHistory || [],
      drafts: backupData.schemeStore.drafts || [],
      filter: backupData.schemeStore.filter || {}
    });
  }
  
  if (backupData.annualDataStore) {
    useAnnualDataStore.setState({
      currentYear: backupData.annualDataStore.currentYear || new Date().getFullYear(),
      annualData: backupData.annualDataStore.annualData || {}
    });
  }
  
  if (backupData.settingsStore) {
    useSettingsStore.setState({
      settings: backupData.settingsStore.settings || {}
    });
  }
};