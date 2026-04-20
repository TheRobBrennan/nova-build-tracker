import { GraphQLError } from 'graphql';
import { Context } from '../context';
import { pubsub, COMPONENT_STATUS_CHANGED } from '../pubsub';

interface CreateComponentInput {
  name: string;
  serialNumber: string;
  partNumber: string;
  type: string;
  notes?: string;
}

interface LogTestEventInput {
  eventType: string;
  result: string;
  notes?: string;
}

export const mutationResolvers = {
  Mutation: {
    createComponent: async (
      _: unknown,
      { input }: { input: CreateComponentInput },
      ctx: Context
    ) => {
      return ctx.db.component.create({
        data: {
          name: input.name,
          serialNumber: input.serialNumber,
          partNumber: input.partNumber,
          type: input.type as any,
          notes: input.notes,
        },
      });
    },

    updateComponentStatus: async (
      _: unknown,
      { id, status }: { id: string; status: string },
      ctx: Context
    ) => {
      const updated = await ctx.db.component.update({
        where: { id },
        data: { status: status as any },
      });

      await pubsub.publish(COMPONENT_STATUS_CHANGED, {
        componentStatusChanged: updated,
      });

      return updated;
    },

    completeBuildStage: async (
      _: unknown,
      { stageId, notes }: { stageId: string; notes?: string },
      ctx: Context
    ) => {
      const stage = await ctx.db.buildStage.findUnique({ where: { id: stageId } });
      if (!stage) {
        throw new GraphQLError('Build stage not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return ctx.db.buildStage.update({
        where: { id: stageId },
        data: { completedAt: new Date(), notes },
      });
    },

    logTestEvent: async (
      _: unknown,
      { componentId, input }: { componentId: string; input: LogTestEventInput },
      ctx: Context
    ) => {
      const component = await ctx.db.component.findUnique({ where: { id: componentId } });
      if (!component) {
        throw new GraphQLError('Component not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return ctx.db.testEvent.create({
        data: {
          componentId,
          eventType: input.eventType,
          result: input.result,
          notes: input.notes,
        },
      });
    },
  },
};
