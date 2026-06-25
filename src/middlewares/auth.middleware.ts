import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../helpers/jwt.helper';
import { ApiError } from '../utils/apiError';
import { JWT } from '../constants/jwt.constants';

const BEARER_PREFIX = `${JWT.BEARER_SCHEME} `;

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith(BEARER_PREFIX)) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) throw ApiError.unauthorized('Missing bearer token');

  req.user = verifyToken(token);
  next();
}

// Must run after `authenticate`, which populates `req.user`.
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to access this resource');
    }
    next();
  };
}

export const requireAdmin = authorize(Role.ADMIN);
export const requireStudent = authorize(Role.STUDENT);
