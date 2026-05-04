export type SkeletonType = 'text' | 'circle' | 'rect';

export interface SkeletonProps {
  /** 骨架屏类型 */
  type?: SkeletonType;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 自定义类名 */
  className?: string;
}
