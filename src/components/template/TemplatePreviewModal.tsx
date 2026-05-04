import React, { useState, useEffect } from 'react';
import { Modal, Button, Skeleton } from '../common';
import TemplatePreview from './TemplatePreview';
import type { Template } from '../../types/template.types';

interface TemplatePreviewModalProps {
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onSelect?: (template: Template) => void;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  open,
  onClose,
  onSelect,
}) => {
  const [loading, setLoading] = useState(true);

  // 模拟预加载，确保加载时间<1s
  useEffect(() => {
    if (open && template) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, template]);

  const handleSelect = () => {
    if (template) {
      onSelect?.(template);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title={template?.name || '模板预览'}
      onClose={onClose}
      size="large"
      maskClosable
      escClosable
      aria-label="模板预览"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSelect}>
            选择此模板
          </Button>
        </>
      }
    >
      {loading || !template ? (
        <div className="space-y-[16px]">
          <Skeleton type="text" className="w-1/2 h-8 mx-auto" />
          <Skeleton type="text" className="w-full h-4" />
          <Skeleton type="text" className="w-full h-4" />
          <Skeleton type="text" className="w-3/4 h-4" />
          <Skeleton type="text" className="w-full h-4" />
          <Skeleton type="text" className="w-5/6 h-4" />
          <div className="mt-[24px] pt-[16px] border-t border-border-light">
            <Skeleton type="text" className="w-32 h-5 mb-[12px]" />
            <div className="grid grid-cols-2 gap-[8px]">
              <Skeleton type="text" className="w-full h-8" />
              <Skeleton type="text" className="w-full h-8" />
              <Skeleton type="text" className="w-full h-8" />
              <Skeleton type="text" className="w-full h-8" />
            </div>
          </div>
        </div>
      ) : (
        <TemplatePreview template={template} />
      )}
    </Modal>
  );
};

export default TemplatePreviewModal;
