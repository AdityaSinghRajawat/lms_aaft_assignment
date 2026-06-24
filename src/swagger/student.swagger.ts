import { SwaggerModule, bearerAuth, jsonRef, paginationParams, pathId } from './common';

const TAG = 'Student';

const studentSwagger: SwaggerModule = {
  schemas: {
    UpsertProgressInput: {
      type: 'object',
      required: ['lessonId', 'lastPositionSeconds', 'percentage'],
      properties: {
        lessonId: { type: 'string', format: 'uuid' },
        lastPositionSeconds: { type: 'integer', example: 540 },
        percentage: { type: 'number', minimum: 0, maximum: 100, example: 92 },
        completed: { type: 'boolean' },
        timeSpentDeltaSeconds: { type: 'integer', example: 60 },
      },
    },
  },
  paths: {
    '/student/courses': {
      get: {
        tags: [TAG],
        summary: 'List assigned courses (paginated)',
        security: bearerAuth,
        parameters: paginationParams,
        responses: { 200: { description: 'List' } },
      },
    },
    '/student/courses/{courseId}': {
      get: {
        tags: [TAG],
        summary: 'Get assigned course with lessons',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        responses: { 200: { description: 'Course' }, 403: { description: 'Not enrolled' } },
      },
    },
    '/student/courses/{courseId}/progress': {
      get: {
        tags: [TAG],
        summary: 'Get progress for an entire course',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        responses: { 200: { description: 'Progress' } },
      },
    },
    '/student/courses/{courseId}/lessons/{lessonId}': {
      get: {
        tags: [TAG],
        summary: 'Access a video lesson',
        security: bearerAuth,
        parameters: [pathId('courseId'), pathId('lessonId')],
        responses: { 200: { description: 'Lesson' } },
      },
    },
    '/student/progress': {
      post: {
        tags: [TAG],
        summary: 'Update video progress (auto-completes at 90%)',
        security: bearerAuth,
        requestBody: { required: true, content: jsonRef('UpsertProgressInput') },
        responses: { 200: { description: 'Updated' } },
      },
    },
    '/student/progress/{lessonId}': {
      get: {
        tags: [TAG],
        summary: 'Get progress for a specific video',
        security: bearerAuth,
        parameters: [pathId('lessonId')],
        responses: { 200: { description: 'Progress' } },
      },
    },
  },
};

export { studentSwagger };
