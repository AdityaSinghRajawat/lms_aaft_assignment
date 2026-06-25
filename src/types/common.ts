import { Role } from '@prisma/client';

export interface AuthPayload {
  sub: string; // user id (JWT standard "subject" claim)
  role: Role;
  email: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
