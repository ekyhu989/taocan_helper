import { render, screen, fireEvent } from '@testing-library/react';
import PolicyCard from './PolicyCard';
import { PolicyCategory, PolicyScene, PolicyLevel } from '../../types/policy.types';
import type { Policy } from '../../types/policy.types';

const mockPolicy: Policy = {
  id: 'pol-test-001',
  title: '测试政策文件',
  category: PolicyCategory.NATIONAL,
  scene: [PolicyScene.HOLIDAY],
  year: 2024,
  level: PolicyLevel.MANDATORY,
  content: '这是政策内容',
  fileUrl: '/files/test.pdf',
  fileSize: 102400,
  fileType: 'pdf',
  keyPoints: ['要点1', '要点2'],
  summary: '这是政策摘要',
  isFavorite: false,
  viewCount: 128,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
};

const mockFavoritePolicy: Policy = {
  ...mockPolicy,
  isFavorite: true,
};

describe('PolicyCard', () => {
  it('renders policy information correctly', () => {
    render(<PolicyCard policy={mockPolicy} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText('测试政策文件')).toBeInTheDocument();
    expect(screen.getByText('这是政策摘要')).toBeInTheDocument();
    expect(screen.getByText('国家政策')).toBeInTheDocument();
    expect(screen.getByText('强制')).toBeInTheDocument();
    expect(screen.getByText('128次浏览')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = jest.fn();
    render(<PolicyCard policy={mockPolicy} onClick={onClick} />);

    fireEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledWith(mockPolicy);
  });

  it('calls onToggleFavorite when star button is clicked', () => {
    const onToggleFavorite = jest.fn();
    render(<PolicyCard policy={mockPolicy} onToggleFavorite={onToggleFavorite} />);

    fireEvent.click(screen.getByRole('button', { name: '收藏' }));
    expect(onToggleFavorite).toHaveBeenCalledWith(mockPolicy);
  });

  it('displays filled star for favorite policy', () => {
    render(<PolicyCard policy={mockFavoritePolicy} />);

    expect(screen.getByRole('button', { name: '取消收藏' })).toBeInTheDocument();
  });

  it('highlights search text', () => {
    render(<PolicyCard policy={mockPolicy} highlightText="政策" />);

    const mark = screen.getByText('政策');
    expect(mark.tagName).toBe('MARK');
  });

  it('does not propagate click event from favorite button', () => {
    const onClick = jest.fn();
    const onToggleFavorite = jest.fn();
    render(
      <PolicyCard
        policy={mockPolicy}
        onClick={onClick}
        onToggleFavorite={onToggleFavorite}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '收藏' }));
    expect(onToggleFavorite).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
