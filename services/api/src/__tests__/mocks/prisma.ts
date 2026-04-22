/**
 * Mocked Prisma client for unit testing
 *
 * Testing was built in from day one — not bolted on later.
 * These mocks allow testing business logic without requiring a real database.
 */
import { vi, type Mock } from 'vitest';
import type { PrismaClient, Component, BuildStage, TestEvent } from '@prisma/client';

/**
 * Creates a mock Prisma client with all necessary methods stubbed.
 * Each test can customize return values as needed.
 */
export function createMockPrisma(): DeepMockProxy<PrismaClient> {
  return {
    component: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    buildStage: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    testEvent: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  } as unknown as DeepMockProxy<PrismaClient>;
}

/**
 * Helper to create mock Component data for tests
 */
export function createMockComponent(overrides: Partial<Component> = {}): Component {
  const now = new Date();
  return {
    id: 'comp-1',
    name: 'Heat Shield Unit A',
    serialNumber: 'HS-2024-001',
    partNumber: 'HS-5000-X',
    type: 'HEAT_SHIELD',
    status: 'PENDING',
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Component;
}

/**
 * Helper to create mock BuildStage data for tests
 */
export function createMockBuildStage(overrides: Partial<BuildStage> = {}): BuildStage {
  const now = new Date();
  return {
    id: 'stage-1',
    componentId: 'comp-1',
    name: 'Initial Assembly',
    sequence: 1,
    completedAt: null,
    notes: null,
    createdAt: now,
    ...overrides,
  } as BuildStage;
}

/**
 * Helper to create mock TestEvent data for tests
 */
export function createMockTestEvent(overrides: Partial<TestEvent> = {}): TestEvent {
  const now = new Date();
  return {
    id: 'test-1',
    componentId: 'comp-1',
    eventType: 'Pressure Test',
    result: 'PASSED',
    performedAt: now,
    notes: null,
    ...overrides,
  } as TestEvent;
}

/**
 * Type helper for deeply mocked Prisma client
 * Using any to avoid complex Prisma client type conflicts
 */
export type DeepMockProxy<T> = {
  [K in keyof T]: any;
};
