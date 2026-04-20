import { Context } from '../context';

export const queryResolvers = {
  Query: {
    components: async (
      _: unknown,
      { status, type }: { status?: string; type?: string },
      ctx: Context
    ) => {
      return ctx.db.component.findMany({
        where: {
          ...(status && { status: status as any }),
          ...(type && { type: type as any }),
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    component: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      return ctx.db.component.findUnique({ where: { id } });
    },
  },
};
