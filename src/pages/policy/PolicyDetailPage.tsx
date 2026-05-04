import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { Button, Skeleton } from '../../components/common';
import { policies } from '../../data/policies';
import type { Policy } from '../../types/policy.types';
import PolicyViewer from '../../components/policy/PolicyViewer';
import { useFavorites } from '../../hooks/useFavorites';

const PolicyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite: toggleFav } = useFavorites();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const found = policies.find((p) => p.id === id);
      if (found) {
        setPolicy({
          ...found,
          isFavorite: isFavorite(found.id),
        });
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id, isFavorite]);

  const toggleFavorite = React.useCallback(
    (p: Policy) => {
      toggleFav({
        id: p.id,
        type: 'policy',
        title: p.title,
        category: p.category,
        summary: p.summary,
      });
      setPolicy((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : prev
      );
    },
    [toggleFav]
  );

  const handleDownload = React.useCallback((p: Policy) => {
    // 生成政策文件内容
    const fileContent = [
      p.title,
      '',
      `【分类】${p.category}`,
      `【年份】${p.year}`,
      `【合规等级】${p.level}`,
      '',
      '【政策摘要】',
      p.summary,
      '',
      '【政策内容】',
      p.content,
      '',
      '【合规要点】',
      ...p.keyPoints.map((point, i) => `${i + 1}. ${point}`),
    ].join('\n');

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.title}.${p.fileType === 'pdf' ? 'txt' : p.fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  if (loading) {
    return (
      <div className="max-w-[960px] mx-auto px-[var(--spacing-page)] py-[var(--spacing-section)]">
        <Skeleton type="rect" width="100%" height={40} className="mb-6" />
        <Skeleton type="rect" width="100%" height={120} className="mb-6" />
        <Skeleton type="rect" width="100%" height={400} />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="max-w-[960px] mx-auto px-[var(--spacing-page)] py-[var(--spacing-section)] text-center">
        <p
          className="mb-[16px]"
          style={{
            fontSize: 'var(--font-size-h3)',
            color: 'var(--color-text-primary)',
          }}
        >
          政策文件未找到
        </p>
        <p
          className="mb-[24px]"
          style={{
            fontSize: 'var(--font-size-body2)',
            color: 'var(--color-text-secondary)',
          }}
        >
          该政策文件可能已被删除或ID有误
        </p>
        <Button variant="primary" onClick={() => navigate('/policies')}>
          返回政策列表
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto px-[var(--spacing-page)] py-[var(--spacing-section)]">
      {/* 返回按钮 + 收藏 */}
      <div className="mb-[16px] flex items-center justify-between">
        <Button
          variant="ghost"
          size="small"
          onClick={() => navigate('/policies')}
        >
          <ArrowLeft className="w-4 h-4 mr-[4px]" />
          返回政策列表
        </Button>
        {policy && (
          <Button
            variant={policy.isFavorite ? 'primary' : 'ghost'}
            size="small"
            onClick={() => toggleFavorite(policy)}
            aria-label={policy.isFavorite ? '取消收藏' : '收藏'}
          >
            <Star className={`w-4 h-4 mr-[4px] ${policy.isFavorite ? 'fill-white' : ''}`} />
            {policy.isFavorite ? '已收藏' : '收藏'}
          </Button>
        )}
      </div>

      {/* 政策查看器 */}
      <PolicyViewer
        policy={policy}
        onToggleFavorite={toggleFavorite}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default PolicyDetailPage;
