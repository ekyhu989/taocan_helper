import { useState, useEffect, useCallback } from 'react';
import {
  vibrate,
  getVibrationSettings,
  setVibrationSettings,
  toggleVibration,
  isVibrationSupported,
  VibrationPattern,
  VibrationConfig
} from '../utils/vibration';

export const useVibration = () => {
  const [settings, setSettingsState] = useState<VibrationConfig>(getVibrationSettings());
  const [supported, setSupported] = useState<boolean>(isVibrationSupported());

  useEffect(() => {
    setSettingsState(getVibrationSettings());
    setSupported(isVibrationSupported());
  }, []);

  const vibrateSuccess = useCallback(() => {
    vibrate(VibrationPattern.SUCCESS);
  }, []);

  const vibrateError = useCallback(() => {
    vibrate(VibrationPattern.ERROR);
  }, []);

  const vibrateWarning = useCallback(() => {
    vibrate(VibrationPattern.WARNING);
  }, []);

  const vibrateProgress = useCallback(() => {
    vibrate(VibrationPattern.PROGRESS);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setVibrationSettings({ enabled });
    setSettingsState(getVibrationSettings());
  }, []);

  const toggle = useCallback(() => {
    const newEnabled = toggleVibration();
    setSettingsState(getVibrationSettings());
    return newEnabled;
  }, []);

  return {
    settings,
    supported,
    enabled: settings.enabled,
    vibrateSuccess,
    vibrateError,
    vibrateWarning,
    vibrateProgress,
    setEnabled,
    toggle
  };
};
