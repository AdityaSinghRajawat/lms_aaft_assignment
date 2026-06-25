/**
 * Builds an in-memory Prisma client mock for repository unit tests.
 * Each delegate method is a jest.fn() so tests can assert the exact query
 * arguments (e.g. `deletedAt: null` soft-delete filters) and stub return values.
 *
 * Used inside a jest.mock factory:
 *   jest.mock('../../../src/config/db', () => {
 *     const { createPrismaMock } = require('../../support/prismaMock');
 *     return { prisma: createPrismaMock() };
 *   });
 */
type MockDelegate = Record<string, jest.Mock>;

const DELEGATE_METHODS = [
  'findFirst',
  'findUnique',
  'findMany',
  'create',
  'update',
  'upsert',
  'count',
  'delete',
];

function buildDelegate(): MockDelegate {
  return DELEGATE_METHODS.reduce<MockDelegate>((delegate, method) => {
    delegate[method] = jest.fn();
    return delegate;
  }, {});
}

function createPrismaMock() {
  return {
    user: buildDelegate(),
    course: buildDelegate(),
    lesson: buildDelegate(),
    enrollment: buildDelegate(),
    videoProgress: buildDelegate(),
  };
}

type PrismaMock = ReturnType<typeof createPrismaMock>;

export { createPrismaMock };
export type { PrismaMock };
