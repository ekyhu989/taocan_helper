import { render, screen, fireEvent } from '@testing-library/react';
import PolicyFilter, { type PolicyFilterState } from './PolicyFilter';

describe('PolicyFilter', () => {
  const defaultFilters: PolicyFilterState = {
    search: '',
    category: '',
    scene: '',
    level: '',
    year: '',
    smartRecommend: false,
  };

  it('renders search input and filter selects', () => {
    const onFilterChange = jest.fn();
    render(<PolicyFilter filters={defaultFilters} onFilterChange={onFilterChange} />);

    expect(screen.getByRole('textbox', { name: '搜索政策' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '分类筛选' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '场景筛选' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '等级筛选' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '年份筛选' })).toBeInTheDocument();
  });

  it('calls onFilterChange when search input changes after debounce', () => {
    jest.useFakeTimers();
    const onFilterChange = jest.fn();
    render(<PolicyFilter filters={defaultFilters} onFilterChange={onFilterChange} />);

    const searchInput = screen.getByRole('textbox', { name: '搜索政策' });
    fireEvent.change(searchInput, { target: { value: '测试' } });

    expect(onFilterChange).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ search: '测试' }));

    jest.useRealTimers();
  });

  it('calls onFilterChange when category select changes', () => {
    const onFilterChange = jest.fn();
    render(<PolicyFilter filters={defaultFilters} onFilterChange={onFilterChange} />);

    const categorySelect = screen.getByRole('combobox', { name: '分类筛选' });
    fireEvent.change(categorySelect, { target: { value: 'national' } });

    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ category: 'national' }));
  });

  it('calls onFilterChange when scene select changes', () => {
    const onFilterChange = jest.fn();
    render(<PolicyFilter filters={defaultFilters} onFilterChange={onFilterChange} />);

    const sceneSelect = screen.getByRole('combobox', { name: '场景筛选' });
    fireEvent.change(sceneSelect, { target: { value: 'holiday' } });

    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ scene: 'holiday' }));
  });

  it('resets all filters when reset button is clicked', () => {
    const onFilterChange = jest.fn();
    const filledFilters: PolicyFilterState = {
      search: '测试',
      category: 'national',
      scene: 'holiday',
      level: 'mandatory',
      year: '2024',
      smartRecommend: true,
    };
    render(<PolicyFilter filters={filledFilters} onFilterChange={onFilterChange} />);

    fireEvent.click(screen.getByRole('button', { name: '重置' }));

    expect(onFilterChange).toHaveBeenCalledWith({
      search: '',
      category: '',
      scene: '',
      level: '',
      year: '',
      smartRecommend: false,
    });
  });
});
