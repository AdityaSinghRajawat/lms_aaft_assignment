import bcrypt from 'bcryptjs';
import { env } from '../config/env';

// bcryptjs is a pure-JS, API-compatible bcrypt port — avoids native build steps.
async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  return bcrypt.hash(plain, salt);
}

async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export { hashPassword, comparePassword };
