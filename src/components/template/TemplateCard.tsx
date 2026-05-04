import React from 'react';
import { Star, Eye, BarChart3, Sparkles } from 'lucide-react';
import { Card } from '../common';
import type { Template } from '../../types/template.types';
import { TemplateScene } from '../../types/template.types';

interface TemplateCardProps {
  template: Template;
  matchScore?: number;
  onClick?: (template: Template) => void;
  onPreview?: (template: Template) => void;
  onToggleFavorite?: (template: Template) => void;
}

const categoryLabels: Record<string, string> = {
  procurement: '采购方案',
  consolation: '慰问方案',
  request: '请示报告',
  approval: '批复文件',
};

const sceneLabels: Record<string, string> = {
  [TemplateScene.HOLIDAY]: '节日慰问',
  [TemplateScene.ACTIVITY]: '员工活动',
  [TemplateScene.CARE]: '困难帮扶',
  [TemplateScene.GENERAL]: '通用',
};

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  matchScore,
  onClick,
  onPreview,
  onToggleFavorite,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(template);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(template);
  };

  return (
    <Card
      variant="hover"
      onClick={() => onClick?.(template)}
      className="relative group"
      role="article"
      aria-label={`模板：${template.name}`}
    >
      {/* 收藏按钮 */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-[12px] right-[12px] p-1 rounded-sm hover:bg-bg-light transition-colors z-10"
        aria-label={template.isFavorite ? '取消收藏' : '收藏'}
        aria-pressed={template.isFavorite}
      >
        <Star
          className={`w-5 h-5 ${
            template.isFavorite
              ? 'text-warning fill-warning'
              : 'text-text-helper'
          }`}
        />
      </button>

      {/* 分类标签 + 场景标签 + 匹配度 */}
      <div className="mb-[12px] flex items-center gap-[8px] flex-wrap">
        <span className="inline-flex items-center px-[8px] py-[2px] rounded-sm text-[12px] font-medium bg-info/10 text-info">
          {categoryLabels[template.category] || template.category}
        </span>
        {template.relatedScenes.map((scene) => (
          <span
            key={scene}
            className="inline-flex items-center px-[8px] py-[2px] rounded-sm text-[12px] font-medium bg-success/10 text-success"
          >
            {sceneLabels[scene] || scene}
          </span>
        ))}
        {matchScore !== undefined && matchScore > 0 && (
          <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-sm text-[12px] font-medium bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3" />
            匹配度 {matchScore}%
          </span>
        )}
      </div>

      {/* 模板名称 */}
      <h3
        className="font-medium mb-[8px] pr-[32px]"
        style={{
          fontSize: 'var(--font-size-h3)',
          color: 'var(--color-text-primary)',
        }}
      >
        {template.name}
      </h3>

      {/* 模板描述 */}
      <p
        className="mb-[16px] line-clamp-2"
        style={{
          fontSize: 'var(--font-size-body2)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--line-height-body)',
        }}
      >
        {template.description}
      </p>

      {/* 底部信息 */}
      <div className="flex items-center justify-between pt-[12px] border-t border-border-light">
        <div className="flex items-center gap-[16px]">
          <span
            className="inline-flex items-center gap-[4px]"
            style={{
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-text-helper)',
            }}
          >
            <BarChart3 className="w-4 h-4" />
            {template.usageCount}次使用
          </span>
        </div>

        <button
          onClick={handlePreviewClick}
          className="inline-flex items-center gap-[4px] px-[12px] py-[4px] rounded-sm text-[13px] font-medium text-primary hover:bg-bg-light transition-colors"
          aria-label={`预览模板：${template.name}`}
        >
          <Eye className="w-4 h-4" />
          预览
        </button>
      </div>
    </Card>
  );
};

export default TemplateCard;
