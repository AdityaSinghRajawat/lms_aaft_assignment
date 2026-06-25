/**
 * Default Jest config — UNIT tests only.
 * Unit tests mock the database, bcrypt and JWT, so they run anywhere with no
 * external services. Integration tests live under a separate config
 * (jest.integration.config.js) because they require a Postgres test database.
 *
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/support/setupEnv.ts'],
  clearMocks: true,
  resetMocks: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/**/*.d.ts',
    '!src/swagger/**',
  ],
};
