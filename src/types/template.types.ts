/**
 * 模板数据类型定义
 * Task-012: 模板数据模型定义
 */

/** 模板场景枚举 */
export enum TemplateScene {
  /** 节日慰问 */
  HOLIDAY = 'holiday',
  /** 员工活动 */
  ACTIVITY = 'activity',
  /** 困难帮扶 */
  CARE = 'care',
  /** 通用 */
  GENERAL = 'general',
}

/** 模板分类枚举 */
export enum TemplateCategory {
  /** 采购方案 */
  PROCUREMENT = 'procurement',
  /** 慰问方案 */
  CONSOLATION = 'consolation',
  /** 请示报告 */
  REQUEST = 'request',
  /** 批复文件 */
  APPROVAL = 'approval',
}

/** 模板变量类型 */
export type VariableType = 'text' | 'number' | 'date' | 'select';

/** 模板变量定义 */
export interface TemplateVariable {
  /** 变量名（对应占位符 ${key}） */
  key: string;
  /** 变量说明 */
  label: string;
  /** 变量类型 */
  type: VariableType;
  /** 是否必填 */
  required: boolean;
  /** 默认值 */
  defaultValue?: string;
  /** select类型选项 */
  options?: string[];
}

/** 模板接口 */
export interface Template {
  /** 模板唯一标识 */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板分类 */
  category: TemplateCategory;
  /** 模板描述 */
  description: string;
  /** 模板内容（含变量占位符如 ${单位名称}） */
  content: string;
  /** 模板变量列表 */
  variables: TemplateVariable[];
  /** 预览图URL */
  previewUrl: string;
  /** 使用次数 */
  usageCount: number;
  /** 是否收藏 */
  isFavorite: boolean;
  /** 适用场景 */
  relatedScenes: TemplateScene[];
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
