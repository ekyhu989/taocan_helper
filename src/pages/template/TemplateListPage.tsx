import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button, Skeleton } from '../../components/common';
import TemplateCard from '../../components/template/TemplateCard';
import TemplateFilter, { type SortOption } from '../../components/template/TemplateFilter';
import TemplatePreviewModal from '../../components/template/TemplatePreviewModal';
import { templates } from '../../data/templates';
import { TemplateCategory, TemplateScene, type Template } from '../../types/template.types';
import { useFavorites } from '../../hooks/useFavorites';
import { type SceneFilter } from '../../components/template/TemplateFilter';

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [activeScene, setActiveScene] = useState<SceneFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('usage');
  const [loading, setLoading] = useState(true);
  const [templateList, setTemplateList] = useState<Template[]>([]);

  // 模拟加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setTemplateList(templates);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // 过滤和排序
  const filteredTemplates = useMemo(() => {
    let result = [...templateList];

    // 分类过滤
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory);
    }

    // 场景过滤
    if (activeScene !== 'all') {
      result = result.filter((t) =>
        t.relatedScenes.includes(activeScene as TemplateScene)
      );
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

    // 排序
    result.sort((a, b) => {
      if (sortBy === 'usage') {
        return b.usageCount - a.usageCount;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [templateList, activeCategory, activeScene, searchQuery, sortBy]);

  const handleTemplateClick = useCallback(
    (template: Template) => {
      navigate('/solution', { state: { selectedTemplate: template } });
    },
    [navigate]
  );

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const handlePreview = useCallback((template: Template) => {
    setPreviewTemplate(template);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewTemplate(null);
  }, []);

  const handleSelectPreview = useCallback((template: Template) => {
    navigate('/solution', { state: { selectedTemplate: template } });
  }, [navigate]);

  const { toggleFavorite, isFavorite } = useFavorites();

  const handleToggleFavorite = useCallback((template: Template) => {
    toggleFavorite({
      id: template.id,
      type: 'template',
      title: template.name,
      category: template.category,
      summary: template.description,
    });
  }, [toggleFavorite]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="container py-[16px]">
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
              <FileText className="w-6 h-6 text-primary" />
              <h1
                className="font-semibold"
                style={{
                  fontSize: 'var(--font-size-h2)',
                  color: 'var(--color-text-primary)',
                }}
              >
                公文模板库
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-[24px]">
        {/* Filter Section */}
        <div className="bg-white rounded-md border border-border p-[16px] mb-[24px]">
          <TemplateFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            activeScene={activeScene}
            onSceneChange={setActiveScene}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Results Count */}
        <div className="mb-[16px]">
          <span
            style={{
              fontSize: 'var(--font-size-body2)',
              color: 'var(--color-text-secondary)',
            }}
          >
            共找到 <strong>{filteredTemplates.length}</strong> 个模板
          </span>
        </div>

        {/* Template Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-md border border-border p-[16px]">
                <Skeleton type="text" className="w-16 h-5 mb-[12px]" />
                <Skeleton type="text" className="w-3/4 h-6 mb-[8px]" />
                <Skeleton type="text" className="w-full h-4 mb-[4px]" />
                <Skeleton type="text" className="w-2/3 h-4 mb-[16px]" />
                <div className="flex justify-between pt-[12px] border-t border-border-light">
                  <Skeleton type="text" className="w-20 h-4" />
                  <Skeleton type="text" className="w-16 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={{ ...template, isFavorite: isFavorite(template.id) }}
                onClick={handleTemplateClick}
                onPreview={handlePreview}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-[64px]">
            <FileText
              className="w-16 h-16 mb-[16px]"
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
            <p
              className="mt-[8px]"
              style={{
                fontSize: 'var(--font-size-body2)',
                color: 'var(--color-text-helper)',
              }}
            >
              请尝试调整搜索条件或分类筛选
            </p>
          </div>
        )}
      </main>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={handleClosePreview}
        onSelect={handleSelectPreview}
      />
    </div>
  );
};

export default TemplateListPage;
