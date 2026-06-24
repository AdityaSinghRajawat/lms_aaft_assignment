import { PaginationMeta, PaginationParams } from '../types/common';
import { PAGINATION } from '../constants/pagination.constants';

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function resolvePagination(rawPage?: unknown, rawLimit?: unknown): PaginationParams {
  const page = clampInt(rawPage, PAGINATION.DEFAULT_PAGE, PAGINATION.MIN_PAGE, Number.MAX_SAFE_INTEGER);
  const limit = clampInt(rawLimit, PAGINATION.DEFAULT_LIMIT, PAGINATION.MIN_LIMIT, PAGINATION.MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

function buildPaginationMeta(totalItems: number, { page, limit }: PaginationParams): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export { resolvePagination, buildPaginationMeta };
