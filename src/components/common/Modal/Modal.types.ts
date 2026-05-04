import type { ReactNode } from 'react';

export type ModalSize = 'small' | 'medium' | 'large' | 'full';

export interface ModalProps {
  /** 是否显示 */
  open: boolean;
  /** 标题 */
  title?: ReactNode;
  /** 内容 */
  children: ReactNode;
  /** 底部操作区 */
  footer?: ReactNode;
  /** 尺寸 */
  size?: ModalSize;
  /** 是否显示关闭按钮 */
  closeButton?: boolean;
  /** 点击遮罩关闭 */
  maskClosable?: boolean;
  /** ESC键关闭 */
  escClosable?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义类名 */
  className?: string;
}
