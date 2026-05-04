import React from 'react';
import { Star, Eye, Tag, Sparkles } from 'lucide-react';
import { Card } from '../common';
import type { Policy } from '../../types/policy.types';

interface PolicyCardProps {
  policy: Policy;
  onClick?: (policy: Policy) => void;
  onToggleFavorite?: (policy: Policy) => void;
  highlightText?: string;
  recommendTags?: string[];
}

const categoryLabels: Record<string, string> = {
  national: '国家政策',
  local: '地方政策',
  industry: '行业规范',
};

const levelLabels: Record<string, string> = {
  mandatory: '强制',
  suggestion: '建议',
  reference: '参考',
};

const categoryColors: Record<string, string> = {
  national: 'bg-info/10 text-info',
  local: 'bg-info/10 text-info',
  industry: 'bg-info/10 text-info',
};

const levelColors: Record<string, string> = {
  mandatory: 'bg-error/10 text-error',
  suggestion: 'bg-warning/10 text-warning',
  reference: 'bg-text-secondary/10 text-text-secondary',
};

/**
 * 高亮文本中的关键词
 */
const HighlightText: React.FC<{ text: string; keyword: string }> = ({
  text,
  keyword,
}) => {
  if (!keyword.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-warning/30 rounded-sm px-[2px]">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  onClick,
  onToggleFavorite,
  highlightText = '',
  recommendTags = [],
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(policy);
  };

  return (
    <Card
      variant="hover"
      onClick={() => onClick?.(policy)}
      className="relative group"
      role="article"
      aria-label={`政策：${policy.title}`}
    >
      {/* 收藏按钮 */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-[12px] right-[12px] p-1 rounded-sm hover:bg-bg-light transition-colors z-10"
        aria-label={policy.isFavorite ? '取消收藏' : '收藏'}
        aria-pressed={policy.isFavorite}
      >
        <Star
          className={`w-5 h-5 ${
            policy.isFavorite
              ? 'text-warning fill-warning'
              : 'text-text-helper'
          }`}
        />
      </button>

      {/* 推荐标签 */}
      {recommendTags.length > 0 && (
        <div className="flex flex-wrap gap-[6px] mb-[8px]">
          {recommendTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-[4px] px-[6px] py-[2px] rounded-sm text-[11px] font-medium bg-primary/10 text-primary"
            >
              <Sparkles className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 标签区域 */}
      <div className="flex flex-wrap gap-[8px] mb-[12px]">
        <span
          className={`inline-flex items-center px-[8px] py-[2px] rounded-sm text-[12px] font-medium ${categoryColors[policy.category]}`}
        >
          {categoryLabels[policy.category] || policy.category}
        </span>
        {policy.scene.map((s) => (
          <span
            key={s}
            className="inline-flex items-center px-[8px] py-[2px] rounded-sm text-[12px] font-medium bg-success/10 text-success"
          >
            {s === 'holiday' ? '节日慰问' : s === 'activity' ? '专项活动' : '精准帮扶'}
          </span>
        ))}
        <span
          className={`inline-flex items-center px-[8px] py-[2px] rounded-sm text-[12px] font-medium ${levelColors[policy.level]}`}
        >
          {levelLabels[policy.level] || policy.level}
        </span>
        <span
          className="inline-flex items-center px-[8px] py-[2px] rounded-sm text-[12px] font-medium bg-text-secondary/10 text-text-secondary"
        >
          {policy.year}年
        </span>
      </div>

      {/* 政策标题 */}
      <h3
        className="font-medium mb-[8px] pr-[32px] line-clamp-2"
        style={{
          fontSize: 'var(--font-size-h3)',
          color: 'var(--color-text-primary)',
        }}
      >
        <HighlightText text={policy.title} keyword={highlightText} />
      </h3>

      {/* 政策摘要 */}
      <p
        className="mb-[16px] line-clamp-2"
        style={{
          fontSize: 'var(--font-size-body2)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--line-height-body)',
        }}
      >
        {policy.summary}
      </p>

      {/* 底部信息 */}
      <div className="flex items-center justify-between pt-[12px] border-t border-border-light">
        <span
          className="inline-flex items-center gap-[4px]"
          style={{
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-helper)',
          }}
        >
          <Eye className="w-4 h-4" />
          {policy.viewCount}次浏览
        </span>
        <span
          className="inline-flex items-center gap-[4px]"
          style={{
            fontSize: 'var(--font-size-caption)',
            color: 'var(--color-text-helper)',
          }}
        >
          <Tag className="w-4 h-4" />
          {policy.fileType.toUpperCase()}
        </span>
      </div>
    </Card>
  );
};

export default PolicyCard;
