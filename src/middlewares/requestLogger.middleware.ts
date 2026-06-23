import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { isTest } from '../config/env';

/**
 * Lightweight request-logging middleware (bonus). Logs method, path,
 * status code and latency once the response finishes.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (isTest) return next();
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`,
    );
  });

  next();
}
