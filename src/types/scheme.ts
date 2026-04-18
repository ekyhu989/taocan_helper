/**
 * 方案相关类型定义
 * V2.0 严格类型约束
 */

/** 方案状态 */
export type TSchemeStatus = 'draft' | 'completed' | 'locked';

/** 资金来源 */
export type TFundSource = 'union' | 'other';

/** 采购场景 */
export type TProcurementScene = 'spring' | 'mid-autumn' | 'special' | 'care' | 'other';

/** 方案配置 */
export interface ISchemeConfig {
  totalBudget: number;
  peopleCount: number;
  fundSource: TFundSource;
  scene: TProcurementScene;
  perCapitaBudget: number;
  maxPerCapitaPrice: number;
  year: number;
  unitName?: string;
  region?: string;
  department?: string;
  applicant?: string;
}

/** 方案商品项 */
export interface ISchemeItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  is832Platform: boolean;
  category: string;
  unit: string;
  totalPrice: number;
  remarks?: string;
}

/** 合规检查结果 */
export interface IComplianceResult {
  isCompliant: boolean;
  warnings: string[];
  errors: string[];
  budgetCompliance: {
    isWithinBudget: boolean;
    remainingBudget: number;
    overBudgetAmount: number;
  };
  priceCompliance: {
    isWithinPriceLimit: boolean;
    maxAllowedPrice: number;
    overPriceItems: string[];
  };
  platform832Compliance: {
    ratio: number;
    isCompliant: boolean;
    requiredRatio: number;
    actualAmount: number;
    requiredAmount: number;
  };
}

/** 方案实体 */
export interface IScheme {
  id: string;
  name: string;
  year: number;
  status: TSchemeStatus;
  config: ISchemeConfig;
  items: ISchemeItem[];
  compliance: IComplianceResult;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags: string[];
  isEmergencyDraft?: boolean;
}

/** 方案创建参数 */
export interface ISchemeCreateParams {
  name?: string;
  config: Omit<ISchemeConfig, 'perCapitaBudget' | 'maxPerCapitaPrice'>;
  items?: ISchemeItem[];
  isEmergencyDraft?: boolean;
}

/** 方案更新参数 */
export interface ISchemeUpdateParams {
  name?: string;
  config?: Partial<ISchemeConfig>;
  items?: ISchemeItem[];
  status?: TSchemeStatus;
}

/** 方案筛选条件 */
export interface ISchemeFilter {
  year?: number;
  status?: TSchemeStatus;
  scene?: TProcurementScene;
  fundSource?: TFundSource;
  tags?: string[];
  searchText?: string;
}

/** 方案对比结果 */
export interface ISchemeComparison {
  schemeA: IScheme;
  schemeB: IScheme;
  differences: {
    totalPrice: { a: number; b: number; diff: number };
    itemCount: { a: number; b: number; diff: number };
    categoryCount: { a: number; b: number; diff: number };
    platform832Ratio: { a: number; b: number; diff: number };
    perCapitaPrice: { a: number; b: number; diff: number };
  };
}