/**
 * 合规相关类型定义
 * V2.0 严格类型约束
 */

import type { IScheme, TProcurementScene, TFundSource } from './scheme';

/** 合规检查级别 */
export type TComplianceLevel = 'pass' | 'warning' | 'error';

/** 合规规则类型 */
export type TComplianceRuleType = 'budget' | 'price' | 'platform832' | 'category' | 'quantity';

/** 合规规则 */
export interface IComplianceRule {
  id: string;
  type: TComplianceRuleType;
  name: string;
  description: string;
  condition: (scheme: IScheme) => boolean;
  message: string;
  level: TComplianceLevel;
  policyReference?: string;
  isEnabled: boolean;
}

/** 预算合规检查结果 */
export interface IBudgetCompliance {
  isWithinBudget: boolean;
  totalBudget: number;
  actualSpending: number;
  remainingBudget: number;
  overBudgetAmount: number;
  budgetUtilizationRate: number;
}

/** 价格合规检查结果 */
export interface IPriceCompliance {
  isWithinPriceLimit: boolean;
  maxAllowedPrice: number;
  actualMaxPrice: number;
  overPriceItems: Array<{
    productId: string;
    productName: string;
    actualPrice: number;
    maxAllowed: number;
    overAmount: number;
  }>;
}

/** 832平台合规检查结果 */
export interface IPlatform832Compliance {
  ratio: number;
  isCompliant: boolean;
  requiredRatio: number;
  actualAmount: number;
  requiredAmount: number;
  shortfallAmount: number;
  platform832Items: Array<{
    productId: string;
    productName: string;
    amount: number;
  }>;
}

/** 品类合规检查结果 */
export interface ICategoryCompliance {
  categoryDistribution: Record<string, number>;
  recommendedDistribution: Record<string, number>;
  deviations: Array<{
    category: string;
    actual: number;
    recommended: number;
    deviation: number;
  }>;
}

/** 数量合规检查结果 */
export interface IQuantityCompliance {
  totalQuantity: number;
  perCapitaQuantity: number;
  isReasonable: boolean;
  recommendations: string[];
}

/** 完整合规检查结果 */
export interface IComplianceCheckResult {
  overallLevel: TComplianceLevel;
  budget: IBudgetCompliance;
  price: IPriceCompliance;
  platform832: IPlatform832Compliance;
  category: ICategoryCompliance;
  quantity: IQuantityCompliance;
  warnings: Array<{
    ruleId: string;
    message: string;
    level: TComplianceLevel;
    details?: any;
  }>;
  errors: Array<{
    ruleId: string;
    message: string;
    level: TComplianceLevel;
    details?: any;
  }>;
  timestamp: Date;
}

/** 合规预警配置 */
export interface IComplianceAlertConfig {
  budgetWarningThreshold: number; // 预算使用率警告阈值
  priceWarningThreshold: number;  // 价格超限警告阈值
  platform832WarningThreshold: number; // 832占比警告阈值
  enableRealTimeCheck: boolean;
  enableAutoSave: boolean;
  alertSoundEnabled: boolean;
  vibrationEnabled: boolean;
}

/** 合规政策 */
export interface ICompliancePolicy {
  id: string;
  title: string;
  content: string;
  effectiveDate: Date;
  expirationDate?: Date;
  applicableScenes: TProcurementScene[];
  applicableFundSources: TFundSource[];
  isActive: boolean;
  version: number;
}

/** 合规例外申请 */
export interface IComplianceException {
  id: string;
  schemeId: string;
  ruleId: string;
  reason: string;
  supportingDocuments?: string[];
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approvalDate?: Date;
  comments?: string;
  createdAt: Date;
}