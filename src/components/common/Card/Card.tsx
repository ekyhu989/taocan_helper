import React from 'react';
import type { CardProps } from './Card.types';

const Card: React.FC<CardProps> = ({
  variant = 'default',
  header,
  children,
  footer,
  onClick,
  className = '',
  clickable = false,
  ...rest
}) => {
  const baseStyles =
    'rounded-md border border-border bg-white transition-shadow duration-fast ease-ease overflow-hidden';

  const variantStyles: Record<typeof variant, string> = {
    default: '',
    hover: 'hover:shadow-sm hover:border-border cursor-pointer',
    active: 'shadow-md border-primary ring-1 ring-primary',
  };

  const isClickable = clickable || onClick !== undefined;

  const classes = [
    baseStyles,
    variantStyles[variant],
    isClickable ? 'cursor-pointer' : '',
    className,
  ].join(' ');

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isClickable && onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : rest.role}
      tabIndex={isClickable ? 0 : rest.tabIndex}
      aria-pressed={isClickable ? false : undefined}
      {...rest}
    >
      {header && (
        <div className="px-[16px] py-[12px] border-b border-border-light">
          {header}
        </div>
      )}
      <div className="p-[16px]">{children}</div>
      {footer && (
        <div className="px-[16px] py-[12px] border-t border-border-light">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
