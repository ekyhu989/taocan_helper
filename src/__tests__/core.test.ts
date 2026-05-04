/**
 * 核心逻辑单元测试
 * ─────────────────────────────────────────
 * 运行方式（无需 jest，直接 Node 执行）：
 *   npx ts-node src/__tests__/core.test.ts
 *
 * 若项目已配置 jest + ts-jest，也可：
 *   npx jest src/__tests__/core.test.ts
 */

import { validateBudget, toChineseAmount } from '../budgetValidator';
import { generateProductList, formatItemList } from '../productListGenerator';
import { assembleReport } from '../reportAssembler';
import type { Product, UserInput } from '../types';

// ─────────────────────────────────────────────
// Mock 商品库（覆盖三种场景 + 832 标识）
// ─────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p001', name: '五常大米礼盒', unit: '份', price: 58,
    category: '食品', category_tag: '食品', scenes: ['holiday', 'activity', 'care'], is832: true,
  },
  {
    id: 'p002', name: '椰树椰汁（24罐装）', unit: '箱', price: 45,
    category: '饮品', category_tag: '食品', scenes: ['holiday', 'activity'], is832: false,
  },
  {
    id: 'p003', name: '橄榄油礼盒', unit: '套', price: 128,
    category: '食品', category_tag: '食品', scenes: ['holiday'], is832: false,
  },
  {
    id: 'p004', name: '黑木耳礼包', unit: '份', price: 36,
    category: '食品', category_tag: '食品', scenes: ['holiday', 'care'], is832: true,
  },
  {
    id: 'p005', name: '防暑降温套装', unit: '套', price: 68,
    category: '日用品', category_tag: '日用品', scenes: ['activity'], is832: false,
  },
  {
    id: 'p006', name: '贵州茶叶礼盒', unit: '盒', price: 88,
    category: '食品', category_tag: '食品', scenes: ['holiday', 'care'], is832: true,
  },
  {
    id: 'p007', name: '洗护用品套装', unit: '套', price: 55,
    category: '日用品', category_tag: '日用品', scenes: ['activity', 'care'], is832: false,
  },
  {
    id: 'p008', name: '坚果礼盒', unit: '盒', price: 98,
    category: '食品', category_tag: '食品', scenes: ['holiday', 'activity', 'care'], is832: false,
  },
];

// ─────────────────────────────────────────────
// 简易断言工具
// ─────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string): void {
  if (condition) {
    console.log(`  ✅ PASS  ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${desc}`);
    failed++;
  }
}

function suite(name: string, fn: () => void): void {
  console.log(`\n▶ ${name}`);
  fn();
}

// ─────────────────────────────────────────────
// Suite 1：预算校验器
// ─────────────────────────────────────────────
suite('validateBudget', () => {
  const r1 = validateBudget(10000, 20);
  assert(r1.isValid === true, '正常输入 isValid=true');
  assert(r1.perCapita === 500, '10000/20=500 perCapita');
  assert(r1.isOverWarn === false, '人均恰好500元，不触发警告');
  assert(r1.warnMessage === null, 'warnMessage 为 null');

  const r2 = validateBudget(10001, 20);
  assert(r2.isOverWarn === true, '10001/20>500 触发警告');
  assert(typeof r2.warnMessage === 'string' && r2.warnMessage.length > 0, '有警告文案');

  const r3 = validateBudget(-100, 10);
  assert(r3.isValid === false, '负数预算 isValid=false');
  assert(r3.errorMessage !== null, '有错误文案');

  const r4 = validateBudget(5000, 0);
  assert(r4.isValid === false, '人数为0 isValid=false');

  const r5 = validateBudget(5000, 1.5);
  assert(r5.isValid === false, '人数为小数 isValid=false');

  const r6 = validateBudget(0, 10);
  assert(r6.isValid === false, '预算为0 isValid=false');
});

// ─────────────────────────────────────────────
// Suite 2：中文大写金额
// ─────────────────────────────────────────────
suite('toChineseAmount', () => {
  assert(toChineseAmount(0) === '零元整', '0 → 零元整');
  assert(toChineseAmount(100) === '壹佰元整', '100 → 壹佰元整');
  assert(toChineseAmount(1000) === '壹仟元整', '1000 → 壹仟元整');
  assert(toChineseAmount(10000) === '壹万元整', '10000 → 壹万元整');
  assert(toChineseAmount(1234) === '壹仟贰佰叁拾肆元整', '1234 → 壹仟贰佰叁拾肆元整');
  assert(toChineseAmount(10500) === '壹万零伍佰元整', '10500 → 壹万零伍佰元整');
  assert(toChineseAmount(100.5) === '壹佰元伍角', '100.5 → 壹佰元伍角');
  assert(toChineseAmount(100.55) === '壹佰元伍角伍分', '100.55 → 壹佰元伍角伍分');
});

// ─────────────────────────────────────────────
// Suite 3：品单生成器
// ─────────────────────────────────────────────
suite('generateProductList', () => {
  const totalBudget = 5000;
  const result = generateProductList(MOCK_PRODUCTS, 'holiday', totalBudget, 10);

  assert(result.items.length >= 4 && result.items.length <= 6, '商品数量在 4~6 之间');
  assert(result.totalAmount > 0, 'totalAmount > 0');
  assert(result.totalAmount <= totalBudget + 1, '合计金额不超预算（允许1元浮动）');
  assert(result.budgetUsageRate > 0 && result.budgetUsageRate <= 1, '预算使用率在 0~1 之间');
  assert(result.platform832Rate >= 0 && result.platform832Rate <= 1, '832占比在 0~1 之间');
  assert(result.hint832.includes('832'), '消费帮扶提示含"832"');

  // 每个商品数量至少为 1
  const allQtyGteOne = result.items.every((it) => it.quantity >= 1);
  assert(allQtyGteOne, '每个商品数量 ≥ 1');

  // subtotal 计算正确
  const subtotalOk = result.items.every(
    (it) => Math.abs(it.subtotal - it.product.price * it.quantity) < 0.01,
  );
  assert(subtotalOk, '每项 subtotal = price × quantity');

  // activity 场景过滤
  const resultActivity = generateProductList(MOCK_PRODUCTS, 'activity', 3000, 10);
  assert(resultActivity.items.length >= 4, 'activity 场景能生成品单');

  // 异常：空商品库
  try {
    generateProductList([], 'holiday', 5000, 10);
    assert(false, '空商品库应抛出异常');
  } catch {
    assert(true, '空商品库正确抛出异常');
  }

  // 异常：预算为0
  try {
    generateProductList(MOCK_PRODUCTS, 'holiday', 0, 10);
    assert(false, '预算为0应抛出异常');
  } catch {
    assert(true, '预算为0正确抛出异常');
  }

  // formatItemList 输出格式验证
  const listText = formatItemList(result.items);
  assert(listText.includes('1.'), '品单文本包含序号"1."');
  assert(listText.includes('×'), '品单文本包含"×"');
});

// ─────────────────────────────────────────────
// Suite 4：报告组装器
// ─────────────────────────────────────────────
suite('assembleReport', () => {
  const userInput: UserInput = {
    unitName: '示例科技有限公司',
    scene: 'holiday',
    headCount: 50,
    totalBudget: 15000,
    fundSource: '工会经费',
    department: '行政部',
    applicant: '张三',
    year: 2025,
    festival: '中秋节',
  };

  const productResult = generateProductList(MOCK_PRODUCTS, 'holiday', 15000, 50);
  const report = assembleReport(userInput, productResult);

  assert(typeof report.title === 'string' && report.title.length > 0, '报告标题非空');
  assert(report.title.includes('中秋节'), '标题含节日名称');
  assert(report.title.includes('2025'), '标题含年份');
  assert(report.body.includes('示例科技有限公司'), '正文含单位名称');
  assert(report.body.includes('50'), '正文含人数');
  assert(report.body.includes('15000'), '正文含总金额');
  assert(report.body.includes('工会经费'), '正文含资金来源');
  assert(report.body.includes('张三'), '正文含申请人');
  assert(report.body.includes('832'), '正文含832平台相关内容');
  assert(report.body.includes('温馨提示'), '正文含消费帮扶提示');
  assert(report.sceneLabel === '传统节日慰问', '场景标签正确');

  // 不应有未替换的占位符
  const hasUnfilled = /\{\{[a-zA-Z]+\}\}/.test(report.body);
  assert(!hasUnfilled, '没有未替换的 {{}} 占位符');

  // activity 场景
  const activityInput: UserInput = {
    ...userInput, scene: 'activity', festival: '夏送清凉',
  };
  const activityProduct = generateProductList(MOCK_PRODUCTS, 'activity', 15000, 50);
  const activityReport = assembleReport(activityInput, activityProduct);
  assert(activityReport.sceneLabel === '专项活动物资', 'activity 场景标签正确');
  assert(activityReport.body.includes('夏送清凉'), 'activity 报告含活动名称');

  // care 场景
  const careInput: UserInput = {
    ...userInput, scene: 'care', festival: '职工生日',
  };
  const careProduct = generateProductList(MOCK_PRODUCTS, 'care', 15000, 50);
  const careReport = assembleReport(careInput, careProduct);
  assert(careReport.sceneLabel === '精准帮扶慰问', 'care 场景标签正确');
});

// ─────────────────────────────────────────────
// 汇总
// ─────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`测试完成：${passed} 通过，${failed} 失败`);
if (failed > 0) {
  process.exit(1);
}
