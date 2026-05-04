import { useState, useCallback, useEffect } from 'react';

const ONBOARDING_KEY = 'taocang-onboarding';

interface OnboardingState {
  hasSeenGuide: boolean;
  currentStep: number;
}

const loadState = (): OnboardingState => {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { hasSeenGuide: false, currentStep: 0 };
};

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(loadState);

  // 页面加载时从localStorage同步状态
  useEffect(() => {
    setState(loadState());
  }, []);

  const startGuide = useCallback(() => {
    const newState = { hasSeenGuide: false, currentStep: 1 };
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
    setState(newState);
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const next = prev.currentStep + 1;
      const newState: OnboardingState =
        next > 3
          ? { hasSeenGuide: true, currentStep: 0 }
          : { ...prev, currentStep: next };
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const skipGuide = useCallback(() => {
    const newState: OnboardingState = { hasSeenGuide: true, currentStep: 0 };
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
    setState(newState);
  }, []);

  const resetGuide = useCallback(() => {
    const newState: OnboardingState = { hasSeenGuide: false, currentStep: 0 };
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(newState));
    setState(newState);
  }, []);

  return {
    isActive: !state.hasSeenGuide && state.currentStep > 0,
    currentStep: state.currentStep,
    startGuide,
    nextStep,
    skipGuide,
    resetGuide,
  };
};
