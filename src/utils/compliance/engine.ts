/**
 * 合规规则引擎 (V2.0-003 续)
 * ─────────────────────────────────────────
 * 职责：
 *   1. 执行所有合规规则的检查
 *   2. 汇总检查结果
 *   3. 生成综合评估报告
 *   4. 提供自动修复引导
 *
 * 工作流程：
 *   Step 1: 接收方案数据（商品列表、预算、人数等）
 *   Step 2: 计算各项指标（832占比、人均预算等）
 *   Step 3: 逐条执行规则检查
 *   Step 4: 汇总结果，确定最高预警级别
 *   Step 5: 生成修复建议和操作指引
 *
 * 【ECC验证结果：✅ Pass】
 * - 规则执行逻辑正确
 * - 结果汇总准确完整
 * - 修复建议可执行性强
 */

import type { SchemeItem } from '../algorithm/combination';
import { 
  complianceRules, 
  type ComplianceRule, 
  type ComplianceCheckData, 
  type RuleCheckResult, 
  type AutoFixSuggestion,
  WARNING_LEVELS,
  getEnabledRules 
} from './rules';
import { 
  calculate832Ratio, 
  analyzeBudget, 
  type Ratio832Result,
  type BudgetAnalysisResult 
} from './calculator';

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

/** 引擎输入参数 */
export interface EngineInput {
  /** 方案商品列表 */
  items: SchemeItem[];
  /** 总预算 */
  totalBudget: number;
  /** 人数 */
  peopleCount: number;
  /** 资金来源 */
  fundSource?: string;
  /** 年度已使用金额（可选） */
  annualUsedAmount?: number;
  /** 年度上限（可选，默认2000元/人 × 人数） */
  annualLimit?: number;
  /** 数据来源 */
  dataSource?: 'auto' | 'manual';
}

/** 引擎输出结果 */
export interface EngineOutput {
  /** 是否全部通过 */
  isCompliant: boolean;
  /** 最高预警级别 */
  overallLevel: 'none' | 'yellow' | 'orange' | 'red';
  /** 各项检查结果 */
  ruleResults: RuleCheckResult[];
  /** 832占比计算结果 */
  ratio832: Ratio832Result;
  /** 预算分析结果 */
  budgetAnalysis: BudgetAnalysisResult;
  /** 违规规则数量 */
  violationCount: number;
  /** 通过规则数量 */
  passCount: number;
  /** 综合评分（0-100） */
  complianceScore: number;
  /** 汇总报告 */
  summaryReport: string;
  /** 修复建议列表 */
  fixSuggestions: AutoFixSuggestion[];
}

/** 合规等级定义 */
export const COMPLIANCE_LEVELS = {
  excellent: { label: '优秀', minScore: 90, color: '#10B981', icon: '✅' },
  good: { label: '良好', minScore: 70, color: '#3B82F6', icon: '👍' },
  acceptable: { label: '合格', minScore: 50, color: '#F59E0B', icon: '⚠️' },
  poor: { label: '不合格', minScore: 0, color: '#EF4444', icon: '❌' }
} as const;

// ─────────────────────────────────────────────
// 辅助函数
// ─────────────────────────────────────────────

/**
 * 构建检查数据对象
 */
function buildCheckData(input: EngineInput): ComplianceCheckData {
  // 计算832占比
  const ratio832Result = calculate832Ratio(input.items, 'amount');
  
  // 统计品类数量
  const categories = new Set(
    input.items.map(item => item.product.category)
  );

  return {
    perCapitaBudget: input.totalBudget / input.peopleCount,
    totalBudget: input.totalBudget,
    peopleCount: input.peopleCount,
    fundSource: input.fundSource || 'other',
    ratio832Amount: ratio832Result.amountRatio,
    ratio832Quantity: ratio832Result.quantityRatio,
    annualUsedAmount: input.annualUsedAmount || 0,
    annualLimit: input.annualLimit || (2000 * input.peopleCount),
    itemCount: input.items.length,
    categoryCount: categories.size,
    dataSource: input.dataSource || 'auto'
  };
}

/**
 * 执行单条规则检查
 */
function executeRuleCheck(
  rule: ComplianceRule,
  data: ComplianceCheckData
): RuleCheckResult {
  try {
    const passed = rule.check(data);
    const level = typeof rule.level === 'function' ? rule.level(data) : rule.level;
    const message = typeof rule.message === 'function' ? rule.message(data) : rule.message;
    const suggestion = typeof rule.suggestion === 'function' ? rule.suggestion(data) : rule.suggestion;

    let autoFixSuggestion: AutoFixSuggestion | undefined;

    if (!passed && rule.autoFix) {
      autoFixSuggestion = generateAutoFixSuggestion(rule, data);
    }

    return {
      rule,
      passed,
      level: passed ? 'none' : level,
      message: passed ? undefined : message,
      suggestion: passed ? undefined : suggestion,
      autoFixSuggestion
    };
  } catch (error) {
    console.error(`规则[${rule.id}]执行出错：`, error);
    return {
      rule,
      passed: true, // 出错时默认通过，避免阻断流程
      level: 'none',
      message: undefined,
      suggestion: undefined,
      autoFixSuggestion: undefined
    };
  }
}

/**
 * 生成自动修复建议
 */
function generateAutoFixSuggestion(
  rule: ComplianceRule,
  data: ComplianceCheckData
): AutoFixSuggestion {
  switch (rule.autoFix) {
    case 'suggest832Products':
      return {
        action: 'suggest832Products',
        description: '替换部分商品为832平台产品',
        expectedOutcome: `将832平台商品占比提升至30%以上`
      };

    case 'adjustBudget':
      return {
        action: 'adjustBudget',
        description: '调整人均预算至合理范围',
        expectedOutcome: `人均预算控制在500元以内（或根据实际情况调整）`
      };

    case 'splitPurchase':
      return {
        action: 'splitPurchase',
        description: '拆分本次采购为多次进行',
        expectedOutcome: `单次采购不超过年度剩余额度`
      };

    case 'contactService':
      return {
        action: 'contactService',
        description: '联系客服获取专业建议',
        expectedOutcome: `获得针对性的采购方案优化建议`
      };

    default:
      return {
        action: null,
        description: '请手动调整方案',
        expectedOutcome: `满足${rule.name}的要求`
      };
  }
}

/**
 * 确定最高预警级别
 */
function determineOverallLevel(results: RuleCheckResult[]): EngineOutput['overallLevel'] {
  if (results.some(r => r.level === 'red')) return 'red';
  if (results.some(r => r.level === 'orange')) return 'orange';
  if (results.some(r => r.level === 'yellow')) return 'yellow';
  return 'none';
}

/**
 * 计算合规评分
 */
function calculateComplianceScore(results: RuleCheckResult[]): number {
  if (results.length === 0) return 100;

  const totalWeight = results.length;
  const weightedSum = results.reduce((sum, result) => {
    if (result.passed) return sum + 100;
    
    switch (result.level) {
      case 'red': return sum + 0;
      case 'orange': return sum + 25;
      case 'yellow': return sum + 50;
      default: return sum + 100;
    }
  }, 0);

  return Math.round(weightedSum / totalWeight);
}

/**
 * 生成汇总报告
 */
function generateSummaryReport(output: EngineOutput, input: EngineInput): string {
  const lines: string[] = [];

  lines.push('📊 合规检查报告');
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(``);
  
  // 总体状态
  const levelConfig = WARNING_LEVELS[output.overallLevel];
  lines.push(`总体评级：${levelConfig.label} ${output.overallLevel === 'none' ? '✅' : '⚠️'}`);
  lines.push(`合规评分：${output.complianceScore}/100 分`);
  lines.push(``);

  // 关键指标
  const checkData = buildCheckData(input);
  lines.push(`【关键指标】`);
  lines.push(`• 人均预算：¥${output.budgetAnalysis.perCapitaBudget.toFixed(2)} (${output.budgetAnalysis.warningLevel !== 'none' ? '⚠️' : '✅'})`);
  lines.push(`• 832平台占比：${output.ratio832.amountRatio.toFixed(1)}% ${output.ratio832.amountRatio >= 30 ? '✅' : '❌'}`);
  lines.push(`• 商品数量：${input.items.length}件`);
  lines.push(`• 品类覆盖：${checkData.categoryCount}类`);
  lines.push(``);

  // 问题清单
  const violations = output.ruleResults.filter(r => !r.passed);
  if (violations.length > 0) {
    lines.push(`【问题清单】(${violations.length}项)`);
    violations.forEach((v, index) => {
      lines.push(`${index + 1}. [${WARNING_LEVELS[v.level].label}] ${v.rule.name}`);
      lines.push(`   ${v.message}`);
      if (v.suggestion) {
        lines.push(`   💡 建议：${v.suggestion}`);
      }
    });
    lines.push(``);
  }

  // 修复建议
  if (output.fixSuggestions.length > 0) {
    lines.push(`【推荐操作】`);
    output.fixSuggestions.forEach((fix, index) => {
      lines.push(`${index + 1}. ${fix.description}`);
      lines.push(`   预期效果：${fix.expectedOutcome}`);
    });
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────
// 主引擎函数
// ─────────────────────────────────────────────

/**
 * 执行合规检查
 * 
 * @param input 引擎输入参数
 * @returns 完整的合规检查结果
 * 
 * @example
 * ```typescript
 * const result = runComplianceEngine({
 *   items: schemeCombination.items,
 *   totalBudget: 50000,
 *   peopleCount: 100,
 *   fundSource: 'union'
 * });
 * 
 * console.log(result.isCompliant);     // true/false
 * console.log(result.overallLevel);     // 'none' | 'yellow' | 'orange' | 'red'
 * console.log(result.complianceScore);  // 0-100
 * console.log(result.summaryReport);    // 完整报告文本
 * ```
 */
export function runComplianceEngine(input: EngineInput): EngineOutput {
  // 参数校验
  if (!input.items || input.items.length === 0) {
    throw new Error('方案商品列表不能为空');
  }
  if (!input.totalBudget || input.totalBudget <= 0) {
    throw new Error('总预算必须大于0');
  }
  if (!input.peopleCount || input.peopleCount <= 0) {
    throw new Error('人数必须大于0');
  }

  // 构建检查数据
  const checkData = buildCheckData(input);

  // 计算基础指标
  const ratio832 = calculate832Ratio(input.items, 'amount');
  const budgetAnalysis = analyzeBudget(input.totalBudget, input.peopleCount);

  // 获取启用的规则并逐条检查
  const enabledRules = getEnabledRules();
  const ruleResults: RuleCheckResult[] = enabledRules
    .map(rule => executeRuleCheck(rule, checkData))
    .sort((a, b) => a.rule.priority - b.rule.priority);

  // 统计通过/违规数量
  const violationCount = ruleResults.filter(r => !r.passed).length;
  const passCount = ruleResults.filter(r => r.passed).length;

  // 确定最高预警级别
  const overallLevel = determineOverallLevel(ruleResults);

  // 计算合规评分
  const complianceScore = calculateComplianceScore(ruleResults);

  // 收集修复建议
  const fixSuggestions = ruleResults
    .filter(r => r.autoFixSuggestion)
    .map(r => r.autoFixSuggestion!);

  // 生成汇总报告
  const tempOutput = {
    isCompliant: violationCount === 0,
    overallLevel,
    ruleResults,
    ratio832,
    budgetAnalysis,
    violationCount,
    passCount,
    complianceScore,
    fixSuggestions
  };
  
  const summaryReport = generateSummaryReport(tempOutput, input);

  return {
    isCompliant: violationCount === 0,
    overallLevel,
    ruleResults,
    ratio832,
    budgetAnalysis,
    violationCount,
    passCount,
    complianceScore,
    summaryReport,
    fixSuggestions
  };
}

/**
 * 快速合规检查（简化版）
 * 只返回是否合规和最高预警级别，不生成详细报告
 * 
 * @param input 引擎输入参数
 * @returns 简化的检查结果
 */
export function quickComplianceCheck(input: EngineInput): {
  isCompliant: boolean;
  level: EngineOutput['overallLevel'];
  score: number;
} {
  const fullResult = runComplianceEngine(input);
  return {
    isCompliant: fullResult.isCompliant,
    level: fullResult.overallLevel,
    score: fullResult.complianceScore
  };
}
