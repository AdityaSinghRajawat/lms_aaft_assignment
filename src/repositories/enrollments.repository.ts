import { Enrollment, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

/**
 * Enrollments repository — Prisma queries only.
 */
export const enrollmentsRepository = {
  create(data: Prisma.EnrollmentUncheckedCreateInput): Promise<Enrollment> {
    return prisma.enrollment.create({ data });
  },

  findById(id: string): Promise<Enrollment | null> {
    return prisma.enrollment.findUnique({ where: { id } });
  },

  findByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
    return prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
  },

  delete(id: string): Promise<Enrollment> {
    return prisma.enrollment.delete({ where: { id } });
  },

  /** Paginated enrollments with related student + course (single query, no N+1). */
  findMany(where: Prisma.EnrollmentWhereInput, skip: number, take: number) {
    return prisma.enrollment.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  count(where: Prisma.EnrollmentWhereInput): Promise<number> {
    return prisma.enrollment.count({ where });
  },

  /** Course ids a student is enrolled in (used to authorise student access). */
  findCourseIdsByStudent(studentId: string): Promise<{ courseId: string }[]> {
    return prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });
  },

  /** Paginated courses assigned to a student, each with a lesson count (no N+1). */
  findAssignedCourses(studentId: string, skip: number, take: number) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: { include: { _count: { select: { lessons: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  },

  countByStudent(studentId: string): Promise<number> {
    return prisma.enrollment.count({ where: { studentId } });
  },

  /** All enrollments for a student with course + lesson count (reporting). */
  findAllByStudentWithCourse(studentId: string) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: { course: { include: { _count: { select: { lessons: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  },

  /** All enrollments for a course with student info (reporting). */
  findAllByCourseWithStudent(courseId: string) {
    return prisma.enrollment.findMany({
      where: { courseId },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  },
};
