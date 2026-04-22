/**
 * Unit tests for GraphQL context factory
 *
 * Testing was built in from day one — not bolted on later.
 * These tests verify the context layer that powers all resolver operations.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { createContext } from './context';
import { createLoaders } from './loaders';

// Mock the loaders module
vi.mock('./loaders', () => ({
  createLoaders: vi.fn(() => ({
    buildStagesByComponentId: {},
    testEventsByComponentId: {},
  })),
}));

describe('createContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should create context with Prisma client and loaders', () => {
    // Arrange
    const mockPrisma = {
      component: {},
      buildStage: {},
      testEvent: {},
    } as unknown as PrismaClient;

    // Act
    const context = createContext(mockPrisma);

    // Assert
    expect(context.db).toBe(mockPrisma);
    expect(context.loaders).toBeDefined();
    expect(createLoaders).toHaveBeenCalledWith(mockPrisma);
  });

  it('should create fresh loaders for each context instance', () => {
    // Arrange
    const mockPrisma = {} as PrismaClient;

    // Act
    const context1 = createContext(mockPrisma);
    const context2 = createContext(mockPrisma);

    // Assert
    expect(context1.loaders).not.toBe(context2.loaders);
    expect(createLoaders).toHaveBeenCalledTimes(2);
  });
});
