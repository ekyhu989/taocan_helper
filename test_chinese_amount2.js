// 测试修复后的中文大写金额转换
const { toChineseAmount } = require('./src/budgetValidator.ts');

console.log('Testing fixed toChineseAmount function:');
console.log('10500 ->', toChineseAmount(10500));
console.log('1234 ->', toChineseAmount(1234));
console.log('10000 ->', toChineseAmount(10000));
console.log('100 ->', toChineseAmount(100));
console.log('1000 ->', toChineseAmount(1000));
console.log('100.5 ->', toChineseAmount(100.5));
console.log('100.55 ->', toChineseAmount(100.55));
console.log('0 ->', toChineseAmount(0));