import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types/common';
import { ApiError } from '../utils/apiError';

/**
 * Domain-specific helper for signing & verifying JWT access tokens.
 */
export function signToken(payload: AuthPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): AuthPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload & AuthPayload;
    return { sub: decoded.sub as string, role: decoded.role, email: decoded.email };
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}
