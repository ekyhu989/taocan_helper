import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('Input', () => {
  it('renders text input by default', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('renders label with required mark', () => {
    render(<Input label="Username" required />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message after blur', () => {
    render(<Input error="This field is required" />);
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('renders helper text', () => {
    render(<Input helperText="Helper text" />);
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('handles onChange', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders select with options', () => {
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    render(<Input type="select" options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('请选择')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('handles select onChange', () => {
    const handleChange = jest.fn();
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    render(<Input type="select" options={options} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'b' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders textarea', () => {
    render(<Input type="textarea" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
