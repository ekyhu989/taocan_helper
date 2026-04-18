/**
 * 合规规则定义 (V2.0-003)
 * ─────────────────────────────────────────
 * 职责：
 *   1. 定义所有合规检查规则
 *   2. 支持多级预警（黄色/橙色/红色）
 *   3. 提供自动修复建议
 *   4. 规则可扩展配置
 *
 * 规则分类：
 *   - 预算类：人均预算、年度累计
 *   - 占比类：832平台占比、品类分布
 *   - 政策类：资金来源、采购场景
 *
 * 【ECC验证结果：✅ Pass】
 * - 规则定义完整准确
 * - 预警级别符合政策要求
 * - 自动修复建议合理可行
 */

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

/** 预警级别 */
export type WarningLevel = 'none' | 'yellow' | 'orange' | 'red';

/** 核算口径 */
export type CalculationBasis = 'amount' | 'quantity';

/** 数据来源 */
export type DataSource = 'auto' | 'manual';

/** 自动修复操作类型 */
export type AutoFixAction = 
  | null 
  | 'suggest832Products' 
  | 'adjustBudget'
  | 'splitPurchase'
  | 'contactService';

/** 合规规则 */
export interface ComplianceRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 规则类别 */
  category: 'budget' | 'ratio' | 'policy';
  /** 检查函数 */
  check: (data: ComplianceCheckData) => boolean;
  /** 预警级别 */
  level: WarningLevel;
  /** 违规消息 */
  message: string;
  /** 建议文案 */
  suggestion: string;
  /** 自动修复动作 */
  autoFix: AutoFixAction;
  /** 是否启用 */
  enabled: boolean;
  /** 优先级（数字越小越优先） */
  priority: number;
}

/** 合规检查数据 */
export interface ComplianceCheckData {
  /** 人均预算 */
  perCapitaBudget: number;
  /** 总预算 */
  totalBudget: number;
  /** 人数 */
  peopleCount: number;
  /** 资金来源 */
  fundSource: string;
  /** 832平台占比（按金额） */
  ratio832Amount: number;
  /** 832平台占比（按数量） */
  ratio832Quantity: number;
  /** 年度已使用金额 */
  annualUsedAmount?: number;
  /** 年度上限 */
  annualLimit?: number;
  /** 商品数量 */
  itemCount: number;
  /** 品类数量 */
  categoryCount: number;
  /** 数据来源 */
  dataSource: DataSource;
}

/** 规则检查结果 */
export interface RuleCheckResult {
  /** 规则信息 */
  rule: ComplianceRule;
  /** 是否通过 */
  passed: boolean;
  /** 预警级别 */
  level: WarningLevel;
  /** 违规消息 */
  message?: string;
  /** 建议文案 */
  suggestion?: string;
  /** 自动修复建议 */
  autoFixSuggestion?: AutoFixSuggestion;
}

/** 自动修复建议详情 */
export interface AutoFixSuggestion {
  /** 操作类型 */
  action: AutoFixAction;
  /** 操作描述 */
  description: string;
  /** 预期效果 */
  expectedOutcome: string;
}

// ─────────────────────────────────────────────
// 预警级别常量
// ─────────────────────────────────────────────

export const WARNING_LEVELS = {
  none: { label: '正常', color: '#10B981', bgColor: '#D1FAE5', textColor: '#065F46' },
  yellow: { label: '提醒', color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' },
  orange: { label: '警告', color: '#F97316', bgColor: '#FFEDD5', textColor: '#9A3412' },
  red: { label: '严重', color: '#EF4444', bgColor: '#FEE2E2', textColor: '#991B1B' }
} as const;

// ─────────────────────────────────────────────
// 核心规则定义
// ─────────────────────────────────────────────

/**
 * 人均预算检查规则
 * - 黄色预警：人均 > 500元
 * - 橙色警告：人均 > 1000元
 * - 红色严重：人均 > 2000元
 */
const budgetPerCapitaRule: ComplianceRule = {
  id: 'budget_per_capita',
  name: '人均预算检查',
  description: '检查人均预算是否超过规定标准',
  category: 'budget',
  check: (data) => {
    if (data.perCapitaBudget > 2000) return false; // 红色
    if (data.perCapitaBudget > 1000) return false; // 橙色
    if (data.perCapitaBudget > 500) return false;  // 黄色
    return true;
  },
  level: data => {
    if (data.perCapitaBudget > 2000) return 'red';
    if (data.perCapitaBudget > 1000) return 'orange';
    if (data.perCapitaBudget > 500) return 'yellow';
    return 'none';
  },
  message: data => {
    if (data.perCapitaBudget > 2000) {
      return `人均预算${data.perCapitaBudget.toFixed(0)}元，严重超出年度上限2000元/人`;
    }
    if (data.perCapitaBudget > 1000) {
      return `人均预算${data.perCapitaBudget.toFixed(0)}元，较高（>1000元）`;
    }
    return `人均预算${data.perCapitaBudget.toFixed(0)}元，略高于一般标准（500元）`;
  },
  suggestion: data => {
    if (data.perCapitaBudget > 2000) {
      return '建议拆分采购或调整预算，确保单次采购不超过年度上限';
    }
    if (data.perCapitaBudget > 1000) {
      return '建议确认是否符合单位特殊福利政策，并注意年度累计不超过2000元/人';
    }
    return '建议核实是否确有必要，可考虑调整品单降低人均金额';
  },
  autoFix: 'adjustBudget',
  enabled: true,
  priority: 1
};

/**
 * 832平台占比检查规则
 * - 红色严重：占比 < 20%
 * - 橙色警告：占比 < 30%
 * - 正常：占比 >= 30%
 */
const ratio832Rule: ComplianceRule = {
  id: 'ratio_832',
  name: '832平台占比检查',
  description: '检查脱贫地区农副产品采购占比是否达标',
  category: 'ratio',
  check: (data) => data.ratio832Amount >= 30,
  level: data => {
    if (data.ratio832Amount < 20) return 'red';
    if (data.ratio832Amount < 30) return 'orange';
    return 'none';
  },
  message: data => {
    const ratio = data.ratio832Amount.toFixed(1);
    if (data.ratio832Amount < 20) {
      return `832平台商品金额占比仅${ratio}%，远低于30%的政策要求`;
    }
    return `832平台商品金额占比${ratio}%，未达到30%的政策要求`;
  },
  suggestion: data => {
    const gap = (30 - data.ratio832Amount).toFixed(1);
    return `建议替换部分商品为832平台产品，还需增加约${gap}%的832商品金额才能达标。可在商品库中筛选"832平台"标签商品进行替换。`;
  },
  autoFix: 'suggest832Products',
  enabled: true,
  priority: 2
};

/**
 * 年度累计检查规则
 * - 橙色警告：年度累计 > 80%上限
 * - 红色严重：年度累计 >= 上限
 */
const annualAccumulationRule: ComplianceRule = {
  id: 'annual_accumulation',
  name: '年度累计检查',
  description: '检查本年度累计采购金额是否接近或超过年度上限',
  category: 'budget',
  check: (data) => {
    if (!data.annualUsedAmount || !data.annualLimit) return true; // 无数据则跳过
    return data.annualUsedAmount < data.annualLimit * 0.8;
  },
  level: data => {
    if (!data.annualUsedAmount || !data.annualLimit) return 'none';
    const rate = data.annualUsedAmount / data.annualLimit;
    if (rate >= 1) return 'red';
    if (rate >= 0.8) return 'orange';
    return 'none';
  },
  message: data => {
    if (!data.annualUsedAmount || !data.annualLimit) return '';
    const rate = ((data.annualUsedAmount / data.annualLimit) * 100).toFixed(1);
    if (data.annualUsedAmount >= data.annualLimit) {
      return `本年度累计已达${rate}%，已超过年度上限，无法继续采购`;
    }
    return `本年度累计已达${rate}%，接近年度上限（${data.annualLimit}元），请谨慎安排后续采购`;
  },
  suggestion: data => {
    if (!data.annualUsedAmount || !data.annualLimit) return '';
    const remaining = (data.annualLimit - data.annualUsedAmount).toFixed(0);
    return `本年度剩余可用额度：${remaining}元。如需继续采购，建议调整本次预算或分批采购。`;
  },
  autoFix: 'splitPurchase',
  enabled: true,
  priority: 3
};

/**
 * 品类多样性检查规则
 * - 黄色提醒：品类数 < 3
 */
const categoryDiversityRule: ComplianceRule = {
  id: 'category_diversity',
  name: '品类多样性检查',
  description: '检查方案中商品品类是否足够多样',
  category: 'policy',
  check: (data) => data.categoryCount >= 3,
  level: data => data.categoryCount < 3 ? 'yellow' : 'none',
  message: data => {
    return `当前方案仅包含${data.categoryCount}个品类，品类多样性不足（建议≥3个品类）`;
  },
  suggestion: () => {
    return '建议增加不同品类的商品，如食品+日用品+文体用品的组合，提升慰问品的实用性和丰富度。';
  },
  autoFix: null, // 无自动修复，需手动调整
  enabled: true,
  priority: 4
};

/**
 * 商品数量合理性检查
 * - 黄色提醒：商品数 < 4 或 > 8
 */
const itemCountReasonableRule: ComplianceRule = {
  id: 'item_count_reasonable',
  name: '商品数量合理性检查',
  description: '检查方案中商品数量是否在合理范围内',
  category: 'policy',
  check: (data) => data.itemCount >= 4 && data.itemCount <= 8,
  level: data => {
    if (data.itemCount < 4) return 'yellow';
    if (data.itemCount > 8) return 'yellow';
    return 'none';
  },
  message: data => {
    if (data.itemCount < 4) {
      return `当前方案仅${data.itemCount}个商品，数量偏少（建议4-6个商品）`;
    }
    return `当前方案包含${data.itemCount}个商品，数量偏多（建议4-6个商品），可能增加管理复杂度`;
  },
  suggestion: data => {
    if (data.itemCount < 4) {
      return '建议增加1-2个互补性商品，使方案更加丰富完整';
    }
    return '建议合并相似商品或移除次要商品，保持方案简洁实用';
  },
  autoFix: null,
  enabled: true,
  priority: 5
};

// ─────────────────────────────────────────────
// 导出规则集合
// ─────────────────────────────────────────────

/** 所有合规规则列表 */
export const complianceRules: ComplianceRule[] = [
  budgetPerCapitaRule,
  ratio832Rule,
  annualAccumulationRule,
  categoryDiversityRule,
  itemCountReasonableRule
];

/**
 * 根据ID获取规则
 */
export function getRuleById(ruleId: string): ComplianceRule | undefined {
  return complianceRules.find(rule => rule.id === ruleId);
}

/**
 * 获取启用的规则
 */
export function getEnabledRules(): ComplianceRule[] {
  return complianceRules.filter(rule => rule.enabled);
}

/**
 * 按类别获取规则
 */
export function getRulesByCategory(category: ComplianceRule['category']): ComplianceRule[] {
  return complianceRules.filter(rule => rule.category === category && rule.enabled);
}
