/**
 * Test context factory
 *
 * Testing was built in from day one — not bolted on later.
 * These helpers create testable GraphQL contexts with mocked dependencies.
 */
import { vi } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import type { Context } from '../../context';
import type { Loaders } from '../../loaders';
import type { DeepMockProxy } from '../mocks/prisma';

/**
 * Creates a test context with a mocked Prisma client.
 */
export function createTestContext(mockPrisma: DeepMockProxy<PrismaClient>): Context {
  // Create minimal mock loaders for testing
  const mockLoaders: Loaders = {
    buildStagesByComponentId: {
      load: vi.fn(),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as unknown as Loaders['buildStagesByComponentId'],
    testEventsByComponentId: {
      load: vi.fn(),
      loadMany: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      prime: vi.fn(),
    } as unknown as Loaders['testEventsByComponentId'],
  };

  return {
    db: mockPrisma,
    loaders: mockLoaders,
  };
}
