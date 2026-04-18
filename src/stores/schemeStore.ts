/**
 * 方案状态管理Store
 * V2.0 状态管理架构 - 支持年度数据隔离和跨组件状态共享
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  IScheme, 
  ISchemeCreateParams, 
  ISchemeUpdateParams, 
  ISchemeFilter,
  TSchemeStatus 
} from '../types';

interface ISchemeState {
  // 状态
  currentScheme: IScheme | null;
  schemeHistory: IScheme[];
  drafts: IScheme[];
  loading: boolean;
  error: string | null;
  filter: ISchemeFilter;
  
  // 操作
  setCurrentScheme: (scheme: IScheme | null) => void;
  createScheme: (params: ISchemeCreateParams) => Promise<IScheme>;
  updateScheme: (id: string, params: ISchemeUpdateParams) => Promise<IScheme>;
  deleteScheme: (id: string) => Promise<void>;
  duplicateScheme: (id: string) => Promise<IScheme>;
  changeSchemeStatus: (id: string, status: TSchemeStatus) => Promise<void>;
  
  // 筛选和查询
  setFilter: (filter: Partial<ISchemeFilter>) => void;
  getFilteredSchemes: () => IScheme[];
  searchSchemes: (query: string) => IScheme[];
  
  // 草稿管理
  saveDraft: (scheme: IScheme) => void;
  deleteDraft: (id: string) => void;
  clearDrafts: () => void;
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * 方案状态管理Store
 */
export const useSchemeStore = create<ISchemeState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentScheme: null,
      schemeHistory: [],
      drafts: [],
      loading: false,
      error: null,
      filter: {
        year: new Date().getFullYear(),
        status: undefined,
        scene: undefined,
        fundSource: undefined,
        tags: [],
        searchText: ''
      },

      // 设置当前方案
      setCurrentScheme: (scheme) => {
        set({ currentScheme: scheme });
      },

      // 创建新方案
      createScheme: async (params) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading(true);
          
          // 生成方案ID
          const schemeId = `scheme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // 计算人均预算和最大单价
          const perCapitaBudget = params.config.totalBudget / params.config.peopleCount;
          const maxPerCapitaPrice = perCapitaBudget * (params.config.fundSource === 'union' ? 0.8 : 0.9);
          
          const newScheme: IScheme = {
            id: schemeId,
            name: params.name || `${params.config.year}年${params.config.scene}采购方案`,
            year: params.config.year,
            status: params.isEmergencyDraft ? 'draft' : 'completed',
            config: {
              ...params.config,
              perCapitaBudget,
              maxPerCapitaPrice
            },
            items: params.items || [],
            compliance: {
              isCompliant: false,
              warnings: [],
              errors: [],
              budgetCompliance: {
                isWithinBudget: false,
                remainingBudget: 0,
                overBudgetAmount: 0
              },
              priceCompliance: {
                isWithinPriceLimit: false,
                maxAllowedPrice: 0,
                overPriceItems: []
              },
              platform832Compliance: {
                ratio: 0,
                isCompliant: false,
                requiredRatio: 0.3,
                actualAmount: 0,
                requiredAmount: 0
              }
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            tags: [params.config.scene, params.config.fundSource],
            isEmergencyDraft: params.isEmergencyDraft
          };

          // 添加到历史记录
          const { schemeHistory } = get();
          set({ 
            schemeHistory: [newScheme, ...schemeHistory],
            currentScheme: newScheme 
          });

          return newScheme;
        } catch (error) {
          setError(error instanceof Error ? error.message : '创建方案失败');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // 更新方案
      updateScheme: async (id, params) => {
        const { setLoading, setError, schemeHistory } = get();
        
        try {
          setLoading(true);
          
          const schemeIndex = schemeHistory.findIndex(s => s.id === id);
          if (schemeIndex === -1) {
            throw new Error('方案不存在');
          }

          const updatedScheme: IScheme = {
            ...schemeHistory[schemeIndex],
            ...params,
            updatedAt: new Date(),
            version: schemeHistory[schemeIndex].version + 1
          };

          const newHistory = [...schemeHistory];
          newHistory[schemeIndex] = updatedScheme;
          
          set({ 
            schemeHistory: newHistory,
            currentScheme: updatedScheme 
          });

          return updatedScheme;
        } catch (error) {
          setError(error instanceof Error ? error.message : '更新方案失败');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // 删除方案
      deleteScheme: async (id) => {
        const { setLoading, setError, schemeHistory } = get();
        
        try {
          setLoading(true);
          
          const newHistory = schemeHistory.filter(s => s.id !== id);
          
          set({ 
            schemeHistory: newHistory,
            currentScheme: get().currentScheme?.id === id ? null : get().currentScheme
          });
        } catch (error) {
          setError(error instanceof Error ? error.message : '删除方案失败');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // 复制方案
      duplicateScheme: async (id) => {
        const { setLoading, setError, schemeHistory } = get();
        
        try {
          setLoading(true);
          
          const originalScheme = schemeHistory.find(s => s.id === id);
          if (!originalScheme) {
            throw new Error('方案不存在');
          }

          const newSchemeId = `scheme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const duplicatedScheme: IScheme = {
            ...originalScheme,
            id: newSchemeId,
            name: `${originalScheme.name} - 副本`,
            status: 'draft' as TSchemeStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            tags: [...originalScheme.tags, '副本']
          };

          set({ 
            schemeHistory: [duplicatedScheme, ...schemeHistory],
            currentScheme: duplicatedScheme 
          });

          return duplicatedScheme;
        } catch (error) {
          setError(error instanceof Error ? error.message : '复制方案失败');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      // 修改方案状态
      changeSchemeStatus: async (id, status) => {
        const { updateScheme } = get();
        await updateScheme(id, { status });
      },

      // 设置筛选条件
      setFilter: (filter) => {
        set({ filter: { ...get().filter, ...filter } });
      },

      // 获取筛选后的方案
      getFilteredSchemes: () => {
        const { schemeHistory, filter } = get();
        
        return schemeHistory.filter(scheme => {
          // 年份筛选
          if (filter.year && scheme.year !== filter.year) return false;
          
          // 状态筛选
          if (filter.status && scheme.status !== filter.status) return false;
          
          // 场景筛选
          if (filter.scene && scheme.config.scene !== filter.scene) return false;
          
          // 资金来源筛选
          if (filter.fundSource && scheme.config.fundSource !== filter.fundSource) return false;
          
          // 标签筛选
          if (filter.tags && filter.tags.length > 0) {
            const hasMatchingTag = filter.tags.some(tag => scheme.tags.includes(tag));
            if (!hasMatchingTag) return false;
          }
          
          // 搜索文本筛选
          if (filter.searchText) {
            const searchLower = filter.searchText.toLowerCase();
            const matchesName = scheme.name.toLowerCase().includes(searchLower);
            const matchesTags = scheme.tags.some(tag => tag.toLowerCase().includes(searchLower));
            if (!matchesName && !matchesTags) return false;
          }
          
          return true;
        });
      },

      // 搜索方案
      searchSchemes: (query) => {
        const { schemeHistory } = get();
        const queryLower = query.toLowerCase();
        
        return schemeHistory.filter(scheme => 
          scheme.name.toLowerCase().includes(queryLower) ||
          scheme.tags.some(tag => tag.toLowerCase().includes(queryLower))
        );
      },

      // 保存草稿
      saveDraft: (scheme) => {
        const { drafts } = get();
        const existingIndex = drafts.findIndex(d => d.id === scheme.id);
        
        if (existingIndex >= 0) {
          const newDrafts = [...drafts];
          newDrafts[existingIndex] = scheme;
          set({ drafts: newDrafts });
        } else {
          set({ drafts: [scheme, ...drafts] });
        }
      },

      // 删除草稿
      deleteDraft: (id) => {
        const { drafts } = get();
        set({ drafts: drafts.filter(d => d.id !== id) });
      },

      // 清空草稿
      clearDrafts: () => {
        set({ drafts: [] });
      },

      // 设置加载状态
      setLoading: (loading) => {
        set({ loading });
      },

      // 设置错误
      setError: (error) => {
        set({ error });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'scheme-store',
      partialize: (state) => ({
        schemeHistory: state.schemeHistory,
        drafts: state.drafts,
        filter: state.filter
      })
    }
  )
);