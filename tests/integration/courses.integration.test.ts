import { app, request, asAdmin, asStudent, bearer, createCourse } from './helpers';

const MISSING_UUID = '00000000-0000-4000-8000-000000000000';

describe('Admin · Courses routes', () => {
  describe('POST /api/admin/courses', () => {
    it('should create a course and return 201', async () => {
      const { token } = await asAdmin();

      const res = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', bearer(token))
        .send({ title: 'New Course', description: 'desc' });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ title: 'New Course', isPublished: true });
    });

    it('should return 400 when the title is missing', async () => {
      const { token } = await asAdmin();
      const res = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', bearer(token))
        .send({ description: 'no title' });
      expect(res.status).toBe(400);
    });

    it('should return 403 for a student token', async () => {
      const { token } = await asStudent();
      const res = await request(app)
        .post('/api/admin/courses')
        .set('Authorization', bearer(token))
        .send({ title: 'X' });
      expect(res.status).toBe(403);
    });

    it('should return 401 without a token', async () => {
      const res = await request(app).post('/api/admin/courses').send({ title: 'X' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/admin/courses', () => {
    it('should list courses with lessons and pagination meta', async () => {
      const { token } = await asAdmin();
      await createCourse();

      const res = await request(app).get('/api/admin/courses').set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toHaveProperty('lessons');
      expect(res.body.meta.totalItems).toBe(1);
    });

    it('should exclude soft-deleted courses', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();
      await request(app).delete(`/api/admin/courses/${course.id}`).set('Authorization', bearer(token));

      const res = await request(app).get('/api/admin/courses').set('Authorization', bearer(token));

      expect(res.body.meta.totalItems).toBe(0);
    });
  });

  describe('GET/PUT/DELETE /api/admin/courses/:courseId', () => {
    it('should return 200 for an existing course', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();

      const res = await request(app)
        .get(`/api/admin/courses/${course.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(course.id);
    });

    it('should return 404 for a missing course', async () => {
      const { token } = await asAdmin();
      const res = await request(app)
        .get(`/api/admin/courses/${MISSING_UUID}`)
        .set('Authorization', bearer(token));
      expect(res.status).toBe(404);
    });

    it('should update a course and return 200', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();

      const res = await request(app)
        .put(`/api/admin/courses/${course.id}`)
        .set('Authorization', bearer(token))
        .send({ title: 'Renamed' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Renamed');
    });

    it('should soft-delete a course (200) then read 404', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();

      const del = await request(app)
        .delete(`/api/admin/courses/${course.id}`)
        .set('Authorization', bearer(token));
      expect(del.status).toBe(200);

      const after = await request(app)
        .get(`/api/admin/courses/${course.id}`)
        .set('Authorization', bearer(token));
      expect(after.status).toBe(404);
    });
  });
});
