import { SwaggerModule, bearerAuth, jsonRef, paginationParams, pathId } from './common';

const TAG = 'Admin · Students';

const studentsSwagger: SwaggerModule = {
  schemas: {
    CreateStudentInput: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'Jane Doe' },
        email: { type: 'string', format: 'email', example: 'jane@example.com' },
        password: { type: 'string', minLength: 8, example: 'Student@123' },
      },
    },
  },
  paths: {
    '/admin/students': {
      post: {
        tags: [TAG],
        summary: 'Create a student',
        security: bearerAuth,
        requestBody: { required: true, content: jsonRef('CreateStudentInput') },
        responses: { 201: { description: 'Created' }, 409: { description: 'Email exists' } },
      },
      get: {
        tags: [TAG],
        summary: 'List students (paginated)',
        security: bearerAuth,
        parameters: [...paginationParams, { name: 'search', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'List', content: jsonRef('SuccessResponse') } },
      },
    },
    '/admin/students/{studentId}': {
      get: {
        tags: [TAG],
        summary: 'Get a student by id',
        security: bearerAuth,
        parameters: [pathId('studentId')],
        responses: { 200: { description: 'Student' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: [TAG],
        summary: 'Update a student',
        security: bearerAuth,
        parameters: [pathId('studentId')],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: [TAG],
        summary: 'Delete a student',
        security: bearerAuth,
        parameters: [pathId('studentId')],
        responses: { 200: { description: 'Deleted' } },
      },
    },
  },
};

export { studentsSwagger };
