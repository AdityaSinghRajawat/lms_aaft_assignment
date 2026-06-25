import { SwaggerModule, bearerAuth, jsonRef } from './common';

function loginPath(role: 'admin' | 'student') {
  const label = `${role[0].toUpperCase()}${role.slice(1)}`;
  return {
    post: {
      tags: ['Auth'],
      summary: `${label} login`,
      requestBody: { required: true, content: jsonRef('LoginInput') },
      responses: {
        200: { description: 'Authenticated', content: jsonRef('AuthResult') },
        401: { description: 'Invalid credentials' },
      },
    },
  };
}

const authSwagger: SwaggerModule = {
  schemas: {
    LoginInput: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'admin@example.com' },
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
  },
};

export { authSwagger };
