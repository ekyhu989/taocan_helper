import React, { useCallback, useState, useRef } from 'react';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Input, Button } from '../common';
import { PolicyCategory, PolicyScene, PolicyLevel } from '../../types/policy.types';

export interface PolicyFilterState {
  search: string;
  category: string;
  scene: string;
  level: string;
  year: string;
  smartRecommend: boolean;
}

interface PolicyFilterProps {
  filters: PolicyFilterState;
  onFilterChange: (filters: PolicyFilterState) => void;
}

const categoryOptions = [
  { value: '', label: '全部分类' },
  { value: PolicyCategory.NATIONAL, label: '国家政策' },
  { value: PolicyCategory.LOCAL, label: '地方政策' },
  { value: PolicyCategory.INDUSTRY, label: '行业规范' },
];

const sceneOptions = [
  { value: '', label: '全部场景' },
  { value: PolicyScene.HOLIDAY, label: '节日慰问' },
  { value: PolicyScene.ACTIVITY, label: '专项活动' },
  { value: PolicyScene.CARE, label: '精准帮扶' },
];

const levelOptions = [
  { value: '', label: '全部等级' },
  { value: PolicyLevel.MANDATORY, label: '强制' },
  { value: PolicyLevel.SUGGESTION, label: '建议' },
  { value: PolicyLevel.REFERENCE, label: '参考' },
];

const yearOptions = [
  { value: '', label: '全部年份' },
  { value: '2026', label: '2026年' },
  { value: '2025', label: '2025年' },
  { value: '2024', label: '2024年' },
];

const PolicyFilter: React.FC<PolicyFilterProps> = ({
  filters,
  onFilterChange,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFilterChange({ ...filters, search: value });
      }, 300);
    },
    [filters, onFilterChange]
  );

  const handleSelectChange = useCallback(
    (key: keyof PolicyFilterState, value: string) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange]
  );

  return (
    <div className="space-y-[16px]">
      {/* 搜索栏 + 智能推荐切换 */}
      <div className="flex gap-[12px] items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-5 h-5 text-text-helper" />
          <Input
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="搜索政策标题、摘要或关键词..."
            className="pl-[40px]"
            aria-label="搜索政策"
          />
        </div>
        <button
          onClick={() => handleSelectChange('smartRecommend', String(!filters.smartRecommend))}
          className={`inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-sm border transition-colors text-[14px] font-medium ${
            filters.smartRecommend
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-white border-border-light text-text-secondary hover:border-primary-200'
          }`}
          aria-pressed={filters.smartRecommend}
          aria-label="智能推荐模式"
          title={filters.smartRecommend ? '智能推荐已开启' : '开启智能推荐'}
        >
          <Sparkles className="w-4 h-4" />
          {filters.smartRecommend ? '智能推荐中' : '智能推荐'}
        </button>
      </div>

      {/* 筛选标签 */}
      <div className="flex flex-wrap gap-[12px] items-center">
        <div className="flex items-center gap-[6px] text-text-secondary">
          <SlidersHorizontal className="w-4 h-4" />
          <span style={{ fontSize: 'var(--font-size-body2)' }}>筛选：</span>
        </div>

        <select
          value={filters.category}
          onChange={(e) => handleSelectChange('category', e.target.value)}
          className="px-[12px] py-[6px] rounded-sm border border-border-light bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200"
          style={{ fontSize: 'var(--font-size-body2)' }}
          aria-label="分类筛选"
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.scene}
          onChange={(e) => handleSelectChange('scene', e.target.value)}
          className="px-[12px] py-[6px] rounded-sm border border-border-light bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200"
          style={{ fontSize: 'var(--font-size-body2)' }}
          aria-label="场景筛选"
        >
          {sceneOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.level}
          onChange={(e) => handleSelectChange('level', e.target.value)}
          className="px-[12px] py-[6px] rounded-sm border border-border-light bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200"
          style={{ fontSize: 'var(--font-size-body2)' }}
          aria-label="等级筛选"
        >
          {levelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={(e) => handleSelectChange('year', e.target.value)}
          className="px-[12px] py-[6px] rounded-sm border border-border-light bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-200"
          style={{ fontSize: 'var(--font-size-body2)' }}
          aria-label="年份筛选"
        >
          {yearOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 重置按钮 */}
        <Button
          variant="ghost"
          size="small"
          onClick={() => {
            setLocalSearch('');
            onFilterChange({
              search: '',
              category: '',
              scene: '',
              level: '',
              year: '',
              smartRecommend: false,
            });
          }}
        >
          重置
        </Button>
      </div>
    </div>
  );
};

export default PolicyFilter;
