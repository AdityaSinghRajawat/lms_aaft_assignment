import { Server } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { logger } from './utils/logger';

/**
 * Application entry point — connects the database, starts the HTTP server
 * and wires up graceful shutdown.
 */
async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server: Server = app.listen(env.port, () => {
    logger.info(`🚀 Server listening on http://localhost:${env.port}${env.apiPrefix}`);
    logger.info(`📚 API docs at http://localhost:${env.port}${env.apiPrefix}/docs`);
  });

  setupGracefulShutdown(server);
}

function setupGracefulShutdown(server: Server): void {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Force-exit if shutdown hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason instanceof Error ? reason.message : reason);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err instanceof Error ? err.message : err);
  process.exit(1);
});
