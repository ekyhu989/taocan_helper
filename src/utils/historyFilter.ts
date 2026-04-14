export interface FilterOptions {
  festival?: string;
  year?: number;
  budgetRange?: [number, number];
  platform832Range?: [number, number];
  productType?: string;
  complianceStatus?: string;
  tags?: string[];
}

export interface HistoryItem {
  id: string;
  createdAt: string;
  tags?: string[];
  festival?: string;
  year?: number;
  totalBudget?: number;
  totalAmount?: number;
  platform832Amount?: number;
  platform832Rate?: number;
  complianceStatus?: 'compliant' | 'warning' | 'exceeded';
  productType?: string;
  useCount?: number;
}

export const filterHistory = (
  history: HistoryItem[],
  filters: FilterOptions
) => {
  return history.filter(item => {
    if (filters.festival && item.festival !== filters.festival) return false;
    if (filters.year && item.year !== filters.year) return false;
    if (filters.budgetRange && item.totalBudget) {
      const [min, max] = filters.budgetRange;
      if (item.totalBudget < min || item.totalBudget > max) return false;
    }
    if (filters.platform832Range && item.platform832Rate !== undefined) {
      const [min, max] = filters.platform832Range;
      if (item.platform832Rate < min || item.platform832Rate > max) return false;
    }
    if (filters.productType && item.productType !== filters.productType) return false;
    if (filters.complianceStatus && item.complianceStatus !== filters.complianceStatus) return false;
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => item.tags?.includes(tag));
      if (!hasTag) return false;
    }
    return true;
  });
};

export const getBudgetRangeLabel = (range: [number, number]) => {
  const [min, max] = range;
  if (max === Infinity) return `${min}元以上`;
  return `${min}-${max}元`;
};

export const getPlatform832RangeLabel = (range: [number, number]) => {
  const [min, max] = range;
  if (min === 0 && max < 0.3) return '<30%（不达标）';
  if (min === 0.3 && max < 0.5) return '30-50%';
  if (min === 0.5 && max < 0.8) return '50-80%';
  return '>80%';
};
