import { Enrollment, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

function create(data: Prisma.EnrollmentUncheckedCreateInput): Promise<Enrollment> {
  return prisma.enrollment.create({ data });
}

function findById(id: string): Promise<Enrollment | null> {
  return prisma.enrollment.findUnique({ where: { id } });
}

function findByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null> {
  return prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
}

function remove(id: string): Promise<Enrollment> {
  return prisma.enrollment.delete({ where: { id } });
}

function findMany(where: Prisma.EnrollmentWhereInput, skip: number, take: number) {
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
}

function count(where: Prisma.EnrollmentWhereInput): Promise<number> {
  return prisma.enrollment.count({ where });
}

function findAssignedCourses(studentId: string, skip: number, take: number) {
  return prisma.enrollment.findMany({
    where: { studentId },
    include: { course: { include: { _count: { select: { lessons: true } } } } },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
}

function countByStudent(studentId: string): Promise<number> {
  return prisma.enrollment.count({ where: { studentId } });
}

function findAllByStudentWithCourse(studentId: string) {
  return prisma.enrollment.findMany({
    where: { studentId },
    include: { course: { include: { _count: { select: { lessons: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
}

function findAllByCourseWithStudent(courseId: string) {
  return prisma.enrollment.findMany({
    where: { courseId },
    include: { student: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export {
  create,
  findById,
  findByStudentAndCourse,
  remove,
  findMany,
  count,
  findAssignedCourses,
  countByStudent,
  findAllByStudentWithCourse,
  findAllByCourseWithStudent,
};
