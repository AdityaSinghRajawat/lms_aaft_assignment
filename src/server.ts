import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { beginShutdown } from './config/appState';
import { logger } from './utils/logger';
import { APP } from './constants/app.constants';

let shuttingDown = false;

// Idempotent: the force-exit timer guarantees the process dies even if a
// connection refuses to drain within SHUTDOWN_TIMEOUT_MS.
async function shutdown(server: http.Server, reason: string, exitCode: number): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  beginShutdown();
  logger.info(`${reason} — shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.error(`Could not drain in ${APP.SHUTDOWN_TIMEOUT_MS}ms — forcing exit`);
    process.exit(1);
  }, APP.SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
      // Release idle keep-alive sockets so close() isn't blocked waiting on them.
      server.closeIdleConnections();
    });
    await disconnectDatabase();
    clearTimeout(forceExit);
    logger.info('Shutdown complete');
    process.exit(exitCode);
  } catch (err) {
    logger.error('Error during shutdown', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

function registerProcessHandlers(server: http.Server): void {
  process.on('SIGTERM', () => void shutdown(server, 'SIGTERM', 0));
  process.on('SIGINT', () => void shutdown(server, 'SIGINT', 0));

  // An uncaught exception leaves the process in an undefined state — log and
  // restart rather than continuing (a process manager/orchestrator respawns it).
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err instanceof Error ? err.stack ?? err.message : err);
    void shutdown(server, 'uncaughtException', 1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason instanceof Error ? reason.stack ?? reason.message : reason);
    void shutdown(server, 'unhandledRejection', 1);
  });
}

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = http.createServer(createApp());
  server.keepAliveTimeout = APP.KEEP_ALIVE_TIMEOUT_MS;
  server.headersTimeout = APP.HEADERS_TIMEOUT_MS;

  registerProcessHandlers(server);

  server.listen(env.port, () => {
    logger.info(`🚀 Server listening on http://localhost:${env.port}${env.apiPrefix}`);
    logger.info(`📚 API docs at http://localhost:${env.port}${env.apiPrefix}/docs`);
    logger.info(`❤️  Health: /health (liveness) · /ready (readiness)`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
