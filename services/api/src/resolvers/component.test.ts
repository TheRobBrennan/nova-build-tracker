/**
 * Unit tests for Component field resolvers
 *
 * Testing was built in from day one — not bolted on later.
 * These tests verify the field-level resolvers that transform and resolve
 * related data for Component, BuildStage, and TestEvent types.
 */
import { describe, it, expect, vi } from 'vitest';
import { componentResolvers } from './component';
import type { Context } from '../context';

describe('Component Field Resolvers', () => {
  function createMockContext(loaderOverrides = {}): Context {
    return {
      db: {} as any,
      loaders: {
        buildStagesByComponentId: {
          load: vi.fn(),
          loadMany: vi.fn(),
          clear: vi.fn(),
          clearAll: vi.fn(),
          prime: vi.fn(),
        },
        testEventsByComponentId: {
          load: vi.fn(),
          loadMany: vi.fn(),
          clear: vi.fn(),
          clearAll: vi.fn(),
          prime: vi.fn(),
        },
        ...loaderOverrides,
      } as any,
    };
  }

  describe('Component.buildStages', () => {
    it('should use DataLoader to resolve build stages', async () => {
      // Arrange
      const parent = { id: 'comp-123' };
      const mockStages = [
        { id: 's1', name: 'Stage 1', sequence: 1 },
        { id: 's2', name: 'Stage 2', sequence: 2 },
      ];

      const mockLoad = vi.fn().mockResolvedValue(mockStages);
      const ctx = createMockContext({
        buildStagesByComponentId: {
          load: mockLoad,
          loadMany: vi.fn(),
          clear: vi.fn(),
          clearAll: vi.fn(),
          prime: vi.fn(),
        } as unknown as Context['loaders']['buildStagesByComponentId'],
      });

      // Act
      const result = await componentResolvers.Component.buildStages(parent, {}, ctx);

      // Assert
      expect(mockLoad).toHaveBeenCalledWith('comp-123');
      expect(result).toEqual(mockStages);
    });
  });

  describe('Component.testEvents', () => {
    it('should use DataLoader to resolve test events', async () => {
      // Arrange
      const parent = { id: 'comp-456' };
      const mockEvents = [
        { id: 'e1', eventType: 'Test 1', result: 'PASSED' },
        { id: 'e2', eventType: 'Test 2', result: 'FAILED' },
      ];

      const mockLoad = vi.fn().mockResolvedValue(mockEvents);
      const ctx = createMockContext({
        testEventsByComponentId: {
          load: mockLoad,
          loadMany: vi.fn(),
          clear: vi.fn(),
          clearAll: vi.fn(),
          prime: vi.fn(),
        } as unknown as Context['loaders']['testEventsByComponentId'],
      });

      // Act
      const result = await componentResolvers.Component.testEvents(parent, {}, ctx);

      // Assert
      expect(mockLoad).toHaveBeenCalledWith('comp-456');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('Component.createdAt', () => {
    it('should convert Date to ISO string', () => {
      // Arrange
      const now = new Date();
      const parent = { createdAt: now };

      // Act
      const result = componentResolvers.Component.createdAt(parent);

      // Assert
      expect(result).toBe(now.toISOString());
    });
  });

  describe('Component.updatedAt', () => {
    it('should convert Date to ISO string', () => {
      // Arrange
      const now = new Date();
      const parent = { updatedAt: now };

      // Act
      const result = componentResolvers.Component.updatedAt(parent);

      // Assert
      expect(result).toBe(now.toISOString());
    });
  });

  describe('BuildStage.completedAt', () => {
    it('should return null when stage is not completed', () => {
      // Arrange
      const parent = { completedAt: null };

      // Act
      const result = componentResolvers.BuildStage.completedAt(parent);

      // Assert
      expect(result).toBeNull();
    });

    it('should convert completed Date to ISO string', () => {
      // Arrange
      const completedAt = new Date();
      const parent = { completedAt };

      // Act
      const result = componentResolvers.BuildStage.completedAt(parent);

      // Assert
      expect(result).toBe(completedAt.toISOString());
    });
  });

  describe('BuildStage.createdAt', () => {
    it('should convert Date to ISO string', () => {
      // Arrange
      const createdAt = new Date();
      const parent = { createdAt };

      // Act
      const result = componentResolvers.BuildStage.createdAt(parent);

      // Assert
      expect(result).toBe(createdAt.toISOString());
    });
  });

  describe('TestEvent.performedAt', () => {
    it('should convert Date to ISO string', () => {
      // Arrange
      const performedAt = new Date();
      const parent = { performedAt };

      // Act
      const result = componentResolvers.TestEvent.performedAt(parent);

      // Assert
      expect(result).toBe(performedAt.toISOString());
    });
  });
});
