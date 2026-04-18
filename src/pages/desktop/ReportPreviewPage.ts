/**
 * 报告预览页面 - 核心逻辑
 * ─────────────────────────────────────────
 * 职责：
 *   1. 接收用户表单数据
 *   2. 调用核心逻辑生成报告
 *   3. 返回完整报告内容（供 UI 层展示）
 */

import { assembleReport } from '../reportAssembler';
import { generateProductList } from '../productListGenerator';
import { validateBudget } from '../budgetValidator';
import type { UserInput, Scene } from '../types';

import products from '../data/products.json';

/**
 * 生成报告的入口函数
 * 
 * @param formData - 用户表单数据
 * @returns 报告结果 { title, body, sceneLabel }
 */
export function generateReport(formData: {
  unitName: string;
  scene: Scene;
  headCount: number;
  totalBudget: number;
  fundSource: string;
  department: string;
  applicant: string;
  festival?: string;
  year?: number;
}) {
  // 1. 预算校验
  const validation = validateBudget(formData.totalBudget, formData.headCount);
  if (!validation.isValid) {
    throw new Error(validation.errorMessage || '预算校验失败');
  }

  // 2. 生成品单
  const productResult = generateProductList(
    products,
    formData.scene,
    formData.totalBudget
  );

  // 3. 组装报告
  const userInput: UserInput = {
    unitName: formData.unitName,
    scene: formData.scene,
    headCount: formData.headCount,
    totalBudget: formData.totalBudget,
    fundSource: formData.fundSource,
    department: formData.department,
    applicant: formData.applicant,
    festival: formData.festival,
    year: formData.year || new Date().getFullYear(),
  };

  const report = assembleReport(userInput, productResult);
  
  return report;
}
