import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  it('does not render when closed', () => {
    render(<Modal open={false}>Content</Modal>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<Modal open={true}>Content</Modal>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Modal open={true} title="Modal Title">Content</Modal>);
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = jest.fn();
    render(<Modal open={true} title="Test" onClose={handleClose}>Content</Modal>);
    fireEvent.click(screen.getByLabelText('关闭'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when mask clicked', () => {
    const handleClose = jest.fn();
    render(<Modal open={true} onClose={handleClose}>Content</Modal>);
    fireEvent.click(screen.getByRole('presentation'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when maskClosable is false', () => {
    const handleClose = jest.fn();
    render(<Modal open={true} onClose={handleClose} maskClosable={false}>Content</Modal>);
    fireEvent.click(screen.getByRole('presentation'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders footer', () => {
    render(<Modal open={true} footer={<button>Action</button>}>Content</Modal>);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('has dialog role', () => {
    render(<Modal open={true}>Content</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
