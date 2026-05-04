import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  header,
  footer,
  hoverable = false,
  bordered = true,
  className = ''
}) => {
  const baseClasses = 'bg-white rounded-xl overflow-hidden';
  const borderClasses = bordered ? 'border border-gray-200' : '';
  const hoverClasses = hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${borderClasses} ${hoverClasses} ${className}`}>
      {(title || subtitle || header) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header || (
            <>
              {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
