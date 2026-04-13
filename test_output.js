// 测试实际输出
const { toChineseAmount } = require('./src/budgetValidator.ts');

console.log('10500 ->', toChineseAmount(10500));
console.log('10000 ->', toChineseAmount(10000));
console.log('1234 ->', toChineseAmount(1234));