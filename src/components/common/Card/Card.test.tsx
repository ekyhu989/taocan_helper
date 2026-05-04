import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('renders with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders header and footer', () => {
    render(
      <Card header="Header" footer="Footer">
        Body
      </Card>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('handles click', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has role button when clickable', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles keyboard interaction when clickable', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies active variant styles', () => {
    render(<Card variant="active">Active</Card>);
    expect(screen.getByText('Active').parentElement).toHaveClass('shadow-md');
  });
});
