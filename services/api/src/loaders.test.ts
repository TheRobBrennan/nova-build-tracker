/**
 * Unit tests for DataLoader factories
 *
 * Testing was built in from day one — not bolted on later.
 * DataLoaders optimize database queries by batching and caching.
 */
import { describe, it, expect, vi } from 'vitest';
import type { PrismaClient, BuildStage, TestEvent } from '@prisma/client';
import { createLoaders } from './loaders';

describe('createLoaders', () => {
  function createMockPrisma(overrides: Partial<PrismaClient> = {}) {
    return {
      buildStage: {
        findMany: vi.fn(),
      },
      testEvent: {
        findMany: vi.fn(),
      },
      ...overrides,
    } as unknown as PrismaClient;
  }

  describe('buildStagesByComponentId', () => {
    it('should batch and return stages grouped by component ID', async () => {
      // Arrange
      const stages: BuildStage[] = [
        { id: 's1', componentId: 'c1', name: 'Stage 1', sequence: 1, completedAt: null, notes: null, createdAt: new Date() },
        { id: 's2', componentId: 'c1', name: 'Stage 2', sequence: 2, completedAt: new Date(), notes: null, createdAt: new Date() },
        { id: 's3', componentId: 'c2', name: 'Stage A', sequence: 1, completedAt: null, notes: null, createdAt: new Date() },
      ] as BuildStage[];

      const mockPrisma = createMockPrisma({
        buildStage: { findMany: vi.fn().mockResolvedValue(stages) },
      });

      const loaders = createLoaders(mockPrisma);

      // Act
      const result = await loaders.buildStagesByComponentId.loadMany(['c1', 'c2']);

      // Assert
      expect(mockPrisma.buildStage.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.buildStage.findMany).toHaveBeenCalledWith({
        where: { componentId: { in: ['c1', 'c2'] } },
        orderBy: { sequence: 'asc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2); // c1 has 2 stages
      expect(result[1]).toHaveLength(1); // c2 has 1 stage
    });

    it('should return empty array for component with no stages', async () => {
      // Arrange
      const stages: BuildStage[] = [
        { id: 's1', componentId: 'c1', name: 'Stage 1', sequence: 1, completedAt: null, notes: null, createdAt: new Date() },
      ] as BuildStage[];

      const mockPrisma = createMockPrisma({
        buildStage: { findMany: vi.fn().mockResolvedValue(stages) },
      });

      const loaders = createLoaders(mockPrisma);

      // Act
      const result = await loaders.buildStagesByComponentId.load('c2');

      // Assert
      expect(result).toEqual([]);
    });

    it('should order stages by sequence ascending', async () => {
      // Arrange
      // Prisma returns data ordered by sequence (simulated with sorted mock data)
      const stages: BuildStage[] = [
        { id: 's1', componentId: 'c1', name: 'Stage 1', sequence: 1, completedAt: null, notes: null, createdAt: new Date() },
        { id: 's2', componentId: 'c1', name: 'Stage 2', sequence: 2, completedAt: null, notes: null, createdAt: new Date() },
        { id: 's3', componentId: 'c1', name: 'Stage 3', sequence: 3, completedAt: null, notes: null, createdAt: new Date() },
      ] as BuildStage[];

      const mockPrisma = createMockPrisma({
        buildStage: { findMany: vi.fn().mockResolvedValue(stages) },
      });

      const loaders = createLoaders(mockPrisma);

      // Act
      const result = await loaders.buildStagesByComponentId.load('c1');

      // Assert - verify Prisma query includes correct ordering
      expect(mockPrisma.buildStage.findMany).toHaveBeenCalledWith({
        where: { componentId: { in: ['c1'] } },
        orderBy: { sequence: 'asc' },
      });
      // Verify results maintain the order from Prisma
      expect(result[0].sequence).toBe(1);
      expect(result[1].sequence).toBe(2);
      expect(result[2].sequence).toBe(3);
    });
  });

  describe('testEventsByComponentId', () => {
    it('should batch and return test events grouped by component ID', async () => {
      // Arrange
      const events: TestEvent[] = [
        { id: 'e1', componentId: 'c1', eventType: 'Pressure Test', result: 'PASSED', performedAt: new Date(), notes: null },
        { id: 'e2', componentId: 'c1', eventType: 'Leak Test', result: 'PASSED', performedAt: new Date(), notes: null },
        { id: 'e3', componentId: 'c2', eventType: 'Visual Inspection', result: 'PASSED', performedAt: new Date(), notes: null },
      ] as TestEvent[];

      const mockPrisma = createMockPrisma({
        testEvent: { findMany: vi.fn().mockResolvedValue(events) },
      });

      const loaders = createLoaders(mockPrisma);

      // Act
      const result = await loaders.testEventsByComponentId.loadMany(['c1', 'c2']);

      // Assert
      expect(mockPrisma.testEvent.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.testEvent.findMany).toHaveBeenCalledWith({
        where: { componentId: { in: ['c1', 'c2'] } },
        orderBy: { performedAt: 'desc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2); // c1 has 2 events
      expect(result[1]).toHaveLength(1); // c2 has 1 event
    });

    it('should order test events by performedAt descending', async () => {
      // Arrange
      // Use fixed timestamps to avoid timing issues
      const now = new Date('2024-04-22T10:00:00.000Z');
      const yesterday = new Date('2024-04-21T10:00:00.000Z');
      const lastWeek = new Date('2024-04-15T10:00:00.000Z');

      // Prisma returns data ordered by performedAt desc (simulated with sorted mock data)
      const events: TestEvent[] = [
        { id: 'e3', componentId: 'c1', eventType: 'Test 3', result: 'PASSED', performedAt: now, notes: null },
        { id: 'e2', componentId: 'c1', eventType: 'Test 2', result: 'PASSED', performedAt: yesterday, notes: null },
        { id: 'e1', componentId: 'c1', eventType: 'Test 1', result: 'PASSED', performedAt: lastWeek, notes: null },
      ] as TestEvent[];

      const mockPrisma = createMockPrisma({
        testEvent: { findMany: vi.fn().mockResolvedValue(events) },
      });

      const loaders = createLoaders(mockPrisma);

      // Act
      const result = await loaders.testEventsByComponentId.load('c1');

      // Assert - verify Prisma query includes correct ordering
      expect(mockPrisma.testEvent.findMany).toHaveBeenCalledWith({
        where: { componentId: { in: ['c1'] } },
        orderBy: { performedAt: 'desc' },
      });
      // Verify results maintain the order from Prisma (most recent first)
      expect(result[0].performedAt.getTime()).toBe(now.getTime());
      expect(result[1].performedAt.getTime()).toBe(yesterday.getTime());
      expect(result[2].performedAt.getTime()).toBe(lastWeek.getTime());
    });
  });

  it('should return independent loaders for each call', () => {
    // Arrange
    const mockPrisma = createMockPrisma();

    // Act
    const loaders1 = createLoaders(mockPrisma);
    const loaders2 = createLoaders(mockPrisma);

    // Assert
    expect(loaders1).not.toBe(loaders2);
    expect(loaders1.buildStagesByComponentId).not.toBe(loaders2.buildStagesByComponentId);
    expect(loaders1.testEventsByComponentId).not.toBe(loaders2.testEventsByComponentId);
  });
});
