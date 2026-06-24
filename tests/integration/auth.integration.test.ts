import type { Application } from 'express';
import request from 'supertest';

describe('auth + RBAC integration (no DB)', () => {
  let app: Application;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test?schema=public';
    process.env.JWT_SECRET = 'test_secret_value_long_enough';
    process.env.NODE_ENV = 'test';
    const { createApp } = await import('../../src/app');
    app = createApp();
  });

  it('POST /api/auth/admin/login with invalid body → 400 validation error', async () => {
    const res = await request(app).post('/api/auth/admin/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('GET /api/admin/students without a token → 401', async () => {
    const res = await request(app).get('/api/admin/students');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/student/courses with an admin token → 403 (RBAC)', async () => {
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { sub: 'x', role: 'ADMIN', email: 'a@b.c' },
      process.env.JWT_SECRET as string,
    );
    const res = await request(app)
      .get('/api/student/courses')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
