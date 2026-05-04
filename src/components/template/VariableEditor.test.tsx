import { render, screen, fireEvent } from '@testing-library/react';
import VariableEditor, { fillTemplate } from './VariableEditor';
import { TemplateCategory, type Template, TemplateScene } from '../../types/template.types';

const mockTemplate: Template = {
  id: 'tpl-test-001',
  name: '测试模板',
  category: TemplateCategory.PROCUREMENT,
  description: '测试描述',
  content: '关于${单位名称}的采购方案，预算${预算金额}元',
  variables: [
    {
      key: '单位名称',
      label: '单位名称',
      type: 'text',
      required: true,
      defaultValue: '测试单位',
    },
    {
      key: '预算金额',
      label: '预算金额',
      type: 'number',
      required: true,
    },
    {
      key: '采购日期',
      label: '采购日期',
      type: 'date',
      required: false,
    },
    {
      key: '采购方式',
      label: '采购方式',
      type: 'select',
      required: true,
      options: ['公开招标', '询价'],
    },
  ],
  previewUrl: '/preview/test',
  usageCount: 50,
  isFavorite: false,
  relatedScenes: [TemplateScene.GENERAL],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VariableEditor', () => {
  const defaultProps = {
    template: mockTemplate,
    values: {},
    onChange: jest.fn(),
    errors: {},
    onValidate: jest.fn(),
  };

  it('renders all variable inputs', () => {
    render(<VariableEditor {...defaultProps} />);
    expect(screen.getByDisplayValue('测试单位')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows required mark for required fields', () => {
    render(<VariableEditor {...defaultProps} />);
    const labels = screen.getAllByText('*');
    expect(labels.length).toBeGreaterThanOrEqual(3); // 3个必填项
  });

  it('calls onChange when input changes', () => {
    render(<VariableEditor {...defaultProps} />);
    const input = screen.getByDisplayValue('测试单位');
    fireEvent.change(input, { target: { value: '新单位' } });
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('validates required fields on blur', () => {
    render(<VariableEditor {...defaultProps} />);
    const input = screen.getByDisplayValue('测试单位');
    fireEvent.blur(input);
    expect(defaultProps.onValidate).toHaveBeenCalledWith(
      '单位名称',
      '单位名称为必填项'
    );
  });

  it('uses default values', () => {
    render(<VariableEditor {...defaultProps} />);
    const input = screen.getByDisplayValue('测试单位') as HTMLInputElement;
    expect(input.value).toBe('测试单位');
  });
});

describe('fillTemplate', () => {
  it('replaces variables with values', () => {
    const result = fillTemplate('${单位名称}的预算为${金额}元', {
      单位名称: '测试单位',
      金额: '10000',
    });
    expect(result).toBe('测试单位的预算为10000元');
  });

  it('keeps placeholder when value is missing', () => {
    const result = fillTemplate('${单位名称}的预算', {});
    expect(result).toBe('${单位名称}的预算');
  });
});
