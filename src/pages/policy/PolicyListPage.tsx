import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';
import { Skeleton } from '../../components/common';
import { policies } from '../../data/policies';
import { Policy, PolicyCategory, PolicyScene } from '../../types/policy.types';
import PolicyCard from '../../components/policy/PolicyCard';
import PolicyFilter, { PolicyFilterState } from '../../components/policy/PolicyFilter';
import { useFavorites } from '../../hooks/useFavorites';

// 模拟加载延迟
const useLoadingDelay = () => {
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  return loading;
};

const PolicyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PolicyFilterState>({
    search: '',
    category: '',
    scene: '',
    level: '',
    year: '',
    smartRecommend: false,
  });

  const { toggleFavorite, isFavorite } = useFavorites();

  const handleToggleFavorite = useCallback((policy: Policy) => {
    toggleFavorite({
      id: policy.id,
      type: 'policy',
      title: policy.title,
      category: policy.category,
      summary: policy.summary,
    });
  }, [toggleFavorite]);

  const isLoading = useLoadingDelay();

  // 计算推荐标签
  const getRecommendTags = useCallback((policy: Policy): string[] => {
    const tags: string[] = [];
    // 场景匹配标签
    if (filters.scene && policy.scene.includes(filters.scene as PolicyScene)) {
      const sceneLabels: Record<string, string> = {
        holiday: '节日慰问相关',
        activity: '专项活动相关',
        care: '精准帮扶相关',
      };
      tags.push(sceneLabels[filters.scene] || '场景匹配');
    } else if (!filters.scene && policy.scene.length > 0) {
      // 智能推荐模式下未选择具体场景，显示政策适用的场景标签
      const sceneLabels: Record<string, string> = {
        holiday: '节日慰问相关',
        activity: '专项活动相关',
        care: '精准帮扶相关',
      };
      policy.scene.forEach((s) => {
        const label = sceneLabels[s];
        if (label && !tags.includes(label)) tags.push(label);
      });
    }
    if (policy.category === PolicyCategory.LOCAL) {
      tags.push('新疆地区适用');
    }
    if (policy.level === 'mandatory') {
      tags.push('强制要求');
    }
    if (policy.year >= 2025) {
      tags.push('最新政策');
    }
    return tags;
  }, [filters.scene]);

  // 是否启用智能推荐模式（通过PolicyFilter的切换按钮控制）
  const isSmartRecommend = filters.smartRecommend;

  const filteredPolicies = useMemo(() => {
    let list = [...policies];

    if (filters.search.trim()) {
      const kw = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.summary.toLowerCase().includes(kw) ||
          p.content.toLowerCase().includes(kw) ||
          p.keyPoints.some((k) => k.toLowerCase().includes(kw))
      );
    }

    if (filters.category) {
      list = list.filter((p) => p.category === filters.category);
    }

    if (filters.scene) {
      list = list.filter((p) => p.scene.includes(filters.scene as never));
    }

    if (filters.level) {
      list = list.filter((p) => p.level === filters.level);
    }

    if (filters.year) {
      list = list.filter((p) => String(p.year) === filters.year);
    }

    // 智能推荐排序：场景匹配 > 年份新 > 浏览量高
    if (isSmartRecommend) {
      list.sort((a, b) => {
        // 强制等级优先
        const levelOrder = { mandatory: 3, suggestion: 2, reference: 1 };
        const levelDiff =
          (levelOrder[b.level as keyof typeof levelOrder] || 0) -
          (levelOrder[a.level as keyof typeof levelOrder] || 0);
        if (levelDiff !== 0) return levelDiff;
        // 年份新的优先
        const yearDiff = b.year - a.year;
        if (yearDiff !== 0) return yearDiff;
        // 浏览量高的优先
        return b.viewCount - a.viewCount;
      });
    } else {
      // 默认按浏览量排序
      list.sort((a, b) => b.viewCount - a.viewCount);
    }

    return list;
  }, [filters, isSmartRecommend]);

  const handlePolicyClick = useCallback(
    (policy: Policy) => {
      navigate(`/policy/${policy.id}`);
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-[var(--spacing-page)] py-[var(--spacing-section)]">
        <div className="mb-[24px]">
          <Skeleton type="text" width={192} height={32} className="mb-4" />
          <Skeleton type="rect" width="100%" height={80} className="rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} type="rect" width="100%" height={240} className="rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-[var(--spacing-page)] py-[var(--spacing-section)]">
      {/* 页面标题 */}
      <div className="mb-[24px]">
        <h1
          className="font-bold mb-[8px]"
          style={{
            fontSize: 'var(--font-size-h1)',
            color: 'var(--color-text-primary)',
          }}
        >
          政策检索
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-body1)',
            color: 'var(--color-text-secondary)',
          }}
        >
          分类浏览采购相关政策文件，了解合规要求
        </p>
      </div>

      {/* 筛选器 */}
      <div className="mb-[24px] p-[16px] bg-white rounded-sm shadow-card">
        <PolicyFilter filters={filters} onFilterChange={setFilters} />
      </div>

      {/* 结果统计 */}
      <div className="mb-[16px] flex items-center justify-between">
        <span
          style={{
            fontSize: 'var(--font-size-body2)',
            color: 'var(--color-text-secondary)',
          }}
        >
          共找到 {filteredPolicies.length} 个政策文件
        </span>
        {isSmartRecommend && (
          <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-sm text-[12px] font-medium bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3" />
            智能推荐中
          </span>
        )}
      </div>

      {/* 政策卡片列表 */}
      {filteredPolicies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={{
                ...policy,
                isFavorite: isFavorite(policy.id),
              }}
              onClick={handlePolicyClick}
              onToggleFavorite={handleToggleFavorite}
              highlightText={filters.search}
              recommendTags={getRecommendTags(policy)}
            />
          ))}
        </div>
      ) : (
        /* 空状态 */
        <div className="text-center py-[80px]">
          <BookOpen
            className="w-16 h-16 mx-auto mb-[16px] text-text-helper"
          />
          <p
            className="mb-[8px]"
            style={{
              fontSize: 'var(--font-size-h3)',
              color: 'var(--color-text-primary)',
            }}
          >
            未找到匹配的政策文件
          </p>
          <p
            style={{
              fontSize: 'var(--font-size-body2)',
              color: 'var(--color-text-secondary)',
            }}
          >
            请尝试调整筛选条件或搜索关键词
          </p>
        </div>
      )}
    </div>
  );
};

export default PolicyListPage;
