import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from './Modal.types';

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  small: 'max-w-[400px]',
  medium: 'max-w-[600px]',
  large: 'max-w-[800px]',
  full: 'max-w-full w-full h-full rounded-none',
};

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  footer,
  size = 'medium',
  closeButton = true,
  maskClosable = true,
  escClosable = true,
  onClose,
  className = '',
}) => {
  const handleMaskClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (maskClosable && e.target === e.currentTarget) {
        onClose?.();
      }
    },
    [maskClosable, onClose]
  );

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (escClosable && e.key === 'Escape') {
        onClose?.();
      }
    },
    [escClosable, onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, handleEsc]);

  if (!open) return null;

  const modalClasses = [
    'relative bg-white rounded-lg shadow-lg overflow-hidden flex flex-col',
    sizeStyles[size],
    className,
  ].join(' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-mask animate-fade-in"
      onClick={handleMaskClick}
      role="presentation"
      aria-hidden="false"
    >
      <div
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-border-light">
            <h3
              id="modal-title"
              className="text-[16px] font-medium text-text-primary"
            >
              {title}
            </h3>
            {closeButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-sm hover:bg-bg-light transition-colors duration-fast"
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-auto px-[24px] py-[24px]">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-[8px] px-[24px] py-[16px] border-t border-border-light">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
