/**
 * Env bootstrap for integration tests (jest `setupFiles`, runs in each worker
 * before any module import). Points the app at the test database and uses a
 * low bcrypt cost for speed.
 */
process.env.NODE_ENV = 'test';
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'integration_test_secret_value_long_enough';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS ?? '4';
