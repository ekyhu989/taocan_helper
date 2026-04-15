import React from 'react';

type FloatingButtonSize = 'small' | 'medium' | 'large';
type FloatingButtonPosition = 'bottom-right' | 'bottom-left';

interface FloatingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: FloatingButtonSize;
  position?: FloatingButtonPosition;
  className?: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  children,
  onClick,
  size = 'medium',
  position = 'bottom-right',
  className = ''
}) => {
  const sizeClasses: Record<FloatingButtonSize, string> = {
    small: 'w-12 h-12 text-xl',
    medium: 'w-16 h-16 text-2xl',
    large: 'w-[72px] h-[72px] text-3xl'
  };

  const positionClasses: Record<FloatingButtonPosition, string> = {
    'bottom-right': 'right-6 bottom-24',
    'bottom-left': 'left-6 bottom-24'
  };

  return (
    <button
      onClick={onClick}
      className={`fixed ${positionClasses[position]} ${sizeClasses[size]} bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-[0.95] transition-transform hover:bg-blue-700 ${className}`}
    >
      {children}
    </button>
  );
};

export default FloatingButton;
