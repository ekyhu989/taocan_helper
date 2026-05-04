import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteItemCard from './FavoriteItemCard';
import type { FavoriteItem } from '../../hooks/useFavorites';

const mockTemplateItem: FavoriteItem = {
  id: 't1',
  type: 'template',
  title: '采购方案模板',
  category: 'procurement',
  summary: '用于生成采购方案',
  createdAt: Date.now(),
};

const mockPolicyItem: FavoriteItem = {
  id: 'p1',
  type: 'policy',
  title: '工会经费管理办法',
  category: 'national',
  summary: '关于工会经费管理的规定',
  createdAt: Date.now(),
};

describe('FavoriteItemCard', () => {
  it('renders template item correctly', () => {
    const onRemove = jest.fn();
    const onNavigate = jest.fn();
    render(
      <FavoriteItemCard
        item={mockTemplateItem}
        onRemove={onRemove}
        onNavigate={onNavigate}
      />
    );

    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByText('采购方案模板')).toBeInTheDocument();
    expect(screen.getByText('用于生成采购方案')).toBeInTheDocument();
    expect(screen.getByText('方案模板')).toBeInTheDocument();
    expect(screen.getByText('procurement')).toBeInTheDocument();
  });

  it('renders policy item correctly', () => {
    const onRemove = jest.fn();
    const onNavigate = jest.fn();
    render(
      <FavoriteItemCard
        item={mockPolicyItem}
        onRemove={onRemove}
        onNavigate={onNavigate}
      />
    );

    expect(screen.getByText('工会经费管理办法')).toBeInTheDocument();
    expect(screen.getByText('政策文件')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = jest.fn();
    const onNavigate = jest.fn();
    render(
      <FavoriteItemCard
        item={mockTemplateItem}
        onRemove={onRemove}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '移除收藏' }));
    expect(onRemove).toHaveBeenCalledWith('t1');
  });

  it('calls onNavigate when navigate button is clicked', () => {
    const onRemove = jest.fn();
    const onNavigate = jest.fn();
    render(
      <FavoriteItemCard
        item={mockTemplateItem}
        onRemove={onRemove}
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '打开' }));
    expect(onNavigate).toHaveBeenCalledWith(mockTemplateItem);
  });

  it('renders without summary', () => {
    const itemWithoutSummary: FavoriteItem = {
      id: 't2',
      type: 'template',
      title: '无摘要模板',
      createdAt: Date.now(),
    };
    render(
      <FavoriteItemCard
        item={itemWithoutSummary}
        onRemove={jest.fn()}
        onNavigate={jest.fn()}
      />
    );

    expect(screen.getByText('无摘要模板')).toBeInTheDocument();
  });
});
