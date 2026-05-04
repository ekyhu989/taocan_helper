import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/common/ErrorBoundary/ErrorBoundary';

// 模拟抛出错误的组件
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal component</div>;
};

describe('ErrorBoundary', () => {
  // 抑制 console.error 输出，避免测试日志被错误信息污染
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('页面出现异常')).toBeInTheDocument();
    expect(screen.getByText('抱歉，页面加载过程中遇到了问题。请尝试重新加载页面。')).toBeInTheDocument();
  });

  it('provides reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('重新加载');
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toBeEnabled();
  });

  it('provides go home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('返回首页');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toBeEnabled();
  });
});
