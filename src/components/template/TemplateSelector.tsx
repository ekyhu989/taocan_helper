import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FileText } from 'lucide-react';
import { Button, ToastProvider } from '../common';
import { useToastContext } from '../common/Toast/ToastProvider';
import TemplateCard from './TemplateCard';
import TemplateFilter, { type SortOption, type SceneFilter } from './TemplateFilter';
import TemplatePreviewModal from './TemplatePreviewModal';
import { templates } from '../../data/templates';
import { TemplateCategory, type Template, TemplateScene } from '../../types/template.types';
import { useFavorites } from '../../hooks/useFavorites';

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (template: Template) => void;
}

const TemplateSelectorContent: React.FC<TemplateSelectorProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const navigate = useNavigate();
  const { add } = useToastContext();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { toggleFavorite, isFavorite } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [activeScene, setActiveScene] = useState<SceneFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('usage');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 自动聚焦搜索框
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // 计算匹配度
  const calculateMatchScore = useCallback((template: Template): number => {
    if (activeScene === 'all') return 0;
    const hasScene = template.relatedScenes.includes(activeScene as TemplateScene);
    return hasScene ? 100 : 0;
  }, [activeScene]);

  // 过滤和排序（收藏优先，然后最近使用/使用频率/匹配度）
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // 分类过滤
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory);
    }

    // 场景过滤
    if (activeScene !== 'all') {
      result = result.filter((t) => t.relatedScenes.includes(activeScene as TemplateScene));
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    // 排序：收藏优先，然后按排序选项
    result.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      if (sortBy === 'match') {
        const scoreA = calculateMatchScore(a);
        const scoreB = calculateMatchScore(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.usageCount - a.usageCount;
      }
      if (sortBy === 'usage') {
        return b.usageCount - a.usageCount;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [activeCategory, activeScene, searchQuery, sortBy, calculateMatchScore]);

  const handlePreview = useCallback((template: Template) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  }, []);

  const handleSelect = useCallback(
    (template: Template) => {
      add({
        type: 'success',
        message: `已选择模板「${template.name}」`,
        description: '正在跳转到方案编辑页面...',
        duration: 2000,
      });
      onClose();
      
      // 调用外部回调（埋点统计、日志记录等）
      onSelect?.(template);
      
      // 延迟导航，让用户看到 Toast
      setTimeout(() => {
        navigate('/solution', { state: { selectedTemplate: template } });
      }, 500);
    },
    [add, navigate, onClose, onSelect]
  );

  const handleToggleFavorite = useCallback((template: Template) => {
    toggleFavorite({
      id: template.id,
      type: 'template',
      title: template.name,
      category: template.category,
      summary: template.description,
    });
  }, [toggleFavorite]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-mask"
        role="dialog"
        aria-modal="true"
        aria-labelledby="selector-title"
        aria-live="polite"
      >
        <div className="relative bg-white rounded-lg shadow-lg w-full max-w-[900px] max-h-[90vh] flex flex-col mx-[16px]">
          {/* Header */}
          <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-border-light">
            <div className="flex items-center gap-[12px]">
              <FileText className="w-5 h-5 text-primary" />
              <h3
                id="selector-title"
                className="font-medium"
                style={{
                  fontSize: 'var(--font-size-h3)',
                  color: 'var(--color-text-primary)',
                }}
              >
                选择模板
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-sm hover:bg-bg-light transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Filter */}
          <div className="px-[24px] py-[16px] border-b border-border-light">
            <TemplateFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              activeScene={activeScene}
              onSceneChange={setActiveScene}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {/* Template Grid */}
          <div className="flex-1 overflow-auto px-[24px] py-[16px]">
            <div className="mb-[12px]">
              <span
                style={{
                  fontSize: 'var(--font-size-body2)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                共 <strong>{filteredTemplates.length}</strong> 个模板
              </span>
            </div>

            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={{ ...template, isFavorite: isFavorite(template.id) }}
                    matchScore={sortBy === 'match' ? calculateMatchScore(template) : 0}
                    onClick={(t) => handlePreview(t)}
                    onPreview={handlePreview}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-[48px]">
                <FileText
                  className="w-12 h-12 mb-[12px]"
                  style={{ color: 'var(--color-text-helper)' }}
                />
                <p
                  style={{
                    fontSize: 'var(--font-size-body1)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  未找到匹配的模板
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-[8px] px-[24px] py-[16px] border-t border-border-light">
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
};

const TemplateSelector: React.FC<TemplateSelectorProps> = (props) => {
  return (
    <ToastProvider>
      <TemplateSelectorContent {...props} />
    </ToastProvider>
  );
};

export default TemplateSelector;
