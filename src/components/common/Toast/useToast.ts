import { useCallback } from 'react';
import { useToastContext } from './ToastProvider';

export const useToast = () => {
  const { add, remove } = useToastContext();

  const success = useCallback(
    (message: string, description?: string) => {
      add({ type: 'success', message, description });
    },
    [add]
  );

  const warning = useCallback(
    (message: string, description?: string) => {
      add({ type: 'warning', message, description });
    },
    [add]
  );

  const error = useCallback(
    (message: string, description?: string) => {
      add({ type: 'error', message, description });
    },
    [add]
  );

  const info = useCallback(
    (message: string, description?: string) => {
      add({ type: 'info', message, description });
    },
    [add]
  );

  return { success, warning, error, info, add, remove };
};

export default useToast;
