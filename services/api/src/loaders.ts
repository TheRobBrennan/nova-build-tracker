import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';

export function createLoaders(db: PrismaClient) {
  return {
    buildStagesByComponentId: new DataLoader(async (ids: readonly string[]) => {
      const stages = await db.buildStage.findMany({
        where: { componentId: { in: [...ids] } },
        orderBy: { sequence: 'asc' },
      });
      return ids.map((id) => stages.filter((s) => s.componentId === id));
    }),

    testEventsByComponentId: new DataLoader(async (ids: readonly string[]) => {
      const events = await db.testEvent.findMany({
        where: { componentId: { in: [...ids] } },
        orderBy: { performedAt: 'desc' },
      });
      return ids.map((id) => events.filter((e) => e.componentId === id));
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
