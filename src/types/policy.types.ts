/**
 * 政策数据类型定义
 * Task-017: 政策数据模型定义
 * 对齐文档: V3.0_需求规格说明书 第4.2节
 */

/** 政策类型枚举 */
export enum PolicyCategory {
  /** 国家政策 */
  NATIONAL = 'national',
  /** 地方政策 */
  LOCAL = 'local',
  /** 行业规范 */
  INDUSTRY = 'industry',
}

/** 适用场景枚举 */
export enum PolicyScene {
  /** 节日慰问 */
  HOLIDAY = 'holiday',
  /** 专项活动 */
  ACTIVITY = 'activity',
  /** 精准帮扶 */
  CARE = 'care',
}

/** 合规等级枚举 */
export enum PolicyLevel {
  /** 强制 */
  MANDATORY = 'mandatory',
  /** 建议 */
  SUGGESTION = 'suggestion',
  /** 参考 */
  REFERENCE = 'reference',
}

/** 文件类型 */
export type PolicyFileType = 'pdf' | 'word' | 'txt';

/** 政策接口 */
export interface Policy {
  /** 政策唯一标识 */
  id: string;
  /** 政策标题 */
  title: string;
  /** 政策类型 */
  category: PolicyCategory;
  /** 适用场景（可多选） */
  scene: PolicyScene[];
  /** 发布年份 */
  year: number;
  /** 合规等级 */
  level: PolicyLevel;
  /** 政策内容 */
  content: string;
  /** 文件URL */
  fileUrl: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 文件类型 */
  fileType: PolicyFileType;
  /** 合规要点 */
  keyPoints: string[];
  /** 政策摘要 */
  summary: string;
  /** 是否收藏 */
  isFavorite: boolean;
  /** 浏览次数 */
  viewCount: number;
  /** 发布时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}
