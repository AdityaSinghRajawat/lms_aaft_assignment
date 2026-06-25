import { app, request, asAdmin, asStudent, bearer } from './helpers';

const MISSING_UUID = '00000000-0000-4000-8000-000000000000';
const newStudent = { name: 'Jane Doe', email: 'jane@example.com', password: 'Student@123' };

describe('Admin · Students routes', () => {
  describe('POST /api/admin/students', () => {
    it('should create a student and return 201 without the password', async () => {
      const { token } = await asAdmin();

      const res = await request(app)
        .post('/api/admin/students')
        .set('Authorization', bearer(token))
        .send(newStudent);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Student created successfully');
      expect(res.body.data).toMatchObject({ email: 'jane@example.com', role: 'STUDENT' });
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 409 when the email already exists', async () => {
      const { token } = await asAdmin();
      await request(app).post('/api/admin/students').set('Authorization', bearer(token)).send(newStudent);

      const res = await request(app)
        .post('/api/admin/students')
        .set('Authorization', bearer(token))
        .send(newStudent);

      expect(res.status).toBe(409);
    });

    it('should return 400 when required fields are missing', async () => {
      const { token } = await asAdmin();

      const res = await request(app)
        .post('/api/admin/students')
        .set('Authorization', bearer(token))
        .send({ name: 'No Email' });

      expect(res.status).toBe(400);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).post('/api/admin/students').send(newStudent);
      expect(res.status).toBe(401);
    });

    it('should return 403 for a student token (RBAC)', async () => {
      const { token } = await asStudent();

      const res = await request(app)
        .post('/api/admin/students')
        .set('Authorization', bearer(token))
        .send(newStudent);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/students', () => {
    it('should return a paginated list with meta', async () => {
      const { token } = await asAdmin();
      await request(app).post('/api/admin/students').set('Authorization', bearer(token)).send(newStudent);

      const res = await request(app)
        .get('/api/admin/students?page=1&limit=10')
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 10, totalItems: expect.any(Number) });
    });
  });

  describe('GET /api/admin/students/:studentId', () => {
    it('should return 200 for an existing student', async () => {
      const { token } = await asAdmin();
      const created = await request(app)
        .post('/api/admin/students')
        .set('Authorization', bearer(token))
        .send(newStudent);

      const res = await request(app)
        .get(`/api/admin/students/${created.body.data.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(created.body.data.id);
    });

    it('should return 404 for a non-existent (but valid) id', async () => {
      const { token } = await asAdmin();
      const res = await request(app)
        .get(`/api/admin/students/${MISSING_UUID}`)
        .set('Authorization', bearer(token));
      expect(res.status).toBe(404);
    });

    it('should return 400 for a malformed id', async () => {
      const { token } = await asAdmin();
      const res = await request(app).get('/api/admin/students/not-a-uuid').set('Authorization', bearer(token));
      expect(res.status).toBe(400);
    });
  });

  describe('PUT/DELETE /api/admin/students/:studentId', () => {
    it('should update a student and return 200', async () => {
      const { token } = await asAdmin();
      const created = await request(app)
        .post('/api/admin/students')
        .set('Authorization', bearer(token))
        .send(newStudent);

      const res = await request(app)
        .put(`/api/admin/students/${created.body.data.id}`)
        .set('Authorization', bearer(token))
        .send({ name: 'Janet' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Janet');
    });

    it('should soft-delete a student so subsequent reads return 404', async () => {
      const { token } = await asAdmin();
      const created = await request(app)
        .post('/api/admin/students')
        .set('Authorization', bearer(token))
        .send(newStudent);

      const del = await request(app)
        .delete(`/api/admin/students/${created.body.data.id}`)
        .set('Authorization', bearer(token));
      expect(del.status).toBe(200);

      const after = await request(app)
        .get(`/api/admin/students/${created.body.data.id}`)
        .set('Authorization', bearer(token));
      expect(after.status).toBe(404);
    });
  });
});
