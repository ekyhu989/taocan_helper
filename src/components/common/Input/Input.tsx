import React, { forwardRef, useState, useCallback } from 'react';
import type { InputProps } from './Input.types';

const sizeStyles: Record<NonNullable<InputProps['size']>, string> = {
  large: 'h-[48px] px-[16px] text-[16px]',
  medium: 'h-[40px] px-[12px] text-[14px]',
  small: 'h-[32px] px-[8px] text-[13px]',
};

const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputProps
>(
  (
    {
      type = 'text',
      label,
      error,
      helperText,
      required = false,
      showRequiredMark = true,
      size = 'medium',
      options,
      className = '',
      onBlur,
      onChange,
      ...rest
    },
    ref
  ) => {
    const [touched, setTouched] = useState(false);

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setTouched(true);
        onBlur?.(e as React.FocusEvent<HTMLInputElement>);
      },
      [onBlur]
    );

    const inputBaseStyles =
      'w-full rounded-md border border-border bg-white text-text-primary placeholder-text-helper transition-colors duration-fast ease-ease focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-20';

    const errorStyles = error
      ? 'border-error focus-visible:border-error focus-visible:ring-error'
      : '';

    const disabledStyles = rest.disabled
      ? 'bg-bg-light opacity-50 cursor-not-allowed'
      : '';

    const inputClasses = [
      inputBaseStyles,
      sizeStyles[size],
      errorStyles,
      disabledStyles,
      className,
    ].join(' ');

    const renderInput = () => {
      if (type === 'textarea') {
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`${inputClasses} py-[10px] resize-y min-h-[80px]`}
            onBlur={handleBlur}
            onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
            aria-invalid={!!error}
            aria-required={required}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        );
      }

      if (type === 'select' && options) {
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            className={inputClasses}
            onBlur={handleBlur}
            onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
            aria-invalid={!!error}
            aria-required={required}
            {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">请选择</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          className={inputClasses}
          onBlur={handleBlur}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          aria-invalid={!!error}
          aria-required={required}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      );
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-[14px] font-medium text-text-primary mb-[8px]">
            {label}
            {required && showRequiredMark && (
              <span className="text-error ml-[4px]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        {renderInput()}
        {error && touched && (
          <p className="mt-[4px] text-[12px] text-error" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-[4px] text-[12px] text-text-secondary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
