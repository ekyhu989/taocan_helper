import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 全局错误边界组件
 * 捕获子组件树中的 JavaScript 错误，防止整个应用白屏
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state，使下一次渲染显示降级 UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息到控制台
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // 可以在这里添加错误上报逻辑（如发送到监控服务）
    // reportError(error, errorInfo);
  }

  handleReload = (): void => {
    // 重新加载页面
    window.location.reload();
  };

  handleGoHome = (): void => {
    // 返回首页（使用 HashRouter 的 hash 路径）
    window.location.hash = '/';
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 如果提供了自定义 fallback，则使用它
      if (fallback) {
        return fallback;
      }

      // 默认的友好错误页面
      return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg border border-[var(--color-border)] shadow-lg p-8 text-center">
            {/* 错误图标 */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-[var(--color-error)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* 错误标题 */}
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              页面出现异常
            </h1>

            {/* 错误描述 */}
            <p className="text-[var(--color-text-secondary)] mb-6">
              抱歉，页面加载过程中遇到了问题。请尝试重新加载页面。
            </p>

            {/* 错误详情（仅在开发环境显示） */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 text-left">
                <div className="bg-gray-50 rounded-md p-4 overflow-auto max-h-48">
                  <p className="text-sm font-mono text-[var(--color-error)] mb-2">
                    {error.toString()}
                  </p>
                  {errorInfo && (
                    <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重新加载
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-100 text-[var(--color-text-primary)] font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
