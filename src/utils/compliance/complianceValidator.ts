/**
 * V1.6 任务8：合规测算规则精细化
 * 
 * 功能列表：
 * 1. 832占比核算口径管理（金额占比/数量占比）
 * 2. 预警逻辑固化（500元黄色、2000元橙色、<30%红色）
 * 3. 数据来源区分（自动核算/手动录入）
 * 4. 年末数据锁定机制
 */

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

/** 832占比核算口径 */
export type CalculationBasis = 'amount' | 'quantity';

/** 数据来源 */
export type DataSource = 'auto' | 'manual';

/** 预警级别 */
export type WarningLevel = 'none' | 'yellow' | 'orange' | 'red';

/** 预警规则配置 */
export interface WarningRule {
  level: WarningLevel;
  condition: (value: number, context?: ValidationContext) => boolean;
  message: string;
  backgroundColor: string;
  textColor: string;
}

/** 验证上下文 */
export interface ValidationContext {
  /** 单位人数 */
  headCount: number;
  /** 年度总预算 */
  totalBudget: number;
  /** 已完成金额 */
  completedAmount: number;
  /** 832平台累计金额 */
  platform832Amount: number;
  /** 832平台累计数量（可选） */
  platform832Quantity?: number;
  /** 数据来源 */
  dataSource: DataSource;
  /** 是否已锁定 */
  isLocked: boolean;
  /** 锁定时间（ISO字符串） */
  lockedAt?: string;
  /** 锁定操作人 */
  lockedBy?: string;
}

/** 验证结果 */
export interface ValidationResult {
  /** 是否通过验证 */
  isValid: boolean;
  /** 预警级别 */
  warningLevel: WarningLevel;
  /** 预警消息 */
  warningMessage: string;
  /** 背景颜色（CSS值） */
  backgroundColor: string;
  /** 文字颜色（CSS值） */
  textColor: string;
  /** 详细验证结果 */
  details: {
    /** 人均预算验证结果 */
    perCapita: PerCapitaValidation;
    /** 832占比验证结果 */
    platform832Ratio: Platform832Validation;
    /** 年度完成率验证结果 */
    completionRate: CompletionValidation;
    /** 数据来源验证结果 */
    dataSource: DataSourceValidation;
  };
}

/** 人均预算验证结果 */
export interface PerCapitaValidation {
  /** 人均金额 */
  perCapitaAmount: number;
  /** 是否超过单次预警线（500元） */
  exceedsSingleWarning: boolean;
  /** 是否超过年度强预警线（2000元） */
  exceedsAnnualWarning: boolean;
  /** 验证结果 */
  result: ValidationResultItem;
}

/** 832占比验证结果 */
export interface Platform832Validation {
  /** 当前占比（金额） */
  amountRatio: number;
  /** 当前占比（数量，如果可用） */
  quantityRatio?: number;
  /** 使用的核算口径 */
  calculationBasis: CalculationBasis;
  /** 是否达标（≥30%） */
  isCompliant: boolean;
  /** 验证结果 */
  result: ValidationResultItem;
}

/** 年度完成率验证结果 */
export interface CompletionValidation {
  /** 完成率（0-100） */
  completionRate: number;
  /** 还需采购金额（满足30%要求） */
  remainingAmount: number;
  /** 验证结果 */
  result: ValidationResultItem;
}

/** 数据来源验证结果 */
export interface DataSourceValidation {
  /** 自动核算的数据项数 */
  autoCount: number;
  /** 手动录入的数据项数 */
  manualCount: number;
  /** 是否有手动数据 */
  hasManualData: boolean;
  /** 验证结果 */
  result: ValidationResultItem;
}

/** 验证结果项 */
export interface ValidationResultItem {
  isValid: boolean;
  message: string;
  warningLevel: WarningLevel;
}

// ─────────────────────────────────────────────
// 常量定义
// ─────────────────────────────────────────────

/** 单次人均预警线（元） */
export const SINGLE_WARNING_THRESHOLD = 500;

/** 年度人均强预警线（元） */
export const ANNUAL_WARNING_THRESHOLD = 2000;

/** 832平台占比要求（%） */
export const PLATFORM_832_REQUIREMENT = 30;

/** 默认核算口径：金额占比（新疆官方要求） */
export const DEFAULT_CALCULATION_BASIS: CalculationBasis = 'amount';

/** 预警规则配置 */
export const WARNING_RULES: Record<WarningLevel, WarningRule> = {
  none: {
    level: 'none',
    condition: () => true,
    message: '合规状态正常',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
  },
  yellow: {
    level: 'yellow',
    condition: (perCapitaAmount: number) => perCapitaAmount > SINGLE_WARNING_THRESHOLD,
    message: `单次人均预算超过${SINGLE_WARNING_THRESHOLD}元，请注意控制支出`,
    backgroundColor: '#FFFBE6',
    textColor: '#D48806',
  },
  orange: {
    level: 'orange',
    condition: (perCapitaAmount: number) => perCapitaAmount > ANNUAL_WARNING_THRESHOLD,
    message: `年度人均预算超过${ANNUAL_WARNING_THRESHOLD}元，已超出工会经费标准`,
    backgroundColor: '#FFF2E8',
    textColor: '#FA541C',
  },
  red: {
    level: 'red',
    condition: (ratio: number) => ratio < PLATFORM_832_REQUIREMENT,
    message: `832平台占比未达到${PLATFORM_832_REQUIREMENT}%要求，需增加脱贫地区农副产品采购`,
    backgroundColor: '#FFF1F0',
    textColor: '#CF1322',
  },
};

// ─────────────────────────────────────────────
// 核心验证函数
// ─────────────────────────────────────────────

/**
 * 计算人均预算
 */
export function calculatePerCapita(
  totalBudget: number,
  headCount: number
): PerCapitaValidation {
  const perCapitaAmount = headCount > 0 ? totalBudget / headCount : 0;
  const exceedsSingleWarning = perCapitaAmount > SINGLE_WARNING_THRESHOLD;
  const exceedsAnnualWarning = perCapitaAmount > ANNUAL_WARNING_THRESHOLD;
  
  let warningLevel: WarningLevel = 'none';
  if (exceedsAnnualWarning) {
    warningLevel = 'orange';
  } else if (exceedsSingleWarning) {
    warningLevel = 'yellow';
  }
  
  return {
    perCapitaAmount,
    exceedsSingleWarning,
    exceedsAnnualWarning,
    result: {
      isValid: !exceedsAnnualWarning,
      message: exceedsAnnualWarning 
        ? `年度人均预算${perCapitaAmount.toFixed(2)}元超过${ANNUAL_WARNING_THRESHOLD}元上限`
        : exceedsSingleWarning
        ? `单次人均预算${perCapitaAmount.toFixed(2)}元超过${SINGLE_WARNING_THRESHOLD}元预警线`
        : `人均预算${perCapitaAmount.toFixed(2)}元，符合要求`,
      warningLevel,
    },
  };
}

/**
 * 计算832平台占比
 */
export function calculatePlatform832Ratio(
  platform832Amount: number,
  totalBudget: number,
  platform832Quantity?: number,
  totalQuantity?: number,
  calculationBasis: CalculationBasis = DEFAULT_CALCULATION_BASIS
): Platform832Validation {
  // 金额占比
  const amountRatio = totalBudget > 0 ? (platform832Amount / totalBudget) * 100 : 0;
  
  // 数量占比（如果数据可用）
  let quantityRatio: number | undefined;
  if (calculationBasis === 'quantity' && totalQuantity && totalQuantity > 0) {
    quantityRatio = platform832Quantity ? (platform832Quantity / totalQuantity) * 100 : 0;
  }
  
  const usedRatio = calculationBasis === 'quantity' && quantityRatio !== undefined 
    ? quantityRatio 
    : amountRatio;
    
  const isCompliant = usedRatio >= PLATFORM_832_REQUIREMENT;
  
  return {
    amountRatio,
    quantityRatio,
    calculationBasis,
    isCompliant,
    result: {
      isValid: isCompliant,
      message: isCompliant
        ? `832平台${calculationBasis === 'quantity' ? '数量' : '金额'}占比${usedRatio.toFixed(1)}%，符合≥${PLATFORM_832_REQUIREMENT}%要求`
        : `832平台${calculationBasis === 'quantity' ? '数量' : '金额'}占比${usedRatio.toFixed(1)}%，未达到${PLATFORM_832_REQUIREMENT}%要求`,
      warningLevel: isCompliant ? 'none' : 'red',
    },
  };
}

/**
 * 计算年度完成率
 */
export function calculateCompletionRate(
  completedAmount: number,
  totalBudget: number
): CompletionValidation {
  const completionRate = totalBudget > 0 ? (completedAmount / totalBudget) * 100 : 0;
  const remainingAmount = totalBudget * (PLATFORM_832_REQUIREMENT / 100) - completedAmount;
  
  let warningLevel: WarningLevel = 'none';
  if (completionRate < PLATFORM_832_REQUIREMENT) {
    warningLevel = 'red';
  } else if (completionRate < 100) {
    warningLevel = 'yellow';
  }
  
  return {
    completionRate,
    remainingAmount: Math.max(remainingAmount, 0),
    result: {
      isValid: completionRate >= PLATFORM_832_REQUIREMENT,
      message: completionRate >= PLATFORM_832_REQUIREMENT
        ? `年度完成率${completionRate.toFixed(1)}%，已达到最低${PLATFORM_832_REQUIREMENT}%要求`
        : `年度完成率${completionRate.toFixed(1)}%，还需采购¥${remainingAmount.toFixed(2)}元以满足${PLATFORM_832_REQUIREMENT}%要求`,
      warningLevel,
    },
  };
}

/**
 * 验证数据来源
 */
export function validateDataSource(
  dataSource: DataSource,
  manualCount: number = 0,
  autoCount: number = 0
): DataSourceValidation {
  const hasManualData = manualCount > 0;
  const totalCount = manualCount + autoCount;
  
  return {
    autoCount,
    manualCount,
    hasManualData,
    result: {
      isValid: true,
      message: hasManualData
        ? `数据包含${manualCount}项手动录入和${autoCount}项自动核算`
        : '所有数据均为系统自动核算',
      warningLevel: 'none',
    },
  };
}

/**
 * 检查数据锁定状态
 */
export function checkLockStatus(
  isLocked: boolean,
  lockedAt?: string,
  lockedBy?: string
): { isLocked: boolean; lockedAt?: string; lockedBy?: string; canEdit: boolean } {
  return {
    isLocked,
    lockedAt,
    lockedBy,
    canEdit: !isLocked,
  };
}

/**
 * 锁定数据
 */
export function lockData(
  lockedBy: string
): { lockedAt: string; lockedBy: string; success: boolean } {
  const lockedAt = new Date().toISOString();
  
  // 在实际应用中，这里会将锁定状态保存到数据库或localStorage
  try {
    localStorage.setItem('compliance_data_locked', 'true');
    localStorage.setItem('compliance_locked_at', lockedAt);
    localStorage.setItem('compliance_locked_by', lockedBy);
    
    return {
      lockedAt,
      lockedBy,
      success: true,
    };
  } catch (error) {
    console.error('锁定数据失败:', error);
    return {
      lockedAt,
      lockedBy,
      success: false,
    };
  }
}

/**
 * 解锁数据
 */
export function unlockData(
  requireConfirmation: boolean = true
): { success: boolean; message: string } {
  if (requireConfirmation) {
    // 在实际应用中，这里会请求用户确认
    console.log('请求解锁确认...');
  }
  
  try {
    localStorage.removeItem('compliance_data_locked');
    localStorage.removeItem('compliance_locked_at');
    localStorage.removeItem('compliance_locked_by');
    
    return {
      success: true,
      message: '数据已解锁',
    };
  } catch (error) {
    console.error('解锁数据失败:', error);
    return {
      success: false,
      message: '解锁失败',
    };
  }
}

/**
 * 综合验证函数
 */
export function validateCompliance(context: ValidationContext): ValidationResult {
  // 1. 验证人均预算
  const perCapitaValidation = calculatePerCapita(
    context.totalBudget,
    context.headCount
  );
  
  // 2. 验证832平台占比
  const platform832Validation = calculatePlatform832Ratio(
    context.platform832Amount,
    context.totalBudget,
    context.platform832Quantity,
    undefined, // totalQuantity 需要额外传入
    'amount' // 默认使用金额占比
  );
  
  // 3. 验证年度完成率
  const completionValidation = calculateCompletionRate(
    context.completedAmount,
    context.totalBudget
  );
  
  // 4. 验证数据来源
  const dataSourceValidation = validateDataSource(
    context.dataSource,
    context.dataSource === 'manual' ? 1 : 0,
    context.dataSource === 'auto' ? 1 : 0
  );
  
  // 5. 确定最高预警级别
  const warningLevels = [
    perCapitaValidation.result.warningLevel,
    platform832Validation.result.warningLevel,
    completionValidation.result.warningLevel,
  ];
  
  const highestWarningLevel = warningLevels.reduce((highest, current) => {
    const priority = { 'red': 3, 'orange': 2, 'yellow': 1, 'none': 0 };
    return priority[current] > priority[highest] ? current : highest;
  }, 'none' as WarningLevel);
  
  const warningRule = WARNING_RULES[highestWarningLevel];
  
  return {
    isValid: highestWarningLevel === 'none' || highestWarningLevel === 'yellow',
    warningLevel: highestWarningLevel,
    warningMessage: warningRule.message,
    backgroundColor: warningRule.backgroundColor,
    textColor: warningRule.textColor,
    details: {
      perCapita: perCapitaValidation,
      platform832Ratio: platform832Validation,
      completionRate: completionValidation,
      dataSource: dataSourceValidation,
    },
  };
}

/**
 * 切换832占比核算口径
 */
export function toggleCalculationBasis(
  currentBasis: CalculationBasis
): CalculationBasis {
  return currentBasis === 'amount' ? 'quantity' : 'amount';
}

/**
 * 获取核算口径说明
 */
export function getBasisDescription(basis: CalculationBasis): string {
  return basis === 'amount' 
    ? '金额占比（新疆审计标准）' 
    : '数量占比（可选审计口径）';
}

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

/**
 * 格式化金额显示
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * 格式化百分比显示
 */
export function formatPercentage(ratio: number): string {
  return `${ratio.toFixed(1)}%`;
}

/**
 * 获取数据来源标签样式
 */
export function getDataSourceStyle(source: DataSource): {
  className: string;
  label: string;
} {
  if (source === 'manual') {
    return {
      className: 'text-blue-600',
      label: '手动',
    };
  }
  
  return {
    className: 'text-gray-900',
    label: '自动',
  };
}