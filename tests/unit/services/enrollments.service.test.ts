jest.mock('../../../src/repositories/enrollments.repository');
jest.mock('../../../src/repositories/users.repository');
jest.mock('../../../src/services/courses.service');

import { Role } from '@prisma/client';
import * as enrollmentsRepository from '../../../src/repositories/enrollments.repository';
import * as usersRepository from '../../../src/repositories/users.repository';
import * as coursesService from '../../../src/services/courses.service';
import {
  assignCourse,
  removeEnrollment,
  listEnrollments,
  assertEnrolled,
} from '../../../src/services/enrollments.service';
import { ApiError } from '../../../src/utils/apiError';
import { buildCourse, buildEnrollment, buildUser } from '../../support/factories';

const findByIdAndRole = usersRepository.findByIdAndRole as jest.Mock;
const ensureCourseExists = coursesService.ensureCourseExists as jest.Mock;
const findByStudentAndCourse = enrollmentsRepository.findByStudentAndCourse as jest.Mock;
const create = enrollmentsRepository.create as jest.Mock;
const findById = enrollmentsRepository.findById as jest.Mock;
const remove = enrollmentsRepository.remove as jest.Mock;
const findMany = enrollmentsRepository.findMany as jest.Mock;
const count = enrollmentsRepository.count as jest.Mock;

const pagination = { page: 1, limit: 10, skip: 0 };
const input = { studentId: 'user-1', courseId: 'course-1' };

describe('enrollments.service', () => {
  describe('assignCourse', () => {
    it('creates an enrollment when student and course exist and there is no duplicate', async () => {
      findByIdAndRole.mockResolvedValue(buildUser());
      ensureCourseExists.mockResolvedValue(buildCourse());
      findByStudentAndCourse.mockResolvedValue(null);
      create.mockResolvedValue(buildEnrollment());

      await assignCourse(input, 'admin-1');

      expect(findByIdAndRole).toHaveBeenCalledWith('user-1', Role.STUDENT);
      expect(create).toHaveBeenCalledWith({
        studentId: 'user-1',
        courseId: 'course-1',
        assignedById: 'admin-1',
      });
    });

    it('throws 404 when the student does not exist', async () => {
      findByIdAndRole.mockResolvedValue(null);
      await expect(assignCourse(input, 'admin-1')).rejects.toMatchObject({ statusCode: 404 });
      expect(create).not.toHaveBeenCalled();
    });

    it('propagates 404 when the course does not exist', async () => {
      findByIdAndRole.mockResolvedValue(buildUser());
      ensureCourseExists.mockRejectedValue(ApiError.notFound('Course not found'));
      await expect(assignCourse(input, 'admin-1')).rejects.toMatchObject({ statusCode: 404 });
      expect(create).not.toHaveBeenCalled();
    });

    it('throws 409 when the student is already enrolled', async () => {
      findByIdAndRole.mockResolvedValue(buildUser());
      ensureCourseExists.mockResolvedValue(buildCourse());
      findByStudentAndCourse.mockResolvedValue(buildEnrollment());

      await expect(assignCourse(input, 'admin-1')).rejects.toMatchObject({ statusCode: 409 });
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('removeEnrollment', () => {
    it('soft-deletes an existing enrollment', async () => {
      findById.mockResolvedValue(buildEnrollment());
      remove.mockResolvedValue(buildEnrollment());
      await removeEnrollment('enrollment-1');
      expect(remove).toHaveBeenCalledWith('enrollment-1');
    });

    it('throws 404 when the enrollment is missing', async () => {
      findById.mockResolvedValue(null);
      await expect(removeEnrollment('missing')).rejects.toMatchObject({ statusCode: 404 });
      expect(remove).not.toHaveBeenCalled();
    });
  });

  describe('listEnrollments', () => {
    it('builds the filter from studentId/courseId and returns items + total', async () => {
      findMany.mockResolvedValue([buildEnrollment()]);
      count.mockResolvedValue(1);

      const result = await listEnrollments({ studentId: 'user-1', courseId: 'course-1' }, pagination);

      expect(findMany).toHaveBeenCalledWith({ studentId: 'user-1', courseId: 'course-1' }, 0, 10);
      expect(result.totalItems).toBe(1);
    });

    it('passes an empty filter when no query params are supplied', async () => {
      findMany.mockResolvedValue([]);
      count.mockResolvedValue(0);

      await listEnrollments({}, pagination);

      expect(findMany).toHaveBeenCalledWith({}, 0, 10);
    });
  });

  describe('assertEnrolled', () => {
    it('resolves when an enrollment exists', async () => {
      findByStudentAndCourse.mockResolvedValue(buildEnrollment());
      await expect(assertEnrolled('user-1', 'course-1')).resolves.toBeUndefined();
    });

    it('throws 403 when the student is not enrolled', async () => {
      findByStudentAndCourse.mockResolvedValue(null);
      await expect(assertEnrolled('user-1', 'course-1')).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
