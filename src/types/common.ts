import { Role } from '@prisma/client';

/**
 * Decoded JWT payload attached to authenticated requests.
 */
export interface AuthPayload {
  sub: string; // user id
  role: Role;
  email: string;
}

/**
 * Normalised pagination parameters resolved from the query string.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Standard pagination envelope returned alongside list payloads.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
