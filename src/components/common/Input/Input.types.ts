import type { InputHTMLAttributes, ReactNode } from 'react';

export type InputType = 'text' | 'number' | 'select' | 'textarea' | 'date';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, 'type' | 'size'> {
  /** 输入框类型 */
  type?: InputType;
  /** 标签 */
  label?: ReactNode;
  /** 错误信息 */
  error?: string;
  /** 辅助文字 */
  helperText?: string;
  /** 是否必填 */
  required?: boolean;
  /** 是否显示必填标记 */
  showRequiredMark?: boolean;
  /** 输入框尺寸 */
  size?: 'large' | 'medium' | 'small';
  /** 选项列表（type=select时使用） */
  options?: Array<{ value: string; label: string }>;
}
