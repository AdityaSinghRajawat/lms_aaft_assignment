import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { isProduction } from '../config/env';

/**
 * Central error-handling middleware. Translates ApiError, Prisma errors and
 * unknown exceptions into the consistent error envelope.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error(`${req.method} ${req.originalUrl}`, err.message);
    sendError(res, err.statusCode, err.message, err.details);
    return;
  }

  const prismaMapped = mapPrismaError(err);
  if (prismaMapped) {
    sendError(res, prismaMapped.statusCode, prismaMapped.message, prismaMapped.details);
    return;
  }

  // Unknown / unexpected error
  const message = err instanceof Error ? err.message : 'Unexpected error';
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, message);
  sendError(res, 500, isProduction ? 'Internal server error' : message);
}

function mapPrismaError(
  err: unknown,
): { statusCode: number; message: string; details?: unknown } | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[] | undefined)?.join(', ');
        return {
          statusCode: 409,
          message: `Unique constraint violated${target ? ` on: ${target}` : ''}`,
        };
      }
      case 'P2003':
        return { statusCode: 400, message: 'Related record not found (foreign key constraint)' };
      case 'P2025':
        return { statusCode: 404, message: 'Resource not found' };
      default:
        return { statusCode: 400, message: `Database error (${err.code})` };
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return { statusCode: 400, message: 'Invalid database query input' };
  }

  return null;
}
