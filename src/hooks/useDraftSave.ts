import { useState, useEffect, useCallback, useRef } from 'react';
import type { VariableValues } from '../components/template/VariableEditor';

const STORAGE_KEY = 'taocang-drafts';

export const getDraftKey = (templateId: string) => `${STORAGE_KEY}-${templateId}`;

export interface DraftData {
  templateId: string;
  templateName: string;
  values: VariableValues;
  savedAt: string;
}

export const useDraftSave = (templateId: string | undefined, templateName: string) => {
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval>>();

  // 检查是否存在草稿
  useEffect(() => {
    if (!templateId) {
      setHasDraft(false);
      return;
    }
    const draft = localStorage.getItem(getDraftKey(templateId));
    setHasDraft(!!draft);
    if (draft) {
      try {
        const parsed: DraftData = JSON.parse(draft);
        setSavedAt(new Date(parsed.savedAt));
      } catch {
        // ignore parse error
      }
    }
  }, [templateId]);

  // 自动保存（30秒间隔）
  const startAutoSave = useCallback(
    (values: VariableValues) => {
      if (!templateId) return;

      // 先清除之前的定时器
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }

      autoSaveRef.current = setInterval(() => {
        if (Object.keys(values).length > 0) {
          const draft: DraftData = {
            templateId,
            templateName,
            values,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(getDraftKey(templateId), JSON.stringify(draft));
          setSavedAt(new Date());
          setHasDraft(true);
        }
      }, 30000);
    },
    [templateId, templateName]
  );

  const stopAutoSave = useCallback(() => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
      autoSaveRef.current = undefined;
    }
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, []);

  // useBeforeUnload 提示未保存内容
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasDraft) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasDraft]);

  const saveDraftImmediately = useCallback(
    (values: VariableValues) => {
      if (!templateId) return;
      const draft: DraftData = {
        templateId,
        templateName,
        values,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(getDraftKey(templateId), JSON.stringify(draft));
      setSavedAt(new Date());
      setHasDraft(true);
    },
    [templateId, templateName]
  );

  const loadDraft = useCallback((): DraftData | null => {
    if (!templateId) return null;
    const draft = localStorage.getItem(getDraftKey(templateId));
    if (!draft) return null;
    try {
      return JSON.parse(draft) as DraftData;
    } catch {
      return null;
    }
  }, [templateId]);

  const clearDraft = useCallback(() => {
    if (!templateId) return;
    localStorage.removeItem(getDraftKey(templateId));
    setHasDraft(false);
    setSavedAt(null);
  }, [templateId]);

  return {
    savedAt,
    hasDraft,
    startAutoSave,
    stopAutoSave,
    saveDraftImmediately,
    loadDraft,
    clearDraft,
  };
};
