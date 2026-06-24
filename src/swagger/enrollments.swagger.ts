import { SwaggerModule, bearerAuth, jsonRef, paginationParams, pathId } from './common';

const TAG = 'Admin · Enrollments';

const enrollmentsSwagger: SwaggerModule = {
  schemas: {
    CreateEnrollmentInput: {
      type: 'object',
      required: ['studentId', 'courseId'],
      properties: {
        studentId: { type: 'string', format: 'uuid' },
        courseId: { type: 'string', format: 'uuid' },
      },
    },
  },
  paths: {
    '/admin/enrollments': {
      post: {
        tags: [TAG],
        summary: 'Assign a course to a student',
        security: bearerAuth,
        requestBody: { required: true, content: jsonRef('CreateEnrollmentInput') },
        responses: { 201: { description: 'Assigned' }, 409: { description: 'Already enrolled' } },
      },
      get: {
        tags: [TAG],
        summary: 'List enrollments (filter by studentId/courseId)',
        security: bearerAuth,
        parameters: [
          ...paginationParams,
          { name: 'studentId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'courseId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 200: { description: 'List' } },
      },
    },
    '/admin/enrollments/{enrollmentId}': {
      delete: {
        tags: [TAG],
        summary: 'Remove an enrollment',
        security: bearerAuth,
        parameters: [pathId('enrollmentId')],
        responses: { 200: { description: 'Removed' } },
      },
    },
  },
};

export { enrollmentsSwagger };
