export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

export interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export interface ToastOptions {
  type?: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

export interface ToastContextValue {
  add: (options: ToastOptions) => void;
  remove: (id: string) => void;
}
