import React from 'react';
import { FileText, RotateCcw, Trash2 } from 'lucide-react';
import { Button, Card } from '../common';

interface DraftRestoreModalProps {
  open: boolean;
  templateName: string;
  savedAt: Date;
  onRestore: () => void;
  onDiscard: () => void;
}

const DraftRestoreModal: React.FC<DraftRestoreModalProps> = ({
  open,
  templateName,
  savedAt,
  onRestore,
  onDiscard,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-mask"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-restore-title"
    >
      <Card className="w-full max-w-[480px] mx-[16px] p-[24px]">
        <div className="flex items-center gap-[12px] mb-[16px]">
          <div
            className="w-[40px] h-[40px] flex items-center justify-center rounded-md"
            style={{ backgroundColor: 'var(--color-info)/10' }}
          >
            <FileText className="w-5 h-5 text-info" />
          </div>
          <div>
            <h3
              id="draft-restore-title"
              className="font-medium"
              style={{
                fontSize: 'var(--font-size-h3)',
                color: 'var(--color-text-primary)',
              }}
            >
              检测到未完成的草稿
            </h3>
            <p
              style={{
                fontSize: 'var(--font-size-body2)',
                color: 'var(--color-text-secondary)',
              }}
            >
              「{templateName}」上次保存于 {savedAt.toLocaleString('zh-CN')}
            </p>
          </div>
        </div>

        <p
          className="mb-[24px]"
          style={{
            fontSize: 'var(--font-size-body1)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-body)',
          }}
        >
          您有一份未完成的草稿，是否恢复已填写的内容？
        </p>

        <div className="flex items-center justify-end gap-[8px]">
          <Button variant="ghost" size="small" onClick={onDiscard}>
            <Trash2 className="w-4 h-4 mr-1" />
            放弃并重新开始
          </Button>
          <Button variant="primary" size="small" onClick={onRestore}>
            <RotateCcw className="w-4 h-4 mr-1" />
            恢复草稿
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DraftRestoreModal;
