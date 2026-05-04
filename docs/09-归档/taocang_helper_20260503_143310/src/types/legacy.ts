/**
 * 遗留类型定义
 * 保持与V1.6版本的兼容性
 */

/** 采购场景分类 */
export type Scene = 'holiday' | 'activity' | 'care';

/** 预算模式 */
export type BudgetMode = 'per_capita' | 'total_control';

/** 商品库中的单条商品 */
export interface Product {
  id: string;
  name: string;       // 商品名称
  unit: string;       // 单位，如"份"、"箱"、"套"
  price: number;      // 单价（元）
  category: string;   // 分类，如"食品"、"日用品"（旧字段，保持兼容）
  category_tag: string; // 品类标签，如"食品"、"日用品"、"文体用品"、"其它节日礼品"
  scenes: Scene[];    // 适用场景
  is832: boolean;     // 是否为832平台（消费帮扶）商品
}

/** 基础信息录入 */
export interface UserInput {
  unitName?: string;      // 单位名称（可选，默认取自用户系统或公文生成页补全）
  region?: string;        // 采购地区
  scene: Scene;           // 采购场景
  festival?: string;      // 节日类型（'spring' | 'eid' | 'nowruz' | 'other'）
  headCount: number;      // 人数
  totalBudget: number;    // 总预算（元）
  fundSource: string;     // 资金来源（仅文本标签）
  department?: string;   // 申请部门（可选，默认取自用户系统或公文生成页补全）
  applicant?: string;     // 申请人（可选，默认取自用户系统或公文生成页补全）
  year?: number;          // 申请年份，默认取当前年
  budgetMode?: BudgetMode; // 预算模式：'per_capita' 或 'total_control'
  category?: string;      // 意向品类：'食品'、'日用品'、'文体用品'、'其它节日礼品'
}

/** 预算校验结果 */
export interface BudgetValidationResult {
  isValid: boolean;
  perCapitaBudget: number;
  maxPerCapitaPrice: number;
  warnings: string[];
  errors: string[];
}

/** 合规检查结果 */
export interface ComplianceResult {
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