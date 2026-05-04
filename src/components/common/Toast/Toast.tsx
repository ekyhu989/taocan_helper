import React, { useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import type { ToastProps, ToastItem } from './Toast.types';

const typeConfig: Record<
  ToastItem['type'],
  { icon: typeof CheckCircle; bg: string; text: string }
> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-success/10',
    text: 'text-success',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10',
    text: 'text-warning',
  },
  error: {
    icon: XCircle,
    bg: 'bg-error/10',
    text: 'text-error',
  },
  info: {
    icon: Info,
    bg: 'bg-info/10',
    text: 'text-info',
  },
};

const defaultDuration: Record<ToastItem['type'], number | null> = {
  success: 2000,
  warning: 3000,
  info: 3000,
  error: null,
};

const ToastItemComponent: React.FC<{
  toast: ToastItem;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const config = typeConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration ?? defaultDuration[toast.type];

  const handleRemove = useCallback(() => {
    onRemove(toast.id);
  }, [onRemove, toast.id]);

  useEffect(() => {
    if (duration === null) return;
    const timer = setTimeout(handleRemove, duration);
    return () => clearTimeout(timer);
  }, [duration, handleRemove]);

  return (
    <div
      className={`flex items-start gap-[12px] w-full max-w-[400px] mx-auto md:mx-0 md:ml-auto rounded-md shadow-md p-[16px] animate-slide-in-right ${config.bg}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-[2px] ${config.text}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium ${config.text}`}>
          {toast.message}
        </p>
        {toast.description && (
          <p className={`text-[13px] mt-[4px] opacity-80 ${config.text}`}>
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded-sm hover:bg-black/5 transition-colors"
        aria-label="关闭提示"
      >
        <X className={`w-4 h-4 ${config.text}`} />
      </button>
    </div>
  );
};

const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col gap-[12px] p-[16px] md:top-[24px] md:right-[24px] md:left-auto md:p-0 pointer-events-none">
      {toasts.slice(0, 3).map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItemComponent toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

export default Toast;
