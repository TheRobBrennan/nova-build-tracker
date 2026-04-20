import { Context } from '../context';

export const componentResolvers = {
  Component: {
    buildStages: (parent: { id: string }, _: unknown, ctx: Context) => {
      return ctx.loaders.buildStagesByComponentId.load(parent.id);
    },

    testEvents: (parent: { id: string }, _: unknown, ctx: Context) => {
      return ctx.loaders.testEventsByComponentId.load(parent.id);
    },

    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
    updatedAt: (parent: { updatedAt: Date }) => parent.updatedAt.toISOString(),
  },

  BuildStage: {
    completedAt: (parent: { completedAt: Date | null }) =>
      parent.completedAt ? parent.completedAt.toISOString() : null,
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },

  TestEvent: {
    performedAt: (parent: { performedAt: Date }) => parent.performedAt.toISOString(),
  },
};
