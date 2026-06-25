import { app, request } from './helpers';

describe('App-level routes', () => {
  it('GET /health (liveness) should return 200 alive', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'alive' });
    expect(res.body.uptime).toEqual(expect.any(Number));
  });

  it('GET /ready (readiness) should return 200 when the database is reachable', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ready', database: 'up' });
  });

  it('GET /api/health should return 200 healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, data: { status: 'healthy' } });
  });

  it('GET /api/docs.json should serve the OpenAPI document', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/auth/admin/login']).toBeDefined();
  });

  it('unknown routes should return a 404 envelope', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
