import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentCard } from './ComponentCard';
import { createMockComponent, createMockBuildStage } from '../test/setup';
import { mockUseMutation } from '../test/mocks';

describe('ComponentCard', () => {
  const mockUpdateStatus = vi.fn();
  
  beforeEach(() => {
    mockUseMutation.mockReturnValue([mockUpdateStatus, { loading: false }]);
    mockUpdateStatus.mockClear();
  });

  it('renders component information correctly', () => {
    const component = createMockComponent({
      name: 'Test Component',
      serialNumber: 'TC-001',
      partNumber: 'TC-001',
      type: 'HEAT_SHIELD',
      status: 'PENDING',
    });

    render(<ComponentCard component={component} />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('TC-001 · TC-001')).toBeInTheDocument();
    expect(screen.getByText('Heat Shield')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    const component = createMockComponent({ status: 'IN_PROGRESS' });
    render(<ComponentCard component={component} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows test events count when present', () => {
    const component = createMockComponent({
      testEvents: [
        { id: '1', eventType: 'Test 1', result: 'PASS', performedAt: new Date().toISOString(), notes: null },
        { id: '2', eventType: 'Test 2', result: 'FAIL', performedAt: new Date().toISOString(), notes: null },
      ],
    });
    render(<ComponentCard component={component} />);
    expect(screen.getByText('2 test events')).toBeInTheDocument();
  });

  it('shows singular test event text', () => {
    const component = createMockComponent({
      testEvents: [{ id: '1', eventType: 'Test 1', result: 'PASS', performedAt: new Date().toISOString(), notes: null }],
    });
    render(<ComponentCard component={component} />);
    expect(screen.getByText('1 test event')).toBeInTheDocument();
  });

  it('displays build stages with progress', () => {
    const component = createMockComponent({
      buildStages: [
        createMockBuildStage({ completedAt: '2023-01-01T00:00:00Z', name: 'Completed Stage' }),
        createMockBuildStage({ completedAt: null, name: 'Incomplete Stage' }),
      ],
    });

    render(<ComponentCard component={component} />);

    expect(screen.getByText('Build stages')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('Completed Stage')).toBeInTheDocument();
    expect(screen.getByText('Incomplete Stage')).toBeInTheDocument();
  });

  it('shows completed stages with check icon', () => {
    const component = createMockComponent({
      buildStages: [
        createMockBuildStage({ 
          completedAt: '2023-01-01T00:00:00Z',
          name: 'Completed Stage'
        }),
      ],
    });

    render(<ComponentCard component={component} />);

    const stageText = screen.getByText('Completed Stage');
    expect(stageText).toHaveClass('text-slate-300');
  });

  it('shows incomplete stages with circle icon', () => {
    const component = createMockComponent({
      buildStages: [
        createMockBuildStage({ 
          completedAt: null,
          name: 'Incomplete Stage'
        }),
      ],
    });

    render(<ComponentCard component={component} />);

    const stageText = screen.getByText('Incomplete Stage');
    expect(stageText).toHaveClass('text-slate-500');
  });

  it('shows advance button for components that can be advanced', () => {
    const component = createMockComponent({ status: 'PENDING' });
    render(<ComponentCard component={component} />);
    expect(screen.getByText('Advance → IN PROGRESS')).toBeInTheDocument();
  });

  it('does not show advance button for ACCEPTED components', () => {
    const component = createMockComponent({ status: 'ACCEPTED' });
    render(<ComponentCard component={component} />);
    expect(screen.queryByText(/Advance ->/)).not.toBeInTheDocument();
  });

  it('does not show advance button for REJECTED components', () => {
    const component = createMockComponent({ status: 'REJECTED' });
    render(<ComponentCard component={component} />);
    expect(screen.queryByText(/Advance ->/)).not.toBeInTheDocument();
  });

  it('calls update status mutation when advance button is clicked', () => {
    const component = createMockComponent({ 
      id: 'test-id',
      status: 'PENDING' 
    });
    
    render(<ComponentCard component={component} />);
    
    const advanceButton = screen.getByText(/Advance.*IN PROGRESS/);
    fireEvent.click(advanceButton);
    
    expect(mockUpdateStatus).toHaveBeenCalledWith({
      variables: { id: 'test-id', status: 'IN_PROGRESS' }
    });
  });

  it('displays loading state on button when mutation is loading', () => {
    mockUseMutation.mockReturnValue([mockUpdateStatus, { loading: true }]);
    
    const component = createMockComponent({ status: 'PENDING' });
    render(<ComponentCard component={component} />);
    
    expect(screen.getByText('Updating…')).toBeInTheDocument();
  });

  it('displays type label for unknown component types', () => {
    const component = createMockComponent({ type: 'UNKNOWN_TYPE' as any });
    render(<ComponentCard component={component} />);
    expect(screen.getByText('UNKNOWN_TYPE')).toBeInTheDocument();
  });

  it('calculates progress correctly', () => {
    const component = createMockComponent({
      buildStages: [
        createMockBuildStage({ completedAt: '2023-01-01T00:00:00Z' }),
        createMockBuildStage({ completedAt: '2023-01-01T00:00:00Z' }),
        createMockBuildStage({ completedAt: null }),
      ],
    });

    render(<ComponentCard component={component} />);
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('handles zero build stages gracefully', () => {
    const component = createMockComponent({ buildStages: [] });
    render(<ComponentCard component={component} />);
    
    // Should not show build stages section
    expect(screen.queryByText('Build stages')).not.toBeInTheDocument();
  });
});
