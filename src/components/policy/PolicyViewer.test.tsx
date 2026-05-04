import { render, screen, fireEvent } from '@testing-library/react';
import PolicyViewer from './PolicyViewer';
import { PolicyCategory, PolicyScene, PolicyLevel } from '../../types/policy.types';
import type { Policy } from '../../types/policy.types';

const mockPolicy: Policy = {
  id: 'pol-test-001',
  title: '测试政策文件',
  category: PolicyCategory.NATIONAL,
  scene: [PolicyScene.HOLIDAY],
  year: 2024,
  level: PolicyLevel.MANDATORY,
  content: '第一、总则\n\n本规定适用于所有单位。\n\n第二、实施细则\n\n具体细则如下。',
  fileUrl: '/files/test.pdf',
  fileSize: 358400,
  fileType: 'pdf',
  keyPoints: ['要点1：不得超标', '要点2：必须审批'],
  summary: '这是测试政策摘要',
  isFavorite: false,
  viewCount: 256,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
};

describe('PolicyViewer', () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });
  it('renders policy header information', () => {
    render(<PolicyViewer policy={mockPolicy} />);

    expect(screen.getByText('测试政策文件')).toBeInTheDocument();
    expect(screen.getByText('这是测试政策摘要')).toBeInTheDocument();
    expect(screen.getByText('国家政策')).toBeInTheDocument();
    expect(screen.getByText('合规等级：强制')).toBeInTheDocument();
    expect(screen.getByText('2024年')).toBeInTheDocument();
    expect(screen.getByText(/KB/)).toBeInTheDocument();
  });

  it('shows content tab by default', () => {
    render(<PolicyViewer policy={mockPolicy} />);

    expect(screen.getByRole('tab', { name: '政策内容' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });

  it('switches to keyPoints tab when clicked', () => {
    render(<PolicyViewer policy={mockPolicy} />);

    fireEvent.click(screen.getByRole('tab', { name: /合规要点/ }));

    expect(screen.getByRole('tab', { name: /合规要点/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('要点1：不得超标')).toBeInTheDocument();
    expect(screen.getByText('要点2：必须审批')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when favorite button is clicked', () => {
    const onToggleFavorite = jest.fn();
    render(
      <PolicyViewer
        policy={mockPolicy}
        onToggleFavorite={onToggleFavorite}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '收藏' }));
    expect(onToggleFavorite).toHaveBeenCalledWith(mockPolicy);
  });

  it('calls onDownload when download button is clicked', () => {
    const onDownload = jest.fn();
    render(
      <PolicyViewer
        policy={mockPolicy}
        onDownload={onDownload}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '下载' }));
    expect(onDownload).toHaveBeenCalledWith(mockPolicy);
  });

  it('displays favorite state correctly', () => {
    const favoritePolicy = { ...mockPolicy, isFavorite: true };
    render(<PolicyViewer policy={favoritePolicy} />);

    expect(screen.getByText('已收藏')).toBeInTheDocument();
  });
});
