/**
 * 初始模板数据
 * Task-012: ≥8个标准模板，覆盖4个分类，每个模板≥10个变量定义
 */
import { Template, TemplateCategory, TemplateScene } from '../types/template.types';

const now = new Date('2026-05-03');

export const templates: Template[] = [
  // ========== 采购方案（2个）==========
  {
    id: 'tpl-procurement-001',
    name: '标准采购方案',
    category: TemplateCategory.PROCUREMENT,
    description: '适用于常规节日慰问品采购的标准方案模板，涵盖采购依据、预算明细、供应商选择等内容',
    content: `关于${'${单位名称}'}${'${采购年份}'}年度${'${采购用途}'}采购方案

一、采购依据
根据${'${政策文件名称}'}（${'${文号}'}）及${'${上级单位名称}'}${'${上级文号}'}文件精神，结合我${'${单位类型}'}实际需求，特制定本采购方案。

二、采购内容
1. ${'${采购品目一}'}：${'${数量一}'}，预算${'${单价一}'}元/份，小计${'${小计一}'}元
2. ${'${采购品目二}'}：${'${数量二}'}，预算${'${单价二}'}元/份，小计${'${小计二}'}元
3. ${'${采购品目三}'}：${'${数量三}'}，预算${'${单价三}'}元/份，小计${'${小计三}'}元

三、预算总额
本项目预算总额为人民币${'${预算总金额}'}元（大写：${'${预算大写}'}），经费来源为${'${经费来源}'}。

四、采购方式
本次采购拟采用${'${采购方式}'}方式，通过${'${采购平台}'}进行采购，计划于${'${采购时间}'}前完成。

五、供应商选择
经市场调研，初步选定以下供应商：
1. ${'${供应商一}'}
2. ${'${供应商二}'}

六、实施计划
（一）${'${计划时间一}'}：完成需求调研
（二）${'${计划时间二}'}：完成供应商比选
（三）${'${计划时间三}'}：完成采购执行
（四）${'${计划时间四}'}：完成验收交付

七、联系人
项目负责人：${'${负责人}'}
联系电话：${'${联系电话}'}`,
    variables: [
      { key: '单位名称', label: '采购单位全称', type: 'text', required: true, defaultValue: 'XX单位' },
      { key: '采购年份', label: '采购年份', type: 'text', required: true, defaultValue: '2026' },
      { key: '采购用途', label: '采购用途', type: 'text', required: true, defaultValue: '节日慰问品' },
      { key: '政策文件名称', label: '政策依据文件名', type: 'text', required: true, defaultValue: '关于规范工会经费使用管理的通知' },
      { key: '文号', label: '政策文号', type: 'text', required: true },
      { key: '上级单位名称', label: '上级单位名称', type: 'text', required: true },
      { key: '上级文号', label: '上级批复文号', type: 'text', required: false },
      { key: '单位类型', label: '单位类型', type: 'select', required: true, options: ['机关', '事业单位', '企业', '社会团体'] },
      { key: '采购品目一', label: '采购品目一', type: 'text', required: true, defaultValue: '大米' },
      { key: '数量一', label: '品目一数量', type: 'number', required: true, defaultValue: '100' },
      { key: '单价一', label: '品目一单价(元)', type: 'number', required: true, defaultValue: '200' },
      { key: '小计一', label: '品目一小计(元)', type: 'number', required: true },
      { key: '采购品目二', label: '采购品目二', type: 'text', required: false, defaultValue: '食用油' },
      { key: '数量二', label: '品目二数量', type: 'number', required: false },
      { key: '单价二', label: '品目二单价(元)', type: 'number', required: false },
      { key: '小计二', label: '品目二小计(元)', type: 'number', required: false },
      { key: '采购品目三', label: '采购品目三', type: 'text', required: false },
      { key: '数量三', label: '品目三数量', type: 'number', required: false },
      { key: '单价三', label: '品目三单价(元)', type: 'number', required: false },
      { key: '小计三', label: '品目三小计(元)', type: 'number', required: false },
      { key: '预算总金额', label: '预算总金额(元)', type: 'number', required: true },
      { key: '预算大写', label: '预算总金额大写', type: 'text', required: true },
      { key: '经费来源', label: '经费来源', type: 'select', required: true, options: ['工会经费', '行政经费', '专项资金', '其他'] },
      { key: '采购方式', label: '采购方式', type: 'select', required: true, options: ['公开招标', '邀请招标', '竞争性谈判', '询价', '单一来源'] },
      { key: '采购平台', label: '采购平台', type: 'text', required: true, defaultValue: '政府采购云平台' },
      { key: '采购时间', label: '计划完成时间', type: 'date', required: true },
      { key: '供应商一', label: '候选供应商一', type: 'text', required: false },
      { key: '供应商二', label: '候选供应商二', type: 'text', required: false },
      { key: '计划时间一', label: '需求调研完成时间', type: 'date', required: true },
      { key: '计划时间二', label: '供应商比选完成时间', type: 'date', required: true },
      { key: '计划时间三', label: '采购执行完成时间', type: 'date', required: true },
      { key: '计划时间四', label: '验收交付完成时间', type: 'date', required: true },
      { key: '负责人', label: '项目负责人', type: 'text', required: true },
      { key: '联系电话', label: '联系电话', type: 'text', required: true },
    ],
    previewUrl: '/preview/tpl-procurement-001',
    usageCount: 156,
    isFavorite: true,
    relatedScenes: [TemplateScene.HOLIDAY],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tpl-procurement-002',
    name: '紧急采购方案',
    category: TemplateCategory.PROCUREMENT,
    description: '适用于突发应急情况下的快速采购方案，简化审批流程，强调时效性和合规性',
    content: `关于${'${单位名称}'}${'${紧急事项}'}紧急采购方案

一、紧急采购事由
因${'${紧急原因}'}，需紧急采购${'${采购物品}'}。根据${'${紧急采购政策依据}'}规定，特启动紧急采购程序。

二、采购需求
1. ${'${物品名称一}'}：数量${'${紧急数量一}'}，预算单价${'${紧急单价一}'}元，合计${'${紧急小计一}'}元
2. ${'${物品名称二}'}：数量${'${紧急数量二}'}，预算单价${'${紧急单价二}'}元，合计${'${紧急小计二}'}元

三、采购预算
紧急采购预算总额人民币${'${紧急预算总额}'}元（大写：${'${紧急预算大写}'}），从${'${预算科目}'}列支。

四、采购方式
鉴于情况紧急，拟采用${'${紧急采购方式}'}方式，直接向${'${紧急供应商}'}采购。

五、时间要求
因${'${时间紧迫原因}'}，需在${'${要求完成日期}'}前完成全部采购及交付。

六、审批意见
（一）${'${审批部门一}'}意见：
（二）${'${审批部门二}'}意见：
（三）单位负责人意见：

联系人：${'${紧急联系人}'}
联系电话：${'${紧急联系电话}'}`,
    variables: [
      { key: '单位名称', label: '采购单位全称', type: 'text', required: true },
      { key: '紧急事项', label: '紧急事项名称', type: 'text', required: true, defaultValue: '突发应急' },
      { key: '紧急原因', label: '紧急采购原因', type: 'text', required: true },
      { key: '采购物品', label: '采购物品总称', type: 'text', required: true },
      { key: '紧急采购政策依据', label: '紧急采购政策文件', type: 'text', required: true, defaultValue: '政府采购应急管理办法' },
      { key: '物品名称一', label: '物品一名称', type: 'text', required: true },
      { key: '紧急数量一', label: '物品一数量', type: 'number', required: true },
      { key: '紧急单价一', label: '物品一单价(元)', type: 'number', required: true },
      { key: '紧急小计一', label: '物品一小计(元)', type: 'number', required: true },
      { key: '物品名称二', label: '物品二名称', type: 'text', required: false },
      { key: '紧急数量二', label: '物品二数量', type: 'number', required: false },
      { key: '紧急单价二', label: '物品二单价(元)', type: 'number', required: false },
      { key: '紧急小计二', label: '物品二小计(元)', type: 'number', required: false },
      { key: '紧急预算总额', label: '预算总额(元)', type: 'number', required: true },
      { key: '紧急预算大写', label: '预算总额大写', type: 'text', required: true },
      { key: '预算科目', label: '预算科目', type: 'select', required: true, options: ['工会经费', '行政经费', '应急预备金', '其他'] },
      { key: '紧急采购方式', label: '采购方式', type: 'select', required: true, options: ['单一来源', '询价', '竞争性谈判'] },
      { key: '紧急供应商', label: '指定供应商', type: 'text', required: true },
      { key: '时间紧迫原因', label: '时间紧迫原因', type: 'text', required: true },
      { key: '要求完成日期', label: '要求完成日期', type: 'date', required: true },
      { key: '审批部门一', label: '审批部门一', type: 'text', required: true, defaultValue: '财务部门' },
      { key: '审批部门二', label: '审批部门二', type: 'text', required: false, defaultValue: '纪检监察部门' },
      { key: '紧急联系人', label: '紧急联系人', type: 'text', required: true },
      { key: '紧急联系电话', label: '紧急联系电话', type: 'text', required: true },
    ],
    previewUrl: '/preview/tpl-procurement-002',
    usageCount: 43,
    isFavorite: false,
    relatedScenes: [TemplateScene.CARE, TemplateScene.GENERAL],
    createdAt: now,
    updatedAt: now,
  },

  // ========== 慰问方案（2个）==========
  {
    id: 'tpl-consolation-001',
    name: '春节慰问方案',
    category: TemplateCategory.CONSOLATION,
    description: '适用于春节等传统节日期间的职工慰问活动方案，涵盖慰问对象、标准、物资安排等内容',
    content: `关于${'${慰问年份}'}年春节慰问活动方案

一、慰问目的
在${'${慰问年份}'}年新春佳节来临之际，为体现${'${组织名称}'}对${'${慰问对象群体}'}的关怀，根据${'${政策文件}'}精神，特制定本慰问方案。

二、慰问对象及标准
1. ${'${慰问对象一}'}：${'${慰问标准一}'}元/人，共${'${慰问人数一}'}人
2. ${'${慰问对象二}'}：${'${慰问标准二}'}元/人，共${'${慰问人数二}'}人
3. ${'${慰问对象三}'}：${'${慰问标准三}'}元/人，共${'${慰问人数三}'}人

三、慰问形式
采用${'${慰问形式}'}的方式进行慰问，具体包括：
（一）发放慰问品：${'${慰问品清单}'}
（二）发放慰问金：${'${慰问金说明}'}
（三）${'${其他形式}'}

四、经费预算
本次慰问活动预算总额人民币${'${慰问总预算}'}元（大写：${'${慰问预算大写}'}），从${'${慰问经费来源}'}列支。

五、时间安排
（一）${'${准备开始日期}'}：完成方案制定
（二）${'${物资准备日期}'}：完成物资采购
（三）${'${慰问开始日期}'}－${'${慰问结束日期}'}：开展慰问活动

六、组织保障
成立慰问工作领导小组：
组　长：${'${组长姓名}'}
副组长：${'${副组长姓名}'}
成　员：${'${成员名单}'}

联系人：${'${慰问联系人}'}
联系电话：${'${慰问联系电话}'}`,
    variables: [
      { key: '慰问年份', label: '慰问年份', type: 'text', required: true, defaultValue: '2026' },
      { key: '组织名称', label: '组织单位名称', type: 'text', required: true },
      { key: '慰问对象群体', label: '慰问对象群体', type: 'text', required: true, defaultValue: '全体职工' },
      { key: '政策文件', label: '政策依据文件', type: 'text', required: true, defaultValue: '基层工会经费收支管理办法' },
      { key: '慰问对象一', label: '慰问对象一', type: 'text', required: true, defaultValue: '在职工会会员' },
      { key: '慰问标准一', label: '慰问标准一(元/人)', type: 'number', required: true, defaultValue: '500' },
      { key: '慰问人数一', label: '慰问人数一', type: 'number', required: true },
      { key: '慰问对象二', label: '慰问对象二', type: 'text', required: false, defaultValue: '退休职工' },
      { key: '慰问标准二', label: '慰问标准二(元/人)', type: 'number', required: false, defaultValue: '300' },
      { key: '慰问人数二', label: '慰问人数二', type: 'number', required: false },
      { key: '慰问对象三', label: '慰问对象三', type: 'text', required: false, defaultValue: '困难职工' },
      { key: '慰问标准三', label: '慰问标准三(元/人)', type: 'number', required: false, defaultValue: '1000' },
      { key: '慰问人数三', label: '慰问人数三', type: 'number', required: false },
      { key: '慰问形式', label: '慰问形式', type: 'select', required: true, options: ['集中慰问', '走访慰问', '集中+走访', '线上慰问'] },
      { key: '慰问品清单', label: '慰问品清单', type: 'text', required: true, defaultValue: '米面油等生活物资' },
      { key: '慰问金说明', label: '慰问金发放说明', type: 'text', required: false },
      { key: '其他形式', label: '其他慰问形式', type: 'text', required: false },
      { key: '慰问总预算', label: '慰问总预算(元)', type: 'number', required: true },
      { key: '慰问预算大写', label: '预算大写', type: 'text', required: true },
      { key: '慰问经费来源', label: '经费来源', type: 'select', required: true, options: ['工会经费', '行政经费', '专项资金'] },
      { key: '准备开始日期', label: '方案制定完成日期', type: 'date', required: true },
      { key: '物资准备日期', label: '物资采购完成日期', type: 'date', required: true },
      { key: '慰问开始日期', label: '慰问开始日期', type: 'date', required: true },
      { key: '慰问结束日期', label: '慰问结束日期', type: 'date', required: true },
      { key: '组长姓名', label: '领导小组组长', type: 'text', required: true },
      { key: '副组长姓名', label: '领导小组副组长', type: 'text', required: true },
      { key: '成员名单', label: '领导小组成员', type: 'text', required: true },
      { key: '慰问联系人', label: '联系人', type: 'text', required: true },
      { key: '慰问联系电话', label: '联系电话', type: 'text', required: true },
    ],
    previewUrl: '/preview/tpl-consolation-001',
    usageCount: 230,
    isFavorite: true,
    relatedScenes: [TemplateScene.HOLIDAY],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tpl-consolation-002',
    name: '帮扶慰问方案',
    category: TemplateCategory.CONSOLATION,
    description: '适用于困难职工精准帮扶的慰问方案，强调摸底调查、分级帮扶、长期关怀',
    content: `关于${'${帮扶年份}'}年度困难职工帮扶慰问方案

一、帮扶背景
根据${'${帮扶政策文件}'}要求，为切实做好${'${帮扶年份}'}年度困难职工帮扶工作，结合我${'${单位类型}'}实际，制定本帮扶方案。

二、困难职工摸底情况
经调查摸底，共确定困难职工${'${困难职工总数}'}人，其中：
1. ${'${困难类型一}'}：${'${困难类型一数量}'}人
2. ${'${困难类型二}'}：${'${困难类型二数量}'}人
3. ${'${困难类型三}'}：${'${困难类型三数量}'}人

三、帮扶标准
（一）${'${困难类型一}'}：帮扶标准${'${帮扶标准一}'}元/人
（二）${'${困难类型二}'}：帮扶标准${'${帮扶标准二}'}元/人
（三）${'${困难类型三}'}：帮扶标准${'${帮扶标准三}'}元/人

四、帮扶方式
采用"${'${帮扶方式}'}"模式，具体包括：
（一）资金帮扶：发放帮扶金
（二）物资帮扶：${'${物资帮扶内容}'}
（三）${'${其他帮扶方式}'}

五、经费预算
本年度帮扶预算总额人民币${'${帮扶总预算}'}元（大写：${'${帮扶预算大写}'}），资金来源为${'${帮扶资金来源}'}。

六、时间安排
（一）${'${摸底完成日期}'}：完成困难职工摸底调查
（二）${'${审核完成日期}'}：完成帮扶对象审核公示
（三）${'${帮扶实施日期}'}：开展帮扶慰问活动
（四）${'${总结完成日期}'}：完成帮扶工作总结

七、跟踪关怀
建立${'${跟踪周期}'}跟踪回访机制，确保帮扶实效。

联系人：${'${帮扶联系人}'}
联系电话：${'${帮扶联系电话}'}`,
    variables: [
      { key: '帮扶年份', label: '帮扶年份', type: 'text', required: true, defaultValue: '2026' },
      { key: '帮扶政策文件', label: '帮扶政策依据文件', type: 'text', required: true, defaultValue: '困难职工帮扶管理办法' },
      { key: '单位类型', label: '单位类型', type: 'select', required: true, options: ['机关', '事业单位', '企业', '社会团体'] },
      { key: '困难职工总数', label: '困难职工总数', type: 'number', required: true },
      { key: '困难类型一', label: '困难类型一', type: 'text', required: true, defaultValue: '特困职工' },
      { key: '困难类型一数量', label: '特困职工人数', type: 'number', required: true },
      { key: '困难类型二', label: '困难类型二', type: 'text', required: false, defaultValue: '一般困难职工' },
      { key: '困难类型二数量', label: '一般困难职工人数', type: 'number', required: false },
      { key: '困难类型三', label: '困难类型三', type: 'text', required: false, defaultValue: '临时困难职工' },
      { key: '困难类型三数量', label: '临时困难职工人数', type: 'number', required: false },
      { key: '帮扶标准一', label: '特困帮扶标准(元/人)', type: 'number', required: true, defaultValue: '3000' },
      { key: '帮扶标准二', label: '一般困难标准(元/人)', type: 'number', required: false, defaultValue: '1500' },
      { key: '帮扶标准三', label: '临时困难标准(元/人)', type: 'number', required: false, defaultValue: '800' },
      { key: '帮扶方式', label: '帮扶方式', type: 'select', required: true, options: ['资金+物资', '资金帮扶', '物资帮扶', '综合帮扶'] },
      { key: '物资帮扶内容', label: '物资帮扶内容', type: 'text', required: false, defaultValue: '生活必需品' },
      { key: '其他帮扶方式', label: '其他帮扶方式', type: 'text', required: false, defaultValue: '就业帮扶、医疗帮扶' },
      { key: '帮扶总预算', label: '帮扶总预算(元)', type: 'number', required: true },
      { key: '帮扶预算大写', label: '预算大写', type: 'text', required: true },
      { key: '帮扶资金来源', label: '资金来源', type: 'select', required: true, options: ['工会经费', '行政拨款', '专项资金', '社会捐赠'] },
      { key: '摸底完成日期', label: '摸底完成日期', type: 'date', required: true },
      { key: '审核完成日期', label: '审核公示完成日期', type: 'date', required: true },
      { key: '帮扶实施日期', label: '帮扶实施日期', type: 'date', required: true },
      { key: '总结完成日期', label: '总结完成日期', type: 'date', required: true },
      { key: '跟踪周期', label: '跟踪回访周期', type: 'select', required: true, options: ['每月', '每季度', '每半年'] },
      { key: '帮扶联系人', label: '帮扶工作联系人', type: 'text', required: true },
      { key: '帮扶联系电话', label: '帮扶联系电话', type: 'text', required: true },
    ],
    previewUrl: '/preview/tpl-consolation-002',
    usageCount: 87,
    isFavorite: false,
    relatedScenes: [TemplateScene.CARE],
    createdAt: now,
    updatedAt: now,
  },

  // ========== 请示报告（2个）==========
  {
    id: 'tpl-request-001',
    name: '经费请示',
    category: TemplateCategory.REQUEST,
    description: '适用于向上级部门申请专项经费的请示报告，涵盖申请事由、预算明细、预期效益',
    content: `${'${呈报单位}'}文件

${'${呈报单位简称}'}〔${'${年份}'}〕${'${编号}'}号

关于申请${'${申请事项}'}经费的请示

${'${上级单位名称}'}：

为${'${申请事由}'}，根据${'${政策依据}'}精神，现申请${'${申请事项}'}专项经费。

一、项目概况
（一）项目名称：${'${项目名称}'}
（二）实施单位：${'${实施单位}'}
（三）实施时间：${'${实施开始日期}'}至${'${实施结束日期}'}
（四）项目负责人：${'${项目负责人}'}

二、经费预算
经测算，本项目共需经费人民币${'${申请总金额}'}元（大写：${'${金额大写}'}），具体明细如下：
1. ${'${预算项目一}'}：${'${预算金额一}'}元
2. ${'${预算项目二}'}：${'${预算金额二}'}元
3. ${'${预算项目三}'}：${'${预算金额三}'}元
4. ${'${预算项目四}'}：${'${预算金额四}'}元

三、预期效益
（一）${'${预期效益一}'}
（二）${'${预期效益二}'}
（三）${'${预期效益三}'}

四、经费来源
资金来源：${'${经费来源渠道}'}

妥否，请批示。

${'${呈报单位}'}
${'${呈报日期}'}

（联系人：${'${请示联系人}'}，联系电话：${'${请示联系电话}'}）`,
    variables: [
      { key: '呈报单位', label: '呈报单位全称', type: 'text', required: true },
      { key: '呈报单位简称', label: '呈报单位简称', type: 'text', required: true },
      { key: '年份', label: '发文年份', type: 'text', required: true, defaultValue: '2026' },
      { key: '编号', label: '发文编号', type: 'text', required: true },
      { key: '申请事项', label: '申请事项', type: 'text', required: true, defaultValue: '专项工作' },
      { key: '上级单位名称', label: '上级单位名称', type: 'text', required: true },
      { key: '申请事由', label: '申请事由', type: 'text', required: true },
      { key: '政策依据', label: '政策依据', type: 'text', required: true },
      { key: '项目名称', label: '项目名称', type: 'text', required: true },
      { key: '实施单位', label: '实施单位', type: 'text', required: true },
      { key: '实施开始日期', label: '实施开始日期', type: 'date', required: true },
      { key: '实施结束日期', label: '实施结束日期', type: 'date', required: true },
      { key: '项目负责人', label: '项目负责人', type: 'text', required: true },
      { key: '申请总金额', label: '申请总金额(元)', type: 'number', required: true },
      { key: '金额大写', label: '金额大写', type: 'text', required: true },
      { key: '预算项目一', label: '预算项目一', type: 'text', required: true, defaultValue: '物资采购费' },
      { key: '预算金额一', label: '项目一金额(元)', type: 'number', required: true },
      { key: '预算项目二', label: '预算项目二', type: 'text', required: false, defaultValue: '场地租赁费' },
      { key: '预算金额二', label: '项目二金额(元)', type: 'number', required: false },
      { key: '预算项目三', label: '预算项目三', type: 'text', required: false, defaultValue: '人员劳务费' },
      { key: '预算金额三', label: '项目三金额(元)', type: 'number', required: false },
      { key: '预算项目四', label: '预算项目四', type: 'text', required: false, defaultValue: '其他费用' },
      { key: '预算金额四', label: '项目四金额(元)', type: 'number', required: false },
      { key: '预期效益一', label: '预期效益一', type: 'text', required: true },
      { key: '预期效益二', label: '预期效益二', type: 'text', required: false },
      { key: '预期效益三', label: '预期效益三', type: 'text', required: false },
      { key: '经费来源渠道', label: '经费来源渠道', type: 'select', required: true, options: ['财政拨款', '工会经费', '单位自筹', '上级补助'] },
      { key: '呈报日期', label: '呈报日期', type: 'date', required: true },
      { key: '请示联系人', label: '联系人', type: 'text', required: true },
      { key: '请示联系电话', label: '联系电话', type: 'text', required: true },
    ],
    previewUrl: '/preview/tpl-request-001',
    usageCount: 198,
    isFavorite: true,
    relatedScenes: [TemplateScene.ACTIVITY, TemplateScene.GENERAL],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tpl-request-002',
    name: '活动请示',
    category: TemplateCategory.REQUEST,
    description: '适用于向上级申请组织开展专项活动的请示报告，涵盖活动方案、安全保障、预算等内容',
    content: `${'${主办单位}'}文件

${'${主办单位简称}'}〔${'${活动年份}'}〕${'${活动编号}'}号

关于举办${'${活动名称}'}的请示

${'${审批单位}'}：

为${'${活动目的}'}，根据${'${活动政策依据}'}，拟于近期举办${'${活动名称}'}。现将有关事项请示如下：

一、活动方案
（一）活动主题：${'${活动主题}'}
（二）活动时间：${'${活动开始时间}'}至${'${活动结束时间}'}
（三）活动地点：${'${活动地点}'}
（四）参加人员：${'${参加人员}'}，预计${'${参加人数}'}人
（五）活动内容：
1. ${'${活动内容一}'}
2. ${'${活动内容二}'}
3. ${'${活动内容三}'}

二、组织机构
（一）主办单位：${'${主办单位}'}
（二）承办单位：${'${承办单位}'}
（三）协办单位：${'${协办单位}'}

三、经费预算
本次活动预算人民币${'${活动总预算}'}元（大写：${'${活动预算大写}'}），从${'${活动经费来源}'}列支。

四、安全保障
制定${'${安全保障措施}'}等安全预案，确保活动安全有序开展。

妥否，请批示。

${'${主办单位}'}
${'${请示日期}'}

（联系人：${'${活动联系人}'}，联系电话：${'${活动联系电话}'}）`,
    variables: [
      { key: '主办单位', label: '主办单位全称', type: 'text', required: true },
      { key: '主办单位简称', label: '主办单位简称', type: 'text', required: true },
      { key: '活动年份', label: '发文年份', type: 'text', required: true, defaultValue: '2026' },
      { key: '活动编号', label: '发文编号', type: 'text', required: true },
      { key: '活动名称', label: '活动名称', type: 'text', required: true },
      { key: '审批单位', label: '审批单位', type: 'text', required: true },
      { key: '活动目的', label: '活动目的', type: 'text', required: true },
      { key: '活动政策依据', label: '政策依据', type: 'text', required: true },
      { key: '活动主题', label: '活动主题', type: 'text', required: true },
      { key: '活动开始时间', label: '活动开始时间', type: 'date', required: true },
      { key: '活动结束时间', label: '活动结束时间', type: 'date', required: true },
      { key: '活动地点', label: '活动地点', type: 'text', required: true },
      { key: '参加人员', label: '参加人员范围', type: 'text', required: true, defaultValue: '全体职工' },
      { key: '参加人数', label: '预计参加人数', type: 'number', required: true },
      { key: '活动内容一', label: '活动内容一', type: 'text', required: true },
      { key: '活动内容二', label: '活动内容二', type: 'text', required: false },
      { key: '活动内容三', label: '活动内容三', type: 'text', required: false },
      { key: '承办单位', label: '承办单位', type: 'text', required: false },
      { key: '协办单位', label: '协办单位', type: 'text', required: false },
      { key: '活动总预算', label: '活动总预算(元)', type: 'number', required: true },
      { key: '活动预算大写', label: '预算大写', type: 'text', required: true },
      { key: '活动经费来源', label: '经费来源', type: 'select', required: true, options: ['工会经费', '行政经费', '专项资金', '自筹资金'] },
      { key: '安全保障措施', label: '安全保障措施', type: 'text', required: true, defaultValue: '安全预案和应急预案' },
      { key: '请示日期', label: '请示日期', type: 'date', required: true },
      { key: '活动联系人', label: '活动联系人', type: 'text', required: true },
      { key: '活动联系电话', label: '联系电话', type: 'text', required: true },
    ],
    previewUrl: '/preview/tpl-request-002',
    usageCount: 112,
    isFavorite: false,
    relatedScenes: [TemplateScene.ACTIVITY],
    createdAt: now,
    updatedAt: now,
  },

  // ========== 批复文件（2个）==========
  {
    id: 'tpl-approval-001',
    name: '批复通知',
    category: TemplateCategory.APPROVAL,
    description: '适用于对下级单位请示事项的正式批复通知，包含批复意见和执行要求',
    content: `${'${批复单位}'}文件

${'${批复单位简称}'}〔${'${批复年份}'}〕${'${批复编号}'}号

关于${'${批复事项}'}的批复

${'${呈报单位}'}：

你单位《关于${'${原请示事项}'}的请示》（${'${原请示文号}'}）收悉。经研究，现批复如下：

一、${'${批复意见一}'}

二、${'${批复意见二}'}

三、${'${批复意见三}'}

请严格按照${'${执行要求}'}要求，认真组织实施，确保${'${确保事项}'}。

此复。

${'${批复单位}'}
${'${批复日期}'}

（联系人：${'${批复联系人}'}，联系电话：${'${批复联系电话}'}）`,
    variables: [
      { key: '批复单位', label: '批复单位全称', type: 'text', required: true },
      { key: '批复单位简称', label: '批复单位简称', type: 'text', required: true },
      { key: '批复年份', label: '批复年份', type: 'text', required: true, defaultValue: '2026' },
      { key: '批复编号', label: '批复编号', type: 'text', required: true },
      { key: '批复事项', label: '批复事项简述', type: 'text', required: true },
      { key: '呈报单位', label: '呈报单位全称', type: 'text', required: true },
      { key: '原请示事项', label: '原请示事项', type: 'text', required: true },
      { key: '原请示文号', label: '原请示文号', type: 'text', required: true },
      { key: '批复意见一', label: '批复意见一', type: 'text', required: true, defaultValue: '原则同意你单位请示事项。' },
      { key: '批复意见二', label: '批复意见二', type: 'text', required: false, defaultValue: '请严格按照预算执行，不得超支。' },
      { key: '批复意见三', label: '批复意见三', type: 'text', required: false },
      { key: '执行要求', label: '执行要求', type: 'text', required: true, defaultValue: '有关规定和方案' },
      { key: '确保事项', label: '确保事项', type: 'text', required: true, defaultValue: '工作顺利完成' },
      { key: '批复日期', label: '批复日期', type: 'date', required: true },
      { key: '批复联系人', label: '批复联系人', type: 'text', required: true },
      { key: '批复联系电话', label: '联系电话', type: 'text', required: true },
    ],
    previewUrl: '/preview/tpl-approval-001',
    usageCount: 165,
    isFavorite: false,
    relatedScenes: [TemplateScene.GENERAL],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tpl-approval-002',
    name: '批复意见',
    category: TemplateCategory.APPROVAL,
    description: '适用于对多个请示事项的综合批复意见，支持分项说明和差异化回复',
    content: `${'${批复单位}'}文件

${'${批复单位简称}'}〔${'${意见年份}'}〕${'${意见编号}'}号

关于${'${意见事项}'}的批复意见

${'${申请单位}'}：

你单位报来的${'${申请文件列表}'}收悉。经${'${研究方式}'}，现提出以下批复意见：

一、关于${'${事项一}'}
${'${意见内容一}'}

二、关于${'${事项二}'}
${'${意见内容二}'}

三、关于${'${事项三}'}
${'${意见内容三}'}

四、总体要求
（一）${'${总体要求一}'}
（二）${'${总体要求二}'}

请按上述意见执行，如有问题及时报告。

${'${批复单位}'}
${'${意见日期}'}

（联系人：${'${意见联系人}'}，联系电话：${'${意见联系电话}'}）`,
    variables: [
      { key: '批复单位', label: '批复单位全称', type: 'text', required: true },
      { key: '批复单位简称', label: '批复单位简称', type: 'text', required: true },
      { key: '意见年份', label: '发文年份', type: 'text', required: true, defaultValue: '2026' },
      { key: '意见编号', label: '发文编号', type: 'text', required: true },
      { key: '意见事项', label: '批复事项', type: 'text', required: true },
      { key: '申请单位', label: '申请单位', type: 'text', required: true },
      { key: '申请文件列表', label: '申请文件列表', type: 'text', required: true },
      { key: '研究方式', label: '研究方式', type: 'select', required: true, options: ['会议研究', '集体讨论', '专家论证', '书面审查'] },
      { key: '事项一', label: '分项事项一', type: 'text', required: true },
      { key: '意见内容一', label: '事项一意见', type: 'text', required: true, defaultValue: '原则同意。' },
      { key: '事项二', label: '分项事项二', type: 'text', required: false },
      { key: '意见内容二', label: '事项二意见', type: 'text', required: false, defaultValue: '原则同意。' },
      { key: '事项三', label: '分项事项三', type: 'text', required: false },
      { key: '意见内容三', label: '事项三意见', type: 'text', required: false },
      { key: '总体要求一', label: '总体要求一', type: 'text', required: true, defaultValue: '严格按照批复意见执行，不得擅自变更。' },
      { key: '总体要求二', label: '总体要求二', type: 'text', required: false, defaultValue: '执行过程中遇重大问题及时请示报告。' },
      { key: '意见日期', label: '批复日期', type: 'date', required: true },
      { key: '意见联系人', label: '批复联系人', type: 'text', required: true },
      { key: '意见联系电话', label: '联系电话', type: 'text', required: true },
    ],
    previewUrl: '/preview/tpl-approval-002',
    usageCount: 78,
    isFavorite: false,
    relatedScenes: [TemplateScene.GENERAL],
    createdAt: now,
    updatedAt: now,
  },
];
