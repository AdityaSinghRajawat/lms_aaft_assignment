import { app, request, asAdmin, bearer, createCourse, createLesson } from './helpers';

const MISSING_UUID = '00000000-0000-4000-8000-000000000000';
const lessonBody = { title: 'Variables', videoUrl: 'https://cdn.lms.test/1.mp4', duration: 600, sortOrder: 1 };

describe('Admin · Lessons routes', () => {
  describe('POST /api/admin/courses/:courseId/lessons', () => {
    it('should add a lesson and return 201', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();

      const res = await request(app)
        .post(`/api/admin/courses/${course.id}/lessons`)
        .set('Authorization', bearer(token))
        .send(lessonBody);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ title: 'Variables', courseId: course.id });
    });

    it('should return 404 when adding a lesson to a missing course', async () => {
      const { token } = await asAdmin();

      const res = await request(app)
        .post(`/api/admin/courses/${MISSING_UUID}/lessons`)
        .set('Authorization', bearer(token))
        .send(lessonBody);

      expect(res.status).toBe(404);
    });

    it('should return 400 when videoUrl is missing', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();

      const res = await request(app)
        .post(`/api/admin/courses/${course.id}/lessons`)
        .set('Authorization', bearer(token))
        .send({ title: 'No URL' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/courses/:courseId/lessons', () => {
    it('should list the lessons of a course', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();
      await createLesson(course.id);

      const res = await request(app)
        .get(`/api/admin/courses/${course.id}/lessons`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET/PUT/DELETE /api/admin/courses/:courseId/lessons/:lessonId', () => {
    it('should return 200 for an existing lesson', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();
      const lesson = await createLesson(course.id);

      const res = await request(app)
        .get(`/api/admin/courses/${course.id}/lessons/${lesson.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(lesson.id);
    });

    it('should return 404 when the lesson does not belong to the course', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();
      const otherCourse = await createCourse({ title: 'Other' });
      const lesson = await createLesson(otherCourse.id);

      const res = await request(app)
        .get(`/api/admin/courses/${course.id}/lessons/${lesson.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(404);
    });

    it('should update a lesson and return 200', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();
      const lesson = await createLesson(course.id);

      const res = await request(app)
        .put(`/api/admin/courses/${course.id}/lessons/${lesson.id}`)
        .set('Authorization', bearer(token))
        .send({ title: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
    });

    it('should soft-delete a lesson and return 200', async () => {
      const { token } = await asAdmin();
      const course = await createCourse();
      const lesson = await createLesson(course.id);

      const res = await request(app)
        .delete(`/api/admin/courses/${course.id}/lessons/${lesson.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);

      const after = await request(app)
        .get(`/api/admin/courses/${course.id}/lessons/${lesson.id}`)
        .set('Authorization', bearer(token));
      expect(after.status).toBe(404);
    });
  });
});
