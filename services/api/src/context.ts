import { PrismaClient } from '@prisma/client';
import { createLoaders, Loaders } from './loaders';

export interface Context {
  db: PrismaClient;
  loaders: Loaders;
}

export function createContext(db: PrismaClient): Context {
  return {
    db,
    loaders: createLoaders(db),
  };
}
