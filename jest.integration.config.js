/**
 * Integration test config — requires a running PostgreSQL test database.
 *
 * Set TEST_DATABASE_URL (or DATABASE_URL) to a disposable database, e.g.:
 *   docker compose up -d db
 *   TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mini_lms_test \
 *     npm run test:integration
 *
 * globalSetup applies the schema once; each test truncates tables beforehand
 * so state never leaks between tests.
 *
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/integration/setupEnv.ts'],
  globalSetup: '<rootDir>/tests/integration/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/integration/globalTeardown.ts',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/hooks.ts'],
  clearMocks: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000,
  maxWorkers: 1,
};
