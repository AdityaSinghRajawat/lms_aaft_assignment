jest.mock('../../../src/repositories/enrollments.repository');
jest.mock('../../../src/repositories/courses.repository');
jest.mock('../../../src/repositories/lessons.repository');
jest.mock('../../../src/services/enrollments.service');

import * as enrollmentsRepository from '../../../src/repositories/enrollments.repository';
import * as coursesRepository from '../../../src/repositories/courses.repository';
import * as lessonsRepository from '../../../src/repositories/lessons.repository';
import * as enrollmentsService from '../../../src/services/enrollments.service';
import {
  listAssignedCourses,
  getAssignedCourseDetail,
  getLessonDetail,
} from '../../../src/services/studentCourses.service';
import { ApiError } from '../../../src/utils/apiError';
import { buildLesson, EPOCH } from '../../support/factories';

const findAssignedCourses = enrollmentsRepository.findAssignedCourses as jest.Mock;
const countByStudent = enrollmentsRepository.countByStudent as jest.Mock;
const findByIdWithLessons = coursesRepository.findByIdWithLessons as jest.Mock;
const findByIdAndCourse = lessonsRepository.findByIdAndCourse as jest.Mock;
const assertEnrolled = enrollmentsService.assertEnrolled as jest.Mock;

const pagination = { page: 1, limit: 10, skip: 0 };

const assignedEnrollment = {
  id: 'enrollment-1',
  createdAt: EPOCH,
  course: {
    id: 'course-1',
    title: 'Intro',
    description: 'd',
    isPublished: true,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    _count: { lessons: 2 },
  },
};

describe('studentCourses.service', () => {
  describe('listAssignedCourses', () => {
    it('serializes assigned courses with the total count', async () => {
      findAssignedCourses.mockResolvedValue([assignedEnrollment]);
      countByStudent.mockResolvedValue(1);

      const { items, totalItems } = await listAssignedCourses('user-1', pagination);

      expect(findAssignedCourses).toHaveBeenCalledWith('user-1', 0, 10);
      expect(totalItems).toBe(1);
      expect(items[0]).toMatchObject({
        enrollmentId: 'enrollment-1',
        course: { id: 'course-1', totalLessons: 2 },
      });
      expect(items[0].course).not.toHaveProperty('_count');
    });
  });

  describe('getAssignedCourseDetail', () => {
    it('asserts enrollment before returning the course with lessons', async () => {
      assertEnrolled.mockResolvedValue(undefined);
      const course = { id: 'course-1', lessons: [] };
      findByIdWithLessons.mockResolvedValue(course);

      const result = await getAssignedCourseDetail('user-1', 'course-1');

      expect(assertEnrolled).toHaveBeenCalledWith('user-1', 'course-1');
      expect(result).toBe(course);
    });

    it('throws 403 when the student is not enrolled', async () => {
      assertEnrolled.mockRejectedValue(ApiError.forbidden('You are not enrolled in this course'));
      await expect(getAssignedCourseDetail('user-1', 'course-1')).rejects.toMatchObject({
        statusCode: 403,
      });
      expect(findByIdWithLessons).not.toHaveBeenCalled();
    });

    it('throws 404 when the course no longer exists', async () => {
      assertEnrolled.mockResolvedValue(undefined);
      findByIdWithLessons.mockResolvedValue(null);
      await expect(getAssignedCourseDetail('user-1', 'course-1')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('getLessonDetail', () => {
    it('asserts enrollment before returning the lesson', async () => {
      assertEnrolled.mockResolvedValue(undefined);
      findByIdAndCourse.mockResolvedValue(buildLesson());

      const result = await getLessonDetail('user-1', 'course-1', 'lesson-1');

      expect(assertEnrolled).toHaveBeenCalledWith('user-1', 'course-1');
      expect(findByIdAndCourse).toHaveBeenCalledWith('lesson-1', 'course-1');
      expect(result.id).toBe('lesson-1');
    });

    it('throws 404 when the lesson is missing', async () => {
      assertEnrolled.mockResolvedValue(undefined);
      findByIdAndCourse.mockResolvedValue(null);
      await expect(getLessonDetail('user-1', 'course-1', 'missing')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
