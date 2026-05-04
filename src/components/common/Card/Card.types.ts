import type { ReactNode, MouseEvent, HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'hover' | 'active';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 卡片变体 */
  variant?: CardVariant;
  /** 头部内容 */
  header?: ReactNode;
  /** 主体内容 */
  children: ReactNode;
  /** 底部内容 */
  footer?: ReactNode;
  /** 点击事件 */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  /** 自定义类名 */
  className?: string;
  /** 是否可点击 */
  clickable?: boolean;
}
