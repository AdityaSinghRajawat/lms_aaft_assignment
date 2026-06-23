import type { Application } from 'express';
import request from 'supertest';

/**
 * DB-free smoke test of the HTTP stack: routing, validation middleware,
 * RBAC/auth middleware, 404 + error handling and the OpenAPI document.
 * Endpoints exercised here resolve before any database access.
 */
describe('app HTTP stack (no DB)', () => {
  let app: Application;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test?schema=public';
    process.env.JWT_SECRET = 'test_secret_value_long_enough';
    process.env.NODE_ENV = 'test';
    const { createApp } = await import('../src/app');
    app = createApp();
  });

  it('GET /api/health → 200 healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: { status: 'healthy' } });
  });

  it('GET /api/docs.json → 200 OpenAPI document', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/auth/admin/login']).toBeDefined();
  });

  it('POST /api/auth/admin/login with invalid body → 400 validation error', async () => {
    const res = await request(app)
      .post('/api/auth/admin/login')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('GET /api/admin/students without token → 401', async () => {
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

  it('unknown route → 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
