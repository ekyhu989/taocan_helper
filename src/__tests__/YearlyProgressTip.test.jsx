import React from 'react';
import { render, screen } from '@testing-library/react';
import YearlyProgressTip from '../components/YearlyProgressTip';
import { getYearlyProgress } from '../utils/historyStorage';

// Mock the historyStorage
jest.mock('../utils/historyStorage');

describe('YearlyProgressTip - P4 Tests', () => {
  test('TC-P4-001: should show first purchase message when no history', () => {
    getYearlyProgress.mockReturnValue({ total: 0, rate: 0, remaining: 0 });
    
    render(<YearlyProgressTip yearlyBudget={100000} />);
    expect(screen.getByText(/本年度首次采购/i)).toBeInTheDocument();
    expect(screen.getByText(/年度总预算 ¥100000.00/i)).toBeInTheDocument();
  });

  test('TC-P4-002: should display completion percentage based on history', () => {
    getYearlyProgress.mockReturnValue({ total: 80000, rate: 80, remaining: 0 });
    
    render(<YearlyProgressTip yearlyBudget={100000} />);
    
    expect(screen.getByText(/本年度已完成 80.0%/i)).toBeInTheDocument();
  });

  test('TC-P4-004: should show warning when rate is below 30%', () => {
    getYearlyProgress.mockReturnValue({ total: 20000, rate: 20, remaining: 10000 });
    
    render(<YearlyProgressTip yearlyBudget={100000} />);
    
    expect(screen.getByText(/本年度已完成 20.0%/i)).toBeInTheDocument();
    expect(screen.getByText(/建议还需采购/i)).toBeInTheDocument();
  });

  test('should show success message when rate is 30% or above', () => {
    getYearlyProgress.mockReturnValue({ total: 30000, rate: 30, remaining: 0 });
    
    render(<YearlyProgressTip yearlyBudget={100000} />);
    
    expect(screen.getByText(/已达到年度消费帮扶30%目标/i)).toBeInTheDocument();
  });
});
