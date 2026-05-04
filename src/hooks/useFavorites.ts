import { useState, useCallback, useEffect } from 'react';

export type FavoriteType = 'template' | 'policy';

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  category?: string;
  summary?: string;
  createdAt: number;
}

const STORAGE_KEY = 'taocang-favorites';

const loadFavoritesFromStorage = (): FavoriteItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavoritesToStorage = (items: FavoriteItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useFavorites = () => {
  const [items, setItems] = useState<FavoriteItem[]>(loadFavoritesFromStorage);

  // 同步到 localStorage
  useEffect(() => {
    saveFavoritesToStorage(items);
  }, [items]);

  /** 添加收藏 */
  const addFavorite = useCallback((item: Omit<FavoriteItem, 'createdAt'>) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, { ...item, createdAt: Date.now() }];
    });
  }, []);

  /** 移除收藏 */
  const removeFavorite = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /** 切换收藏状态 */
  const toggleFavorite = useCallback(
    (item: Omit<FavoriteItem, 'createdAt'>) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.id === item.id);
        if (exists) {
          return prev.filter((i) => i.id !== item.id);
        }
        return [...prev, { ...item, createdAt: Date.now() }];
      });
    },
    []
  );

  /** 检查是否已收藏 */
  const isFavorite = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  /** 按类型筛选 */
  const getByType = useCallback(
    (type: FavoriteType) => items.filter((i) => i.type === type),
    [items]
  );

  /** 清空所有收藏 */
  const clearAll = useCallback(() => setItems([]), []);

  return {
    items,
    count: items.length,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getByType,
    clearAll,
  };
};

export default useFavorites;
