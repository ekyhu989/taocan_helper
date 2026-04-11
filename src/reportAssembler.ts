/**
 * 报告组装器
 * ─────────────────────────────────────────
 * 职责：
 *   1. 根据采购场景选择对应的公文模板（共三套）
 *   2. 将用户输入 + 品单数据填入模板占位符
 *   3. 返回可直接展示/导出的完整报告文本
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
 *
 * 注：规范 §2.3.1 强制使用 Few-Shot 模板，严禁自由发挥。
 *     若需要 AI 补写内容，调用方应在本函数返回后再传给大模型 API。
 */

import type { ProductListResult, ReportResult, Scene, UserInput } from './types';
import { toChineseAmount } from './budgetValidator';
import { formatItemList } from './productListGenerator';

// ─────────────────────────────────────────────
// 场景映射
// ─────────────────────────────────────────────

/** 场景 → 中文标签 */
const SCENE_LABELS: Record<Scene, string> = {
  holiday: '传统节日慰问',
  activity: '专项活动物资',
  care: '精准帮扶慰问',
};

/** 场景 → 默认节日名称（holiday 场景使用） */
const DEFAULT_FESTIVAL: Record<Scene, string> = {
  holiday: '节日',
  activity: '活动',
  care: '慰问',
};

// ─────────────────────────────────────────────
// 三套公文模板（对应模板库 §5.1 / §5.2 / §5.3）
// 占位符全部使用 {{key}} 格式，最终统一替换
// ─────────────────────────────────────────────

const TEMPLATE_HOLIDAY = `关于{{year}}年{{festival}}职工慰问品采购方案的申请报告

致：{{unit}}工会委员会/财务部

一、申请事由

值此{{festival}}来临之际，为体现公司对职工的关怀，增强团队凝聚力，根据《基层工会经费收支管理办法》及公司年度福利计划，拟开展节日慰问活动。

二、慰问对象及标准

1. 慰问对象：{{unit}}全体在职职工（含劳务派遣人员），共计{{headCount}}人。
2. 预算标准：
   · 人均标准：人民币{{perCapita}}元/人。
   · 总预算：人民币{{totalBudget}}元（大写：{{chineseAmount}}）。
   · 合规说明：本次人均标准符合工会经费支出相关规定。

三、采购方案

本次采购拟通过832平台/定点供应商进行，坚持"合规、实用、普惠"原则。具体品单如下：

{{itemList}}

   · 消费帮扶说明：本次方案中，832平台脱贫地区农副产品金额占比约{{platform832Rate}}，符合年度消费帮扶任务要求。

四、发放方式

由各部门统一领取发放，职工签字确认。

{{hint832}}

妥否，请批示。

申请部门：{{department}}
申请人：{{applicant}}
日期：{{year}}年  月  日`;

const TEMPLATE_ACTIVITY = `关于{{year}}年"{{festival}}"职工活动物资采购的申请报告

致：{{unit}}领导/财务部

一、申请背景

为保障一线职工身体健康/丰富职工文化生活，切实做好{{festival}}后勤保障工作，特申请采购一批相关物资。

二、采购需求

1. 使用范围：{{unit}}{{department}}一线职工，预计{{headCount}}人。
2. 采购预算：
   · 预计总费用：人民币{{totalBudget}}元（大写：{{chineseAmount}}）。
   · 人均标准：人民币{{perCapita}}元/人。
   · 资金来源：{{fundSource}}。

三、拟采购物资清单

本次采购主要包含食品饮料及相关生活物资，具体如下：

{{itemList}}

四、采购渠道

拟优先选用832平台/大型商超产品，确保食品安全与价格公道。
本次方案中，832平台产品金额占比约{{platform832Rate}}。

{{hint832}}

以上申请，请予审核批准。

申请人：{{applicant}}
日期：{{year}}年  月  日`;

const TEMPLATE_CARE = `关于{{unit}}职工慰问品采购的申请报告

致：{{unit}}工会

一、慰问事由

1. 事由类型：{{festival}}
2. 慰问对象：{{department}}职工，共{{headCount}}人。

二、慰问标准

根据公司《职工福利管理办法》相关规定，拟申请慰问标准为：
· 人均金额：人民币{{perCapita}}元。
· 合计金额：人民币{{totalBudget}}元（大写：{{chineseAmount}}）。
· 资金来源：{{fundSource}}。

三、拟购方案

拟采购以下物资作为慰问：

{{itemList}}

{{hint832}}

特此申请，望批准。

申请部门：{{department}}
申请人：{{applicant}}
日期：{{year}}年  月  日`;

/** 场景 → 模板 */
const TEMPLATES: Record<Scene, string> = {
  holiday: TEMPLATE_HOLIDAY,
  activity: TEMPLATE_ACTIVITY,
  care: TEMPLATE_CARE,
};

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
    unitName,
    scene,
    headCount,
    totalBudget,
    fundSource,
    department,
    applicant,
    year = new Date().getFullYear(),
    festival,
  } = userInput;

  const perCapita = Math.round((totalBudget / headCount) * 100) / 100;
  const festivalLabel = festival?.trim() || DEFAULT_FESTIVAL[scene];

  // 品单文本
  const itemList = formatItemList(productResult.items);

  // 构造变量表
  const vars: TemplateVars = {
    year: String(year),
    festival: festivalLabel,
    unit: unitName,
    headCount: String(headCount),
    perCapita: String(perCapita),
    totalBudget: String(totalBudget),
    chineseAmount: toChineseAmount(totalBudget),
    itemList,
    platform832Rate: formatPlatform832Rate(productResult.platform832Rate),
    hint832: productResult.hint832,
    department,
    applicant,
    fundSource,
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
