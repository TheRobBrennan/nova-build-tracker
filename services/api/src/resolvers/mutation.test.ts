/**
 * Unit tests for Mutation resolvers
 *
 * Testing was built in from day one — not bolted on later.
 * These tests verify all write operations and business logic in the GraphQL API.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GraphQLError } from 'graphql';
import { mutationResolvers } from './mutation';
import type { Context } from '../context';
import type { DeepMockProxy } from '../__tests__/mocks/prisma';
import type { PrismaClient, Component, BuildStage, TestEvent } from '@prisma/client';
import * as pubsubModule from '../pubsub';

// Mock the pubsub module
vi.mock('../pubsub', () => ({
  pubsub: {
    publish: vi.fn(),
  },
  COMPONENT_STATUS_CHANGED: 'COMPONENT_STATUS_CHANGED',
}));

describe('Mutation Resolvers', () => {
  function createMockContext(prismaOverrides: Partial<DeepMockProxy<PrismaClient>> = {}): Context {
    const mockPrisma = {
      component: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      buildStage: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      testEvent: {
        create: vi.fn(),
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createComponent', () => {
    it('should create a new component with provided input', async () => {
      // Arrange
      const input = {
        name: 'New Heat Shield',
        serialNumber: 'HS-2024-002',
        partNumber: 'HS-5000-Y',
        type: 'HEAT_SHIELD',
        notes: 'Manufacturing batch 2',
      };

      const createdComponent: Component = {
        id: 'new-comp-id',
        name: input.name,
        serialNumber: input.serialNumber,
        partNumber: input.partNumber,
        type: input.type,
        status: 'PENDING',
        notes: input.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Component;

      const ctx = createMockContext({
        component: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn().mockResolvedValue(createdComponent),
          update: vi.fn(),
        },
      });

      // Act
      const result = await mutationResolvers.Mutation.createComponent({}, { input }, ctx);

      // Assert
      expect(ctx.db.component.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          serialNumber: input.serialNumber,
          partNumber: input.partNumber,
          type: input.type,
          notes: input.notes,
        },
      });
      expect(result).toEqual(createdComponent);
    });

    it('should create component without optional notes field', async () => {
      // Arrange
      const input = {
        name: 'Engine Component',
        serialNumber: 'EC-001',
        partNumber: 'EC-1000',
        type: 'ENGINE_COMPONENT',
      };

      const createdComponent: Component = {
        id: 'comp-id',
        name: input.name,
        serialNumber: input.serialNumber,
        partNumber: input.partNumber,
        type: input.type,
        status: 'PENDING',
        notes: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Component;

      const ctx = createMockContext({
        component: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn().mockResolvedValue(createdComponent),
          update: vi.fn(),
        },
      });

      // Act
      const result = await mutationResolvers.Mutation.createComponent({}, { input }, ctx);

      // Assert
      expect(ctx.db.component.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          serialNumber: input.serialNumber,
          partNumber: input.partNumber,
          type: input.type,
          notes: undefined,
        },
      });
      expect(result).toEqual(createdComponent);
    });
  });

  describe('updateComponentStatus', () => {
    it('should update component status and publish event', async () => {
      // Arrange
      const updatedComponent: Component = {
        id: 'comp-123',
        name: 'Test Component',
        serialNumber: 'SN-123',
        partNumber: 'PN-456',
        type: 'HEAT_SHIELD',
        status: 'IN_PROGRESS',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Component;

      const ctx = createMockContext({
        component: {
          findMany: vi.fn(),
          findUnique: vi.fn(),
          create: vi.fn(),
          update: vi.fn().mockResolvedValue(updatedComponent),
        },
      });

      // Act
      const result = await mutationResolvers.Mutation.updateComponentStatus(
        {},
        { id: 'comp-123', status: 'IN_PROGRESS' },
        ctx
      );

      // Assert
      expect(ctx.db.component.update).toHaveBeenCalledWith({
        where: { id: 'comp-123' },
        data: { status: 'IN_PROGRESS' },
      });
      expect(pubsubModule.pubsub.publish).toHaveBeenCalledWith(
        'COMPONENT_STATUS_CHANGED',
        { componentStatusChanged: updatedComponent }
      );
      expect(result).toEqual(updatedComponent);
    });

    it('should handle all status transitions', async () => {
      const statuses = ['PENDING', 'IN_PROGRESS', 'TESTING', 'ACCEPTED', 'REJECTED'];

      for (const status of statuses) {
        vi.clearAllMocks();

        const updatedComponent: Component = {
          id: 'comp-123',
          name: 'Test',
          serialNumber: 'SN',
          partNumber: 'PN',
          type: 'HEAT_SHIELD',
          status: status as any,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Component;

        const ctx = createMockContext({
          component: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn().mockResolvedValue(updatedComponent),
          },
        });

        const result = await mutationResolvers.Mutation.updateComponentStatus(
          {},
          { id: 'comp-123', status },
          ctx
        );

        expect(ctx.db.component.update).toHaveBeenCalledWith({
          where: { id: 'comp-123' },
          data: { status },
        });
        expect(result.status).toBe(status);
      }
    });
  });

  describe('completeBuildStage', () => {
    it('should mark build stage as completed with current timestamp', async () => {
      // Arrange
      const beforeUpdate = new Date('2024-01-01');
      const completedStage: BuildStage = {
        id: 'stage-1',
        componentId: 'comp-123',
        name: 'Assembly',
        sequence: 1,
        completedAt: beforeUpdate,
        notes: null,
        createdAt: new Date(),
      } as BuildStage;

      const ctx = createMockContext({
        buildStage: {
          findUnique: vi.fn().mockResolvedValue(completedStage),
          update: vi.fn().mockImplementation(({ data }) =>
            Promise.resolve({ ...completedStage, completedAt: data.completedAt, notes: data.notes })
          ),
        },
      });

      // Act
      const result = await mutationResolvers.Mutation.completeBuildStage(
        {},
        { stageId: 'stage-1', notes: 'Completed successfully' },
        ctx
      );

      // Assert
      expect(ctx.db.buildStage.findUnique).toHaveBeenCalledWith({
        where: { id: 'stage-1' },
      });
      expect(ctx.db.buildStage.update).toHaveBeenCalledWith({
        where: { id: 'stage-1' },
        data: { completedAt: expect.any(Date), notes: 'Completed successfully' },
      });
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should throw error when build stage not found', async () => {
      // Arrange
      const ctx = createMockContext({
        buildStage: {
          findUnique: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
      });

      // Act & Assert
      await expect(
        mutationResolvers.Mutation.completeBuildStage({}, { stageId: 'non-existent' }, ctx)
      ).rejects.toThrow(GraphQLError);

      await expect(
        mutationResolvers.Mutation.completeBuildStage({}, { stageId: 'non-existent' }, ctx)
      ).rejects.toThrow('Build stage not found');

      expect(ctx.db.buildStage.update).not.toHaveBeenCalled();
    });

    it('should complete stage without optional notes', async () => {
      // Arrange
      const stage: BuildStage = {
        id: 'stage-1',
        componentId: 'comp-123',
        name: 'Assembly',
        sequence: 1,
        completedAt: null,
        notes: null,
        createdAt: new Date(),
      } as BuildStage;

      const ctx = createMockContext({
        buildStage: {
          findUnique: vi.fn().mockResolvedValue(stage),
          update: vi.fn().mockImplementation(({ data }) =>
            Promise.resolve({ ...stage, completedAt: data.completedAt, notes: data.notes })
          ),
        },
      });

      // Act
      await mutationResolvers.Mutation.completeBuildStage({}, { stageId: 'stage-1' }, ctx);

      // Assert
      expect(ctx.db.buildStage.update).toHaveBeenCalledWith({
        where: { id: 'stage-1' },
        data: { completedAt: expect.any(Date), notes: undefined },
      });
    });
  });

  describe('logTestEvent', () => {
    it('should create test event for existing component', async () => {
      // Arrange
      const component: Component = {
        id: 'comp-123',
        name: 'Test Component',
        serialNumber: 'SN-123',
        partNumber: 'PN-456',
        type: 'HEAT_SHIELD',
        status: 'TESTING',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Component;

      const input = {
        eventType: 'Pressure Test',
        result: 'PASSED',
        notes: 'All pressure tests passed at 500 PSI',
      };

      const createdEvent: TestEvent = {
        id: 'test-1',
        componentId: 'comp-123',
        eventType: input.eventType,
        result: input.result,
        performedAt: new Date(),
        notes: input.notes,
      } as TestEvent;

      const ctx = createMockContext({
        component: {
          findMany: vi.fn(),
          findUnique: vi.fn().mockResolvedValue(component),
          create: vi.fn(),
          update: vi.fn(),
        },
        testEvent: {
          create: vi.fn().mockResolvedValue(createdEvent),
        },
      });

      // Act
      const result = await mutationResolvers.Mutation.logTestEvent(
        {},
        { componentId: 'comp-123', input },
        ctx
      );

      // Assert
      expect(ctx.db.component.findUnique).toHaveBeenCalledWith({
        where: { id: 'comp-123' },
      });
      expect(ctx.db.testEvent.create).toHaveBeenCalledWith({
        data: {
          componentId: 'comp-123',
          eventType: input.eventType,
          result: input.result,
          notes: input.notes,
        },
      });
      expect(result).toEqual(createdEvent);
    });

    it('should throw error when component not found', async () => {
      // Arrange
      const input = {
        eventType: 'Pressure Test',
        result: 'FAILED',
      };

      const ctx = createMockContext({
        component: {
          findMany: vi.fn(),
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn(),
          update: vi.fn(),
        },
        testEvent: {
          create: vi.fn(),
        },
      });

      // Act & Assert
      await expect(
        mutationResolvers.Mutation.logTestEvent({}, { componentId: 'non-existent', input }, ctx)
      ).rejects.toThrow(GraphQLError);

      await expect(
        mutationResolvers.Mutation.logTestEvent({}, { componentId: 'non-existent', input }, ctx)
      ).rejects.toThrow('Component not found');

      expect(ctx.db.testEvent.create).not.toHaveBeenCalled();
    });

    it('should create test event without optional notes', async () => {
      // Arrange
      const component: Component = {
        id: 'comp-123',
        name: 'Test Component',
        serialNumber: 'SN-123',
        partNumber: 'PN-456',
        type: 'HEAT_SHIELD',
        status: 'TESTING',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Component;

      const input = {
        eventType: 'Visual Inspection',
        result: 'PASSED',
      };

      const createdEvent: TestEvent = {
        id: 'test-1',
        componentId: 'comp-123',
        eventType: input.eventType,
        result: input.result,
        performedAt: new Date(),
        notes: undefined,
      } as unknown as TestEvent;

      const ctx = createMockContext({
        component: {
          findMany: vi.fn(),
          findUnique: vi.fn().mockResolvedValue(component),
          create: vi.fn(),
          update: vi.fn(),
        },
        testEvent: {
          create: vi.fn().mockResolvedValue(createdEvent),
        },
      });

      // Act
      await mutationResolvers.Mutation.logTestEvent({}, { componentId: 'comp-123', input }, ctx);

      // Assert
      expect(ctx.db.testEvent.create).toHaveBeenCalledWith({
        data: {
          componentId: 'comp-123',
          eventType: input.eventType,
          result: input.result,
          notes: undefined,
        },
      });
    });
  });
});
