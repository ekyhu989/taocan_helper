import { render, screen } from '@testing-library/react';
import Skeleton from './Skeleton';

describe('Skeleton', () => {
  it('renders text skeleton by default', () => {
    render(<Skeleton />);
    const skeleton = screen.getByLabelText('加载中');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders circle skeleton', () => {
    render(<Skeleton type="circle" width={40} height={40} />);
    const skeleton = screen.getByLabelText('加载中');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders rect skeleton', () => {
    render(<Skeleton type="rect" width={200} height={100} />);
    const skeleton = screen.getByLabelText('加载中');
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('applies custom width and height', () => {
    render(<Skeleton type="rect" width={100} height={50} />);
    const skeleton = screen.getByLabelText('加载中');
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
  });

  it('has aria-busy attribute', () => {
    render(<Skeleton />);
    expect(screen.getByLabelText('加载中')).toHaveAttribute('aria-busy', 'true');
  });
});
