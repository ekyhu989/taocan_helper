import { useState, useCallback, useEffect } from 'react';
import type { VariableValues } from '../components/template/VariableEditor';

const STORAGE_KEY = 'taocang-solution-history';
export const MAX_HISTORY = 20;

export interface SolutionHistoryItem {
  id: string;
  templateId: string;
  templateName: string;
  templateCategory: string;
  values: VariableValues;
  exportedAt: string;
  exportFormat: 'word' | 'pdf';
}

const loadHistory = (): SolutionHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
};

const saveHistory = (items: SolutionHistoryItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
};

/**
 * 方案历史记录Hook
 * Task-025: 方案对比功能的数据基础
 */
export const useSolutionHistory = () => {
  const [items, setItems] = useState<SolutionHistoryItem[]>(loadHistory);

  // 同步到localStorage
  useEffect(() => {
    saveHistory(items);
  }, [items]);

  const addSolution = useCallback(
    (solution: Omit<SolutionHistoryItem, 'id' | 'exportedAt'>) => {
      const newItem: SolutionHistoryItem = {
        ...solution,
        id: `sol-${Date.now()}`,
        exportedAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev].slice(0, MAX_HISTORY));
    },
    []
  );

  const removeSolution = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addSolution,
    removeSolution,
    clearHistory,
  };
};

export default useSolutionHistory;
