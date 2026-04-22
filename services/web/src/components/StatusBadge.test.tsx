import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders correct label for PENDING status', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders correct label for IN_PROGRESS status', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders correct label for TESTING status', () => {
    render(<StatusBadge status="TESTING" />);
    expect(screen.getByText('Testing')).toBeInTheDocument();
  });

  it('renders correct label for ACCEPTED status', () => {
    render(<StatusBadge status="ACCEPTED" />);
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('renders correct label for REJECTED status', () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('applies correct CSS classes for each status', () => {
    const { rerender } = render(<StatusBadge status="PENDING" />);
    const badge = screen.getByText('Pending');
    expect(badge).toHaveClass('bg-slate-700', 'text-slate-300');

    rerender(<StatusBadge status="IN_PROGRESS" />);
    const inProgressBadge = screen.getByText('In Progress');
    expect(inProgressBadge).toHaveClass('bg-blue-900', 'text-blue-300');

    rerender(<StatusBadge status="TESTING" />);
    const testingBadge = screen.getByText('Testing');
    expect(testingBadge).toHaveClass('bg-amber-900', 'text-amber-300');

    rerender(<StatusBadge status="ACCEPTED" />);
    const acceptedBadge = screen.getByText('Accepted');
    expect(acceptedBadge).toHaveClass('bg-emerald-900', 'text-emerald-300');

    rerender(<StatusBadge status="REJECTED" />);
    const rejectedBadge = screen.getByText('Rejected');
    expect(rejectedBadge).toHaveClass('bg-red-900', 'text-red-300');
  });

  it('has consistent base classes', () => {
    render(<StatusBadge status="PENDING" />);
    const badge = screen.getByText('Pending');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-medium'
    );
  });
});
