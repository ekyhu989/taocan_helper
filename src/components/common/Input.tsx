import React, { useState } from 'react';

type InputSize = 'small' | 'medium' | 'large';
type InputVariant = 'default' | 'outlined' | 'filled';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  size = 'medium',
  variant = 'default',
  leftIcon,
  rightIcon,
  onRightIconClick,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseClasses = 'w-full border rounded-lg transition-all focus:outline-none';

  const variantClasses: Record<InputVariant, string> = {
    default: 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    outlined: 'bg-transparent border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    filled: 'bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
  };

  const sizeClasses: Record<InputSize, string> = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onRightIconClick && typeof onRightIconClick === 'function') {
                onRightIconClick();
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {rightIcon}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
