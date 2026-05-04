import React from 'react';
import type { SkeletonProps } from './Skeleton.types';

const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  width,
  height,
  className = '',
}) => {
  const baseStyles =
    'bg-gradient-to-r from-bg-light via-border to-bg-light bg-[length:200%_100%] animate-[skeleton-shimmer_1.5s_ease-in-out_infinite]';

  const typeStyles: Record<typeof type, string> = {
    text: 'rounded-sm h-[16px] w-full',
    circle: 'rounded-full',
    rect: 'rounded-md',
  };

  const style: React.CSSProperties = {};
  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  const classes = [baseStyles, typeStyles[type], className].join(' ');

  return (
    <div
      className={classes}
      style={style}
      aria-busy="true"
      aria-label="加载中"
    />
  );
};

export default Skeleton;
