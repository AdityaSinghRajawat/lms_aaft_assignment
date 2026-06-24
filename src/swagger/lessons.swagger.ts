import { SwaggerModule, bearerAuth, jsonRef, pathId } from './common';

const TAG = 'Admin · Lessons';

const lessonsSwagger: SwaggerModule = {
  schemas: {
    CreateLessonInput: {
      type: 'object',
      required: ['title', 'videoUrl'],
      properties: {
        title: { type: 'string', example: 'Variables & Types' },
        description: { type: 'string' },
        videoUrl: { type: 'string', format: 'uri', example: 'https://cdn.lms.test/v1.mp4' },
        duration: { type: 'integer', example: 600 },
        sortOrder: { type: 'integer', example: 1 },
      },
    },
  },
  paths: {
    '/admin/courses/{courseId}/lessons': {
      post: {
        tags: [TAG],
        summary: 'Add a lesson to a course',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        requestBody: { required: true, content: jsonRef('CreateLessonInput') },
        responses: { 201: { description: 'Created' } },
      },
      get: {
        tags: [TAG],
        summary: 'List lessons of a course',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        responses: { 200: { description: 'List' } },
      },
    },
    '/admin/courses/{courseId}/lessons/{lessonId}': {
      get: {
        tags: [TAG],
        summary: 'Get lesson',
        security: bearerAuth,
        parameters: [pathId('courseId'), pathId('lessonId')],
        responses: { 200: { description: 'Lesson' } },
      },
      put: {
        tags: [TAG],
        summary: 'Update lesson',
        security: bearerAuth,
        parameters: [pathId('courseId'), pathId('lessonId')],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: [TAG],
        summary: 'Delete lesson',
        security: bearerAuth,
        parameters: [pathId('courseId'), pathId('lessonId')],
        responses: { 200: { description: 'Deleted' } },
      },
    },
  },
};

export { lessonsSwagger };
