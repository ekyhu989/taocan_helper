export enum VibrationPattern {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  PROGRESS = 'progress'
}

export interface VibrationConfig {
  enabled: boolean;
}

const vibrationPatterns: Record<VibrationPattern, number[]> = {
  success: [50],
  error: [200, 100, 200],
  warning: [30, 50, 30, 50, 30],
  progress: [20]
};

const VIBRATION_SETTINGS_KEY = 'vibrationSettings';
const DEFAULT_SETTINGS: VibrationConfig = {
  enabled: true
};

let currentSettings: VibrationConfig = DEFAULT_SETTINGS;

export function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export function getVibrationSettings(): VibrationConfig {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(VIBRATION_SETTINGS_KEY);
      if (saved) {
        currentSettings = JSON.parse(saved);
      }
    } catch {
      currentSettings = DEFAULT_SETTINGS;
    }
  }
  return currentSettings;
}

export function setVibrationSettings(settings: Partial<VibrationConfig>): void {
  currentSettings = { ...currentSettings, ...settings };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(VIBRATION_SETTINGS_KEY, JSON.stringify(currentSettings));
  }
}

export function toggleVibration(): boolean {
  const newEnabled = !currentSettings.enabled;
  setVibrationSettings({ enabled: newEnabled });
  return newEnabled;
}

export function vibrate(pattern: VibrationPattern): void {
  if (!currentSettings.enabled) return;
  if (!isVibrationSupported()) return;

  try {
    const patternArray = vibrationPatterns[pattern];
    if (navigator.vibrate) {
      navigator.vibrate(patternArray);
    }
  } catch (error) {
    console.warn('Vibration failed:', error);
  }
}

export { vibrationPatterns };
