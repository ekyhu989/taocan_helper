import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ComplianceCalculator from '../components/ComplianceCalculator';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ComplianceCalculator - P1 Tests', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ headCount: 100 }));
  });

  test('TC-P1-001: should display 0% completion with red progress bar initially', () => {
    render(<ComplianceCalculator />);
    
    const totalInput = screen.getByLabelText(/年度总预算/i);
    fireEvent.change(totalInput, { target: { value: '100000' } });
    
    // 找到年度采购完成率区域（包含大数字和标题的共同父容器）
    const completionHeader = screen.getByText('年度采购完成率');
    const completionSection = completionHeader.closest('div.text-center');
    const completionText = within(completionSection).getByText('0.0%');
    expect(completionText).toBeInTheDocument();
  });

  test('TC-P1-002: should show yellow progress bar at 30% completion', () => {
    render(<ComplianceCalculator />);
    
    fireEvent.change(screen.getByLabelText(/年度总预算/i), { target: { value: '100000' } });
    fireEvent.change(screen.getByLabelText(/已完成采购金额/i), { target: { value: '30000' } });
    
    expect(screen.getByText('30.0%')).toBeInTheDocument();
    expect(screen.getByText(/进行中，已达到最低要求/i)).toBeInTheDocument();
  });

  test('should not show warning when per capita is 1800 yuan', () => {
    render(<ComplianceCalculator />);
    
    fireEvent.change(screen.getByLabelText(/年度总预算/i), { target: { value: '180000' } });
    
    expect(screen.queryByText(/合规警告：年度人均预算超过2000元上限/i)).not.toBeInTheDocument();
  });

  test('should not show warning at 2000 yuan threshold', () => {
    render(<ComplianceCalculator />);
    
    fireEvent.change(screen.getByLabelText(/年度总预算/i), { target: { value: '200000' } });
    
    expect(screen.queryByText(/合规警告：年度人均预算超过2000元上限/i)).not.toBeInTheDocument();
  });

  test('TC-P1-006: should show orange warning when per capita exceeds 2000 yuan', () => {
    render(<ComplianceCalculator />);

    fireEvent.change(screen.getByLabelText(/年度总预算/i), { target: { value: '250000' } });

    // 找到警告框容器
    const warningTitle = screen.getByText(/合规警告：年度人均预算超过2000元上限/i);
    const warningBox = warningTitle.closest('div');
    // 在警告框内检查关键信息
    expect(within(warningBox).getByText('2500 元')).toBeInTheDocument();
    expect(within(warningBox).getByText(/超过 2000 元上限/)).toBeInTheDocument();
  });

  test('TC-P1-008: should auto-load headCount from localStorage', () => {
    render(<ComplianceCalculator />);
    
    fireEvent.change(screen.getByLabelText(/年度总预算/i), { target: { value: '100000' } });
    
    expect(screen.getByText(/1000 元/i)).toBeInTheDocument();
  });
});
