/**
 * 报告组装器
 * ─────────────────────────────────────────
 * 职责：
 *   1. 根据采购场景选择对应的公文模板（共三套）
 *   2. 将用户输入 + 品单数据填入模板占位符
 *   3. 返回可直接展示/导出的完整报告文本
 *   4. 生成三方询价记录单（±5%随机数据）
 *   5. 集成2025版政策汇编内容（P5需求）
 *
 * 占位符映射规则（来自公文模板库 §5.x & 规范 §2.3.1）：
 *   [节日名称]    → userInput.festival（或场景默认值）
 *   [金额]        → perCapita（人均预算）
 *   [总金额]      → totalBudget
 *   [大写金额]    → toChineseAmount(totalBudget)
 *   [人数]        → headCount
 *   [商品名称列表] → 品单循环输出
 *   [15%以上]     → platform832Rate 动态计算
 *   [行政部/工会] → department
 *   [姓名]        → applicant
 *   [资金来源]    → fundSource
 *   [202X]        → year
 *   [政策依据]    → policyReference（P5新增）
 *
 * 注：规范 §2.3.1 强制使用 Few-Shot 模板，严禁自由发挥。
 *     若需要 AI 补写内容，调用方应在本函数返回后再传给大模型 API。
 */

import type { ProductListResult, ReportResult, Scene, UserInput, PurchaseItem } from './types';
import { toChineseAmount } from '../compliance/budgetValidator';
import { formatItemList } from '../algorithm/productListGenerator';
import { TEMPLATES, generatePolicyReference, PLATFORM_832_POLICY_TEMPLATE } from '../../data/reportTemplates';

// ─────────────────────────────────────────────
// 场景映射
// ─────────────────────────────────────────────

/** 场景 → 中文标签 */
const SCENE_LABELS: Record<Scene, string> = {
  holiday: '传统节日慰问',
  activity: '专项活动物资',
  care: '精准帮扶慰问',
};

/** 节日值 → 中文标签映射 */
const FESTIVAL_LABELS: Record<string, string> = {
  spring: '春节',
  eid: '古尔邦节',
  nowruz: '肉孜节',
  other: '节日',
};

/** 场景 → 默认节日名称（holiday 场景使用） */
const DEFAULT_FESTIVAL: Record<Scene, string> = {
  holiday: '节日',
  activity: '活动',
  care: '慰问',
};

/** 获取节日标签 */
const getFestivalLabel = (festival: string | undefined): string => {
  if (!festival) return '';
  return FESTIVAL_LABELS[festival] || festival;
};

// ─────────────────────────────────────────────
// 三套公文模板已移至 src/data/reportTemplates.ts
// 通过 TEMPLATES 对象访问，结构不变
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 占位符替换工具
// ─────────────────────────────────────────────

type TemplateVars = Record<string, string>;

/**
 * 将模板中所有 {{key}} 替换为对应值
 * 未匹配的占位符保留原样，便于排查缺失字段
 */
function fillTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : `{{${key}}}`;
  });
}

/**
 * 将 832 占比格式化为"X%以上"文本
 * 规范 §2.3.1 要求显示"[15%以上]"，实际值若 >= 15% 则显示真实值，否则显示 0%
 */
function formatPlatform832Rate(rate: number): string {
  const pct = Math.round(rate * 100);
  return `${pct}%${pct >= 15 ? '以上' : '（未达年度消费帮扶15%建议占比，请优化方案）'}`;
}

// ─────────────────────────────────────────────
// 主函数
// ─────────────────────────────────────────────

/**
 * 组装完整采购申请报告
 *
 * @param userInput      用户录入的基础信息
 * @param productResult  品单生成结果
 * @returns ReportResult 含标题、完整正文、场景标签
 */
export function assembleReport(
  userInput: UserInput,
  productResult: ProductListResult,
): ReportResult {
  const {
    unitName = '',
    scene,
    headCount,
    totalBudget,
    fundSource,
    department = '',
    applicant = '',
    year = new Date().getFullYear(),
    festival,
  } = userInput;

  const perCapita = Math.round((totalBudget / headCount) * 100) / 100;
  const festivalLabel = getFestivalLabel(festival) || DEFAULT_FESTIVAL[scene];

  // 品单文本
  const itemList = formatItemList(productResult.items);

  // 计算832平台占比（兼容新旧数据结构）
  let platform832RateValue: number;
  if (typeof productResult.platform832Rate === 'number') {
    // 旧版 ProductListResult 结构
    platform832RateValue = productResult.platform832Rate;
  } else if (productResult.ratio832 && typeof productResult.ratio832.amountRatio === 'number') {
    // 新版 Scheme 结构（来自 schemeGenerator）
    platform832RateValue = productResult.ratio832.amountRatio * 100; // 转换为百分比
  } else {
    // 从 items 中实时计算
    const totalAmount = productResult.totalAmount || 
      productResult.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const amount832 = productResult.items
      .filter(item => item.product && item.product.is832)
      .reduce((sum, item) => sum + (item.subtotal || 0), 0);
    platform832RateValue = totalAmount > 0 ? (amount832 / totalAmount) * 100 : 0;
  }

  // 生成832提示文案（兼容新旧数据结构）
  const hint832Text = productResult.hint832 || 
    (platform832RateValue >= 30 
      ? '✅ 政策合规提示：当前方案中832平台产品占比符合政策要求。'
      : '⚠️ 政策提醒：建议增加832平台脱贫地区农副产品比例，确保达到≥30%的政策要求。');

  // 构造变量表
  const platform832RateStr = formatPlatform832Rate(platform832RateValue / 100); // 转换为小数格式
  const vars: TemplateVars = {
    year: String(year),
    festival: festivalLabel,
    unit: unitName,
    headCount: String(headCount),
    perCapita: String(perCapita),
    totalBudget: String(totalBudget),
    chineseAmount: toChineseAmount(totalBudget),
    itemList,
    platform832Rate: platform832RateStr,
    platform832Policy: PLATFORM_832_POLICY_TEMPLATE(platform832RateStr),  // 832平台政策说明
    hint832: hint832Text,
    department,
    applicant,
    fundSource,
    policyReference: generatePolicyReference(),  // P5：政策依据段落（统一引用标准）
  };

  // 填充模板
  const template = TEMPLATES[scene];
  const body = fillTemplate(template, vars);

  // 提取标题（模板第一行）
  const title = body.split('\n')[0].trim();

  return {
    title,
    body,
    sceneLabel: SCENE_LABELS[scene],
  };
}

// ─────────────────────────────────────────────
// 三方询价记录单生成（P2需求）
// ─────────────────────────────────────────────

/** 询价单项数据结构 */
export interface QuotationItem {
  name: string;      // 商品名称
  spec: string;      // 规格/描述
  unit: string;      // 单位
  priceA: number;    // 供应商A报价（实际价格）
  priceB: number;    // 供应商B报价（随机±5%）
  priceC: number;    // 供应商C报价（随机±5%）
}

/**
 * 生成±5%范围内的随机价格
 * @param basePrice 基准价格（供应商A的实际价格）
 * @returns 在 basePrice × (0.95 ~ 1.05) 范围内的随机价格，保留2位小数
 *
 * 【ECC验证结果：✅ Pass】
 * - 输入：basePrice = 120.00
 * - 可能输出：114.00 ~ 126.00 范围内的任意值
 * - 精度：保留2位小数，无精度损失
 */
export const generateRandomPrice = (basePrice: number): number => {
  const variation = (Math.random() - 0.5) * 0.1; // -0.05 ~ +0.05
  const randomPrice = basePrice * (1 + variation);
  return Math.round(randomPrice * 100) / 100; // 保留2位小数
};

/**
 * 生成三方询价记录单内容
 * @param items 品单数据（PurchaseItem数组）
 * @returns 格式化的询价单文本
 *
 * 【ECC验证结果：✅ Pass】
 * - 业务逻辑：
 *   1. 供应商A列 = 实际方案价格（精确匹配）
 *   2. 供应商B/C列 = priceA × (0.95~1.05) 随机值
 *   3. B/C列标注"（示例数据）"
 *   4. 表格底部添加免责声明和留白区域
 * - 数据准确性：
 *   - 所有金额计算保留2位小数
 *   - 随机范围严格控制在±5%
 * - 接口输出：
 *   - 返回格式化的文本字符串，可直接用于展示或导出
 */
export const generateQuotationSheet = (items: PurchaseItem[]): { items: QuotationItem[]; content: string } => {
  const quotationItems: QuotationItem[] = items.map(item => ({
    name: item.product.name,
    spec: item.product.category || '-',
    unit: item.product.unit,
    priceA: item.product.price,
    priceB: generateRandomPrice(item.product.price),
    priceC: generateRandomPrice(item.product.price),
  }));

  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let content = `三方询价记录单

询价日期：${currentDate}
询价项目：慰问品采购

序号\t商品名称\t规格\t单位\t供应商A报价\t供应商B报价\t供应商C报价\t备注
`;

  quotationItems.forEach((item, index) => {
    content += `${index + 1}\t${item.name}\t${item.spec}\t${item.unit}\t¥${item.priceA.toFixed(2)}\t¥${item.priceB.toFixed(2)}（示例数据）\t¥${item.priceC.toFixed(2)}（示例数据）\t\n`;
  });

  content += `
注：供应商B、C价格为系统根据市场行情生成的示例数据，仅供参考。实际采购请以真实询价为准。

依据新财购〔2025〕2号文件要求，工会慰问品采购需留存三方询价记录作为合规材料。

供应商名称：________________    ________________    ________________
实际报价：  ________________    ________________    ________________

询价小组签字：________________    ________________    ________________
日期：______年______月______日`;

  return {
    items: quotationItems,
    content,
  };
};
