import { Role } from '@prisma/client';
import { app, request, asAdmin, asStudent, seedUser, bearer, createCourse, enroll } from './helpers';

const MISSING_UUID = '00000000-0000-4000-8000-000000000000';

describe('Admin · Enrollments routes', () => {
  describe('POST /api/admin/enrollments', () => {
    it('should assign a course to a student and return 201', async () => {
      const { token } = await asAdmin();
      const { user: student } = await seedUser(Role.STUDENT, { email: 's1@example.com' });
      const course = await createCourse();

      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', bearer(token))
        .send({ studentId: student.id, courseId: course.id });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ studentId: student.id, courseId: course.id });
    });

    it('should return 409 when the student is already enrolled', async () => {
      const { token, user: admin } = await asAdmin();
      const { user: student } = await seedUser(Role.STUDENT, { email: 's1@example.com' });
      const course = await createCourse();
      await enroll(student.id, course.id, admin.id);

      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', bearer(token))
        .send({ studentId: student.id, courseId: course.id });

      expect(res.status).toBe(409);
    });

    it('should return 404 when the student does not exist', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();

      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', bearer(token))
        .send({ studentId: MISSING_UUID, courseId: course.id });

      expect(res.status).toBe(404);
    });

    it('should return 404 when the course does not exist', async () => {
      const { token } = await asAdmin();
      const { user: student } = await seedUser(Role.STUDENT, { email: 's1@example.com' });

      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', bearer(token))
        .send({ studentId: student.id, courseId: MISSING_UUID });

      expect(res.status).toBe(404);
    });

    it('should return 400 for a malformed body', async () => {
      const { token } = await asAdmin();
      const res = await request(app)
        .post('/api/admin/enrollments')
        .set('Authorization', bearer(token))
        .send({ studentId: 'nope', courseId: 'nope' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/enrollments', () => {
    it('should list enrollments filtered by studentId with meta', async () => {
      const { token, user: admin } = await asAdmin();
      const { user: student } = await seedUser(Role.STUDENT, { email: 's1@example.com' });
      const course = await createCourse();
      await enroll(student.id, course.id, admin.id);

      const res = await request(app)
        .get(`/api/admin/enrollments?studentId=${student.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.meta.totalItems).toBe(1);
    });
  });

  describe('DELETE /api/admin/enrollments/:enrollmentId', () => {
    it('should remove an enrollment and return 200', async () => {
      const { token, user: admin } = await asAdmin();
      const { user: student } = await seedUser(Role.STUDENT, { email: 's1@example.com' });
      const course = await createCourse();
      const enrollment = await enroll(student.id, course.id, admin.id);

      const res = await request(app)
        .delete(`/api/admin/enrollments/${enrollment.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
    });

    it('should return 404 for a missing enrollment', async () => {
      const { token } = await asAdmin();
      const res = await request(app)
        .delete(`/api/admin/enrollments/${MISSING_UUID}`)
        .set('Authorization', bearer(token));
      expect(res.status).toBe(404);
    });
  });

  describe('authorization', () => {
    it('should return 403 for a student token', async () => {
      const { token } = await asStudent();
      const res = await request(app)
        .get('/api/admin/enrollments')
        .set('Authorization', bearer(token));
      expect(res.status).toBe(403);
    });
  });
});
