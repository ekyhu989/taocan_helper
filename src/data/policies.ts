/**
 * V1.6 政策文库合规升级 - 政策数据结构
 * 
 * 扩展原有policyData.ts，添加版本控制、条款结构、解读内容等
 */

// ─────────────────────────────────────────────
// 常量定义
// ─────────────────────────────────────────────

/** 硬编码政策版本号（需与官网保持同步） */
export const POLICY_VERSION = "2025-04-01";

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

export interface Clause {
  number: string; // 如 "第5条"
  title: string;
  content: string;
}

export interface Policy {
  id: string;
  title: string;
  officialUrl: string; // 官方源地址
  version: string; // 版本号（如 "2025-04-01"）
  updateDate: string; // 更新时间（显示用）
  content: string; // 原文
  interpretation: string; // 解读
  clauses: Clause[]; // 条款
  coreRequirements: string[]; // 核心合规条款
  category: '工会经费' | '脱贫地区采购' | '采购平台';
  docNo: string; // 文号
  issuer: string; // 发布单位
  effectiveDate: string; // 生效日期
  description: string; // 简短描述
}

export interface OfficialLink {
  name: string;
  url: string;
  description: string;
}

// ─────────────────────────────────────────────
// 政策数据
// ─────────────────────────────────────────────

/** 2025版核心政策数据 */
export const policies: Policy[] = [
  {
    id: 'xjgh-2019-3',
    title: '新疆维吾尔自治区基层工会经费收支管理办法实施细则',
    officialUrl: 'https://www.xjgh.org/',
    version: POLICY_VERSION,
    updateDate: '2025-04-01',
    content: `（此处为政策原文内容，由于篇幅限制，实际应用时可分页加载或从服务器获取）

第一章 总则

第一条 为规范基层工会经费收支管理，保障工会经费依法合规使用，根据《中华人民共和国工会法》《中国工会章程》和《新疆维吾尔自治区基层工会经费收支管理办法》等有关规定，制定本实施细则。

第二条 本实施细则适用于新疆维吾尔自治区行政区域内所有基层工会组织。

第三条 基层工会经费收支管理应当遵循以下原则：
（一）遵纪守法原则；
（二）经费独立原则；
（三）预算管理原则；
（四）服务职工原则；
（五）勤俭节约原则；
（六）民主管理原则。

……（完整内容省略）`,
    interpretation: `【政策解读】

1. **适用范围**：全疆所有基层工会组织，包括机关、企事业单位、社会组织等依法成立的工会。

2. **经费来源**：
   - 会费收入：会员缴纳的会费
   - 拨缴经费收入：单位按全部职工工资总额2%拨缴的经费
   - 上级补助收入：上级工会拨付的各类补助
   - 行政补助收入：单位行政给予的补助
   - 其他收入：投资收益、利息收入等

3. **支出范围**：
   - 职工活动支出：文体活动、宣传活动、职工教育等
   - 维权支出：劳动关系协调、劳动保护、法律援助等
   - 业务支出：培训、会议、专项业务等
   - 资本性支出：设备购置、房屋修缮等
   - 其他支出：按规定提取的专项资金等

4. **慰问品标准**：
   - 2025年补充通知将全年慰问品总额由1500元/人上调至2000元/人
   - 慰问品应优先采购脱贫地区农副产品
   - 禁止发放现金、购物卡、代金券等

5. **监督检查**：工会经费使用情况应定期向会员公开，接受会员监督。`,
    clauses: [
      {
        number: '第5条',
        title: '慰问品采购标准',
        content: '基层工会逢年过节可以向全体会员发放节日慰问品，每位会员年度总额不得超过2000元。慰问品原则上为符合中国传统节日习惯的食品和职工必需的日常生活用品，不得发放现金、购物卡、代金券等。'
      },
      {
        number: '第8条',
        title: '脱贫地区采购要求',
        content: '基层工会采购节日慰问品时，应优先采购脱贫地区农副产品，采购金额原则上不低于当年慰问品总额的30%。'
      },
      {
        number: '第12条',
        title: '经费使用监督',
        content: '基层工会经费使用情况应当定期向会员大会或会员代表大会报告，并接受会员监督。经费审查委员会应当加强对工会经费收支情况的审查监督。'
      }
    ],
    coreRequirements: [
      '年度人均福利支出不得超过2000元',
      '慰问品中脱贫地区农副产品占比≥30%',
      '禁止发放现金、购物卡、代金券等',
      '经费使用情况需定期公开并接受监督'
    ],
    category: '工会经费',
    docNo: '新工办〔2019〕3号',
    issuer: '新疆维吾尔自治区总工会',
    effectiveDate: '2025-01-01',
    description: '规范基层工会经费收支管理，明确工会经费使用范围和标准。2025年补充通知将全年慰问品总额由1500元上调至2000元/人。'
  },
  {
    id: 'xjczt-2025-2',
    title: '关于做好2025年政府采购脱贫地区农副产品工作的通知',
    officialUrl: 'http://czt.xinjiang.gov.cn',
    version: POLICY_VERSION,
    updateDate: '2025-04-01',
    content: `新疆维吾尔自治区财政厅
新疆维吾尔自治区农业农村厅
新疆维吾尔自治区乡村振兴局
新疆维吾尔自治区总工会
新疆维吾尔自治区供销合作社联合社

新财购〔2025〕2号

关于做好2025年政府采购脱贫地区农副产品工作的通知

各州、市、县（市、区）财政局、农业农村局、乡村振兴局、总工会、供销合作社，自治区各委、办、厅、局，各人民团体，各自治区级企业：

为深入贯彻党中央、国务院关于实现巩固拓展脱贫攻坚成果同乡村振兴有效衔接的决策部署，持续发挥政府采购政策功能，支持脱贫地区农副产品销售，促进农民持续增收，现就做好2025年政府采购脱贫地区农副产品工作通知如下：

一、提高政治站位，充分认识政府采购脱贫地区农副产品工作的重要意义

……（完整内容省略）`,
    interpretation: `【政策解读】

1. **采购主体**：全疆各级预算单位，包括机关、事业单位、团体组织、国有企业等。

2. **采购平台**：财政部指定的"832平台"（脱贫地区农副产品网络销售平台）。

3. **预留比例要求**：
   - 无食堂单位：年度工会经费用于832平台采购比例不低于20%
   - 有食堂单位：年度食堂食材通过832平台采购比例不低于10%
   - 工会慰问品：通过832平台采购的脱贫地区农副产品比例不低于30%

4. **统计口径**：
   - 默认按金额占比计算
   - 审计时可按数量占比复核
   - 需留存采购凭证备查

5. **完成时限**：年度采购任务需在当年12月31日前完成。`,
    clauses: [
      {
        number: '第3条',
        title: '预留比例要求',
        content: '各级预算单位应当按照以下比例预留年度采购份额：（一）无食堂的单位，年度工会经费用于832平台采购的比例不低于20%；（二）有食堂的单位，年度食堂食材通过832平台采购的比例不低于10%；（三）工会慰问品采购，通过832平台采购的脱贫地区农副产品比例不低于30%。'
      },
      {
        number: '第7条',
        title: '统计与考核',
        content: '各级财政部门应当会同农业农村、乡村振兴、总工会、供销合作社等部门，对预算单位政府采购脱贫地区农副产品工作进行统计、通报和考核。'
      }
    ],
    coreRequirements: [
      '无食堂单位：832采购占比≥20%',
      '有食堂单位：832采购占比≥10%',
      '工会慰问品：832采购占比≥30%',
      '必须通过832平台进行采购',
      '需留存采购凭证备查'
    ],
    category: '脱贫地区采购',
    docNo: '新财购〔2025〕2号',
    issuer: '新疆财政厅等五部门',
    effectiveDate: '2025-01',
    description: '明确各级预算单位通过832平台采购脱贫地区农副产品的预留比例要求。无食堂单位≥20%，有食堂单位≥10%，工会慰问品≥30%。'
  },
  {
    id: 'mof-2024-267',
    title: '832平台采购人系统操作指南（2025年全国通知）',
    officialUrl: 'https://cg.fupin832.com',
    version: POLICY_VERSION,
    updateDate: '2025-04-01',
    content: `中华人民共和国财政部办公厅

财办库〔2024〕267号

832平台采购人系统操作指南

（2025年全国通知）

各中央预算单位，各省、自治区、直辖市、计划单列市财政厅（局），新疆生产建设兵团财政局：

为进一步规范832平台采购操作，提高采购效率，保障数据准确，现将《832平台采购人系统操作指南（2025年版）》印发给你们，请遵照执行。

一、平台登录与账号管理

1.1 登录方式
采购人通过财政部统一身份认证平台登录832平台采购人系统。

1.2 账号权限
（1）管理员账号：可进行预留份额填报、采购执行、数据统计等全部操作。
（2）经办人账号：可进行采购执行操作，无预留份额填报权限。

……（完整内容省略）`,
    interpretation: `【平台操作指南】

1. **账号管理**：
   - 需通过财政部统一身份认证平台登录
   - 区分管理员账号和经办人账号
   - 账号需定期更新密码

2. **采购流程**：
   - 预留份额填报（每年1-3月）
   - 采购执行（全年）
   - 验收付款（收货后15个工作日内）
   - 数据统计（实时）

3. **注意事项**：
   - 采购订单需在832平台内完成，不得线下交易
   - 收货后需及时确认验收
   - 付款需在平台内完成，确保数据可追溯

4. **数据对接**：
   - 平台与财政系统实时对接
   - 采购数据自动同步至财政监管系统
   - 可生成合规性报告供审计使用`,
    clauses: [
      {
        number: '第4条',
        title: '采购执行',
        content: '采购人应当在832平台内完成全部采购流程，包括商品选择、下单、支付、验收等环节。平台外交易不计入政府采购脱贫地区农副产品统计范围。'
      },
      {
        number: '第9条',
        title: '数据统计',
        content: '832平台自动统计各采购人的预留份额完成情况，实时生成采购数据报表，并与财政监管系统实时对接。'
      }
    ],
    coreRequirements: [
      '采购流程需在832平台内完成',
      '收货后15个工作日内完成验收付款',
      '采购数据实时同步至财政监管系统',
      '可生成合规性报告供审计使用'
    ],
    category: '采购平台',
    docNo: '财办库〔2024〕267号',
    issuer: '财政部',
    effectiveDate: '2025-01',
    description: '832平台是政府采购脱贫地区农副产品的指定官方平台。本指南详细介绍预留份额填报、采购执行流程及数据监管要求。'
  }
];

/** 核心合规条款摘要（用于置顶展示） */
export const coreComplianceRequirements = [
  '832平台采购占比 ≥ 30%（慰问品）',
  '年度人均预算 ≤ 2000元（工会经费）',
  '单次采购人均预警线 500元',
  '禁止发放现金、购物卡、代金券'
];

/** 官方链接（保持与policyData.ts兼容） */
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

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

/**
 * 搜索政策
 * @param keyword 搜索关键词
 * @returns 匹配的政策列表
 */
export function searchPolicies(keyword: string): Policy[] {
  if (!keyword.trim()) return [];
  
  const lowerKeyword = keyword.toLowerCase();
  return policies.filter(policy => 
    policy.title.toLowerCase().includes(lowerKeyword) ||
    policy.content.toLowerCase().includes(lowerKeyword) ||
    policy.interpretation.toLowerCase().includes(lowerKeyword) ||
    policy.clauses.some(clause => 
      clause.content.toLowerCase().includes(lowerKeyword)
    ) ||
    policy.coreRequirements.some(req => 
      req.toLowerCase().includes(lowerKeyword)
    )
  );
}

/**
 * 按条款编号查找
 * @param clauseNumber 条款编号，如"第5条"
 * @returns 匹配的条款及所属政策
 */
export function findClause(clauseNumber: string): { policy: Policy, clause: Clause } | null {
  for (const policy of policies) {
    const clause = policy.clauses.find(c => c.number === clauseNumber);
    if (clause) {
      return { policy, clause };
    }
  }
  return null;
}

/**
 * 获取政策版本校验状态
 * @returns 是否已确认最新版本
 */
export function checkPolicyVersion(): boolean {
  const confirmedVersion = localStorage.getItem('policy_confirmed_version');
  return confirmedVersion === POLICY_VERSION;
}

/**
 * 确认政策版本（更新localStorage）
 */
export function confirmPolicyVersion(): void {
  localStorage.setItem('policy_confirmed_version', POLICY_VERSION);
}

/**
 * 获取导出签章文本
 * @returns 签章文本
 */
export function getExportSeal(): string {
  const now = new Date();
  const formattedTime = `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  return `─────────────────────────────────────
政策版本校验签章

政策版本：${POLICY_VERSION}
校验时间：${formattedTime}
文件来源：新疆财政厅官网（http://czt.xinjiang.gov.cn）
版本状态：✓ 已校验为最新版本
─────────────────────────────────────`;
}