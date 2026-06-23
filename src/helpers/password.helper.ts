import bcrypt from 'bcryptjs';
import { env } from '../config/env';

/**
 * Domain-specific helper for password hashing & verification.
 * Uses bcrypt (bcryptjs — a pure-JS, API-compatible bcrypt implementation).
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
