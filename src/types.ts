/**
 * 核心类型定义
 * AI采购方案生成工具 - 逻辑层类型声明
 */

// ─────────────────────────────────────────────
// 商品库
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// 用户输入
// ─────────────────────────────────────────────

/** 基础信息录入 */
export interface UserInput {
  unitName?: string;      // 单位名称（可选，默认取自用户系统或公文生成页补全）
  region?: string;        // 采购地区
  scene: Scene;           // 采购场景
  festival?: string;      // 节日类型（'spring' | 'eid' | 'nowruz' | 'other'）
  headCount: number;      // 人数
  totalBudget: number;    // 总预算（元）
  fundSource: string;     // 资金来源（仅文本标签）
  department?: string;    // 申请部门（可选，默认取自用户系统或公文生成页补全）
  applicant?: string;     // 申请人（可选，默认取自用户系统或公文生成页补全）
  year?: number;          // 申请年份，默认取当前年
  budgetMode?: BudgetMode; // 预算模式：'per_capita' 或 'total_control'
  category?: string;      // 意向品类：'食品'、'日用品'、'文体用品'、'其它节日礼品'
}

// ─────────────────────────────────────────────
// 预算校验
// ─────────────────────────────────────────────

/** 预算校验结果 */
export interface BudgetValidationResult {
  isValid: boolean;         // 是否通过校验（false = 硬错误，如输入为负）
  perCapita: number;        // 人均预算（元）
  isOverWarn: boolean;      // 是否触发＞500元的黄色提醒
  warnMessage: string | null; // 提醒文案，null = 无需提醒
  errorMessage: string | null; // 错误文案，null = 无硬错误
}

// ─────────────────────────────────────────────
// 品单
// ─────────────────────────────────────────────

/** 品单中的一行商品 */
export interface PurchaseItem {
  product: Product;
  quantity: number;   // 数量（份）
  subtotal: number;   // 小计 = price × quantity
}

/** 品单生成结果 */
export interface ProductListResult {
  items: PurchaseItem[];
  totalAmount: number;      // 实际合计金额
  budgetUsageRate: number;  // 预算使用率（0~1）
  platform832Amount: number; // 832平台商品合计金额
  platform832Rate: number;   // 832商品占比（0~1）
  hint832: string;           // 消费帮扶提示文案
  noMatchWarning?: string;   // 商品库无匹配时的警告文案（可选）
}

// ─────────────────────────────────────────────
// 报告
// ─────────────────────────────────────────────

/** 报告组装结果 */
export interface ReportResult {
  title: string;    // 报告标题
  body: string;     // 完整正文（已填充变量）
  sceneLabel: string; // 场景中文标签
}
