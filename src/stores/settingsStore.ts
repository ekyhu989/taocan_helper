/**
 * 设置状态管理Store
 * V2.0 状态管理架构 - 管理用户偏好设置
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ISettingItem, TExportFormat } from '../types';

interface ISettingsState {
  // 设置项
  settings: Record<string, any>;
  
  // 操作
  getSetting: <T>(key: string, defaultValue?: T) => T;
  setSetting: <T>(key: string, value: T) => void;
  resetSetting: (key: string) => void;
  resetAllSettings: () => void;
  
  // 设置项定义
  settingDefinitions: Record<string, ISettingItem>;
  getSettingDefinition: (key: string) => ISettingItem | undefined;
  
  // 特定设置快捷方法
  setVibrationEnabled: (enabled: boolean) => void;
  setExportFormat: (format: TExportFormat) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'zh-CN' | 'en-US') => void;
}

/**
 * 默认设置定义
 */
const defaultSettingDefinitions: Record<string, ISettingItem> = {
  // 通用设置
  'vibration.enabled': {
    key: 'vibration.enabled',
    value: true,
    label: '振动反馈',
    description: '开启后操作成功或失败时会有振动反馈',
    category: 'general',
    type: 'boolean'
  },
  
  'sound.enabled': {
    key: 'sound.enabled',
    value: false,
    label: '声音提示',
    description: '开启后操作成功或失败时会有声音提示',
    category: 'general',
    type: 'boolean'
  },
  
  'autoSave.enabled': {
    key: 'autoSave.enabled',
    value: true,
    label: '自动保存',
    description: '开启后编辑内容会自动保存',
    category: 'general',
    type: 'boolean'
  },
  
  'autoSave.interval': {
    key: 'autoSave.interval',
    value: 30,
    label: '自动保存间隔',
    description: '自动保存的时间间隔（秒）',
    category: 'general',
    type: 'number',
    min: 10,
    max: 300,
    step: 10
  },
  
  // 显示设置
  'theme.mode': {
    key: 'theme.mode',
    value: 'auto',
    label: '主题模式',
    description: '选择界面主题',
    category: 'display',
    type: 'select',
    options: [
      { label: '自动', value: 'auto' },
      { label: '浅色', value: 'light' },
      { label: '深色', value: 'dark' }
    ]
  },
  
  'display.fontSize': {
    key: 'display.fontSize',
    value: 'medium',
    label: '字体大小',
    description: '调整界面字体大小',
    category: 'display',
    type: 'select',
    options: [
      { label: '小', value: 'small' },
      { label: '中', value: 'medium' },
      { label: '大', value: 'large' }
    ]
  },
  
  'display.highContrast': {
    key: 'display.highContrast',
    value: false,
    label: '高对比度模式',
    description: '开启后界面使用高对比度配色，适合户外强光环境',
    category: 'display',
    type: 'boolean'
  },
  
  'display.singleHandMode': {
    key: 'display.singleHandMode',
    value: 'auto',
    label: '单手模式',
    description: '优化单手操作体验',
    category: 'display',
    type: 'select',
    options: [
      { label: '自动', value: 'auto' },
      { label: '左手', value: 'left' },
      { label: '右手', value: 'right' },
      { label: '关闭', value: 'off' }
    ]
  },
  
  // 导出设置
  'export.defaultFormat': {
    key: 'export.defaultFormat',
    value: 'pdf',
    label: '默认导出格式',
    description: '设置默认的导出文件格式',
    category: 'export',
    type: 'select',
    options: [
      { label: 'PDF', value: 'pdf' },
      { label: 'Word', value: 'word' },
      { label: 'Excel', value: 'excel' }
    ]
  },
  
  'export.includeLogs': {
    key: 'export.includeLogs',
    value: true,
    label: '包含操作日志',
    description: '导出时包含详细的操作修改日志',
    category: 'export',
    type: 'boolean'
  },
  
  'export.includeCompliance': {
    key: 'export.includeCompliance',
    value: true,
    label: '包含合规检查',
    description: '导出时包含合规检查结果',
    category: 'export',
    type: 'boolean'
  },
  
  'export.watermark': {
    key: 'export.watermark',
    value: true,
    label: '添加水印',
    description: '导出文件添加"草稿"或"正式"水印',
    category: 'export',
    type: 'boolean'
  },
  
  // 安全设置
  'security.autoLock': {
    key: 'security.autoLock',
    value: true,
    label: '自动锁定',
    description: '闲置一段时间后自动锁定应用',
    category: 'security',
    type: 'boolean'
  },
  
  'security.lockTimeout': {
    key: 'security.lockTimeout',
    value: 300,
    label: '锁定超时时间',
    description: '闲置多长时间后自动锁定（秒）',
    category: 'security',
    type: 'number',
    min: 60,
    max: 3600,
    step: 60
  },
  
  'security.encryptLocalData': {
    key: 'security.encryptLocalData',
    value: true,
    label: '加密本地数据',
    description: '对本地存储的数据进行加密保护',
    category: 'security',
    type: 'boolean'
  }
};

/**
 * 默认设置值
 */
const defaultSettings: Record<string, any> = Object.keys(defaultSettingDefinitions).reduce((acc, key) => {
  acc[key] = defaultSettingDefinitions[key].value;
  return acc;
}, {} as Record<string, any>);

/**
 * 设置状态管理Store
 */
export const useSettingsStore = create<ISettingsState>()(
  persist(
    (set, get) => ({
      // 初始状态
      settings: defaultSettings,
      settingDefinitions: defaultSettingDefinitions,

      // 获取设置值
      getSetting: <T>(key: string, defaultValue?: T) => {
        const { settings } = get();
        return settings[key] ?? defaultValue ?? defaultSettings[key];
      },

      // 设置设置值
      setSetting: <T>(key: string, value: T) => {
        const { settings, settingDefinitions } = get();
        const definition = settingDefinitions[key];
        
        // 验证设置值
        if (definition) {
          if (definition.type === 'number' && typeof value === 'number') {
            if (definition.min !== undefined && value < definition.min) {
              value = definition.min as T;
            }
            if (definition.max !== undefined && value > definition.max) {
              value = definition.max as T;
            }
          }
          
          if (definition.validation && !definition.validation(value)) {
            throw new Error(`设置值验证失败: ${key}`);
          }
        }
        
        set({
          settings: {
            ...settings,
            [key]: value
          }
        });
      },

      // 重置设置值
      resetSetting: (key: string) => {
        const { settings } = get();
        const newSettings = { ...settings };
        
        if (key in defaultSettings) {
          newSettings[key] = defaultSettings[key];
        } else {
          delete newSettings[key];
        }
        
        set({ settings: newSettings });
      },

      // 重置所有设置
      resetAllSettings: () => {
        set({ settings: { ...defaultSettings } });
      },

      // 获取设置定义
      getSettingDefinition: (key: string) => {
        const { settingDefinitions } = get();
        return settingDefinitions[key];
      },

      // 快捷方法 - 振动设置
      setVibrationEnabled: (enabled: boolean) => {
        get().setSetting('vibration.enabled', enabled);
      },

      // 快捷方法 - 导出格式
      setExportFormat: (format: TExportFormat) => {
        get().setSetting('export.defaultFormat', format);
      },

      // 快捷方法 - 自动保存
      setAutoSaveEnabled: (enabled: boolean) => {
        get().setSetting('autoSave.enabled', enabled);
      },

      // 快捷方法 - 主题设置
      setTheme: (theme: 'light' | 'dark' | 'auto') => {
        get().setSetting('theme.mode', theme);
      },

      // 快捷方法 - 语言设置
      setLanguage: (language: 'zh-CN' | 'en-US') => {
        get().setSetting('language', language);
      }
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({
        settings: state.settings
      })
    }
  )
);

/**
 * 设置工具函数
 */

/**
 * 获取分类的设置项
 */
export const getSettingsByCategory = (category: string): ISettingItem[] => {
  const { settingDefinitions } = useSettingsStore.getState();
  return Object.values(settingDefinitions).filter(item => item.category === category);
};

/**
 * 获取所有设置分类
 */
export const getSettingCategories = (): string[] => {
  const { settingDefinitions } = useSettingsStore.getState();
  const categories = new Set<string>();
  
  Object.values(settingDefinitions).forEach(item => {
    categories.add(item.category);
  });
  
  return Array.from(categories);
};

/**
 * 验证设置值
 */
export const validateSettingValue = (key: string, value: any): boolean => {
  const { getSettingDefinition } = useSettingsStore.getState();
  const definition = getSettingDefinition(key);
  
  if (!definition) return false;
  
  // 类型检查
  if (definition.type === 'number' && typeof value !== 'number') return false;
  if (definition.type === 'boolean' && typeof value !== 'boolean') return false;
  if (definition.type === 'string' && typeof value !== 'string') return false;
  
  // 范围检查
  if (definition.type === 'number') {
    if (definition.min !== undefined && value < definition.min) return false;
    if (definition.max !== undefined && value > definition.max) return false;
  }
  
  // 选项检查
  if (definition.type === 'select' && definition.options) {
    const validValues = definition.options.map(opt => opt.value);
    if (!validValues.includes(value)) return false;
  }
  
  // 自定义验证
  if (definition.validation && !definition.validation(value)) return false;
  
  return true;
};

/**
 * 导出设置配置
 */
export const exportSettings = (): string => {
  const { settings } = useSettingsStore.getState();
  return JSON.stringify(settings, null, 2);
};

/**
 * 导入设置配置
 */
export const importSettings = (settingsJson: string): void => {
  const { setSetting } = useSettingsStore.getState();
  const importedSettings = JSON.parse(settingsJson);
  
  Object.keys(importedSettings).forEach(key => {
    if (validateSettingValue(key, importedSettings[key])) {
      setSetting(key, importedSettings[key]);
    }
  });
};