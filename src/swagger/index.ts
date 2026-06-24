import { env } from '../config/env';
import { SwaggerModule, sharedSchemas } from './common';
import { authSwagger } from './auth.swagger';
import { studentsSwagger } from './students.swagger';
import { coursesSwagger } from './courses.swagger';
import { lessonsSwagger } from './lessons.swagger';
import { enrollmentsSwagger } from './enrollments.swagger';
import { reportsSwagger } from './reports.swagger';
import { studentSwagger } from './student.swagger';

const modules: SwaggerModule[] = [
  authSwagger,
  studentsSwagger,
  coursesSwagger,
  lessonsSwagger,
  enrollmentsSwagger,
  reportsSwagger,
  studentSwagger,
];

function collectPaths(): Record<string, unknown> {
  return modules.reduce((acc, m) => ({ ...acc, ...m.paths }), {});
}

function collectSchemas(): Record<string, unknown> {
  return modules.reduce((acc, m) => ({ ...acc, ...(m.schemas ?? {}) }), {});
}

const swaggerSpec = {
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
    schemas: { ...sharedSchemas, ...collectSchemas() },
  },
  paths: collectPaths(),
};

export { swaggerSpec };
