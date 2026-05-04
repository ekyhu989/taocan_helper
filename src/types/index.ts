/**
 * 类型统一导出文件
 * V2.0 严格类型约束 - 统一导出所有类型定义
 */

// 方案相关类型
export type {
  TSchemeStatus,
  TFundSource,
  TProcurementScene,
  ISchemeConfig,
  ISchemeItem,
  IComplianceResult,
  IScheme,
  ISchemeCreateParams,
  ISchemeUpdateParams,
  ISchemeFilter,
  ISchemeComparison
} from './scheme';

// 商品相关类型
export type {
  TProductCategory,
  TProductStatus,
  TProductSource,
  IProduct,
  IProductCreateParams,
  IProductUpdateParams,
  IProductFilter,
  IProductMatchResult,
  IProductImportParams,
  IProductImportResult,
  ITemporaryProduct
} from './product';

// 合规相关类型
export type {
  TComplianceLevel,
  TComplianceRuleType,
  IComplianceRule,
  IBudgetCompliance,
  IPriceCompliance,
  IPlatform832Compliance,
  ICategoryCompliance,
  IQuantityCompliance,
  IComplianceCheckResult,
  IComplianceAlertConfig,
  ICompliancePolicy,
  IComplianceException
} from './compliance';

// 用户输入相关类型（保持原有类型兼容性）
export type {
  Scene,
  BudgetMode,
  Product,
  UserInput
} from './legacy';

/**
 * 通用工具类型
 */

/** 分页查询参数 */
export interface IPaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/** 分页查询结果 */
export interface IPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** API响应格式 */
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
  timestamp: Date;
}

/** 错误信息 */
export interface IErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

/** 设备信息 */
export interface IDeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  deviceType: 'mobile' | 'desktop';
}

/** 设置项 */
export interface ISettingItem<T = any> {
  key: string;
  value: T;
  label: string;
  description?: string;
  category: 'general' | 'display' | 'security' | 'export';
  type: 'boolean' | 'number' | 'string' | 'select' | 'array';
  options?: Array<{ label: string; value: T }>;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  validation?: (value: T) => boolean;
}

/** 导出格式 */
export type TExportFormat = 'pdf' | 'word' | 'excel' | 'json';

/** 导出配置 */
export interface IExportConfig {
  format: TExportFormat;
  includeLogs: boolean;
  includeCompliance: boolean;
  includeProducts: boolean;
  fileName?: string;
  watermark?: boolean;
}