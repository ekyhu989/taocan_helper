import React, { useState, useCallback, useRef } from 'react';
import Toast from './Toast';
import type { ToastItem, ToastOptions, ToastContextValue } from './Toast.types';

export const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export const useToastContext = (): ToastContextValue => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const add = useCallback((options: ToastOptions) => {
    const id = `toast-${++idRef.current}`;
    const newToast: ToastItem = {
      id,
      type: options.type ?? 'info',
      message: options.message,
      description: options.description,
      duration: options.duration,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <Toast toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
