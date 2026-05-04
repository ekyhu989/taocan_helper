import React from 'react';
import { X, FileText, Download, RotateCcw } from 'lucide-react';
import { Button } from '../common';

export type ExportFormat = 'word' | 'pdf';

interface ExportPreviewModalProps {
  open: boolean;
  title: string;
  content: string;
  format: ExportFormat;
  onConfirm: () => void;
  onCancel: () => void;
  onSwitchFormat: (format: ExportFormat) => void;
}

const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  open,
  title,
  content,
  format,
  onConfirm,
  onCancel,
  onSwitchFormat,
}) => {
  if (!open) return null;

  const lines = content.split('\n').filter((line) => line.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-mask"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[800px] max-h-[90vh] flex flex-col mx-[16px]">
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-border-light">
          <div className="flex items-center gap-[12px]">
            <FileText className="w-5 h-5 text-primary" />
            <h3
              id="preview-title"
              className="font-medium"
              style={{
                fontSize: 'var(--font-size-h3)',
                color: 'var(--color-text-primary)',
              }}
            >
              导出预览
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-sm hover:bg-bg-light transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Format Switch */}
        <div className="px-[24px] py-[12px] border-b border-border-light bg-bg-light">
          <div className="flex items-center gap-[8px]">
            <span
              style={{
                fontSize: 'var(--font-size-body2)',
                color: 'var(--color-text-secondary)',
              }}
            >
              导出格式：
            </span>
            <Button
              variant={format === 'word' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => onSwitchFormat('word')}
            >
              Word
            </Button>
            <Button
              variant={format === 'pdf' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => onSwitchFormat('pdf')}
            >
              PDF
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto px-[24px] py-[16px]">
          <div
            className="border border-border-light rounded-sm p-[32px] bg-white"
            style={{
              fontFamily: format === 'word' ? 'SimSun, serif' : 'SimSun, serif',
              fontSize: format === 'word' ? '16px' : '14pt',
              lineHeight: '1.8',
            }}
          >
            <h1
              className="text-center mb-[24px] font-bold"
              style={{
                fontSize: format === 'word' ? '22px' : '18pt',
              }}
            >
              {title}
            </h1>
            {lines.map((line, i) => (
              <p
                key={i}
                style={{
                  textIndent: '2em',
                  margin: format === 'word' ? '12px 0' : '8pt 0',
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-[8px] px-[24px] py-[16px] border-t border-border-light">
          <Button variant="ghost" onClick={onCancel}>
            <RotateCcw className="w-4 h-4 mr-1" />
            返回修改
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            <Download className="w-4 h-4 mr-1" />
            确认导出
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportPreviewModal;
