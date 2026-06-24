import { User } from '@prisma/client';
import { AuthResult } from '../types/auth.types';
import { toSafeUser } from './user.serializer';

function toAuthResult(token: string, expiresIn: string, user: User): AuthResult {
  return { token, expiresIn, user: toSafeUser(user) };
}

export { toAuthResult };
