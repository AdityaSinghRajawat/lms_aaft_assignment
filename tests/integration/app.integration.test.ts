import type { Application } from 'express';
import request from 'supertest';

describe('app integration (no DB)', () => {
  let app: Application;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test?schema=public';
    process.env.JWT_SECRET = 'test_secret_value_long_enough';
    process.env.NODE_ENV = 'test';
    const { createApp } = await import('../../src/app');
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
    expect(res.body.paths['/student/progress']).toBeDefined();
  });

  it('unknown route → 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
