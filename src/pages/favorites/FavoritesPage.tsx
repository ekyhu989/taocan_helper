import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2, FolderHeart } from 'lucide-react';
import { Button } from '../../components/common';
import { useFavorites, type FavoriteType } from '../../hooks/useFavorites';
import FavoriteItemCard from '../../components/favorites/FavoriteItemCard';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, count, removeFavorite, clearAll, getByType } = useFavorites();
  const [activeTab, setActiveTab] = useState<FavoriteType | 'all'>('all');

  const filteredItems =
    activeTab === 'all' ? items : getByType(activeTab);

  const handleNavigate = React.useCallback(
    (item: (typeof items)[number]) => {
      if (item.type === 'template') {
        navigate('/templates');
      } else {
        navigate(`/policy/${item.id}`);
      }
    },
    [navigate]
  );

  return (
    <div className="max-w-[800px] mx-auto px-[var(--spacing-page)] py-[var(--spacing-section)]">
      {/* 页面标题 */}
      <div className="mb-[24px]">
        <h1
          className="font-bold mb-[8px] flex items-center gap-[10px]"
          style={{
            fontSize: 'var(--font-size-h1)',
            color: 'var(--color-text-primary)',
          }}
        >
          <Star className="w-8 h-8 text-warning" />
          我的收藏
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-body1)',
            color: 'var(--color-text-secondary)',
          }}
        >
          管理您收藏的模板和政策文件，共 {count} 项
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="flex items-center justify-between mb-[24px] border-b border-border-light">
        <div className="flex gap-[4px]">
          <button
            className={`px-[16px] py-[10px] font-medium transition-colors relative ${
              activeTab === 'all'
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('all')}
            style={{ fontSize: 'var(--font-size-body1)' }}
            role="tab"
            aria-selected={activeTab === 'all'}
          >
            全部 ({count})
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
          <button
            className={`px-[16px] py-[10px] font-medium transition-colors relative ${
              activeTab === 'template'
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('template')}
            style={{ fontSize: 'var(--font-size-body1)' }}
            role="tab"
            aria-selected={activeTab === 'template'}
          >
            模板 ({getByType('template').length})
            {activeTab === 'template' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
          <button
            className={`px-[16px] py-[10px] font-medium transition-colors relative ${
              activeTab === 'policy'
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('policy')}
            style={{ fontSize: 'var(--font-size-body1)' }}
            role="tab"
            aria-selected={activeTab === 'policy'}
          >
            政策 ({getByType('policy').length})
            {activeTab === 'policy' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
        </div>

        {count > 0 && (
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              if (window.confirm('确定要清空所有收藏吗？')) {
                clearAll();
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-[4px] text-text-helper" />
            清空
          </Button>
        )}
      </div>

      {/* 收藏列表 */}
      {filteredItems.length > 0 ? (
        <div className="space-y-[10px]" role="list">
          {filteredItems.map((item) => (
            <FavoriteItemCard
              key={item.id}
              item={item}
              onRemove={removeFavorite}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      ) : (
        /* 空状态 */
        <div className="text-center py-[80px]">
          <FolderHeart className="w-16 h-16 mx-auto mb-[16px] text-text-helper" />
          <p
            className="mb-[8px]"
            style={{
              fontSize: 'var(--font-size-h3)',
              color: 'var(--color-text-primary)',
            }}
          >
            {activeTab === 'all'
              ? '暂无收藏内容'
              : activeTab === 'template'
              ? '暂无收藏的模板'
              : '暂无收藏的政策'}
          </p>
          <p
            className="mb-[24px]"
            style={{
              fontSize: 'var(--font-size-body2)',
              color: 'var(--color-text-secondary)',
            }}
          >
            在浏览模板或政策时，点击收藏按钮即可添加到此处
          </p>
          <div className="flex gap-[12px] justify-center">
            <Button variant="primary" onClick={() => navigate('/templates')}>
              浏览模板
            </Button>
            <Button variant="secondary" onClick={() => navigate('/policies')}>
              浏览政策
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
