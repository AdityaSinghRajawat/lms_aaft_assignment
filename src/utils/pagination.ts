import { PaginationMeta, PaginationParams } from '../types/common';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Resolve normalised pagination params from already-validated query values.
 * Generic + stateless utility.
 */
export function resolvePagination(rawPage?: unknown, rawLimit?: unknown): PaginationParams {
  const page = clampInt(rawPage, DEFAULT_PAGE, 1, Number.MAX_SAFE_INTEGER);
  const limit = clampInt(rawLimit, DEFAULT_LIMIT, 1, MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Build the pagination metadata envelope for a list response.
 */
export function buildPaginationMeta(
  totalItems: number,
  { page, limit }: PaginationParams,
): PaginationMeta {
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

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}
