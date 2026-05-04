import React from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  icon,
  closable = false,
  onClose,
  className = ''
}) => {
  const variantClasses: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✅'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: '⚠️'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌'
    }
  };

  const classes = variantClasses[variant];

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-xl">
          {icon || classes.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`font-bold ${classes.text} mb-1`}>
              {title}
            </h4>
          )}
          <div className={`${classes.text}`}>
            {children}
          </div>
        </div>
        {closable && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black bg-opacity-10 rounded transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
