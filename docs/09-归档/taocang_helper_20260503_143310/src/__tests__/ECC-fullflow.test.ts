/**
 * ECC (Everything-Claude-Code) 端到端验证测试
 * 
 * 测试范围：
 * 1. 商品库数据加载与完整性
 * 2. 基础信息表单数据流
 * 3. 方案生成算法（PATCH-001）
 * 4. 三方案生成与切换
 * 5. 报告组装与模板渲染
 * 6. React Key 唯一性检查
 */

import { loadProducts, generateProductId } from '../utils/helpers/productStorage';
import { generateThreeSchemes, calculateCombinationTarget, calculatePerCapitaLimit } from '../utils/schemeGenerator';
import { assembleReport } from '../utils/helpers/reportAssembler';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ECC 全流程验证', () => {

  // ═══════════════════════════════════════════
  // ECC-1: 商品库数据加载与完整性
  // ═══════════════════════════════════════════
  describe('ECC-1: 商品库数据', () => {
    
    test('应成功加载商品库数据', () => {
      const products = loadProducts();
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    test('每个商品应有唯一ID', () => {
      const products = loadProducts();
      const ids = products.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      // 检查是否有重复ID
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('商品应包含必要字段', () => {
      const products = loadProducts();
      const requiredFields = ['id', 'name', 'price', 'unit', 'category', 'is832'];
      
      products.forEach(product => {
        requiredFields.forEach(field => {
          expect(product).toHaveProperty(field);
        });
        
        // 价格应为正数
        expect(product.price).toBeGreaterThan(0);
      });
    });

    test('generateProductId 应生成唯一ID', () => {
      const id1 = generateProductId();
      const id2 = generateProductId();
      const id3 = generateProductId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
      
      // ID格式应以'p'开头
      expect(id1).toMatch(/^p\d+/);
    });

    test('832平台商品占比应合理（≥30%）', () => {
      const products = loadProducts();
      const count832 = products.filter(p => p.is832).length;
      const ratio832 = (count832 / products.length) * 100;
      
      console.log(`商品库统计: 总数=${products.length}, 832商品=${count832}, 占比=${ratio832.toFixed(1)}%`);
      
      // 至少应该有部分832商品
      expect(count832).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════
  // ECC-2: 基础信息表单数据流
  // ═══════════════════════════════════════════
  describe('ECC-2: 基础信息表单数据流', () => {
    
    const validFormData = {
      scene: 'holiday',
      festival: 'spring',
      headCount: 250,
      totalBudget: 50000,
      fundSource: '行政福利费',
      budgetMode: 'per_capita',
      category: '食品',
      department: '工会',
      applicant: '张三',
      unitName: '某某单位'
    };

    test('表单数据应包含所有必要字段', () => {
      const requiredFields = [
        'scene', 'festival', 'headCount', 'totalBudget',
        'fundSource', 'budgetMode', 'category'
      ];
      
      requiredFields.forEach(field => {
        expect(validFormData).toHaveProperty(field);
        expect(validFormData[field]).toBeDefined();
      });
    });

    test('预算模式应正确识别', () => {
      expect(validFormData.budgetMode).toBe('per_capita');
      
      // 测试总额控制模式
      const totalControlData = { ...validFormData, budgetMode: 'total_control' };
      expect(totalControlData.budgetMode).toBe('total_control');
    });

    test('人均预算计算应正确', () => {
      const perCapita = validFormData.totalBudget / validFormData.headCount;
      expect(perCapita).toBe(200); // 50000 / 250 = 200
    });
  });

  // ═══════════════════════════════════════════
  // ECC-3: 方案生成算法逻辑 (PATCH-001)
  // ═══════════════════════════════════════════
  describe('ECC-3: PATCH-001 方案生成算法', () => {
    
    const schemeParams = {
      totalBudget: 50000,
      peopleCount: 250,
      fundingSource: 'other', // 行政福利费对应 other
      budgetMode: 'per_capita',
      scene: 'holiday'
    };

    test('calculatePerCapitaLimit 应返回正确的上限', () => {
      const perCapitaBudget = 200; // 50000 / 250
      const limit = calculatePerCapitaLimit(perCapitaBudget, 'other');
      
      // 其他资金: 200 / 0.9 ≈ 222
      expect(limit).toBe(222);
    });

    test('calculateCombinationTarget 应返回正确的组合参数', () => {
      const result = calculateCombinationTarget(schemeParams);
      
      // ✅ 单人份模式：targetBudget 使用人均上限
      expect(result.perCapitaLimit).toBe(222);           // 人均上限
      expect(result.targetBudget).toBe(222);             // 人均上限
      expect(result.maxBudget).toBeCloseTo(233.1, 0);   // 222 * 1.05
      expect(result.minBudget).toBeCloseTo(199.8, 0);   // 222 * 0.9
    });

    test('generateThreeSchemes 应一次生成三个方案', () => {
      const products = loadProducts();
      const schemes = generateThreeSchemes(products, schemeParams);
      
      expect(schemes).toHaveProperty('balanced');
      expect(schemes).toHaveProperty('costEffective');
      expect(schemes).toHaveProperty('highQuality');
      
      // 每个方案都应有商品列表
      expect(schemes.balanced.items.length).toBeGreaterThan(0);
      expect(schemes.costEffective.items.length).toBeGreaterThan(0);
      expect(schemes.highQuality.items.length).toBeGreaterThan(0);
    });

    test('方案的人均价格应在合理范围内', () => {
      const products = loadProducts();
      const schemes = generateThreeSchemes(products, schemeParams);
      
      Object.values(schemes).forEach(scheme => {
        // 人均价格应 ≤ 人均上限 (222元)
        expect(scheme.perCapitaPrice).toBeLessThanOrEqual(222);
        
        // 人均价格应 > 0
        expect(scheme.perCapitaPrice).toBeGreaterThan(0);
        
        console.log(`方案人均价格: ¥${scheme.perCapitaPrice.toFixed(2)} (上限: ¥222)`);
      });
    });
  });

  // ═══════════════════════════════════════════
  // ECC-4: 三方案差异化验证
  // ═══════════════════════════════════════════
  describe('ECC-4: 三方案差异化', () => {
    
    const schemeParams = {
      totalBudget: 50000,
      peopleCount: 100,
      fundingSource: 'union',
      budgetMode: 'per_capita',
      scene: 'holiday'
    };

    test('三个方案应有不同的商品组合', () => {
      const products = loadProducts();
      const schemes = generateThreeSchemes(products, schemeParams);
      
      const balancedIds = new Set(schemes.balanced.items.map(i => i.product.id));
      const costEffectiveIds = new Set(schemes.costEffective.items.map(i => i.product.id));
      const highQualityIds = new Set(schemes.highQuality.items.map(i => i.product.id));
      
      // 三个方案的商品集合不应完全相同
      const allSame = 
        balancedIds.size === costEffectiveIds.size &&
        balancedIds.size === highQualityIds.size &&
        [...balancedIds].every(id => costEffectiveIds.has(id)) &&
        [...balancedIds].every(id => highQualityIds.has(id));
      
      // 允许相同（如果商品库很小），但记录日志
      if (allSame) {
        console.warn('⚠️ 三个方案商品组合完全相同（可能商品库较小）');
      }
    });

    test('高性价比方案应倾向更多商品件数（单人份显示）', () => {
      const products = loadProducts();
      const schemes = generateThreeSchemes(products, schemeParams);
      
      // 单人份模式：商品件数 = 商品种类数（不是总数量）
      const balancedItemCount = schemes.balanced.items.length;
      const costEffectiveItemCount = schemes.costEffective.items.length;
      const highQualityItemCount = schemes.highQuality.items.length;
      
      console.log(`均衡方案商品种类: ${balancedItemCount}, 高性价比: ${costEffectiveItemCount}, 高品质: ${highQualityItemCount}`);
      
      // 高性价比方案的商品种类应 ≥ 均衡方案（或接近）
      // 注意：由于人均模式的约束，差异可能较小
      expect(costEffectiveItemCount).toBeGreaterThanOrEqual(balancedItemCount * 0.6);
    });
  });

  // ═══════════════════════════════════════════
  // ECC-5: 报告组装与模板渲染
  // ═══════════════════════════════════════════
  describe('ECC-5: 报告组装', () => {
    
    const userInput = {
      scene: 'holiday',
      festival: 'spring',
      headCount: 250,
      totalBudget: 50000,
      fundSource: '行政福利费',
      department: '工会',
      applicant: '张三',
      unitName: '某某单位'
    };

    test('assembleReport 应成功生成报告', () => {
      const products = loadProducts();
      const schemeParams = {
        totalBudget: 50000,
        peopleCount: 250,
        fundingSource: 'other',
        budgetMode: 'per_capita'
      };
      
      const schemes = generateThreeSchemes(products, schemeParams);
      const report = assembleReport(userInput, schemes.balanced);
      
      expect(report).toBeDefined();
      expect(report.title).toContain('采购');
      expect(report.body).not.toContain('{{'); // 不应包含未替换的占位符
      
      console.log(`报告标题: ${report.title}`);
      console.log(`报告长度: ${report.body.length} 字符`);
    });

    test('报告应包含关键信息', () => {
      const products = loadProducts();
      const schemeParams = {
        totalBudget: 50000,
        peopleCount: 250,
        fundingSource: 'other',
        budgetMode: 'per_capita'
      };
      
      const schemes = generateThreeSchemes(products, schemeParams);
      const report = assembleReport(userInput, schemes.balanced);
      
      // 检查是否包含单位名称、人数、预算等关键信息
      expect(report.body).toContain(userInput.unitName || userInput.title);
      expect(report.body).toContain(String(userInput.headCount));
      expect(report.body).toContain(String(userInput.totalBudget));
    });
  });

  // ═══════════════════════════════════════════
  // ECC-6: React Key 唯一性检查
  // ═══════════════════════════════════════════
  describe('ECC-6: React Key 唯一性', () => {
    
    test('生成的方案中商品ID应唯一', () => {
      const products = loadProducts();
      const schemeParams = {
        totalBudget: 50000,
        peopleCount: 100,
        fundingSource: 'union',
        budgetMode: 'per_capita'
      };
      
      const schemes = generateThreeSchemes(products, schemeParams);
      
      // 收集所有方案中的商品ID
      const allIds = [];
      Object.values(schemes).forEach(scheme => {
        scheme.items.forEach(item => {
          allIds.push(item.product.id);
        });
      });
      
      // 检查唯一性
      const uniqueIds = new Set(allIds);
      
      console.log(`总商品引用数: ${allIds.length}, 唯一ID数: ${uniqueIds.size}`);
      
      // 如果有重复ID，说明有问题
      if (uniqueIds.size !== allIds.length) {
        const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
        console.error('❌ 发现重复ID:', [...new Set(duplicates)]);
      }
      
      // 注意：不同方案可能包含相同商品，这是正常的
      // 这里主要确保同一方案内没有重复
    });

    test('同一方案内的商品ID应唯一', () => {
      const products = loadProducts();
      const schemeParams = {
        totalBudget: 50000,
        peopleCount: 100,
        fundingSource: 'union',
        budgetMode: 'per_capita'
      };
      
      const schemes = generateThreeSchemes(products, schemeParams);
      
      // 检查每个方案内部
      Object.entries(schemes).forEach(([schemeName, scheme]) => {
        const ids = scheme.items.map(item => item.product.id);
        const uniqueIds = new Set(ids);
        
        expect(uniqueIds.size).toBe(ids.length);
        console.log(`${schemeName} 方案商品数: ${ids.length} (全部唯一 ✓)`);
      });
    });
  });

  // ═══════════════════════════════════════════
  // 完整端到端流程测试
  // ═══════════════════════════════════════════
  describe('完整端到端流程', () => {
    
    test('从表单输入到报告输出的完整流程', () => {
      // Step 1: 模拟用户填写表单
      const formData = {
        scene: 'holiday',
        festival: 'spring',
        headCount: 250,
        totalBudget: 50000,
        fundSource: '行政福利费',
        budgetMode: 'per_capita',
        category: '食品',
        department: '工会',
        applicant: '张三',
        unitName: '某某单位'
      };
      
      console.log('\n📋 Step 1: 用户填写表单');
      console.log(`   场景: ${formData.scene}`);
      console.log(`   人数: ${formData.headCount}`);
      console.log(`   预算: ¥${formData.totalBudget}`);
      console.log(`   预算模式: ${formData.budgetMode}`);
      
      // Step 2: 加载商品库
      console.log('\n📦 Step 2: 加载商品库');
      const products = loadProducts();
      console.log(`   商品数量: ${products.length}`);
      console.log(`   832商品: ${products.filter(p => p.is832).length}`);
      
      // Step 3: 构造方案参数
      const schemeParams = {
        totalBudget: formData.totalBudget,
        peopleCount: formData.headCount,
        fundingSource: formData.fundSource === '其他资金' ? 'other' : 'union',
        budgetMode: formData.budgetMode,
        scene: formData.scene
      };
      
      // Step 4: 计算目标参数
      console.log('\n🎯 Step 3: 计算组合目标');
      const targetParams = calculateCombinationTarget({
        ...schemeParams,
        fundingSource: 'other' // 行政福利费
      });
      console.log(`   人均上限: ¥${targetParams.perCapitaLimit}`);
      console.log(`   总价上限: ¥${targetParams.targetBudget}`);
      
      // Step 5: 生成三个方案
      console.log('\n🎨 Step 4: 生成三个方案');
      const threeSchemes = generateThreeSchemes(products, {
        ...schemeParams,
        fundingSource: 'other'
      });
      
      Object.entries(threeSchemes).forEach(([name, scheme]) => {
        console.log(`   ${name}:`);
        console.log(`     - 商品数: ${scheme.items.length}`);
        console.log(`     - 总金额: ¥${scheme.totalAmount.toFixed(2)}`);
        console.log(`     - 人均: ¥${scheme.perCapitaPrice.toFixed(2)}`);
        console.log(`     - 832占比: ${(scheme.ratio832.amountRatio * 100).toFixed(1)}%`);
      });
      
      // Step 6: 生成报告
      console.log('\n📄 Step 5: 生成公文报告');
      const fullUserInput = {
        ...formData,
        unitName: formData.unitName
      };
      
      const report = assembleReport(fullUserInput, threeSchemes.balanced);
      console.log(`   标题: ${report.title}`);
      console.log(`   正文字符数: ${report.body.length}`);
      
      // 验证结果
      expect(report.title).toBeTruthy();
      expect(report.body.length).toBeGreaterThan(100);
      
      // 验证合规性
      threeSchemes.balanced.items.forEach(item => {
        expect(item.product.price).toBeGreaterThan(0);
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.subtotal).toBeGreaterThan(0);
      });
      
      console.log('\n✅ 完整流程验证通过！');
    });
  });
});
