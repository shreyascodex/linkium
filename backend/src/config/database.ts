import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  var __linkiumPrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma: PrismaClient = globalThis.__linkiumPrisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__linkiumPrisma = prisma;
}

export async function checkDatabaseHealth(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
