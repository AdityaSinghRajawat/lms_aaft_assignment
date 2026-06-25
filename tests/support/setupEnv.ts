/**
 * Runs before any module is imported (jest `setupFiles`).
 * Guarantees the env validation in src/config/env.ts passes during unit tests
 * without relying on a real .env file. Real values are never needed because
 * the database, bcrypt and JWT layers are mocked in unit tests.
 */
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test?schema=public';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'unit_test_secret_value_long_enough';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ?? '10';
