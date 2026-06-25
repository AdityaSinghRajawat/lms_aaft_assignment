import { execSync } from 'child_process';

/**
 * Runs once before the integration suite: applies the schema to the test
 * database via the committed migration. Requires TEST_DATABASE_URL (or
 * DATABASE_URL) to point at a disposable Postgres database.
 */
export default async function globalSetup(): Promise<void> {
  if (process.env.TEST_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Integration tests require a Postgres test database. ' +
        'Set TEST_DATABASE_URL (or DATABASE_URL), e.g. ' +
        'postgresql://postgres:postgres@localhost:5432/mini_lms_test',
    );
  }

  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
}
