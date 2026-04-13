/**
 * 统一入口 / Barrel 导出
 * 外部模块统一从此文件导入所有逻辑函数和类型
 */

export * from './types';
export { validateBudget, toChineseAmount } from './budgetValidator';
export { generateProductList, formatItemList, recalculateSolution } from './productListGenerator';
export { assembleReport } from './reportAssembler';
