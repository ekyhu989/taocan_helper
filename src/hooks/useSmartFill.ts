import { useState, useCallback, useEffect, useMemo } from 'react';
import type { VariableValues } from '../components/template/VariableEditor';

const HISTORY_KEY = 'taocang-form-history';

/** 智能识别可填充的字段类型 */
const FIELD_PATTERNS: Record<string, RegExp[]> = {
  unitName: [/单位名称/, /单位/, /采购单位/],
  contactPerson: [/联系人/, /经办人/, /负责人/],
  contactPhone: [/联系电话/, /电话/, /手机号/, /联系方式/],
  budget: [/预算金额/, /预算/, /金额/, /经费/],
};

export interface SmartFillData {
  hasHistory: boolean;
  suggestedValues: VariableValues;
  saveHistory: (values: VariableValues) => void;
  clearHistory: () => void;
  applyFill: (values: VariableValues) => VariableValues;
}

const loadHistory = (): VariableValues => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {};
};

const saveHistoryToStorage = (values: VariableValues) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(values));
};

/**
 * 根据字段key和label识别字段类型
 */
const identifyField = (key: string, label: string): string | null => {
  const text = `${key}${label}`;
  for (const [fieldType, patterns] of Object.entries(FIELD_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) {
      return fieldType;
    }
  }
  return null;
};

/**
 * 表单字段智能填充Hook
 * Task-027: 基于历史数据自动填充表单字段
 */
export const useSmartFill = (
  variables: Array<{ key: string; label: string }> = []
): SmartFillData => {
  const [history, setHistory] = useState<VariableValues>(() => loadHistory());

  // 页面加载时同步历史数据
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const hasHistory = Object.keys(history).length > 0;

  // 计算建议填充值（基于当前模板的变量匹配历史数据）
  const suggestedValues = useMemo(() => {
    if (!hasHistory || variables.length === 0) return {};
    const result: VariableValues = {};

    // 先识别当前模板中各字段的类型
    const currentFieldTypes: Record<string, string> = {};
    variables.forEach((v) => {
      const type = identifyField(v.key, v.label);
      if (type) currentFieldTypes[v.key] = type;
    });

    // 再识别历史数据中各字段的类型
    const historyFieldTypes: Record<string, string> = {};
    Object.keys(history).forEach((key) => {
      // 尝试从key本身识别类型
      for (const [fieldType, patterns] of Object.entries(FIELD_PATTERNS)) {
        if (patterns.some((p) => p.test(key))) {
          historyFieldTypes[key] = fieldType;
          break;
        }
      }
    });

    // 按字段类型匹配
    Object.entries(currentFieldTypes).forEach(([varKey, varType]) => {
      Object.entries(historyFieldTypes).forEach(([histKey, histType]) => {
        if (varType === histType && history[histKey]) {
          result[varKey] = history[histKey];
        }
      });
    });

    // 直接key匹配（兜底）
    variables.forEach((v) => {
      if (history[v.key] && !result[v.key]) {
        result[v.key] = history[v.key];
      }
    });

    return result;
  }, [hasHistory, variables, history]);

  const saveHistory = useCallback((values: VariableValues) => {
    // 只保存智能填充相关的字段
    const filtered: VariableValues = {};
    Object.entries(values).forEach(([key, value]) => {
      if (value && value.trim()) {
        // 检查是否是智能填充相关字段
        const isRelevant = Object.values(FIELD_PATTERNS).some((patterns) =>
          patterns.some((p) => p.test(key))
        );
        if (isRelevant) {
          filtered[key] = value;
        }
      }
    });
    if (Object.keys(filtered).length > 0) {
      saveHistoryToStorage(filtered);
      setHistory(filtered);
    }
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory({});
  }, []);

  const applyFill = useCallback(
    (currentValues: VariableValues): VariableValues => {
      return { ...currentValues, ...suggestedValues };
    },
    [suggestedValues]
  );

  return {
    hasHistory,
    suggestedValues,
    saveHistory,
    clearHistory,
    applyFill,
  };
};

export default useSmartFill;
