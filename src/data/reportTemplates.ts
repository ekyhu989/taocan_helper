/**
 * 公文模板库 - V1.6-5 统一政策引用标准
 * 
 * 功能：
 * 1. 提供三套标准公文模板（传统节日慰问/专项活动物资/精准帮扶慰问）
 * 2. 统一政策文号引用格式
 * 3. 标准化术语使用
 * 4. 包含政策版本签章区域占位符
 * 
 * 引用政策文号来源：policyData.ts 中的 complianceRules.policyDocNos
 */

import { complianceRules } from './policyData';

// 统一政策文号列表（来自 policyData.ts）
const POLICY_DOC_NOS = complianceRules.policyDocNos;

// 政策依据段落模板（统一使用标准文号）
export const POLICY_REFERENCE_TEMPLATE = `根据《新疆维吾尔自治区基层工会经费收支管理办法实施细则》（${POLICY_DOC_NOS[0]}）及《关于做好2025年政府采购脱贫地区农副产品工作的通知》（${POLICY_DOC_NOS[1]}）文件要求，结合本单位实际情况，拟开展本次慰问品采购工作。`;

// 832平台政策说明模板
export const PLATFORM_832_POLICY_TEMPLATE = (rate: string): string => 
  `本次方案中，832平台脱贫地区农副产品金额占比约${rate}，符合《关于做好2025年政府采购脱贫地区农副产品工作的通知》（${POLICY_DOC_NOS[1]}）文件要求。`;

// 政策版本签章区域模板（在导出时动态生成）
export const POLICY_VERSION_SEAL_TEMPLATE = `─── 政策版本校验签章 ───
版本状态：已确认
政策版本：{policy_version}
校验时间：{validation_time}
签章说明：本公文引用政策文号均基于最新有效版本，符合合规要求`;

// 三套公文模板
export const TEMPLATE_HOLIDAY = `关于{{year}}年{{festival}}慰问品采购的申请报告

致：{{unit}}领导

一、采购事由

根据年度工会工作计划，为表达对职工的关心，营造{{festival}}氛围，{{policyReference}}

二、采购需求

1. 使用范围：{{unit}}{{department}}一线职工，预计{{headCount}}人。
2. 采购预算：
   · 预计总费用：人民币{{totalBudget}}元（大写：{{chineseAmount}}）。
   · 人均标准：人民币{{perCapita}}元/人（全年累计不超过2000元/人）。
   · 资金来源：{{fundSource}}。

三、拟采购物资清单

本次采购优先通过832平台采购脱贫地区农副产品，主要包含食品饮料及相关生活物资，具体如下：

{{itemList}}

四、采购渠道

拟优先选用832平台产品，确保食品安全与价格公道。
{{platform832Policy}}

{{hint832}}

妥否，请批示。

申请部门：{{department}}
申请人：{{applicant}}
日期：{{year}}年  月  日`;

export const TEMPLATE_ACTIVITY = `关于{{year}}年"{{festival}}"职工活动物资采购的申请报告

致：{{unit}}领导/财务部

一、申请背景

为保障一线职工身体健康/丰富职工文化生活，切实做好{{festival}}后勤保障工作，{{policyReference}}特申请采购一批相关物资。

二、采购需求

1. 使用范围：{{unit}}{{department}}一线职工，预计{{headCount}}人。
2. 采购预算：
   · 预计总费用：人民币{{totalBudget}}元（大写：{{chineseAmount}}）。
   · 人均标准：人民币{{perCapita}}元/人（全年累计不超过2000元/人）。
   · 资金来源：{{fundSource}}，其中832平台脱贫地区农副产品采购占比符合新财购〔2025〕2号文件要求。

三、拟采购物资清单

本次采购优先通过832平台采购脱贫地区农副产品，主要包含食品饮料及相关生活物资，具体如下：

{{itemList}}

四、采购渠道

拟优先选用832平台产品，确保食品安全与价格公道。
本次方案中，832平台脱贫地区农副产品金额占比约{{platform832Rate}}，符合《关于做好2025年政府采购脱贫地区农副产品工作的通知》（新财购〔2025〕2号）文件要求。

{{hint832}}

以上申请，请予审核批准。

申请人：{{applicant}}
日期：{{year}}年  月  日`;

export const TEMPLATE_CARE = `关于{{unit}}职工慰问品采购的申请报告

致：{{unit}}工会

一、慰问事由

1. 事由类型：{{festival}}
2. 慰问对象：{{department}}职工，共{{headCount}}人。
3. 政策依据：{{policyReference}}

二、慰问标准

根据《新疆维吾尔自治区基层工会经费收支管理办法实施细则》（新工办〔2019〕3号）及2025年补充通知相关规定，拟申请慰问标准为：
· 人均金额：人民币{{perCapita}}元（全年累计不超过2000元/人）。
· 合计金额：人民币{{totalBudget}}元（大写：{{chineseAmount}}）。
· 资金来源：{{fundSource}}，其中832平台脱贫地区农副产品采购占比符合新财购〔2025〕2号文件要求。

三、拟购方案

拟优先通过832平台采购以下脱贫地区农副产品作为慰问：

{{itemList}}

本次方案中，832平台脱贫地区农副产品金额占比约{{platform832Rate}}，符合政策要求。

{{hint832}}

特此申请，望批准。

申请部门：{{department}}
申请人：{{applicant}}
日期：{{year}}年  月  日`;

// 场景 → 模板映射
export const TEMPLATES = {
  holiday: TEMPLATE_HOLIDAY,
  activity: TEMPLATE_ACTIVITY,
  care: TEMPLATE_CARE,
};

// 获取指定场景的模板
export const getTemplateForScene = (scene: 'holiday' | 'activity' | 'care'): string => {
  return TEMPLATES[scene];
};

// 获取所有政策文号
export const getPolicyDocNos = (): string[] => {
  return [...POLICY_DOC_NOS];
};

// 生成统一政策依据段落
export const generatePolicyReference = (): string => {
  return POLICY_REFERENCE_TEMPLATE;
};

// 生成832平台政策说明
export const generatePlatform832Policy = (rate: number): string => {
  const formattedRate = `${Math.round(rate * 100)}%${rate >= 0.15 ? '以上' : '（未达年度消费帮扶15%建议占比，请优化方案）'}`;
  return PLATFORM_832_POLICY_TEMPLATE(formattedRate);
};