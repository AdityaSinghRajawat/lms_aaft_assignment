import { resolvePagination, buildPaginationMeta } from '../../../src/utils/pagination';

describe('pagination util', () => {
  describe('resolvePagination', () => {
    it('applies defaults when params are missing', () => {
      expect(resolvePagination(undefined, undefined)).toEqual({ page: 1, limit: 10, skip: 0 });
    });

    it('computes skip from page and limit', () => {
      expect(resolvePagination(3, 20)).toEqual({ page: 3, limit: 20, skip: 40 });
    });

    it('clamps limit to the maximum and floors invalid values', () => {
      expect(resolvePagination(0, 500)).toEqual({ page: 1, limit: 100, skip: 0 });
      expect(resolvePagination('abc', 'xyz')).toEqual({ page: 1, limit: 10, skip: 0 });
    });
  });

  describe('buildPaginationMeta', () => {
    it('derives total pages and navigation flags', () => {
      const meta = buildPaginationMeta(45, { page: 2, limit: 10, skip: 10 });
      expect(meta).toEqual({
        page: 2,
        limit: 10,
        totalItems: 45,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('handles the last page', () => {
      const meta = buildPaginationMeta(20, { page: 2, limit: 10, skip: 10 });
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPrevPage).toBe(true);
    });
  });
});
