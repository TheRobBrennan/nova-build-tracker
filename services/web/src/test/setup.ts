import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';
import type { Component, BuildStage, TestEvent, ComponentType, BuildStatus } from '../types';
import './mocks'; // Import all mocks

// Mock WebSocket for graphql-ws
vi.mock('graphql-ws', () => ({
  createClient: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock Apollo Client setup
vi.mock('../apollo/client', () => ({
  getWsConnected: vi.fn(() => true),
  subscribeToWsState: vi.fn(() => () => {}),
}));

// Mock TailwindCSS classes
vi.mock('tailwindcss', () => ({}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Test utilities
export const createMockComponent = (overrides: Partial<Component> = {}): Component => ({
  id: '1',
  name: 'Test Component',
  serialNumber: 'TC-001',
  partNumber: 'TC-001',
  type: 'STRUCTURAL' as ComponentType,
  status: 'PENDING' as BuildStatus,
  notes: null,
  buildStages: [
    {
      id: 'stage-1',
      name: 'Raw Material Inspection',
      sequence: 1,
      completedAt: null,
      notes: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'stage-2',
      name: 'Machining',
      sequence: 2,
      completedAt: null,
      notes: null,
      createdAt: new Date().toISOString(),
    },
  ],
  testEvents: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

let stageIdCounter = 1;
export const createMockBuildStage = (overrides: Partial<BuildStage> = {}): BuildStage => ({
  id: `stage-${stageIdCounter++}`,
  name: 'Raw Material Inspection',
  sequence: 1,
  completedAt: null,
  notes: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

let testEventIdCounter = 1;
export const createMockTestEvent = (overrides: Partial<TestEvent> = {}): TestEvent => ({
  id: `test-${testEventIdCounter++}`,
  eventType: 'DIMENSIONAL_INSPECTION',
  result: 'PASS',
  performedAt: new Date().toISOString(),
  notes: null,
  ...overrides,
});
