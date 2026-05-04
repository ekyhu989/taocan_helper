import React from 'react';
import { X, FileText, LayoutTemplate, ExternalLink } from 'lucide-react';
import { Button } from '../common';
import type { FavoriteItem } from '../../hooks/useFavorites';

interface FavoriteItemCardProps {
  item: FavoriteItem;
  onRemove: (id: string) => void;
  onNavigate: (item: FavoriteItem) => void;
}

const typeConfig = {
  template: {
    icon: LayoutTemplate,
    label: '方案模板',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  policy: {
    icon: FileText,
    label: '政策文件',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
};

const FavoriteItemCard: React.FC<FavoriteItemCardProps> = ({
  item,
  onRemove,
  onNavigate,
}) => {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div
      className="flex items-center gap-[12px] p-[12px] bg-white rounded-sm border border-border-light hover:shadow-card transition-shadow"
      role="listitem"
      aria-label={`${config.label}：${item.title}`}
    >
      {/* 类型图标 */}
      <div
        className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${config.bgColor}`}
      >
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <h4
          className="font-medium truncate"
          style={{
            fontSize: 'var(--font-size-body1)',
            color: 'var(--color-text-primary)',
          }}
        >
          {item.title}
        </h4>
        {item.summary && (
          <p
            className="truncate mt-[2px]"
            style={{
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {item.summary}
          </p>
        )}
        <div className="flex items-center gap-[8px] mt-[4px]">
          <span
            className={`inline-flex items-center px-[6px] py-[1px] rounded-sm text-[12px] ${config.bgColor} ${config.color}`}
          >
            {config.label}
          </span>
          {item.category && (
            <span
              style={{
                fontSize: 'var(--font-size-caption)',
                color: 'var(--color-text-helper)',
              }}
            >
              {item.category}
            </span>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-[8px] shrink-0">
        <Button
          variant="ghost"
          size="small"
          onClick={() => onNavigate(item)}
          aria-label="打开"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="small"
          onClick={() => onRemove(item.id)}
          aria-label="移除收藏"
        >
          <X className="w-4 h-4 text-text-helper hover:text-error" />
        </Button>
      </div>
    </div>
  );
};

export default FavoriteItemCard;
