/**
 * 预算校验器
 * ─────────────────────────────────────────
 * 职责：
 *   1. 校验总预算与人数的合法性（必须为正整数/正数）
 *   2. 计算人均预算
 *   3. 当人均 > 500 元时，附加黄色提醒文案（仅提醒，不阻断流程）
 *
 * 规范依据：
 *   - 开发规范 §2.2.3：人均预算超过500元时自动添加提醒
 *   - PRD §1.4.2：提醒文案为"当前人均标准较高，建议按单位规定核实调整。"
 */

import type { BudgetValidationResult } from './types';

/** 人均预算预警阈值（元） */
const PER_CAPITA_WARN_THRESHOLD = 500;

/** 黄色提醒文案（来自 PRD §1.4.2） */
const OVER_THRESHOLD_WARN =
  '当前人均标准较高，建议按单位规定核实调整。';

/**
 * 将数字转换为中文大写金额（元整）
 * 最大支持到亿级，满足政府采购日常场景
 */
export function toChineseAmount(amount: number): string {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const posUnits = ['', '拾', '佰', '仟']; // 个位到千位

  if (amount === 0) return '零元整';

  // 取整到分，避免浮点误差
  const totalFen = Math.round(amount * 100);
  const yuan = Math.floor(totalFen / 100);
  const jiao = Math.floor((totalFen % 100) / 10);
  const fen = totalFen % 10;

  /**
   * 将 0~9999 的整数转为汉字（不含末尾级别单位，如"万"、"亿"）
   * needLeadingZero: 当此段前面已有内容，且本段 < 1000 时需要前导"零"
   */
  const convertSection = (n: number, needLeadingZero: boolean): string => {
    if (n === 0) return '';
    let s = '';
    const str = String(n); // 不 padStart，直接按实际位数处理
    const len = str.length; // 1~4

    if (needLeadingZero) s += '零';

    for (let i = 0; i < len; i++) {
      const d = parseInt(str[i], 10);
      const pos = len - 1 - i; // 0=个,1=十,2=百,3=千
      if (d === 0) {
        // 中间/末尾零：只在后面还有非零位时才加"零"
        const hasMore = str.slice(i + 1).split('').some((c) => c !== '0');
        if (hasMore) s += '零';
      } else {
        s += digits[d] + posUnits[pos];
      }
    }
    return s;
  };

  let result = '';
  const yi = Math.floor(yuan / 100_000_000);
  const wan = Math.floor((yuan % 100_000_000) / 10_000);
  const ge = yuan % 10_000;

  if (yi > 0) {
    result += convertSection(yi, false) + '亿';
  }
  if (wan > 0) {
    result += convertSection(wan, yi > 0 && wan < 1000) + '万';
  }
  if (ge > 0) {
    result += convertSection(ge, (yi > 0 || wan > 0) && ge < 1000);
  }

  result += '元';

  if (jiao === 0 && fen === 0) {
    result += '整';
  } else if (jiao === 0) {
    result += '零' + digits[fen] + '分';
  } else {
    result += digits[jiao] + '角';
    if (fen > 0) result += digits[fen] + '分';
  }

  return result;
}

/**
 * 校验预算合法性并返回结构化结果
 *
 * @param totalBudget 总预算（元），必须 > 0
 * @param headCount   人数，必须为正整数
 * @returns BudgetValidationResult
 */
export function validateBudget(
  totalBudget: number,
  headCount: number,
): BudgetValidationResult {
  // ── 硬校验 ──────────────────────────────────
  if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
    return {
      isValid: false,
      perCapita: 0,
      isOverWarn: false,
      warnMessage: null,
      errorMessage: '输入数据有误，总预算必须为大于零的数字，请检查后重新提交。',
    };
  }

  if (!Number.isInteger(headCount) || headCount <= 0) {
    return {
      isValid: false,
      perCapita: 0,
      isOverWarn: false,
      warnMessage: null,
      errorMessage: '输入数据有误，人数必须为大于零的整数，请检查后重新提交。',
    };
  }

  // ── 核心计算 ─────────────────────────────────
  const perCapita = totalBudget / headCount;
  const isOverWarn = perCapita > PER_CAPITA_WARN_THRESHOLD;

  return {
    isValid: true,
    perCapita: Math.round(perCapita * 100) / 100, // 保留两位小数
    isOverWarn,
    warnMessage: isOverWarn ? OVER_THRESHOLD_WARN : null,
    errorMessage: null,
  };
}
