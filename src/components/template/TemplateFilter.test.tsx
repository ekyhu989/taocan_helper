import { render, screen, fireEvent } from '@testing-library/react';
import TemplateFilter from './TemplateFilter';
import { TemplateCategory } from '../../types/template.types';

describe('TemplateFilter', () => {
  const defaultProps = {
    activeCategory: 'all' as const,
    onCategoryChange: jest.fn(),
    activeScene: 'all' as const,
    onSceneChange: jest.fn(),
    searchQuery: '',
    onSearchChange: jest.fn(),
    sortBy: 'usage' as const,
    onSortChange: jest.fn(),
  };

  it('renders search input', () => {
    render(<TemplateFilter {...defaultProps} />);
    expect(screen.getByLabelText('搜索模板')).toBeInTheDocument();
  });

  it('renders category tabs', () => {
    render(<TemplateFilter {...defaultProps} />);
    expect(screen.getByRole('tab', { name: '全部' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '采购方案' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '慰问方案' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '请示报告' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '批复文件' })).toBeInTheDocument();
  });

  it('calls onCategoryChange when category tab clicked', () => {
    render(<TemplateFilter {...defaultProps} />);
    fireEvent.click(screen.getByRole('tab', { name: '采购方案' }));
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(
      TemplateCategory.PROCUREMENT
    );
  });

  it('calls onSearchChange with debounce', () => {
    jest.useFakeTimers();
    render(<TemplateFilter {...defaultProps} />);

    const input = screen.getByLabelText('搜索模板');
    fireEvent.change(input, { target: { value: '测试' } });

    expect(defaultProps.onSearchChange).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('测试');

    jest.useRealTimers();
  });

  it('calls onSortChange when sort button clicked', () => {
    render(<TemplateFilter {...defaultProps} />);
    fireEvent.click(screen.getByText('更新时间'));
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('updated');
  });
});
