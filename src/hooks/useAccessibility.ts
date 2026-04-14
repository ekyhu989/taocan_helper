import { useState, useEffect, useCallback } from 'react';

const ACCESSIBILITY_KEY = 'accessibility_settings';

export interface AccessibilitySettings {
  largeTextMode: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  largeTextMode: false,
};

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(ACCESSIBILITY_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(updatedSettings));
    
    if (updatedSettings.largeTextMode) {
      document.documentElement.classList.add('large-text-mode');
    } else {
      document.documentElement.classList.remove('large-text-mode');
    }
  }, [settings]);

  const toggleLargeTextMode = useCallback(() => {
    updateSettings({ largeTextMode: !settings.largeTextMode });
  }, [settings.largeTextMode, updateSettings]);

  const resetSettings = useCallback(() => {
    updateSettings(DEFAULT_SETTINGS);
  }, [updateSettings]);

  useEffect(() => {
    if (settings.largeTextMode) {
      document.documentElement.classList.add('large-text-mode');
    } else {
      document.documentElement.classList.remove('large-text-mode');
    }
  }, []);

  return {
    settings,
    updateSettings,
    toggleLargeTextMode,
    resetSettings,
    isLargeTextMode: settings.largeTextMode,
  };
};
