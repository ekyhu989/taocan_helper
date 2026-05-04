import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from './Toast';
import type { ToastItem } from './Toast.types';

describe('Toast', () => {
  const mockRemove = jest.fn();

  beforeEach(() => {
    mockRemove.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when no toasts', () => {
    const { container } = render(<Toast toasts={[]} onRemove={mockRemove} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders success toast', () => {
    const toasts: ToastItem[] = [{ id: '1', type: 'success', message: 'Saved' }];
    render(<Toast toasts={toasts} onRemove={mockRemove} />);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    const toasts: ToastItem[] = [{ id: '1', type: 'error', message: 'Failed' }];
    render(<Toast toasts={toasts} onRemove={mockRemove} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('auto removes success toast after duration', () => {
    const toasts: ToastItem[] = [{ id: '1', type: 'success', message: 'Saved' }];
    render(<Toast toasts={toasts} onRemove={mockRemove} />);
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(mockRemove).toHaveBeenCalledWith('1');
  });

  it('does not auto remove error toast', () => {
    const toasts: ToastItem[] = [{ id: '1', type: 'error', message: 'Failed' }];
    render(<Toast toasts={toasts} onRemove={mockRemove} />);
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('removes toast when close button clicked', () => {
    const toasts: ToastItem[] = [{ id: '1', type: 'info', message: 'Info' }];
    render(<Toast toasts={toasts} onRemove={mockRemove} />);
    fireEvent.click(screen.getByLabelText('关闭提示'));
    expect(mockRemove).toHaveBeenCalledWith('1');
  });

  it('shows at most 3 toasts', () => {
    const toasts: ToastItem[] = [
      { id: '1', type: 'info', message: 'One' },
      { id: '2', type: 'info', message: 'Two' },
      { id: '3', type: 'info', message: 'Three' },
      { id: '4', type: 'info', message: 'Four' },
    ];
    render(<Toast toasts={toasts} onRemove={mockRemove} />);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
    expect(screen.queryByText('Four')).not.toBeInTheDocument();
  });
});
