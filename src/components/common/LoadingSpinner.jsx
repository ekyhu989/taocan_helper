import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '加载中...',
  subMessage,
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  const dotSizeClasses = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2.5 h-2.5',
    large: 'w-4 h-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <div className={`absolute inset-0 border-4 border-gray-200 rounded-full`}></div>
        <div 
          className={`absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin`}
        ></div>
      </div>
      
      <div className="text-center">
        {message && (
          <p className="text-gray-700 font-medium">{message}</p>
        )}
        {subMessage && (
          <p className="text-gray-500 text-sm mt-1">{subMessage}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
