/**
 * 年度数据管理Store
 * V2.0 状态管理架构 - 实现年度数据物理隔离
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IAnnualDataState {
  // 状态
  currentYear: number;
  annualData: Record<string, any>; // 年度数据缓存
  
  // 操作
  setYear: (year: number) => void;
  getAnnualKey: (key: string) => string;
  getAnnualData: <T>(key: string, defaultValue?: T) => T | undefined;
  setAnnualData: <T>(key: string, data: T) => void;
  clearAnnualData: (year?: number) => void;
  
  // 年度数据统计
  getYearlyStatistics: () => Record<number, {
    schemeCount: number;
    totalBudget: number;
    totalSpending: number;
    platform832Ratio: number;
  }>;
  
  // 跨年度数据迁移
  migrateData: (fromYear: number, toYear: number, keys: string[]) => void;
}

/**
 * 年度数据管理Store
 */
export const useAnnualDataStore = create<IAnnualDataState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentYear: new Date().getFullYear(),
      annualData: {},

      // 设置当前年份
      setYear: (year) => {
        set({ currentYear: year });
      },

      // 获取年度化键名
      getAnnualKey: (key) => {
        const { currentYear } = get();
        return `${key}_${currentYear}`;
      },

      // 获取年度数据
      getAnnualData: <T>(key: string, defaultValue?: T) => {
        const { annualData, getAnnualKey } = get();
        const annualKey = getAnnualKey(key);
        return annualData[annualKey] ?? defaultValue;
      },

      // 设置年度数据
      setAnnualData: <T>(key: string, data: T) => {
        const { annualData, getAnnualKey } = get();
        const annualKey = getAnnualKey(key);
        
        set({
          annualData: {
            ...annualData,
            [annualKey]: data
          }
        });
      },

      // 清空年度数据
      clearAnnualData: (year?: number) => {
        const { annualData, currentYear } = get();
        const targetYear = year ?? currentYear;
        
        const newAnnualData = { ...annualData };
        
        // 删除指定年份的所有数据
        Object.keys(newAnnualData).forEach(key => {
          if (key.endsWith(`_${targetYear}`)) {
            delete newAnnualData[key];
          }
        });
        
        set({ annualData: newAnnualData });
      },

      // 获取年度统计
      getYearlyStatistics: () => {
        const { annualData } = get();
        const statistics: Record<number, {
          schemeCount: number;
          totalBudget: number;
          totalSpending: number;
          platform832Ratio: number;
        }> = {};

        // 从年度数据中提取统计信息
        Object.keys(annualData).forEach(key => {
          if (key.startsWith('schemeHistory_')) {
            const year = parseInt(key.split('_')[1]);
            const schemes = annualData[key] as any[];
            
            if (!statistics[year]) {
              statistics[year] = {
                schemeCount: 0,
                totalBudget: 0,
                totalSpending: 0,
                platform832Ratio: 0
              };
            }
            
            statistics[year].schemeCount += schemes.length;
            
            schemes.forEach(scheme => {
              statistics[year].totalBudget += scheme.config.totalBudget || 0;
              
              // 计算实际支出
              const totalSpending = scheme.items?.reduce((sum: number, item: any) => 
                sum + (item.price * item.quantity), 0) || 0;
              statistics[year].totalSpending += totalSpending;
              
              // 计算832平台占比
              const platform832Amount = scheme.items?.reduce((sum: number, item: any) => 
                item.is832Platform ? sum + (item.price * item.quantity) : sum, 0) || 0;
              
              if (totalSpending > 0) {
                statistics[year].platform832Ratio += platform832Amount / totalSpending;
              }
            });
            
            // 计算平均832占比
            if (schemes.length > 0) {
              statistics[year].platform832Ratio /= schemes.length;
            }
          }
        });

        return statistics;
      },

      // 跨年度数据迁移
      migrateData: (fromYear: number, toYear: number, keys: string[]) => {
        const { annualData } = get();
        const newAnnualData = { ...annualData };
        
        keys.forEach(key => {
          const fromKey = `${key}_${fromYear}`;
          const toKey = `${key}_${toYear}`;
          
          if (newAnnualData[fromKey]) {
            newAnnualData[toKey] = newAnnualData[fromKey];
            
            // 可选：删除源数据
            // delete newAnnualData[fromKey];
          }
        });
        
        set({ annualData: newAnnualData });
      }
    }),
    {
      name: 'annual-data-store',
      partialize: (state) => ({
        currentYear: state.currentYear,
        annualData: state.annualData
      })
    }
  )
);

/**
 * 年度数据工具函数
 */

/**
 * 获取所有可用年份
 */
export const getAvailableYears = (): number[] => {
  const { annualData } = useAnnualDataStore.getState();
  const years = new Set<number>();
  
  Object.keys(annualData).forEach(key => {
    const match = key.match(/_(\d{4})$/);
    if (match) {
      years.add(parseInt(match[1]));
    }
  });
  
  return Array.from(years).sort((a, b) => b - a); // 降序排列
};

/**
 * 检查年份是否被锁定（年末锁定机制）
 */
export const isYearLocked = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year < currentYear; // 往年数据锁定
};

/**
 * 获取年度数据存储键名（静态方法）
 */
export const getAnnualStorageKey = (key: string, year: number): string => {
  return `${key}_${year}`;
};

/**
 * 清理过期年度数据（保留最近3年）
 */
export const cleanupExpiredAnnualData = (): void => {
  const { annualData, clearAnnualData } = useAnnualDataStore.getState();
  const currentYear = new Date().getFullYear();
  const keepYears = 3; // 保留最近3年数据
  
  const years = getAvailableYears();
  const expiredYears = years.filter(year => year < currentYear - keepYears);
  
  expiredYears.forEach(year => {
    clearAnnualData(year);
  });
};