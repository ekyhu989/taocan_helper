/**
 * ECC 调试测试 - 832占比计算
 */

import { loadProducts } from '../utils/helpers/productStorage';
import { generateThreeSchemes } from '../utils/schemeGenerator';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ECC-DEBUG: 832占比计算调试', () => {
  
  test('详细检查832占比计算过程', () => {
    const products = loadProducts();
    
    console.log('\n📦 商品库832商品列表:');
    const products832 = products.filter(p => p.is832);
    products832.forEach(p => {
      console.log(`   ${p.id}: ${p.name} (¥${p.price})`);
    });
    console.log(`   总计: ${products832.length} 个832商品`);
    
    // 生成方案
    const schemeParams = {
      totalBudget: 50000,
      peopleCount: 250,
      fundingSource: 'other',
      budgetMode: 'per_capita',
      scene: 'holiday'
    };
    
    const schemes = generateThreeSchemes(products, schemeParams);
    
    Object.entries(schemes).forEach(([name, scheme]) => {
      console.log(`\n🎯 ${name} 方案详情:`);
      console.log(`   商品数: ${scheme.items.length}`);
      console.log(`   总金额: ¥${scheme.totalAmount.toFixed(2)}`);
      console.log(`   人均: ¥${scheme.perCapitaPrice.toFixed(2)}`);
      
      // 手动计算832占比
      const items832 = scheme.items.filter(item => item.product.is832);
      const amount832 = items832.reduce((sum, item) => sum + item.subtotal, 0);
      const calculatedRatio = (amount832 / scheme.totalAmount) * 100;
      
      console.log(`\n   832商品明细:`);
      items832.forEach(item => {
        console.log(`     - ${item.product.name}: ¥${item.price} × ${item.quantity} = ¥${item.subtotal.toFixed(2)}`);
      });
      console.log(`   832总金额: ¥${amount832.toFixed(2)}`);
      console.log(`   计算的832占比: ${calculatedRatio.toFixed(1)}%`);
      console.log(`   返回的832占比: ${(scheme.ratio832.amountRatio * 100).toFixed(1)}%`);
      
      // 验证
      if (Math.abs(calculatedRatio - scheme.ratio832.amountRatio * 100) > 0.1) {
        console.error(`   ❌ 不一致！手动计算=${calculatedRatio.toFixed(1)}%, 函数返回=${(scheme.ratio832.amountRatio * 100).toFixed(1)}%`);
      }
      
      // 检查是否合理（应在0-100%之间）
      if (calculatedRatio > 100 || calculatedRatio < 0) {
        console.error(`   ❌ 异常！832占比超出范围: ${calculatedRatio.toFixed(1)}%`);
        console.error(`   可能原因:`);
        console.error(`   1. subtotal 计算错误`);
        console.error(`   2. totalPrice 计算错误`);
        console.error(`   3. is832 标识错误`);
        
        // 额外调试信息
        console.log(`\n   📊 所有商品明细:`);
        scheme.items.forEach(item => {
          const expectedSubtotal = item.price * item.quantity;
          console.log(`     ${item.product.name} (is832:${item.product.is832}): ¥${item.price} × ${item.quantity} = ¥${item.subtotal.toFixed(2)} (期望:¥${expectedSubtotal.toFixed(2)})`);
          if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) {
            console.error(`       ⚠️ subtotal不匹配!`);
          }
        });
      }
    });
    
    // 最终断言：所有方案的832占比都应在0-100%之间
    Object.values(schemes).forEach(scheme => {
      expect(scheme.ratio832.amountRatio).toBeLessThanOrEqual(1); // ≤ 100%
      expect(scheme.ratio832.amountRatio).toBeGreaterThanOrEqual(0); // ≥ 0%
    });
  });
});
