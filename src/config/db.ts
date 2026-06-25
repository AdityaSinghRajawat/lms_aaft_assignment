import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// One shared client per process — multiple instances would exhaust DB connections.
export const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('✅ Database connected');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('🛑 Database disconnected');
}

export async function pingDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
