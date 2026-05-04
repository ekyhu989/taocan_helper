import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, FileText, RotateCcw } from 'lucide-react';
import { Button } from '../../components/common';
import VariableEditor, { fillTemplate, type VariableValues } from '../../components/template/VariableEditor';
import DraftRestoreModal from '../../components/draft/DraftRestoreModal';
import OnboardingGuide from '../../components/guide/OnboardingGuide';
import ExportPreviewModal from '../../components/export/ExportPreviewModal';
import type { ExportFormat } from '../../components/export/ExportPreviewModal';
import { useDraftSave } from '../../hooks/useDraftSave';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useSmartFill } from '../../hooks/useSmartFill';
import { useSolutionHistory } from '../../hooks/useSolutionHistory';
import type { Template } from '../../types/template.types';

interface LocationState {
  selectedTemplate?: Template;
}

const SolutionEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const template = state?.selectedTemplate;

  const [values, setValues] = useState<VariableValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<ExportFormat>('word');

  const {
    savedAt,
    startAutoSave,
    stopAutoSave,
    saveDraftImmediately,
    loadDraft,
    clearDraft,
  } = useDraftSave(template?.id, template?.name || '');

  const { addSolution } = useSolutionHistory();

  const { isActive, currentStep, nextStep, skipGuide } = useOnboarding();

  const {
    hasHistory,
    suggestedValues,
    saveHistory,
    clearHistory: clearSmartFillHistory,
  } = useSmartFill(template?.variables.map((v) => ({ key: v.key, label: v.label })) || []);

  const [showSmartFillTip, setShowSmartFillTip] = useState(false);

  // 初始化守卫：防止重复执行初始化逻辑导致无限重渲染
  const initGuardRef = useRef(false);

  // 初始化：检查草稿、智能填充历史或默认值
  useEffect(() => {
    if (!template) return;
    if (initGuardRef.current) return;

    const draft = loadDraft();
    if (draft) {
      // 有草稿，显示恢复弹窗
      setShowRestoreModal(true);
    } else {
      // 检查是否有智能填充历史数据
      if (hasHistory && Object.keys(suggestedValues).length > 0) {
        setShowSmartFillTip(true);
      }
      // 使用变量默认值 + 智能填充建议值
      const defaultValues: VariableValues = {};
      template.variables.forEach((v) => {
        if (v.defaultValue) {
          defaultValues[v.key] = v.defaultValue;
        } else if (v.type === 'select' && v.options && v.options.length > 0) {
          defaultValues[v.key] = v.options[0];
        }
      });
      setValues({ ...defaultValues, ...suggestedValues });
    }
    initGuardRef.current = true;
  }, [template, loadDraft, hasHistory, suggestedValues]);

  // 自动保存
  useEffect(() => {
    if (!template) return;
    startAutoSave(values);
    return () => {
      stopAutoSave();
    };
  }, [template, values, startAutoSave, stopAutoSave]);

  // 验证所有必填项
  const validateAll = useCallback((): boolean => {
    if (!template) return false;

    const newErrors: Record<string, string> = {};
    template.variables.forEach((variable) => {
      if (variable.required && !values[variable.key]?.trim()) {
        newErrors[variable.key] = `${variable.label}为必填项`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [template, values]);

  const handleValidate = useCallback((key: string, error: string) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
  }, []);

  const handleSave = useCallback(() => {
    if (!template) return;

    if (!validateAll()) {
      return;
    }

    saveDraftImmediately(values);
  }, [template, values, validateAll, saveDraftImmediately]);

  const doExportWord = useCallback(() => {
    if (!template) return;
    const content = fillTemplate(template.content, values);
    const dateStr = new Date().toISOString().split('T')[0];
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${template.name}</title>
<style>
body { font-family: SimSun, serif; font-size: 16px; line-height: 1.8; max-width: 800px; margin: 40px auto; padding: 20px; }
h1 { font-size: 22px; text-align: center; margin-bottom: 24px; }
p { text-indent: 2em; margin: 12px 0; }
</style>
</head>
<body>
<h1>${template.name}</h1>
${content.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name}_${dateStr}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    clearDraft();
    saveHistory(values);
    addSolution({
      templateId: template.id,
      templateName: template.name,
      templateCategory: template.category,
      values: { ...values },
      exportFormat: 'word',
    });
    setShowPreviewModal(false);
  }, [template, values, clearDraft, saveHistory, addSolution]);

  const doExportPDF = useCallback(() => {
    if (!template) return;
    const content = fillTemplate(template.content, values);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${template.name}</title>
<style>
@page { size: A4; margin: 2cm; }
body { font-family: SimSun, serif; font-size: 14pt; line-height: 1.8; }
h1 { font-size: 18pt; text-align: center; margin-bottom: 20pt; }
p { text-indent: 2em; margin: 8pt 0; }
</style>
</head>
<body>
<h1>${template.name}</h1>
${content.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`);
    printWindow.document.close();

    clearDraft();
    saveHistory(values);
    addSolution({
      templateId: template.id,
      templateName: template.name,
      templateCategory: template.category,
      values: { ...values },
      exportFormat: 'pdf',
    });
    setShowPreviewModal(false);
  }, [template, values, clearDraft, saveHistory, addSolution]);

  const handleExportWord = useCallback(() => {
    if (!template || !validateAll()) return;
    setPreviewFormat('word');
    setShowPreviewModal(true);
  }, [template, validateAll]);

  const handleExportPDF = useCallback(() => {
    if (!template || !validateAll()) return;
    setPreviewFormat('pdf');
    setShowPreviewModal(true);
  }, [template, validateAll]);

  const handleConfirmExport = useCallback(() => {
    if (previewFormat === 'word') {
      doExportWord();
    } else {
      doExportPDF();
    }
  }, [previewFormat, doExportWord, doExportPDF]);

  const handleReset = useCallback(() => {
    if (!template) return;
    if (window.confirm('确定要重置所有填写内容吗？')) {
      setValues({});
      setErrors({});
      clearDraft();
    }
  }, [template, clearDraft]);

  const handleRestoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setValues(draft.values);
    }
    setShowRestoreModal(false);
  }, [loadDraft]);

  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    setShowRestoreModal(false);
    // 使用默认值
    if (template) {
      const defaultValues: VariableValues = {};
      template.variables.forEach((v) => {
        if (v.defaultValue) {
          defaultValues[v.key] = v.defaultValue;
        }
      });
      setValues(defaultValues);
    }
  }, [clearDraft, template]);

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-[16px]" style={{ color: 'var(--color-text-helper)' }} />
          <h2 className="text-xl font-medium mb-[8px]" style={{ color: 'var(--color-text-primary)' }}>
            未选择模板
          </h2>
          <p className="mb-[24px]" style={{ color: 'var(--color-text-secondary)' }}>
            请先选择要使用的模板
          </p>
          <Button variant="primary" onClick={() => navigate('/templates')}>
            浏览模板
          </Button>
        </div>
      </div>
    );
  }

  const filledContent = fillTemplate(template.content, values);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="container py-[16px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[16px]">
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate('/')}
                aria-label="返回首页"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
              </Button>
              <div className="flex items-center gap-[12px]">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h1
                    className="font-semibold"
                    style={{
                      fontSize: 'var(--font-size-h3)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {template.name}
                  </h1>
                  {savedAt && (
                    <p
                      style={{
                        fontSize: 'var(--font-size-caption)',
                        color: 'var(--color-text-helper)',
                      }}
                    >
                      上次保存：{savedAt.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-[8px]" data-guide-step="3">
              <Button variant="ghost" size="small" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                重置
              </Button>
              <Button variant="secondary" size="small" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                保存
              </Button>
              <Button variant="secondary" size="small" onClick={handleExportWord}>
                <Download className="w-4 h-4 mr-1" />
                Word
              </Button>
              <Button variant="primary" size="small" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-[24px]">
        <div className="flex flex-col lg:flex-row gap-[24px]">
          {/* Left: Variable Form */}
          <div className="flex-1 lg:w-[60%] lg:flex-none">
            <div className="bg-white rounded-md border border-border p-[24px]">
              <h2
                className="font-medium mb-[24px]"
                style={{
                  fontSize: 'var(--font-size-h3)',
                  color: 'var(--color-text-primary)',
                }}
                data-guide-step="2"
              >
                填写变量
              </h2>

              {/* 智能填充提示 */}
              {showSmartFillTip && (
                <div className="mb-[16px] p-[12px] rounded-sm bg-info/10 border border-info/20 flex items-center justify-between">
                  <span
                    style={{
                      fontSize: 'var(--font-size-body2)',
                      color: 'var(--color-info)',
                    }}
                  >
                    检测到历史数据，已自动填充 {Object.keys(suggestedValues).length} 个字段
                  </span>
                  <div className="flex items-center gap-[8px]">
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => {
                        clearSmartFillHistory();
                        setShowSmartFillTip(false);
                      }}
                    >
                      清除历史
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => setShowSmartFillTip(false)}
                    >
                      知道了
                    </Button>
                  </div>
                </div>
              )}

              <VariableEditor
                template={template}
                values={values}
                onChange={setValues}
                errors={errors}
                onValidate={handleValidate}
              />
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="flex-1 lg:w-[40%] lg:flex-none">
            <div className="bg-white rounded-md border border-border p-[24px] sticky top-[24px]">
              <h2
                className="font-medium mb-[24px]"
                style={{
                  fontSize: 'var(--font-size-h3)',
                  color: 'var(--color-text-primary)',
                }}
              >
                实时预览
              </h2>
              <div
                className="whitespace-pre-wrap overflow-auto max-h-[70vh] p-[16px] rounded-sm bg-bg-light border border-border-light"
                style={{
                  fontSize: 'var(--font-size-body1)',
                  lineHeight: 'var(--line-height-loose)',
                  color: 'var(--color-text-primary)',
                }}
                aria-label="方案预览"
              >
                {filledContent || (
                  <p style={{ color: 'var(--color-text-helper)' }}>
                    填写左侧变量后，此处将显示填充后的方案内容...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Draft Restore Modal */}
      {showRestoreModal && savedAt && (
        <DraftRestoreModal
          open={showRestoreModal}
          templateName={template.name}
          savedAt={savedAt}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {/* Export Preview Modal */}
      {showPreviewModal && template && (
        <ExportPreviewModal
          open={showPreviewModal}
          title={template.name}
          content={fillTemplate(template.content, values)}
          format={previewFormat}
          onConfirm={handleConfirmExport}
          onCancel={() => setShowPreviewModal(false)}
          onSwitchFormat={setPreviewFormat}
        />
      )}

      {/* Onboarding Guide (Step 2 & 3) */}
      {isActive && (currentStep === 2 || currentStep === 3) && (
        <OnboardingGuide
          currentStep={currentStep}
          onNext={nextStep}
          onSkip={skipGuide}
        />
      )}
    </div>
  );
};

export default SolutionEditorPage;
