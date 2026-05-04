import { renderHook, act } from '@testing-library/react';
import { useFavorites, type FavoriteItem } from './useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.items).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it('should add a favorite', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite({
        id: 'test-1',
        type: 'template',
        title: '测试模板',
        category: 'procurement',
      });
    });

    expect(result.current.count).toBe(1);
    expect(result.current.isFavorite('test-1')).toBe(true);
  });

  it('should not add duplicate favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite({ id: 'test-1', type: 'template', title: '测试' });
      result.current.addFavorite({ id: 'test-1', type: 'template', title: '测试' });
    });

    expect(result.current.count).toBe(1);
  });

  it('should toggle favorite', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite({ id: 'test-1', type: 'policy', title: '政策' });
    });
    expect(result.current.isFavorite('test-1')).toBe(true);

    act(() => {
      result.current.toggleFavorite({ id: 'test-1', type: 'policy', title: '政策' });
    });
    expect(result.current.isFavorite('test-1')).toBe(false);
  });

  it('should remove favorite', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite({ id: 'test-1', type: 'template', title: '测试' });
    });

    act(() => {
      result.current.removeFavorite('test-1');
    });

    expect(result.current.isFavorite('test-1')).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it('should filter by type', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite({ id: 't1', type: 'template', title: '模板1' });
      result.current.addFavorite({ id: 'p1', type: 'policy', title: '政策1' });
      result.current.addFavorite({ id: 't2', type: 'template', title: '模板2' });
    });

    expect(result.current.getByType('template')).toHaveLength(2);
    expect(result.current.getByType('policy')).toHaveLength(1);
  });

  it('should clear all favorites', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite({ id: 't1', type: 'template', title: '模板1' });
      result.current.addFavorite({ id: 'p1', type: 'policy', title: '政策1' });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.count).toBe(0);
    expect(result.current.items).toEqual([]);
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite({ id: 'test-1', type: 'template', title: '测试' });
    });

    const stored = localStorage.getItem('taocang-favorites');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('test-1');
  });

  it('should load from localStorage', () => {
    const item: FavoriteItem = {
      id: 'test-1',
      type: 'template',
      title: '测试',
      createdAt: Date.now(),
    };
    localStorage.setItem('taocang-favorites', JSON.stringify([item]));

    const { result } = renderHook(() => useFavorites());
    expect(result.current.count).toBe(1);
    expect(result.current.isFavorite('test-1')).toBe(true);
  });
});
