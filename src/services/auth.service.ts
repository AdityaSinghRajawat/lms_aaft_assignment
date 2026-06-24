import { Role } from '@prisma/client';
import * as usersRepository from '../repositories/users.repository';
import { comparePassword } from '../helpers/password.helper';
import { signToken } from '../helpers/jwt.helper';
import { toAuthResult } from '../serializers/auth.serializer';
import { toSafeUser } from '../serializers/user.serializer';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';
import { AuthResult, LoginInput } from '../types/auth.types';
import { SafeUser } from '../types/user.types';

async function login({ email, password }: LoginInput, expectedRole: Role): Promise<AuthResult> {
  const user = await usersRepository.findByEmail(email);

  // Uniform error regardless of which check fails — avoids user enumeration.
  if (!user || user.role !== expectedRole) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account is deactivated');
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return toAuthResult(token, env.jwtExpiresIn, user);
}

async function getProfile(userId: string): Promise<SafeUser> {
  const user = await usersRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return toSafeUser(user);
}

export { login, getProfile };
