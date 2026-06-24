import { SwaggerModule, bearerAuth, pathId } from './common';

const TAG = 'Admin · Reports';

const reportsSwagger: SwaggerModule = {
  paths: {
    '/admin/reports/students/{studentId}/progress': {
      get: {
        tags: [TAG],
        summary: 'Student-wise progress report',
        security: bearerAuth,
        parameters: [pathId('studentId')],
        responses: { 200: { description: 'Report' } },
      },
    },
    '/admin/reports/courses/{courseId}/progress': {
      get: {
        tags: [TAG],
        summary: 'Course-wise progress report',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        responses: { 200: { description: 'Report' } },
      },
    },
  },
};

export { reportsSwagger };
