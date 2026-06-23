import { PrismaClient } from '@prisma/client';
import { isProduction } from './env';
import { logger } from '../utils/logger';

/**
 * Single shared PrismaClient instance (connection pooling lives inside Prisma).
 * Re-using one client avoids exhausting database connections.
 */
export const prisma = new PrismaClient({
  log: isProduction ? ['warn', 'error'] : ['warn', 'error'],
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('✅ Database connected');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('🛑 Database disconnected');
}
