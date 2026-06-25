import { app, request, asStudent, bearer, createCourse, createLesson, enroll } from './helpers';

/**
 * Seeds a student enrolled in a course that has one lesson, plus a second
 * course/lesson the student is NOT enrolled in (for the 403 path).
 */
async function seedStudentWithCourse() {
  const { token, user: student } = await asStudent();
  const course = await createCourse();
  const lesson = await createLesson(course.id);
  await enroll(student.id, course.id);

  const otherCourse = await createCourse({ title: 'Unassigned' });
  const otherLesson = await createLesson(otherCourse.id);

  return { token, student, course, lesson, otherCourse, otherLesson };
}

describe('Student · Progress + course access routes', () => {
  describe('POST /api/student/progress', () => {
    it('should record progress and return 200', async () => {
      const { token, lesson } = await seedStudentWithCourse();

      const res = await request(app)
        .post('/api/student/progress')
        .set('Authorization', bearer(token))
        .send({ lessonId: lesson.id, lastPositionSeconds: 120, percentage: 50 });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ percentage: 50, completed: false });
    });

    it('should auto-complete the lesson at the 90% threshold', async () => {
      const { token, lesson } = await seedStudentWithCourse();

      const res = await request(app)
        .post('/api/student/progress')
        .set('Authorization', bearer(token))
        .send({ lessonId: lesson.id, lastPositionSeconds: 580, percentage: 90 });

      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
      expect(res.body.data.completedAt).not.toBeNull();
    });

    it('should keep completion sticky once a lesson reaches 90%', async () => {
      const { token, lesson } = await seedStudentWithCourse();
      const post = (percentage: number) =>
        request(app)
          .post('/api/student/progress')
          .set('Authorization', bearer(token))
          .send({ lessonId: lesson.id, lastPositionSeconds: 10, percentage });

      await post(95); // completes
      const res = await post(20); // student scrubs back

      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it('should return 403 when the student is not enrolled in the lesson course', async () => {
      const { token, otherLesson } = await seedStudentWithCourse();

      const res = await request(app)
        .post('/api/student/progress')
        .set('Authorization', bearer(token))
        .send({ lessonId: otherLesson.id, lastPositionSeconds: 10, percentage: 10 });

      expect(res.status).toBe(403);
    });

    it('should return 400 when percentage exceeds 100', async () => {
      const { token, lesson } = await seedStudentWithCourse();

      const res = await request(app)
        .post('/api/student/progress')
        .set('Authorization', bearer(token))
        .send({ lessonId: lesson.id, lastPositionSeconds: 10, percentage: 150 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/student/progress/:lessonId', () => {
    it('should return 404 before any progress is recorded', async () => {
      const { token, lesson } = await seedStudentWithCourse();

      const res = await request(app)
        .get(`/api/student/progress/${lesson.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(404);
    });

    it('should return the recorded progress after an update', async () => {
      const { token, lesson } = await seedStudentWithCourse();
      await request(app)
        .post('/api/student/progress')
        .set('Authorization', bearer(token))
        .send({ lessonId: lesson.id, lastPositionSeconds: 120, percentage: 50 });

      const res = await request(app)
        .get(`/api/student/progress/${lesson.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.lessonId).toBe(lesson.id);
    });
  });

  describe('GET /api/student/courses', () => {
    it('should list assigned courses with meta', async () => {
      const { token } = await seedStudentWithCourse();

      const res = await request(app).get('/api/student/courses').set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.meta.totalItems).toBe(1);
      expect(res.body.data[0].course).toHaveProperty('totalLessons');
    });
  });

  describe('GET /api/student/courses/:courseId', () => {
    it('should return course detail when enrolled', async () => {
      const { token, course } = await seedStudentWithCourse();

      const res = await request(app)
        .get(`/api/student/courses/${course.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(course.id);
    });

    it('should return 403 for a course the student is not enrolled in', async () => {
      const { token, otherCourse } = await seedStudentWithCourse();

      const res = await request(app)
        .get(`/api/student/courses/${otherCourse.id}`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/student/courses/:courseId/progress', () => {
    it('should return the course progress summary', async () => {
      const { token, course } = await seedStudentWithCourse();

      const res = await request(app)
        .get(`/api/student/courses/${course.id}/progress`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('lessons');
    });
  });
});
