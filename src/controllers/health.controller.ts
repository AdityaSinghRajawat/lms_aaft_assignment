import { Request, Response } from 'express';
import { pingDatabase } from '../config/db';
import { isShuttingDown } from '../config/appState';
import { HTTP_STATUS } from '../constants/http.constants';

/**
 * Liveness probe — answers "is the process up and responsive?". Must NOT touch
 * external dependencies: a DB outage should not cause the orchestrator to kill
 * and restart an otherwise-healthy process.
 */
function liveness(_req: Request, res: Response): void {
  res.status(HTTP_STATUS.OK).json({
    status: 'alive',
    uptime: process.uptime(),
  });
}

/**
 * Readiness probe — answers "should this instance receive traffic now?".
 * Reports 503 while draining (graceful shutdown) or when the database is
 * unreachable, so the load balancer removes the instance without a restart.
 */
async function readiness(_req: Request, res: Response): Promise<void> {
  if (isShuttingDown()) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({ status: 'shutting_down', database: 'unknown' });
    return;
  }

  const databaseUp = await pingDatabase();
  if (!databaseUp) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({ status: 'not_ready', database: 'down' });
    return;
  }

  res.status(HTTP_STATUS.OK).json({ status: 'ready', database: 'up' });
}

export { liveness, readiness };
