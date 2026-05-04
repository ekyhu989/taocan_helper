/**
 * V1.6-5 公文生成防错合规优化 - 导出前校验逻辑
 * 
 * 功能：
 * 1. 政策版本校验 - 检查是否已确认最新政策版本
 * 2. 敏感词检测 - 自动检查禁用词汇（购买/下单/支付/商城/购物车/订单）
 * 3. 公文格式校验 - 检查政策引用文号格式标准
 * 4. 统一校验入口 - 导出前调用，返回校验结果和错误信息
 */

import { checkPolicyVersion } from '../../data/policies';
import { UserInput } from '../types';

// 禁用词汇列表（严禁使用，必须替换为合规词汇）
const FORBIDDEN_TERMS = [
  { forbidden: '购买', replacement: '采购' },
  { forbidden: '下单', replacement: '生成方案' },
  { forbidden: '支付', replacement: '预算安排' },
  { forbidden: '商城', replacement: '平台' },
  { forbidden: '购物车', replacement: '物资清单' },
  { forbidden: '订单', replacement: '方案' },
];

// 政策文号正则表达式（标准格式：新工办〔2019〕3号）
const POLICY_DOC_NO_REGEX = /^[^\d\s]+〔\d{4}〕\d+号$/;

/**
 * 敏感词检测结果
 */
export interface SensitiveTermCheckResult {
  hasForbiddenTerms: boolean;
  forbiddenTerms: Array<{ term: string; replacement: string }>;
  suggestedContent: string;
}

/**
 * 政策版本校验结果
 */
export interface PolicyVersionCheckResult {
  isValid: boolean;
  currentVersion: string;
  confirmedVersion: string | null;
  message: string;
}

/**
 * 公文格式校验结果
 */
export interface ReportFormatCheckResult {
  isValid: boolean;
  policyDocNos: string[];
  invalidDocNos: string[];
  message: string;
}

/**
 * 导出前完整校验结果
 */
export interface ExportValidationResult {
  isValid: boolean;
  policyVersionCheck: PolicyVersionCheckResult;
  sensitiveTermCheck: SensitiveTermCheckResult;
  reportFormatCheck: ReportFormatCheckResult;
  errors: string[];
  warnings: string[];
}

/**
 * 检测敏感词并返回替换建议
 * @param content 待检测文本内容
 * @returns 检测结果
 */
export function checkSensitiveTerms(content: string): SensitiveTermCheckResult {
  const forbiddenTermsFound: Array<{ term: string; replacement: string }> = [];
  let suggestedContent = content;

  FORBIDDEN_TERMS.forEach(({ forbidden, replacement }) => {
    const regex = new RegExp(forbidden, 'g');
    if (regex.test(content)) {
      forbiddenTermsFound.push({ term: forbidden, replacement });
      suggestedContent = suggestedContent.replace(regex, replacement);
    }
  });

  return {
    hasForbiddenTerms: forbiddenTermsFound.length > 0,
    forbiddenTerms: forbiddenTermsFound,
    suggestedContent,
  };
}

/**
 * 校验政策版本
 * @returns 校验结果
 */
export function checkPolicyVersionCompliance(): PolicyVersionCheckResult {
  const isValid = checkPolicyVersion();
  const currentVersion = localStorage.getItem('policy_version') || '未知';
  const confirmedVersion = localStorage.getItem('policy_confirmed_version');

  return {
    isValid,
    currentVersion,
    confirmedVersion,
    message: isValid 
      ? '政策版本已确认，符合最新合规要求'
      : '政策版本未确认或已过期，请先确认最新政策版本',
  };
}

/**
 * 从报告内容中提取政策文号并校验格式
 * @param reportContent 报告内容
 * @returns 校验结果
 */
export function checkPolicyDocNoFormat(reportContent: string): ReportFormatCheckResult {
  // 匹配政策文号（格式：新工办〔2019〕3号）
  const docNoRegex = /([^\d\s]+〔\d{4}〕\d+号)/g;
  const matches = reportContent.match(docNoRegex) || [];
  
  const invalidDocNos = matches.filter(docNo => !POLICY_DOC_NO_REGEX.test(docNo));
  
  return {
    isValid: invalidDocNos.length === 0,
    policyDocNos: matches,
    invalidDocNos,
    message: invalidDocNos.length === 0
      ? `政策文号格式正确（共${matches.length}个）`
      : `发现${invalidDocNos.length}个格式错误的政策文号：${invalidDocNos.join('、')}`,
  };
}

/**
 * 统一导出前校验入口
 * @param reportContent 报告内容
 * @param userInput 用户输入信息（用于扩展校验）
 * @returns 完整校验结果
 */
export function validateExport(
  reportContent: string,
  userInput?: UserInput
): ExportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 政策版本校验
  const policyVersionCheck = checkPolicyVersionCompliance();
  if (!policyVersionCheck.isValid) {
    errors.push('政策版本未确认或已过期，禁止导出公文');
  }

  // 2. 敏感词检测
  const sensitiveTermCheck = checkSensitiveTerms(reportContent);
  if (sensitiveTermCheck.hasForbiddenTerms) {
    warnings.push(`发现禁用词汇：${sensitiveTermCheck.forbiddenTerms.map(t => t.term).join('、')}，已自动替换为合规词汇`);
  }

  // 3. 公文格式校验（政策文号）
  const reportFormatCheck = checkPolicyDocNoFormat(reportContent);
  if (!reportFormatCheck.isValid) {
    errors.push(`政策文号格式错误：${reportFormatCheck.message}`);
  }

  // 4. 额外校验：人均预算超500元警告（已在其他地方处理，此处仅记录）
  if (userInput && userInput.totalBudget && userInput.headCount) {
    const perCapita = userInput.totalBudget / userInput.headCount;
    if (perCapita > 500) {
      warnings.push(`人均预算${perCapita.toFixed(2)}元超过500元，请注意合规要求`);
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    policyVersionCheck,
    sensitiveTermCheck,
    reportFormatCheck,
    errors,
    warnings,
  };
}

/**
 * 获取强制更新提示消息
 * @returns 提示消息HTML
 */
export function getPolicyUpdateAlertMessage(): string {
  return `
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <div class="flex items-start">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-red-800">政策版本已更新</h3>
      <div class="mt-2 text-sm text-red-700">
        <p>检测到最新政策版本更新，为确保公文合规性，请先确认最新政策版本后再导出公文。</p>
        <p class="mt-1">点击"查看更新"按钮跳转新疆财政厅官网查看最新政策。</p>
      </div>
      <div class="mt-4">
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            onclick="window.open('http://czt.xinjiang.gov.cn', '_blank', 'noopener,noreferrer')"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            查看更新
          </button>
          <button
            type="button"
            onclick="window.location.reload()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            稍后提醒
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
  `.trim();
}

/**
 * 获取敏感词替换提示消息
 * @param forbiddenTerms 检测到的禁用词汇
 * @returns 提示消息HTML
 */
export function getSensitiveTermAlertMessage(
  forbiddenTerms: Array<{ term: string; replacement: string }>
): string {
  const termsList = forbiddenTerms.map(t => 
    `<li><span class="font-semibold text-red-600">${t.term}</span> → <span class="font-semibold text-green-600">${t.replacement}</span></li>`
  ).join('');

  return `
<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
  <div class="flex items-start">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium text-yellow-800">发现非合规词汇</h3>
      <div class="mt-2 text-sm text-yellow-700">
        <p>为确保公文合规性，系统检测到以下非合规词汇并已自动替换：</p>
        <ul class="mt-2 list-disc list-inside">
          ${termsList}
        </ul>
        <p class="mt-2">系统已自动替换为合规词汇，您也可以手动修改报告内容。</p>
      </div>
    </div>
  </div>
</div>
  `.trim();
}