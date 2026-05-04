import { filterHistory, getBudgetRangeLabel, getPlatform832RangeLabel } from '../utils/historyFilter';

describe('V1.6 历史筛选 - historyFilter', () => {
  const mockHistory = [
    {
      id: '1',
      createdAt: '2025-01-15',
      festival: '春节',
      year: 2025,
      totalBudget: 5000,
      platform832Rate: 35,
      complianceStatus: 'compliant',
      tags: ['优先', '快速'],
    },
    {
      id: '2',
      createdAt: '2025-02-20',
      festival: '古尔邦节',
      year: 2025,
      totalBudget: 8000,
      platform832Rate: 25,
      complianceStatus: 'warning',
      tags: ['新疆特色'],
    },
    {
      id: '3',
      createdAt: '2024-12-25',
      festival: '肉孜节',
      year: 2024,
      totalBudget: 12000,
      platform832Rate: 85,
      complianceStatus: 'compliant',
      tags: ['年度'],
    },
  ];

  describe('节日筛选', () => {
    test('TC-V16-061: 按节日筛选', () => {
      const result = filterHistory(mockHistory, { festival: '春节' });
      expect(result.length).toBe(1);
      expect(result[0].festival).toBe('春节');
    });

    test('TC-V16-062: 新疆特色节日筛选', () => {
      const result = filterHistory(mockHistory, { festival: '古尔邦节' });
      expect(result.length).toBe(1);
      expect(result[0].festival).toBe('古尔邦节');
    });
  });

  describe('年份筛选', () => {
    test('TC-V16-063: 按年份筛选', () => {
      const result = filterHistory(mockHistory, { year: 2025 });
      expect(result.length).toBe(2);
      result.forEach(item => expect(item.year).toBe(2025));
    });
  });

  describe('预算范围筛选', () => {
    test('TC-V16-064: 预算范围筛选（5000-10000）', () => {
      const result = filterHistory(mockHistory, { budgetRange: [5000, 10000] });
      expect(result.length).toBe(2);
      result.forEach(item => {
        expect(item.totalBudget).toBeGreaterThanOrEqual(5000);
        expect(item.totalBudget).toBeLessThanOrEqual(10000);
      });
    });
  });

  describe('832占比筛选', () => {
    test('TC-V16-065: 832占比筛选（≥30%）', () => {
      const result = filterHistory(mockHistory, { platform832Range: [30, 100] });
      expect(result.length).toBe(2);
      result.forEach(item => {
        expect(item.platform832Rate).toBeGreaterThanOrEqual(30);
      });
    });

    test('TC-V16-066: 832占比不达标筛选（<30%）', () => {
      const result = filterHistory(mockHistory, { platform832Range: [0, 29] });
      expect(result.length).toBe(1);
      expect(result[0].platform832Rate).toBeLessThan(30);
    });
  });

  describe('合规状态筛选', () => {
    test('TC-V16-067: 合规状态筛选', () => {
      const result = filterHistory(mockHistory, { complianceStatus: 'compliant' });
      expect(result.length).toBe(2);
      result.forEach(item => expect(item.complianceStatus).toBe('compliant'));
    });
  });

  describe('标签筛选', () => {
    test('TC-V16-068: 单个标签筛选', () => {
      const result = filterHistory(mockHistory, { tags: ['优先'] });
      expect(result.length).toBe(1);
      expect(result[0].tags).toContain('优先');
    });

    test('TC-V16-069: 多个标签筛选（OR逻辑）', () => {
      const result = filterHistory(mockHistory, { tags: ['优先', '年度'] });
      expect(result.length).toBe(2);
    });
  });

  describe('多条件组合筛选', () => {
    test('TC-V16-070: 年份+节日组合筛选', () => {
      const result = filterHistory(mockHistory, { year: 2025, festival: '春节' });
      expect(result.length).toBe(1);
      expect(result[0].year).toBe(2025);
      expect(result[0].festival).toBe('春节');
    });

    test('TC-V16-071: 无筛选条件返回全部', () => {
      const result = filterHistory(mockHistory, {});
      expect(result.length).toBe(mockHistory.length);
    });
  });

  describe('标签生成函数', () => {
    test('TC-V16-072: 预算范围标签生成', () => {
      expect(getBudgetRangeLabel([0, 5000])).toBe('0-5000元');
      expect(getBudgetRangeLabel([5000, Infinity])).toBe('5000元以上');
    });

    test('TC-V16-073: 832占比范围标签生成', () => {
      expect(getPlatform832RangeLabel([0, 0.29])).toBe('<30%（不达标）');
      expect(getPlatform832RangeLabel([0.3, 0.49])).toBe('30-50%');
      expect(getPlatform832RangeLabel([0.8, 1])).toBe('>80%');
    });
  });
});
