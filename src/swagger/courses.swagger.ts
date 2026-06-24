import { SwaggerModule, bearerAuth, jsonRef, paginationParams, pathId } from './common';

const TAG = 'Admin · Courses';

const coursesSwagger: SwaggerModule = {
  schemas: {
    CreateCourseInput: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', example: 'Intro to TypeScript' },
        description: { type: 'string' },
        isPublished: { type: 'boolean', default: true },
      },
    },
  },
  paths: {
    '/admin/courses': {
      post: {
        tags: [TAG],
        summary: 'Create a course',
        security: bearerAuth,
        requestBody: { required: true, content: jsonRef('CreateCourseInput') },
        responses: { 201: { description: 'Created' } },
      },
      get: {
        tags: [TAG],
        summary: 'List courses with lessons (paginated)',
        security: bearerAuth,
        parameters: [...paginationParams, { name: 'search', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'List' } },
      },
    },
    '/admin/courses/{courseId}': {
      get: {
        tags: [TAG],
        summary: 'Get course with lessons',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        responses: { 200: { description: 'Course' } },
      },
      put: {
        tags: [TAG],
        summary: 'Update course',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: [TAG],
        summary: 'Delete course',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        responses: { 200: { description: 'Deleted' } },
      },
    },
  },
};

export { coursesSwagger };
