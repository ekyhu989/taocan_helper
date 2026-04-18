import { generateQuotationSheet, generateRandomPrice } from '../reportAssembler';

describe('QuotationGenerator - P2 Tests', () => {
  const baseAmount = 10000;

  test('TC-P2-001: should generate random price within ±5% range', () => {
    const basePrice = 100;
    const minPrice = basePrice * 0.95;
    const maxPrice = basePrice * 1.05;
    
    const results = [];
    for (let i = 0; i < 100; i++) {
      const price = generateRandomPrice(basePrice);
      results.push(price);
      expect(price).toBeGreaterThanOrEqual(minPrice);
      expect(price).toBeLessThanOrEqual(maxPrice);
    }
  });

  test('should generate quotation with supplier A matching base amount', () => {
    const mockItems = [
      {
        product: {
          name: '测试商品',
          description: '规格说明',
          unit: '份',
          price: 100
        },
        quantity: 10,
        subtotal: 1000
      }
    ];

    const quotation = generateQuotationSheet(mockItems);
    
    expect(quotation.items[0].priceA).toBe(100);
  });

  test('TC-P2-002: should generate supplier B and C within ±5% range', () => {
    const mockItems = [
      {
        product: {
          name: '测试商品',
          description: '规格说明',
          unit: '份',
          price: 100
        },
        quantity: 10,
        subtotal: 1000
      }
    ];

    const minPrice = 100 * 0.95;
    const maxPrice = 100 * 1.05;
    
    for (let i = 0; i < 100; i++) {
      const quotation = generateQuotationSheet(mockItems);
      const { priceB, priceC } = quotation.items[0];
      
      expect(priceB).toBeGreaterThanOrEqual(minPrice);
      expect(priceB).toBeLessThanOrEqual(maxPrice);
      expect(priceC).toBeGreaterThanOrEqual(minPrice);
      expect(priceC).toBeLessThanOrEqual(maxPrice);
    }
  });

  test('should mark B and C as sample data in content', () => {
    const mockItems = [
      {
        product: {
          name: '测试商品',
          description: '规格说明',
          unit: '份',
          price: 100
        },
        quantity: 10,
        subtotal: 1000
      }
    ];

    const quotation = generateQuotationSheet(mockItems);
    
    expect(quotation.content).toContain('示例数据');
  });
});
