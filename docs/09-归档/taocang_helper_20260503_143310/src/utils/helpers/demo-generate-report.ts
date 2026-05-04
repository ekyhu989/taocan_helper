/**
 * 报告生成功能演示
 * ─────────────────────────────────────────
 * 演示从表单数据 → 完整报告的完整流程
 * 
 * 运行方式：
 *   npx ts-node src/demo-generate-report.ts
 */

import { generateReport } from './pages/ReportPreviewPage';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     AI采购方案生成工具 - 报告生成功能演示                   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// 场景 1：传统节日慰问（中秋节）
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('【场景 1】传统节日慰问 - 中秋节');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const holidayFormData = {
  unitName: '某某科技有限公司',
  scene: 'holiday' as const,
  headCount: 50,
  totalBudget: 10000,
  fundSource: '工会经费',
  department: '行政部',
  applicant: '张三',
  festival: '中秋节',
  year: 2025,
};

try {
  const report = generateReport(holidayFormData);
  
  console.log('📋 场景标签：', report.sceneLabel);
  console.log('📄 报告标题：', report.title);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('【完整报告正文】');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(report.body);
  
  // 验证占位符替换
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('【占位符替换验证】');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const checks = [
    ['单位名称（某某科技有限公司）', report.body.includes('某某科技有限公司')],
    ['人数（50人）', report.body.includes('50')],
    ['总金额（10000元）', report.body.includes('10000')],
    ['大写金额（壹万元整）', report.body.includes('壹万元整')],
    ['申请人（张三）', report.body.includes('张三')],
    ['部门（行政部）', report.body.includes('行政部')],
    ['年份（2025）', report.body.includes('2025')],
    ['节日（中秋节）', report.body.includes('中秋节')],
    ['资金来源（工会经费）', report.body.includes('工会经费')],
    ['832平台占比', report.body.includes('832平台') && report.body.includes('%')],
    ['品单列表（带序号）', /\d+\.\s+.+（\d+\w+\s*×\s*\d+元）/.test(report.body)],
    ['消费帮扶提示', report.body.includes('消费帮扶')],
  ];
  
  checks.forEach(([desc, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${desc}`);
  });
  
  // 检查未替换的占位符
  const unmatched = report.body.match(/\{\{\w+\}\}/g);
  if (unmatched) {
    console.log(`\n⚠️  发现未替换占位符: ${unmatched.join(', ')}`);
  } else {
    console.log('\n✅ 所有占位符已正确替换');
  }
  
} catch (err) {
  console.error('❌ 生成失败:', (err as Error).message);
}

// 场景 2：专项活动物资（夏送清凉）
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('【场景 2】专项活动物资 - 夏送清凉');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const activityFormData = {
  ...holidayFormData,
  scene: 'activity' as const,
  festival: '夏送清凉',
  headCount: 30,
  totalBudget: 6000,
};

try {
  const report = generateReport(activityFormData);
  console.log('📋 场景标签：', report.sceneLabel);
  console.log('📄 报告标题：', report.title);
  console.log('\n【正文预览 - 前 20 行】');
  console.log(report.body.split('\n').slice(0, 20).join('\n'));
  console.log('\n... (省略后续内容)');
  console.log('✅ 包含"申请背景"：', report.body.includes('申请背景'));
  console.log('✅ 包含"夏送清凉"：', report.body.includes('夏送清凉'));
} catch (err) {
  console.error('❌ 生成失败:', (err as Error).message);
}

// 场景 3：精准帮扶慰问（生日慰问）
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('【场景 3】精准帮扶慰问 - 生日慰问');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const careFormData = {
  ...holidayFormData,
  scene: 'care' as const,
  festival: '生日慰问',
  headCount: 1,
  totalBudget: 300,
};

try {
  const report = generateReport(careFormData);
  console.log('📋 场景标签：', report.sceneLabel);
  console.log('📄 报告标题：', report.title);
  console.log('\n【正文预览 - 前 20 行】');
  console.log(report.body.split('\n').slice(0, 20).join('\n'));
  console.log('\n... (省略后续内容)');
  console.log('✅ 包含"慰问事由"：', report.body.includes('慰问事由'));
  console.log('✅ 包含"生日慰问"：', report.body.includes('生日慰问'));
} catch (err) {
  console.error('❌ 生成失败:', (err as Error).message);
}

// 错误处理演示
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('【错误处理演示】');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const errorCases = [
  { ...holidayFormData, totalBudget: -1000, desc: '负数预算' },
  { ...holidayFormData, headCount: 0, desc: '人数为0' },
  { ...holidayFormData, headCount: 3.5, desc: '人数为小数' },
];

errorCases.forEach((testCase) => {
  try {
    generateReport(testCase);
    console.log(`❌ ${testCase.desc}：未抛出错误`);
  } catch (err) {
    console.log(`✅ ${testCase.desc}：正确抛出错误 - ${(err as Error).message}`);
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('【演示完成】');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n💡 使用说明：');
console.log('   1. 在用户表单页面收集数据（单位名称、人数、预算等）');
console.log('   2. 点击"生成方案"按钮时调用 generateReport(formData)');
console.log('   3. 将返回的 report.body 显示在预览页面的文本框中');
console.log('   4. 用户可复制报告内容或导出为 Word/PDF');
