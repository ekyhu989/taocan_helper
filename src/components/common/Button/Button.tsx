import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { ButtonProps } from './Button.types';

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'bg-white text-primary border border-primary hover:bg-bg-light active:bg-bg',
  ghost:
    'bg-transparent text-primary hover:bg-bg-light active:bg-bg',
  danger:
    'bg-white text-error border border-error hover:bg-error hover:text-white active:bg-error',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  large: 'h-[48px] px-[24px] text-[16px]',
  medium: 'h-[40px] px-[20px] text-[14px]',
  small: 'h-[32px] px-[16px] text-[13px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      loading = false,
      disabled = false,
      children,
      className = '',
      onClick,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles =
      'inline-flex items-center justify-center rounded-sm font-medium transition-colors duration-fast ease-ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

    const stateStyles = isDisabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer';

    const classes = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      stateStyles,
      className,
    ].join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        onClick={onClick}
        aria-disabled={isDisabled}
        {...rest}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
