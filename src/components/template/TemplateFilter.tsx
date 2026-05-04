import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Button, Input } from '../common';
import { TemplateCategory, TemplateScene } from '../../types/template.types';

export type SortOption = 'usage' | 'updated' | 'match';
export type SceneFilter = 'all' | TemplateScene;

interface TemplateFilterProps {
  activeCategory: TemplateCategory | 'all';
  onCategoryChange: (category: TemplateCategory | 'all') => void;
  activeScene: SceneFilter;
  onSceneChange: (scene: SceneFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const categories: { value: TemplateCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: TemplateCategory.PROCUREMENT, label: '采购方案' },
  { value: TemplateCategory.CONSOLATION, label: '慰问方案' },
  { value: TemplateCategory.REQUEST, label: '请示报告' },
  { value: TemplateCategory.APPROVAL, label: '批复文件' },
];

const scenes: { value: SceneFilter; label: string }[] = [
  { value: 'all', label: '全部场景' },
  { value: TemplateScene.HOLIDAY, label: '节日慰问' },
  { value: TemplateScene.ACTIVITY, label: '员工活动' },
  { value: TemplateScene.CARE, label: '困难帮扶' },
  { value: TemplateScene.GENERAL, label: '通用' },
];

const TemplateFilter: React.FC<TemplateFilterProps> = ({
  activeCategory,
  onCategoryChange,
  activeScene,
  onSceneChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    },
    [onSearchChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-[16px]">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 text-text-helper" />
        <Input
          type="text"
          placeholder="搜索模板名称或描述..."
          value={localSearch}
          onChange={handleSearchChange}
          className="pl-[40px]"
          aria-label="搜索模板"
        />
      </div>

      {/* 分类 Tab */}
      <div className="flex items-center gap-[8px] flex-wrap" role="tablist" aria-label="模板分类">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={activeCategory === cat.value ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onCategoryChange(cat.value)}
            role="tab"
            aria-selected={activeCategory === cat.value}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* 场景筛选 */}
      <div className="flex items-center gap-[8px] flex-wrap" role="tablist" aria-label="适用场景">
        {scenes.map((s) => (
          <Button
            key={s.value}
            variant={activeScene === s.value ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onSceneChange(s.value)}
            role="tab"
            aria-selected={activeScene === s.value}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {/* 排序选择 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <SlidersHorizontal className="w-4 h-4 text-text-helper" />
          <span
            style={{
              fontSize: 'var(--font-size-body2)',
              color: 'var(--color-text-secondary)',
            }}
          >
            排序
          </span>
        </div>
        <div className="flex items-center gap-[8px]">
          <Button
            variant={sortBy === 'usage' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onSortChange('usage')}
          >
            使用频率
          </Button>
          <Button
            variant={sortBy === 'updated' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onSortChange('updated')}
          >
            更新时间
          </Button>
          <Button
            variant={sortBy === 'match' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onSortChange('match')}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            匹配度
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateFilter;
