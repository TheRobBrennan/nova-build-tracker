/**
 * Unit tests for Query resolvers
 *
 * Testing was built in from day one — not bolted on later.
 * These tests verify all read operations in the GraphQL API.
 */
import { describe, it, expect, vi } from 'vitest';
import { queryResolvers } from './query';
import type { Context } from '../context';
import type { DeepMockProxy } from '../__tests__/mocks/prisma';
import type { PrismaClient, Component } from '@prisma/client';

describe('Query Resolvers', () => {
  function createMockContext(prismaOverrides: Partial<DeepMockProxy<PrismaClient>> = {}): Context {
    const mockPrisma = {
      component: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      ...prismaOverrides,
    } as unknown as DeepMockProxy<PrismaClient>;

    return {
      db: mockPrisma as any,
      loaders: {
        buildStagesByComponentId: { load: vi.fn(), loadMany: vi.fn() },
        testEventsByComponentId: { load: vi.fn(), loadMany: vi.fn() },
      } as any,
    };
  }

  describe('components query', () => {
    it('should return all components when no filters provided', async () => {
      // Arrange
      const mockComponents: Component[] = [
        { id: '1', name: 'Comp 1', serialNumber: 'SN1', partNumber: 'PN1', type: 'HEAT_SHIELD', status: 'PENDING', notes: null, createdAt: new Date(), updatedAt: new Date() },
      ] as Component[];

      const ctx = createMockContext({
        component: {
          findMany: vi.fn().mockResolvedValue(mockComponents),
          findUnique: vi.fn(),
        },
      });

      // Act
      const result = await queryResolvers.Query.components({}, {}, ctx);

      // Assert
      expect(ctx.db.component.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockComponents);
    });

    it('should filter components by status', async () => {
      // Arrange
      const mockComponents: Component[] = [
        { id: '1', name: 'Comp 1', serialNumber: 'SN1', partNumber: 'PN1', type: 'HEAT_SHIELD', status: 'IN_PROGRESS', notes: null, createdAt: new Date(), updatedAt: new Date() },
      ] as Component[];

      const ctx = createMockContext({
        component: {
          findMany: vi.fn().mockResolvedValue(mockComponents),
          findUnique: vi.fn(),
        },
      });

      // Act
      const result = await queryResolvers.Query.components({}, { status: 'IN_PROGRESS' }, ctx);

      // Assert
      expect(ctx.db.component.findMany).toHaveBeenCalledWith({
        where: { status: 'IN_PROGRESS' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockComponents);
    });

    it('should filter components by type', async () => {
      // Arrange
      const mockComponents: Component[] = [
        { id: '1', name: 'Comp 1', serialNumber: 'SN1', partNumber: 'PN1', type: 'ENGINE_COMPONENT', status: 'PENDING', notes: null, createdAt: new Date(), updatedAt: new Date() },
      ] as Component[];

      const ctx = createMockContext({
        component: {
          findMany: vi.fn().mockResolvedValue(mockComponents),
          findUnique: vi.fn(),
        },
      });

      // Act
      const result = await queryResolvers.Query.components({}, { type: 'ENGINE_COMPONENT' }, ctx);

      // Assert
      expect(ctx.db.component.findMany).toHaveBeenCalledWith({
        where: { type: 'ENGINE_COMPONENT' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockComponents);
    });

    it('should filter components by both status and type', async () => {
      // Arrange
      const mockComponents: Component[] = [
        { id: '1', name: 'Comp 1', serialNumber: 'SN1', partNumber: 'PN1', type: 'AVIONICS', status: 'TESTING', notes: null, createdAt: new Date(), updatedAt: new Date() },
      ] as Component[];

      const ctx = createMockContext({
        component: {
          findMany: vi.fn().mockResolvedValue(mockComponents),
          findUnique: vi.fn(),
        },
      });

      // Act
      const result = await queryResolvers.Query.components({}, { status: 'TESTING', type: 'AVIONICS' }, ctx);

      // Assert
      expect(ctx.db.component.findMany).toHaveBeenCalledWith({
        where: { status: 'TESTING', type: 'AVIONICS' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockComponents);
    });

    it('should return empty array when no components match', async () => {
      // Arrange
      const ctx = createMockContext({
        component: {
          findMany: vi.fn().mockResolvedValue([]),
          findUnique: vi.fn(),
        },
      });

      // Act
      const result = await queryResolvers.Query.components({}, { status: 'REJECTED' }, ctx);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('component query', () => {
    it('should return a single component by ID', async () => {
      // Arrange
      const mockComponent: Component = {
        id: 'comp-123',
        name: 'Test Component',
        serialNumber: 'SN-123',
        partNumber: 'PN-456',
        type: 'STRUCTURAL',
        status: 'ACCEPTED',
        notes: 'Test notes',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Component;

      const ctx = createMockContext({
        component: {
          findMany: vi.fn(),
          findUnique: vi.fn().mockResolvedValue(mockComponent),
        },
      });

      // Act
      const result = await queryResolvers.Query.component({}, { id: 'comp-123' }, ctx);

      // Assert
      expect(ctx.db.component.findUnique).toHaveBeenCalledWith({
        where: { id: 'comp-123' },
      });
      expect(result).toEqual(mockComponent);
    });

    it('should return null when component not found', async () => {
      // Arrange
      const ctx = createMockContext({
        component: {
          findMany: vi.fn(),
          findUnique: vi.fn().mockResolvedValue(null),
        },
      });

      // Act
      const result = await queryResolvers.Query.component({}, { id: 'non-existent' }, ctx);

      // Assert
      expect(result).toBeNull();
    });
  });
});
