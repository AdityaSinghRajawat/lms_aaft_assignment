import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { isProduction } from '../config/env';
import { HTTP_STATUS } from '../constants/http.constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    if (err.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      logger.error(`${req.method} ${req.originalUrl}`, err.message);
    }
    sendError(res, err.statusCode, err.message, err.details);
    return;
  }

  const prismaMapped = mapPrismaError(err);
  if (prismaMapped) {
    sendError(res, prismaMapped.statusCode, prismaMapped.message, prismaMapped.details);
    return;
  }

  const message = err instanceof Error ? err.message : 'Unexpected error';
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, message);
  sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, isProduction ? 'Internal server error' : message);
}

function mapPrismaError(
  err: unknown,
): { statusCode: number; message: string; details?: unknown } | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[] | undefined)?.join(', ');
        return {
          statusCode: HTTP_STATUS.CONFLICT,
          message: `Unique constraint violated${target ? ` on: ${target}` : ''}`,
        };
      }
      case 'P2003':
        return {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: 'Related record not found (foreign key constraint)',
        };
      case 'P2025':
        return { statusCode: HTTP_STATUS.NOT_FOUND, message: 'Resource not found' };
      default:
        return { statusCode: HTTP_STATUS.BAD_REQUEST, message: `Database error (${err.code})` };
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return { statusCode: HTTP_STATUS.BAD_REQUEST, message: 'Invalid database query input' };
  }

  return null;
}
