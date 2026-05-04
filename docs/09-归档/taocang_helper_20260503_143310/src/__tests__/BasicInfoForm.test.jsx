import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BasicInfoForm from '../components/BasicInfoForm';

describe('BasicInfoForm - P3 Tests', () => {
  const mockOnChange = jest.fn();

  test('TC-P3-001: should display region field with default value and readonly', () => {
    render(<BasicInfoForm formData={{}} onDataChange={mockOnChange} />);
    
    const regionInput = screen.getByLabelText(/采购地区/i);
    expect(regionInput).toHaveValue('新疆地区');
    expect(regionInput).toBeDisabled();
  });

  test('TC-P3-002: should show festival dropdown when scene is holiday', () => {
    render(<BasicInfoForm formData={{ scene: 'holiday' }} onDataChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/节日类型/i)).toBeInTheDocument();
  });

  test('TC-P3-003: should hide festival field when scene is not holiday', () => {
    render(<BasicInfoForm formData={{ scene: 'activity' }} onDataChange={mockOnChange} />);
    
    expect(screen.queryByLabelText(/节日类型/i)).not.toBeInTheDocument();
  });

  test('should calculate per capita correctly', () => {
    render(<BasicInfoForm formData={{ headCount: 10, totalBudget: 5000 }} onDataChange={mockOnChange} />);
    
    expect(screen.getByText(/¥500.00/i)).toBeInTheDocument();
  });
});
