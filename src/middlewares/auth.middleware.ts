import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../helpers/jwt.helper';
import { ApiError } from '../utils/apiError';

/**
 * Authentication middleware — verifies the Bearer JWT and attaches
 * the decoded payload to `req.user`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) throw ApiError.unauthorized('Missing bearer token');

  req.user = verifyToken(token);
  next();
}

/**
 * Authorization middleware factory — enforces role-based access control.
 * Must run after `authenticate`.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }
    next();
  };
}

/** Convenience guards. */
export const requireAdmin = authorize(Role.ADMIN);
export const requireStudent = authorize(Role.STUDENT);
