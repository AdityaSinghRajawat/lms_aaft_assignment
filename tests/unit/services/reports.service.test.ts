jest.mock('../../../src/repositories/users.repository');
jest.mock('../../../src/repositories/enrollments.repository');
jest.mock('../../../src/repositories/videoProgress.repository');
jest.mock('../../../src/repositories/courses.repository');

import * as usersRepository from '../../../src/repositories/users.repository';
import * as enrollmentsRepository from '../../../src/repositories/enrollments.repository';
import * as videoProgressRepository from '../../../src/repositories/videoProgress.repository';
import * as coursesRepository from '../../../src/repositories/courses.repository';
import { studentProgress, courseProgress } from '../../../src/services/reports.service';
import { buildCourse, buildUser, buildVideoProgress } from '../../support/factories';

const findByIdAndRole = usersRepository.findByIdAndRole as jest.Mock;
const findAllByStudentWithCourse = enrollmentsRepository.findAllByStudentWithCourse as jest.Mock;
const findAllByCourseWithStudent = enrollmentsRepository.findAllByCourseWithStudent as jest.Mock;
const findManyByStudent = videoProgressRepository.findManyByStudent as jest.Mock;
const findManyByCourse = videoProgressRepository.findManyByCourse as jest.Mock;
const courseFindById = coursesRepository.findById as jest.Mock;
const countLessons = coursesRepository.countLessons as jest.Mock;

describe('reports.service', () => {
  describe('studentProgress', () => {
    it('throws 404 when the student does not exist', async () => {
      findByIdAndRole.mockResolvedValue(null);
      await expect(studentProgress('missing')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('aggregates per-course progress for the student', async () => {
      findByIdAndRole.mockResolvedValue(buildUser({ id: 'user-1', name: 'Jane', email: 'jane@student.test' }));
      findAllByStudentWithCourse.mockResolvedValue([
        { courseId: 'course-1', course: { id: 'course-1', title: 'A', _count: { lessons: 2 } } },
      ]);
      findManyByStudent.mockResolvedValue([
        buildVideoProgress({ courseId: 'course-1', lessonId: 'lesson-1', completed: true, timeSpentSeconds: 300 }),
      ]);

      const report = await studentProgress('user-1');

      expect(report.student).toEqual({ id: 'user-1', name: 'Jane', email: 'jane@student.test' });
      expect(report.courses).toHaveLength(1);
      expect(report.courses[0]).toMatchObject({ courseId: 'course-1', completedLessons: 1, totalLessons: 2 });
      expect(report.overall).toMatchObject({
        totalCourses: 1,
        totalLessons: 2,
        completedLessons: 1,
        completionPercentage: 50,
        totalTimeSpentSeconds: 300,
      });
    });
  });

  describe('courseProgress', () => {
    it('throws 404 when the course does not exist', async () => {
      courseFindById.mockResolvedValue(null);
      await expect(courseProgress('missing')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('aggregates per-student progress for the course', async () => {
      courseFindById.mockResolvedValue(buildCourse({ id: 'course-1', title: 'A' }));
      countLessons.mockResolvedValue(2);
      findAllByCourseWithStudent.mockResolvedValue([
        { studentId: 'user-1', student: { id: 'user-1', name: 'Jane', email: 'jane@student.test' } },
      ]);
      findManyByCourse.mockResolvedValue([
        buildVideoProgress({ studentId: 'user-1', completed: true, timeSpentSeconds: 300 }),
      ]);

      const report = await courseProgress('course-1');

      expect(report.course).toEqual({ id: 'course-1', title: 'A', totalLessons: 2 });
      expect(report.students).toHaveLength(1);
      expect(report.students[0]).toMatchObject({ studentId: 'user-1', completedLessons: 1, isCompleted: false });
      expect(report.summary).toMatchObject({
        totalStudents: 1,
        studentsCompleted: 0,
        averageCompletionPercentage: 50,
        totalTimeSpentSeconds: 300,
      });
    });
  });
});
