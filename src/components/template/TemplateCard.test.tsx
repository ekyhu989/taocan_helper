import { render, screen, fireEvent } from '@testing-library/react';
import TemplateCard from './TemplateCard';
import { TemplateCategory, type Template, TemplateScene } from '../../types/template.types';

const mockTemplate: Template = {
  id: 'tpl-test-001',
  name: '测试模板',
  category: TemplateCategory.PROCUREMENT,
  description: '这是一个测试模板描述',
  content: '测试内容',
  variables: [],
  previewUrl: '/preview/test',
  usageCount: 100,
  isFavorite: false,
  relatedScenes: [TemplateScene.GENERAL],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TemplateCard', () => {
  it('renders template information correctly', () => {
    render(<TemplateCard template={mockTemplate} />);

    expect(screen.getByText('测试模板')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试模板描述')).toBeInTheDocument();
    expect(screen.getByText('采购方案')).toBeInTheDocument();
    expect(screen.getByText('100次使用')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<TemplateCard template={mockTemplate} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledWith(mockTemplate);
  });

  it('calls onPreview when preview button is clicked', () => {
    const handlePreview = jest.fn();
    render(<TemplateCard template={mockTemplate} onPreview={handlePreview} />);

    fireEvent.click(screen.getByLabelText('预览模板：测试模板'));
    expect(handlePreview).toHaveBeenCalledWith(mockTemplate);
  });

  it('toggles favorite status', () => {
    const handleToggleFavorite = jest.fn();
    render(
      <TemplateCard
        template={mockTemplate}
        onToggleFavorite={handleToggleFavorite}
      />
    );

    fireEvent.click(screen.getByLabelText('收藏'));
    expect(handleToggleFavorite).toHaveBeenCalledWith(mockTemplate);
  });

  it('shows filled star when favorite', () => {
    const favoriteTemplate = { ...mockTemplate, isFavorite: true };
    render(<TemplateCard template={favoriteTemplate} />);

    expect(screen.getByLabelText('取消收藏')).toBeInTheDocument();
  });
});
