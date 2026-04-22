import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentList } from './ComponentList';
import { createMockComponent } from '../test/setup';
import { mockUseQuery, mockUseMutation } from '../test/mocks';

describe('ComponentList', () => {
  beforeEach(() => {
    mockUseQuery.mockClear();
    mockUseMutation.mockReturnValue([vi.fn(), { loading: false }]);
  });

  it('renders status filter buttons', () => {
    mockUseQuery.mockReturnValue({
      data: { components: [] },
      loading: false,
      error: null,
    });

    render(<ComponentList />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Testing')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(<ComponentList />);
    
    expect(screen.getByText(/Loading components./)).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network error'),
    });

    render(<ComponentList />);
    
    expect(screen.getByText('Failed to load components: Network error')).toBeInTheDocument();
  });

  it('shows empty state when no components', () => {
    mockUseQuery.mockReturnValue({
      data: { components: [] },
      loading: false,
      error: null,
    });

    render(<ComponentList />);
    
    expect(screen.getByText('No components found.')).toBeInTheDocument();
  });

  it('renders components when data is available', () => {
    const mockComponents = [
      createMockComponent({ name: 'Component 1', id: '1' }),
      createMockComponent({ name: 'Component 2', id: '2' }),
    ];

    mockUseQuery.mockReturnValue({
      data: { components: mockComponents },
      loading: false,
      error: null,
    });

    render(<ComponentList />);
    
    expect(screen.getByText('Component 1')).toBeInTheDocument();
    expect(screen.getByText('Component 2')).toBeInTheDocument();
  });

  it('filters components by status', () => {
    const mockComponents = [
      createMockComponent({ name: 'Pending Component', status: 'PENDING', id: '1' }),
      createMockComponent({ name: 'In Progress Component', status: 'IN_PROGRESS', id: '2' }),
    ];

    mockUseQuery.mockReturnValue({
      data: { components: mockComponents },
      loading: false,
      error: null,
    });

    render(<ComponentList />);
    
    // Initially shows all components
    expect(screen.getByText('Pending Component')).toBeInTheDocument();
    expect(screen.getByText('In Progress Component')).toBeInTheDocument();
    
    // Click on Pending filter (use the filter button, not component content)
    const filterButtons = screen.getAllByText('Pending');
    fireEvent.click(filterButtons[0]);
    
    // Should have called useQuery with status filter
    expect(mockUseQuery).toHaveBeenCalledWith(
      'GET_COMPONENTS',
      { variables: { status: 'PENDING' }, fetchPolicy: 'cache-and-network' }
    );
  });

  it('highlights active filter button', () => {
    mockUseQuery.mockReturnValue({
      data: { components: [] },
      loading: false,
      error: null,
    });

    render(<ComponentList />);
    
    const allButton = screen.getByText('All');
    const pendingButton = screen.getByText('Pending');
    
    // All button should be active initially
    expect(allButton).toHaveClass('bg-orange-500', 'text-white');
    expect(pendingButton).toHaveClass('bg-slate-700', 'text-slate-300');
  });

  it('calls query with correct variables on filter change', () => {
    mockUseQuery.mockReturnValue({
      data: { components: [] },
      loading: false,
      error: null,
    });

    render(<ComponentList />);
    
    // Click on Testing filter
    fireEvent.click(screen.getByText('Testing'));
    
    expect(mockUseQuery).toHaveBeenLastCalledWith(
      'GET_COMPONENTS',
      { variables: { status: 'TESTING' }, fetchPolicy: 'cache-and-network' }
    );
  });

  it('resets filter when clicking All', () => {
    mockUseQuery.mockReturnValue({
      data: { components: [] },
      loading: false,
      error: null,
    });

    render(<ComponentList />);
    
    // Click on a specific status first
    fireEvent.click(screen.getByText('Accepted'));
    
    // Then click All
    fireEvent.click(screen.getByText('All'));
    
    expect(mockUseQuery).toHaveBeenLastCalledWith(
      'GET_COMPONENTS',
      { variables: { status: undefined }, fetchPolicy: 'cache-and-network' }
    );
  });
});
