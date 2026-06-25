import { Role } from '@prisma/client';
import {
  app,
  request,
  prisma,
  asAdmin,
  asStudent,
  seedUser,
  bearer,
  createCourse,
  createLesson,
  enroll,
} from './helpers';

const MISSING_UUID = '00000000-0000-4000-8000-000000000000';

/** Admin + a student enrolled in a course with one completed lesson. */
async function seedReportData() {
  const { token, user: admin } = await asAdmin();
  const { user: student } = await seedUser(Role.STUDENT, { email: 'reported@example.com' });
  const course = await createCourse();
  const lesson = await createLesson(course.id);
  await enroll(student.id, course.id, admin.id);
  await prisma.videoProgress.create({
    data: {
      studentId: student.id,
      lessonId: lesson.id,
      courseId: course.id,
      lastPositionSeconds: 600,
      percentage: 100,
      completed: true,
      timeSpentSeconds: 600,
      completedAt: new Date(),
    },
  });
  return { token, student, course };
}

describe('Admin · Reports routes', () => {
  describe('GET /api/admin/reports/students/:studentId/progress', () => {
    it('should return a student-wise progress report', async () => {
      const { token, student } = await seedReportData();

      const res = await request(app)
        .get(`/api/admin/reports/students/${student.id}/progress`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.student.id).toBe(student.id);
      expect(res.body.data.overall).toMatchObject({ totalLessons: 1, completedLessons: 1, completionPercentage: 100 });
      expect(res.body.data.courses).toHaveLength(1);
    });

    it('should return 404 for a non-existent student', async () => {
      const { token } = await asAdmin();
      const res = await request(app)
        .get(`/api/admin/reports/students/${MISSING_UUID}/progress`)
        .set('Authorization', bearer(token));
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/admin/reports/courses/:courseId/progress', () => {
    it('should return a course-wise progress report', async () => {
      const { token, course } = await seedReportData();

      const res = await request(app)
        .get(`/api/admin/reports/courses/${course.id}/progress`)
        .set('Authorization', bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.course.id).toBe(course.id);
      expect(res.body.data.summary).toMatchObject({ totalStudents: 1, studentsCompleted: 1 });
    });

    it('should return 404 for a non-existent course', async () => {
      const { token } = await asAdmin();
      const res = await request(app)
        .get(`/api/admin/reports/courses/${MISSING_UUID}/progress`)
        .set('Authorization', bearer(token));
      expect(res.status).toBe(404);
    });
  });

  describe('authorization', () => {
    it('should return 403 for a student token', async () => {
      const { token } = await asStudent();
      const res = await request(app)
        .get(`/api/admin/reports/courses/${MISSING_UUID}/progress`)
        .set('Authorization', bearer(token));
      expect(res.status).toBe(403);
    });
  });
});
