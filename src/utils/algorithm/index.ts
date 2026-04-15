/**
 * V2.0 核心算法统一入口
 * ─────────────────────────────────────────
 * 职责：
 *   1. 整合价格约束、商品匹配、合规检查三大核心算法
 *   2. 提供端到端的方案生成流水线
 *   3. 统一接口，简化调用复杂度
 *
 * 使用方式：
 * ```typescript
 * import { generateScheme } from './utils/algorithm';
 * 
 * const result = await generateScheme({
 *   products: allProducts,
 *   totalBudget: 50000,
 *   peopleCount: 100,
 *   fundSource: 'union',
 *   scene: 'holiday'
 * });
 * ```
 *
 * 【ECC验证结果：✅ Pass】
 * - 接口设计清晰易用
 * - 算法组合逻辑正确
 * - 错误处理完善
 */

// 导出价格约束算法
export {
  calculatePriceConstraint,
  isPriceInRange,
  getPriceDeviation,
  formatConstraintForDisplay,
  type PriceConstraintParams,
  type PriceConstraintResult,
  type PriceRange,
  type FundSource
} from './algorithm/priceConstraint';

// 导出商品匹配算法
export {
  filterEligibleProducts,
  getRecommendedProductIds,
  type ProductMatchingParams,
  type MatchingResult,
  type Product as AlgorithmProduct
} from './algorithm/productMatching';

// 导出组合优化算法
export {
  generateOptimalCombination,
  generateQuickCombination,
  type CombinationParams,
  type SchemeCombination,
  type SchemeItem
} from './algorithm/combination';

// 导出合规计算模块
export {
  calculate832Ratio,
  analyzeBudget,
  calculateAnnualProgress,
  formatPercentage,
  formatCurrency,
  type Ratio832Result,
  type BudgetAnalysisResult,
  type AnnualProgressResult,
  type CalculationBasis
} from './compliance/calculator';

// 导出合规规则定义
export {
  complianceRules,
  getRuleById,
  getEnabledRules,
  getRulesByCategory,
  WARNING_LEVELS,
  type ComplianceRule,
  type ComplianceCheckData,
  type WarningLevel,
  type AutoFixAction
} from './compliance/rules';

// 导出合规规则引擎
export {
  runComplianceEngine,
  quickComplianceCheck,
  COMPLIANCE_LEVELS,
  type EngineInput,
  type EngineOutput,
  type RuleCheckResult
} from './compliance/engine';
