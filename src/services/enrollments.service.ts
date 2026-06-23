import { Prisma, Role } from '@prisma/client';
import { enrollmentsRepository } from '../repositories/enrollments.repository';
import { usersRepository } from '../repositories/users.repository';
import { coursesService } from './courses.service';
import { ApiError } from '../utils/apiError';
import { CreateEnrollmentInput, EnrollmentFilter } from '../models/enrollment.model';
import { PaginationParams } from '../types/common';

/**
 * Enrollments service — course-assignment business logic.
 */
export const enrollmentsService = {
  async assignCourse(input: CreateEnrollmentInput, assignedById: string) {
    const student = await usersRepository.findByIdAndRole(input.studentId, Role.STUDENT);
    if (!student) throw ApiError.notFound('Student not found');

    await coursesService.ensureCourseExists(input.courseId);

    const existing = await enrollmentsRepository.findByStudentAndCourse(
      input.studentId,
      input.courseId,
    );
    if (existing) throw ApiError.conflict('Student is already enrolled in this course');

    return enrollmentsRepository.create({
      studentId: input.studentId,
      courseId: input.courseId,
      assignedById,
    });
  },

  async removeEnrollment(enrollmentId: string): Promise<void> {
    const enrollment = await enrollmentsRepository.findById(enrollmentId);
    if (!enrollment) throw ApiError.notFound('Enrollment not found');
    await enrollmentsRepository.delete(enrollmentId);
  },

  async listEnrollments(filter: EnrollmentFilter, pagination: PaginationParams) {
    const where: Prisma.EnrollmentWhereInput = {};
    if (filter.studentId) where.studentId = filter.studentId;
    if (filter.courseId) where.courseId = filter.courseId;

    const [items, totalItems] = await Promise.all([
      enrollmentsRepository.findMany(where, pagination.skip, pagination.limit),
      enrollmentsRepository.count(where),
    ]);

    return { items, totalItems };
  },

  /** Throws unless the student is enrolled in the course. */
  async assertEnrolled(studentId: string, courseId: string): Promise<void> {
    const enrollment = await enrollmentsRepository.findByStudentAndCourse(studentId, courseId);
    if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course');
  },
};
