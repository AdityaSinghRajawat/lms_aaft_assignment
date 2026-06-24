export interface SwaggerModule {
  paths: Record<string, unknown>;
  schemas?: Record<string, unknown>;
}

export const bearerAuth = [{ bearerAuth: [] }];

export const paginationParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
];

export function pathId(name: string) {
  return { name, in: 'path', required: true, schema: { type: 'string', format: 'uuid' } };
}

export function jsonRef(schema: string) {
  return { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } };
}

export const sharedSchemas = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['ADMIN', 'STUDENT'] },
      isActive: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  PaginationMeta: {
    type: 'object',
    properties: {
      page: { type: 'integer' },
      limit: { type: 'integer' },
      totalItems: { type: 'integer' },
      totalPages: { type: 'integer' },
      hasNextPage: { type: 'boolean' },
      hasPrevPage: { type: 'boolean' },
    },
  },
  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string' },
      data: {},
      meta: { $ref: '#/components/schemas/PaginationMeta' },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string' },
      errors: {},
    },
  },
};
