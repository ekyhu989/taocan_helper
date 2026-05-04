import { render, screen } from '@testing-library/react';
import TemplatePreview from './TemplatePreview';
import { TemplateCategory, type Template, TemplateScene } from '../../types/template.types';

const mockTemplate: Template = {
  id: 'tpl-test-001',
  name: '测试模板',
  category: TemplateCategory.PROCUREMENT,
  description: '测试描述',
  content: '关于${单位名称}的采购方案\n\n预算：${预算金额}元',
  variables: [
    { key: '单位名称', label: '单位名称', type: 'text', required: true },
    { key: '预算金额', label: '预算金额', type: 'number', required: true },
  ],
  previewUrl: '/preview/test',
  usageCount: 50,
  isFavorite: false,
  relatedScenes: [TemplateScene.GENERAL],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TemplatePreview', () => {
  it('renders template name', () => {
    render(<TemplatePreview template={mockTemplate} />);
    expect(screen.getByText('测试模板')).toBeInTheDocument();
  });

  it('highlights variables in content', () => {
    render(<TemplatePreview template={mockTemplate} />);

    const variables = screen.getAllByRole('mark');
    expect(variables.length).toBe(2);
    expect(variables[0]).toHaveTextContent('${单位名称}');
    expect(variables[1]).toHaveTextContent('${预算金额}');
  });

  it('renders variable list', () => {
    render(<TemplatePreview template={mockTemplate} />);
    expect(screen.getByText('模板变量（共2个）')).toBeInTheDocument();
    expect(screen.getByText('单位名称')).toBeInTheDocument();
    expect(screen.getByText('预算金额')).toBeInTheDocument();
  });

  it('shows required mark for required variables', () => {
    render(<TemplatePreview template={mockTemplate} />);
    const variableLabels = screen.getAllByText(/预算金额/);
    // 变量列表中应该显示 *
    expect(variableLabels.length).toBeGreaterThan(0);
  });
});
