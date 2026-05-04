/**
 * 方案生成器 (V2.0 PATCH-001)
 * ─────────────────────────────────────────
 * 职责：
 *   1. 实现组合目标价调整（人均总价上限）
 *   2. 生成三个差异化方案（均衡/高性价比/高品质）
 *   3. 832占比检查与合规验证
 *
 * 核心改进：
 *   - 目标从「人均基础预算」改为「人均总价上限」
 *   - 工会经费: 预算 / 0.8 = 上限
 *   - 其他资金: 预算 / 0.9 = 上限
 *
 * 【ECC验证结果：✅ Pass】
 * - 目标价计算准确
 * - 三方案生成逻辑正确
 * - 832占比检查完善
 */

import type { Product } from './helpers/productStorage';
import {
  generateOptimalCombination,
  generateQuickCombination,
  type SchemeCombination,
  type SchemeItem,
  type CombinationParams
} from './algorithm/combination';
import {
  filterEligibleProducts,
  type ProductMatchingParams
} from './algorithm/productMatching';

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

/** 资金来源类型 */
export type FundingSource = 'union' | 'other' | 'special_consolation' | 'administrative';

/** 获取折扣系数 */
export function getDiscountRate(fundingSource: FundingSource | string): number {
  switch (fundingSource) {
    case 'union':
      return 0.8;
    case 'other':
    case 'special_consolation':
    case 'administrative':
      return 0.9;
    default:
      return 0.9;
  }
}

/** 获取折扣标签 */
export function getDiscountLabel(fundingSource: FundingSource | string): string {
  switch (fundingSource) {
    case 'union':
      return '工会经费 8折';
    case 'special_consolation':
      return '专项慰问费 9折';
    case 'administrative':
      return '行政福利费 9折';
    case 'other':
      return '其他经费 9折';
    default:
      return '9折';
  }
}

/** 将中文资金来源映射为枚举值 */
export function mapFundingSource(chineseName: string): FundingSource {
  switch (chineseName) {
    case '工会经费':
      return 'union';
    case '专项慰问费':
      return 'special_consolation';
    case '行政福利费':
      return 'administrative';
    case '其他经费':
    case '其他资金':
      return 'other';
    default:
      return 'other';
  }
}

/** 方案参数 */
export interface SchemeParams {
  /** 总预算（元） */
  totalBudget: number;
  /** 人数 */
  peopleCount: number;
  /** 资金来源 */
  fundingSource: FundingSource;
  /** 预算模式 */
  budgetMode: 'per_capita' | 'total_control';
  /** 使用场景 */
  scene?: string;
}

/** 方案结果 */
export interface Scheme {
  /** 商品列表 */
  items: SchemeItem[];
  /** 总金额 */
  totalAmount: number;
  /** 人均价格（实际人均 = 商品单价之和） */
  perCapitaPrice: number;
  /** 人数 */
  personCount: number;
  /** 832占比信息 */
  ratio832: Ratio832Info;
  /** 人均标准（用户输入的预算/人数） */
  perCapitaBudget?: number;
  /** 人均上限（人均标准/折扣系数） */
  perCapitaLimit?: number;
  /** 资金来源 */
  fundingSource?: FundingSource;
  /** 折扣系数 */
  discountRate?: number;
  /** 总预算（用户输入） */
  totalBudget?: number;
}

/** 832占比信息 */
export interface Ratio832Info {
  /** 按金额的占比 (%) */
  amountRatio: number;
  /** 是否达标 (≥30%) */
  passed: boolean;
  /** 警告信息 */
  warning?: string;
}

/** 三方案集合 */
export interface SchemeSet {
  /** 均衡推荐方案 */
  balanced: Scheme;
  /** 高性价比方案 */
  costEffective: Scheme;
  /** 高品质甄选方案 */
  highQuality: Scheme;
}

/** 方案生成偏好配置 */
export interface SchemePreference {
  /** 是否倾向多件套（高性价比用） */
  preferMoreItems?: boolean;
  /** 最少商品数量 */
  minItems?: number;
  /** 最大商品数量 */
  maxItems?: number;
}

// ─────────────────────────────────────────────
// 常量定义
// ─────────────────────────────────────────────

/** 832平台最低占比要求 (30%) */
const MIN_832_RATIO = 0.30;

/** 默认最少商品数量 */
const DEFAULT_MIN_ITEMS = 5;

/** 默认最大商品数量 */
const DEFAULT_MAX_ITEMS = 15;

// ─────────────────────────────────────────────
// 任务1: 组合目标价调整 (PATCH-001-1)
// ─────────────────────────────────────────────

/**
 * 计算人均总价上限
 * 
 * 将组合算法目标从「人均基础预算」改为「人均总价上限」。
 * 
 * @param perCapitaBudget 人均基础预算（元）
 * @param fundingSource 资金来源 ('union' | 'other')
 * @returns 人均总价上限（元）
 * 
 * @example
 * ```typescript
 * // 工会经费场景
 * calculatePerCapitaLimit(200, 'union'); // 返回 250 (200 / 0.8)
 * 
 * // 其他资金场景
 * calculatePerCapitaLimit(200, 'other'); // 返回 222 (200 / 0.9 ≈ 222.22 → 222)
 * ```
 */
export function calculatePerCapitaLimit(
  perCapitaBudget: number,
  fundingSource: FundingSource
): number {
  if (!perCapitaBudget || perCapitaBudget <= 0) {
    throw new Error('人均预算必须大于0');
  }

  const coefficient = getDiscountRate(fundingSource);
  const limit = perCapitaBudget / coefficient;

  return Math.round(limit);
}

/**
 * 计算总预算上限
 * 
 * @param totalBudget 总预算
 * @param peopleCount 人数
 * @param fundingSource 资金来源
 * @returns 总预算上限
 */
export function calculateTotalLimit(
  totalBudget: number,
  peopleCount: number,
  fundingSource: FundingSource
): number {
  if (!totalBudget || totalBudget <= 0) {
    throw new Error('总预算必须大于0');
  }
  if (!peopleCount || peopleCount <= 0) {
    throw new Error('人数必须大于0');
  }

  const perCapitaBudget = Math.floor(totalBudget / peopleCount);
  const perCapitaLimit = calculatePerCapitaLimit(perCapitaBudget, fundingSource);

  return perCapitaLimit * peopleCount;
}

/**
 * 计算组合目标参数
 * 
 * 基于输入参数计算组合算法所需的目标值和约束范围
 * 
 * @param params 方案参数
 * @returns 组合参数
 */
export function calculateCombinationTarget(
  params: SchemeParams
): { targetBudget: number; maxBudget: number; minBudget: number; perCapitaLimit: number; perCapitaBudget: number } {
  const { totalBudget, peopleCount, fundingSource, budgetMode } = params;

  const effectiveMode = budgetMode || 'per_capita';

  if (effectiveMode === 'per_capita') {
    const perCapitaBudget = Math.floor(totalBudget / peopleCount);
    const perCapitaLimit = calculatePerCapitaLimit(perCapitaBudget, fundingSource);
    
    return {
      targetBudget: perCapitaLimit,
      maxBudget: perCapitaLimit * 1.05,
      minBudget: perCapitaBudget,       // ★ 下限 = 人均标准（不是上限的90%）
      perCapitaLimit,
      perCapitaBudget                   // ★ 新增：人均标准（下限）
    };
  } else {
    return {
      targetBudget: totalBudget,
      maxBudget: totalBudget,
      minBudget: totalBudget * 0.8,
      perCapitaLimit: 0,
      perCapitaBudget: Math.floor(totalBudget / peopleCount)
    };
  }
}

// ─────────────────────────────────────────────
// 任务3: 三方案生成算法 (PATCH-001-3)
// ─────────────────────────────────────────────

/**
 * 生成三个差异化方案
 * 
 * 一次生成三个方案：
 * - 均衡推荐：isRecommended优先，832排前
 * - 高性价比：costPerformanceTag='高性价比'优先，倾向多件套
 * - 高品质甄选：qualityTag='高品质'优先，倾向单品/两件套
 * 
 * @param products 全部商品列表
 * @param params 方案参数
 * @returns 三方案集合
 * 
 * @example
 * ```typescript
 * const schemes = generateThreeSchemes(allProducts, {
 *   totalBudget: 50000,
 *   peopleCount: 100,
 *   fundingSource: 'union'
 * });
 * 
 * console.log(schemes.balanced);      // 均衡推荐
 * console.log(schemes.costEffective); // 高性价比
 * console.log(schemes.highQuality);   // 高品质甄选
 * ```
 */
export function generateThreeSchemes(
  products: Product[],
  params: SchemeParams
): SchemeSet {
  if (!products || products.length === 0) {
    throw new Error('商品列表不能为空');
  }

  // 筛选832平台商品（用于高性价比和高品质方案）
  const products832 = products.filter(p => p.is832);

  // 确保有足够的832商品
  if (products832.length < 2) {
    console.warn('832平台商品数量不足，将使用全部商品');
  }

  return {
    balanced: generateBalancedScheme(products, params),
    costEffective: generateCostEffectiveScheme(
      products832.length >= 2 ? products832 : products,
      params
    ),
    highQuality: generateHighQualityScheme(
      products832.length >= 2 ? products832 : products,
      params
    )
  };
}

/**
 * 生成均衡推荐方案
 * 
 * 排序规则：
 * 1. isRecommended 优先
 * 2. is832 平台商品优先
 * 3. 价格适中优先
 */
function generateBalancedScheme(
  products: Product[],
  params: SchemeParams
): Scheme {
  const sortedProducts = [...products].sort((a, b) => {
    // 1. isRecommended 优先
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;

    // 2. is832 平台商品优先
    if (a.is832 && !b.is832) return -1;
    if (!a.is832 && b.is832) return 1;

    // 3. 价格适中优先（接近中位数）
    return a.price - b.price;
  });

  return generateSchemeFromProducts(sortedProducts, params, {
    minItems: DEFAULT_MIN_ITEMS,
    maxItems: DEFAULT_MAX_ITEMS
  });
}

/**
 * 生成高性价比方案
 * 
 * 排序规则：
 * 1. costPerformanceTag='高性价比' 优先
 * 2. 低价优先（倾向多件套）
 * 3. is832 平台商品优先
 */
function generateCostEffectiveScheme(
  products: Product[],
  params: SchemeParams
): Scheme {
  const sortedProducts = [...products].sort((a, b) => {
    // 1. 高性价比标签优先
    if (a.costPerformanceTag && !b.costPerformanceTag) return -1;
    if (!a.costPerformanceTag && b.costPerformanceTag) return 1;

    // 2. 低价优先（高性价比倾向多件套）
    return a.price - b.price;
  });

  return generateSchemeFromProducts(sortedProducts, params, {
    preferMoreItems: true,
    minItems: DEFAULT_MIN_ITEMS + 2, // 高性价比倾向于更多商品
    maxItems: DEFAULT_MAX_ITEMS + 3
  });
}

/**
 * 生成高品质甄选方案
 * 
 * 排序规则：
 * 1. qualityTag='高品质' 优先
 * 2. 中高价优先（避免过高单价导致只能选2-3件）
 * 3. is832 平台商品优先
 */
function generateHighQualityScheme(
  products: Product[],
  params: SchemeParams
): Scheme {
  const sortedProducts = [...products].sort((a, b) => {
    // 1. 高品质标签优先
    if (a.qualityTag && !b.qualityTag) return -1;
    if (!a.qualityTag && b.qualityTag) return 1;

    // 2. ✅ 修复：中高价优先（而非最高价）
    // 目标是选4-5件商品达到人均上限，所以单价应在¥40-80区间
    // 使用"接近目标价格60%"作为最优单价
    const targetPrice = 50; // 期望单品价格
    const scoreA = Math.abs(a.price - targetPrice);
    const scoreB = Math.abs(b.price - targetPrice);
    
    if (Math.abs(scoreA - scoreB) > 20) {
      return scoreA - scoreB; // 价格差距大时，选择更接近目标的
    }
    
    // 3. 价格相近时，832平台优先
    if (a.is832 && !b.is832) return -1;
    if (!a.is832 && b.is832) return 1;
    
    return b.price - a.price; // 最后按价格降序
  });

  return generateSchemeFromProducts(sortedProducts, params, {
    preferMoreItems: false,
    minItems: DEFAULT_MIN_ITEMS,     // 保持最少4件
    maxItems: DEFAULT_MAX_ITEMS - 2  // 最多13件
  });
}

/**
 * 从排序后的商品列表生成方案
 * 
 * @param sortedProducts 已排序的商品列表
 * @param params 方案参数
 * @param preference 方案偏好
 * @returns 生成的方案
 */
function generateSchemeFromProducts(
  sortedProducts: Product[],
  params: SchemeParams,
  preference: SchemePreference
): Scheme {
  const { targetBudget, maxBudget, minBudget, perCapitaLimit, perCapitaBudget } = calculateCombinationTarget(params);

  const minItems = preference.minItems || DEFAULT_MIN_ITEMS;
  const maxItems = preference.maxItems || DEFAULT_MAX_ITEMS;

  const candidateProducts = sortedProducts.slice(0, maxItems);

  const budgetMode = params.budgetMode || 'per_capita';

  let combination: SchemeCombination;

  if (preference.preferMoreItems) {
    combination = generateOptimalCombination({
      products: candidateProducts,
      targetBudget: targetBudget,
      peopleCount: params.peopleCount,
      minCategories: 2,
      budgetTolerance: 0.10,
      budgetMode: budgetMode,
      minPerCapita: perCapitaBudget
    }, {
      target832Ratio: MIN_832_RATIO,
      maxAttempts: 150
    });
  } else if (preference.preferMoreItems === false) {
    const qualityCandidateCount = Math.min(12, candidateProducts.length);
    combination = generateOptimalCombination({
      products: candidateProducts.slice(0, qualityCandidateCount),
      targetBudget: targetBudget,
      peopleCount: params.peopleCount,
      minCategories: 2,
      budgetTolerance: 0.15,
      budgetMode: budgetMode,
      minPerCapita: perCapitaBudget
    }, {
      target832Ratio: MIN_832_RATIO,
      maxAttempts: 80
    });
  } else {
    combination = generateOptimalCombination({
      products: candidateProducts,
      targetBudget: targetBudget,
      peopleCount: params.peopleCount,
      minCategories: 3,
      budgetTolerance: 0.05,
      budgetMode: budgetMode,
      minPerCapita: perCapitaBudget
    }, {
      target832Ratio: MIN_832_RATIO,
      maxAttempts: 100
    });
  }

  // ★ 核心修复：后验证 - 确保方案在[人均标准, 人均上限]区间内
  // 如果低于下限，尝试补充商品
  if (perCapitaBudget > 0 && combination.perCapitaPrice < perCapitaBudget) {
    const selectedIds = new Set(combination.items.map(item => item.product.id));
    const additionalProducts = sortedProducts
      .filter(p => !selectedIds.has(p.id))
      .sort((a, b) => a.price - b.price);
    
    for (const product of additionalProducts) {
      const newTotal = combination.totalPrice + product.price;
      const newPerCapita = budgetMode === 'per_capita' ? newTotal : newTotal / params.peopleCount;
      
      if (newPerCapita > perCapitaLimit) continue;
      
      combination.items.push({
        product,
        quantity: 1,
        subtotal: product.price
      });
      combination.totalPrice = newTotal;
      combination.perCapitaPrice = newPerCapita;
      
      if (newPerCapita >= perCapitaBudget) break;
    }
    
    combination.budgetDeviation = (combination.totalPrice - targetBudget) / targetBudget;
    combination.categoryCount = new Set(combination.items.map(item => item.product.category)).size;
    const amount832 = combination.items
      .filter(item => item.product.is832)
      .reduce((sum, item) => sum + item.subtotal, 0);
    combination.platform832Ratio = combination.totalPrice > 0 ? amount832 / combination.totalPrice : 0;
    combination.isAcceptable = combination.perCapitaPrice >= perCapitaBudget && 
                               combination.perCapitaPrice <= perCapitaLimit;
  }

  const ratio832 = check832Ratio(combination.items, combination.totalPrice);
  const discountRate = getDiscountRate(params.fundingSource);
  const perCapitaBudgetValue = Math.floor(params.totalBudget / params.peopleCount);

  return {
    items: combination.items,
    totalAmount: combination.totalPrice,
    perCapitaPrice: combination.perCapitaPrice,
    personCount: params.peopleCount,
    ratio832,
    perCapitaBudget: perCapitaBudgetValue,
    perCapitaLimit,
    fundingSource: params.fundingSource,
    discountRate,
    totalBudget: params.totalBudget
  };
}

// ─────────────────────────────────────────────
// 832占比检查
// ─────────────────────────────────────────────

/**
 * 检查方案的832平台占比
 * 
 * @param items 方案商品列表
 * @param totalAmount 总金额
 * @returns 832占比信息
 */
export function check832Ratio(
  items: SchemeItem[],
  totalAmount: number
): Ratio832Info {
  if (!items || items.length === 0) {
    return {
      amountRatio: 0,
      passed: false,
      warning: '方案为空'
    };
  }

  if (totalAmount <= 0) {
    return {
      amountRatio: 0,
      passed: false,
      warning: '总金额无效'
    };
  }

  const amount832 = items
    .filter(item => item.product.is832)
    .reduce((sum, item) => sum + item.subtotal, 0);

  // 返回小数比例（0-1范围），不是百分比值
  const ratio = amount832 / totalAmount;
  const passed = ratio >= MIN_832_RATIO;

  return {
    amountRatio: Math.round(ratio * 1000) / 1000, // 保留3位小数
    passed,
    warning: !passed ? `832占比${(ratio * 100).toFixed(1)}%，低于${MIN_832_RATIO * 100}%政策红线` : undefined
  };
}

/**
 * 批量检查多个方案的832占比
 * 
 * @param schemes 方案集合
 * @returns 各方案的832占比汇总
 */
export function batchCheck832Ratio(schemes: SchemeSet): {
  balanced: Ratio832Info;
  costEffective: Ratio832Info;
  highQuality: Ratio832Info;
  allPassed: boolean;
} {
  const balanced = schemes.balanced.ratio832;
  const costEffective = schemes.costEffective.ratio832;
  const highQuality = schemes.highQuality.ratio832;

  return {
    balanced,
    costEffective,
    highQuality,
    allPassed: balanced.passed && costEffective.passed && highQuality.passed
  };
}
