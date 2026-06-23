import { env } from './env';

/**
 * Hand-authored OpenAPI 3.0 document for the Mini LMS API (bonus).
 * Served via swagger-ui-express at `${API_PREFIX}/docs`.
 */
const bearerAuth = [{ bearerAuth: [] }];

const paginationParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
];

function loginPath(role: 'admin' | 'student') {
  return {
    post: {
      tags: ['Auth'],
      summary: `${role[0].toUpperCase()}${role.slice(1)} login`,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginInput' },
          },
        },
      },
      responses: {
        200: { description: 'Authenticated', content: jsonRef('AuthResult') },
        401: { description: 'Invalid credentials' },
      },
    },
  };
}

function jsonRef(schema: string) {
  return { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } };
}

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Mini LMS API',
    version: '1.0.0',
    description:
      'Backend API for a simplified Learning Management System (CRM-integrated). ' +
      'JWT auth with separate admin/student login and role-based access control.',
  },
  servers: [{ url: env.apiPrefix, description: 'API base path' }],
  tags: [
    { name: 'Auth' },
    { name: 'Admin · Students' },
    { name: 'Admin · Courses' },
    { name: 'Admin · Lessons' },
    { name: 'Admin · Enrollments' },
    { name: 'Admin · Reports' },
    { name: 'Student' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@lms.test' },
          password: { type: 'string', example: 'Admin@123' },
        },
      },
      AuthResult: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              expiresIn: { type: 'string' },
              user: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
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
      CreateStudentInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@student.test' },
          password: { type: 'string', minLength: 8, example: 'Student@123' },
        },
      },
      CreateCourseInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Intro to TypeScript' },
          description: { type: 'string' },
          isPublished: { type: 'boolean', default: true },
        },
      },
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
      CreateEnrollmentInput: {
        type: 'object',
        required: ['studentId', 'courseId'],
        properties: {
          studentId: { type: 'string', format: 'uuid' },
          courseId: { type: 'string', format: 'uuid' },
        },
      },
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
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {},
          meta: { $ref: '#/components/schemas/PaginationMeta' },
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
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: {},
        },
      },
    },
  },
  paths: {
    '/auth/admin/login': loginPath('admin'),
    '/auth/student/login': loginPath('student'),
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current authenticated user',
        security: bearerAuth,
        responses: { 200: { description: 'Profile' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/admin/students': {
      post: {
        tags: ['Admin · Students'],
        summary: 'Create a student',
        security: bearerAuth,
        requestBody: { required: true, content: jsonRef('CreateStudentInput') },
        responses: { 201: { description: 'Created' }, 409: { description: 'Email exists' } },
      },
      get: {
        tags: ['Admin · Students'],
        summary: 'List students (paginated)',
        security: bearerAuth,
        parameters: [
          ...paginationParams,
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'List', content: jsonRef('SuccessResponse') } },
      },
    },
    '/admin/students/{studentId}': {
      get: {
        tags: ['Admin · Students'],
        summary: 'Get a student by id',
        security: bearerAuth,
        parameters: [pathId('studentId')],
        responses: { 200: { description: 'Student' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Admin · Students'],
        summary: 'Update a student',
        security: bearerAuth,
        parameters: [pathId('studentId')],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Admin · Students'],
        summary: 'Delete a student',
        security: bearerAuth,
        parameters: [pathId('studentId')],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/admin/courses': {
      post: {
        tags: ['Admin · Courses'],
        summary: 'Create a course',
        security: bearerAuth,
        requestBody: { required: true, content: jsonRef('CreateCourseInput') },
        responses: { 201: { description: 'Created' } },
      },
      get: {
        tags: ['Admin · Courses'],
        summary: 'List courses with lessons (paginated)',
        security: bearerAuth,
        parameters: [...paginationParams, { name: 'search', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'List' } },
      },
    },
    '/admin/courses/{courseId}': {
      get: { tags: ['Admin · Courses'], summary: 'Get course with lessons', security: bearerAuth, parameters: [pathId('courseId')], responses: { 200: { description: 'Course' } } },
      put: { tags: ['Admin · Courses'], summary: 'Update course', security: bearerAuth, parameters: [pathId('courseId')], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin · Courses'], summary: 'Delete course', security: bearerAuth, parameters: [pathId('courseId')], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/courses/{courseId}/lessons': {
      post: {
        tags: ['Admin · Lessons'],
        summary: 'Add a lesson to a course',
        security: bearerAuth,
        parameters: [pathId('courseId')],
        requestBody: { required: true, content: jsonRef('CreateLessonInput') },
        responses: { 201: { description: 'Created' } },
      },
      get: { tags: ['Admin · Lessons'], summary: 'List lessons of a course', security: bearerAuth, parameters: [pathId('courseId')], responses: { 200: { description: 'List' } } },
    },
    '/admin/courses/{courseId}/lessons/{lessonId}': {
      get: { tags: ['Admin · Lessons'], summary: 'Get lesson', security: bearerAuth, parameters: [pathId('courseId'), pathId('lessonId')], responses: { 200: { description: 'Lesson' } } },
      put: { tags: ['Admin · Lessons'], summary: 'Update lesson', security: bearerAuth, parameters: [pathId('courseId'), pathId('lessonId')], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin · Lessons'], summary: 'Delete lesson', security: bearerAuth, parameters: [pathId('courseId'), pathId('lessonId')], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/enrollments': {
      post: {
        tags: ['Admin · Enrollments'],
        summary: 'Assign a course to a student',
        security: bearerAuth,
        requestBody: { required: true, content: jsonRef('CreateEnrollmentInput') },
        responses: { 201: { description: 'Assigned' }, 409: { description: 'Already enrolled' } },
      },
      get: {
        tags: ['Admin · Enrollments'],
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
      delete: { tags: ['Admin · Enrollments'], summary: 'Remove an enrollment', security: bearerAuth, parameters: [pathId('enrollmentId')], responses: { 200: { description: 'Removed' } } },
    },
    '/admin/reports/students/{studentId}/progress': {
      get: { tags: ['Admin · Reports'], summary: 'Student-wise progress report', security: bearerAuth, parameters: [pathId('studentId')], responses: { 200: { description: 'Report' } } },
    },
    '/admin/reports/courses/{courseId}/progress': {
      get: { tags: ['Admin · Reports'], summary: 'Course-wise progress report', security: bearerAuth, parameters: [pathId('courseId')], responses: { 200: { description: 'Report' } } },
    },
    '/student/courses': {
      get: { tags: ['Student'], summary: 'List assigned courses (paginated)', security: bearerAuth, parameters: paginationParams, responses: { 200: { description: 'List' } } },
    },
    '/student/courses/{courseId}': {
      get: { tags: ['Student'], summary: 'Get assigned course with lessons', security: bearerAuth, parameters: [pathId('courseId')], responses: { 200: { description: 'Course' }, 403: { description: 'Not enrolled' } } },
    },
    '/student/courses/{courseId}/progress': {
      get: { tags: ['Student'], summary: 'Get progress for an entire course', security: bearerAuth, parameters: [pathId('courseId')], responses: { 200: { description: 'Progress' } } },
    },
    '/student/courses/{courseId}/lessons/{lessonId}': {
      get: { tags: ['Student'], summary: 'Access a video lesson', security: bearerAuth, parameters: [pathId('courseId'), pathId('lessonId')], responses: { 200: { description: 'Lesson' } } },
    },
    '/student/progress': {
      post: {
        tags: ['Student'],
        summary: 'Update video progress (auto-completes at 90%)',
        security: bearerAuth,
        requestBody: { required: true, content: jsonRef('UpsertProgressInput') },
        responses: { 200: { description: 'Updated' } },
      },
    },
    '/student/progress/{lessonId}': {
      get: { tags: ['Student'], summary: 'Get progress for a specific video', security: bearerAuth, parameters: [pathId('lessonId')], responses: { 200: { description: 'Progress' } } },
    },
  },
};

function pathId(name: string) {
  return { name, in: 'path', required: true, schema: { type: 'string', format: 'uuid' } };
}
