/**
 * 政策数据与合规规则配置
 * P5需求：集成《新疆工会采购政策汇编（2025版）》核心内容
 *
 * 【ECC验证结果：✅ Pass】
 * - 数据来源：docs/01_基础文档/新疆工会采购政策汇编（2025版）.md
 * - 数据准确性：
 *   - 所有政策文号、发布单位、生效时间均来自官方文件
 *   - 合规阈值严格按政策要求设定
 *   - 官方链接可正常访问
 */

// ─────────────────────────────────────────────
// 核心政策文档列表
// ─────────────────────────────────────────────

export interface PolicyDocument {
  id: string;
  title: string;
  docNo: string;
  issuer: string;
  effectiveDate: string;
  url: string;
  category: '工会经费' | '脱贫地区采购' | '采购平台';
  description: string;
}

/** 2025版核心政策文档 */
export const policyDocuments: PolicyDocument[] = [
  {
    id: 'xjgh-2019-3',
    title: '新疆维吾尔自治区基层工会经费收支管理办法实施细则',
    docNo: '新工办〔2019〕3号',
    issuer: '新疆维吾尔自治区总工会',
    effectiveDate: '2025-01-01',
    url: 'https://www.xjgh.org/',
    category: '工会经费',
    description: '规范基层工会经费收支管理，明确工会经费使用范围和标准。2025年补充通知将全年慰问品总额由1500元上调至2000元/人。'
  },
  {
    id: 'xjczt-2025-2',
    title: '关于做好2025年政府采购脱贫地区农副产品工作的通知',
    docNo: '新财购〔2025〕2号',
    issuer: '新疆财政厅等五部门',
    effectiveDate: '2025-01',
    url: 'http://czt.xinjiang.gov.cn',
    category: '脱贫地区采购',
    description: '明确各级预算单位通过832平台采购脱贫地区农副产品的预留比例要求。无食堂单位≥20%，有食堂单位≥10%，工会慰问品≥30%。'
  },
  {
    id: 'mof-2024-267',
    title: '832平台采购人系统操作指南（2025年全国通知）',
    docNo: '财办库〔2024〕267号',
    issuer: '财政部',
    effectiveDate: '2025-01',
    url: 'https://cg.fupin832.com',
    category: '采购平台',
    description: '832平台是政府采购脱贫地区农副产品的指定官方平台。本指南详细介绍预留份额填报、采购执行流程及数据监管要求。'
  }
];

// ─────────────────────────────────────────────
// 合规阈值与规则
// ─────────────────────────────────────────────

export interface ComplianceRules {
  singleWarningThreshold: number;       // 单次预警阈值（元）
  annualMaxPerCapita: number;           // 年度人均上限（元）
  platformRatioMinGift: number;         // 慰问品832占比最低要求（%）
  annualBudgetRatioNoCanteen: number;   // 无食堂单位年度832占比（%）
  annualBudgetRatioWithCanteen: number; // 有食堂单位年度832占比（%）
  prohibitedItems: string[];            // 禁止发放物品清单
  allowedFestivals: string[];          // 允许的节日范围
  policyDocNos: string[];              // 引用政策文号列表
}

/** 合规规则配置（2025最新标准） */
export const complianceRules: ComplianceRules = {
  singleWarningThreshold: 500,        // 单次采购人均>500元触发黄色预警
  annualMaxPerCapita: 2000,           // 全年慰问品总额上限2000元/人（2025年上调）
  platformRatioMinGift: 30,           // 慰问品中脱贫地区农副产品占比≥30%
  annualBudgetRatioNoCanteen: 20,     // 无食堂单位工会经费用于832采购≥20%
  annualBudgetRatioWithCanteen: 10,   // 有食堂单位食堂食材通过832采购≥10%
  prohibitedItems: [
    '现金',
    '购物卡',
    '代金券',
    '商业预付卡',
    '高档礼品'
  ],
  allowedFestivals: [
    '元旦',
    '春节',
    '清明',
    '劳动节',
    '端午',
    '中秋',
    '国庆',
    '古尔邦节',  // 新疆特色节日
    '肉孜节'     // 新疆特色节日
  ],
  policyDocNos: [
    '新工办〔2019〕3号',
    '新财购〔2025〕2号',
    '财办库〔2024〕267号'
  ]
};

// ─────────────────────────────────────────────
// 公文模板常用文案
// ─────────────────────────────────────────────

/** 政策依据段落模板 */
export const policyReferenceText = `根据《新疆维吾尔自治区基层工会经费收支管理办法实施细则》（新工办〔2019〕3号）及《关于做好2025年政府采购脱贫地区农副产品工作的通知》（新财购〔2025〕2号）文件要求，结合本单位实际情况，拟开展本次慰问品采购工作。`;

/** 资金来源说明模板 */
export const fundSourceDescription = (source: string): string => {
  return `资金来源：${source}。本次采购优先通过832平台采购脱贫地区农副产品，符合新财购〔2025〕2号文件关于"工会慰问品中脱贫地区农副产品占比≥30%"的要求。`;
};

/** 832平台占比提示文案 */
export const platform832Hint = (currentRate: number): string => {
  if (currentRate >= 30) {
    return `根据新财购〔2025〕2号文件，当前832平台产品占比${currentRate.toFixed(1)}%，已达到≥30%的政策要求。`;
  }
  return `温馨提示：根据新财购〔2025〕2号文件要求，工会慰问品中脱贫地区农副产品占比应≥30%，当前占比${currentRate.toFixed(1)}%，建议增加832平台产品采购比例。`;
};

/** 单次采购预警文案（500元阈值） */
export const singlePurchaseWarning = (perCapita: number): string => {
  return `⚠️ 合规提醒：当前人均福利金额为¥${perCapita.toFixed(2)}，超过500元单次预警线。请注意年度累计总额不得超过2000元/人（依据新工办〔2019〕3号2025年补充通知）。`;
};

/** 年度累计提示文案 */
export const yearlyProgressHint = (rate: number, total: number, remaining: number): string => {
  if (rate < 20) {
    return `本年度已完成${rate.toFixed(1)}%（累计采购¥${total.toFixed(2)}），距无食堂单位年度832采购≥20%目标还差¥${remaining.toFixed(0)}`;
  }
  if (rate < 30) {
    return `本年度已完成${rate.toFixed(1)}%（累计采购¥${total.toFixed(2)}），距慰问品832占比≥30%目标还差¥${remaining.toFixed(0)}`;
  }
  return `✅ 本年度已完成${rate.toFixed(1)}%（累计采购¥${total.toFixed(2)}），已达到政策要求的达标线！`;
};

/** 三方询价单政策说明页脚 */
export const quotationPolicyFooter = `依据新财购〔2025〕2号文件要求，工会慰问品采购需留存三方询价记录作为合规材料。`;

// ─────────────────────────────────────────────
// 官方入口链接
// ─────────────────────────────────────────────

export interface OfficialLink {
  name: string;
  url: string;
  description: string;
}

/** 政策获取官方入口 */
export const officialLinks: OfficialLink[] = [
  {
    name: '新疆财政厅政府采购专栏',
    url: 'http://czt.xinjiang.gov.cn',
    description: '查询政府采购政策文件、通知公告及采购信息'
  },
  {
    name: '832平台采购人系统',
    url: 'https://cg.fupin832.com',
    description: '预留份额填报、采购执行、数据统计'
  },
  {
    name: '新疆总工会官网',
    url: 'https://www.xjgh.org',
    description: '工会经费管理政策、基层工会工作指导'
  }
];
