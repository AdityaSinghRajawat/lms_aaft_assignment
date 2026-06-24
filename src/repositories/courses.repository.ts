import { Course, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

function buildSearchFilter(search?: string): Prisma.CourseWhereInput {
  if (!search) return {};
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ],
  };
}

function create(data: Prisma.CourseCreateInput): Promise<Course> {
  return prisma.course.create({ data });
}

function findById(id: string): Promise<Course | null> {
  return prisma.course.findUnique({ where: { id } });
}

function findByIdWithLessons(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: { lessons: { orderBy: { sortOrder: 'asc' } } },
  });
}

function update(id: string, data: Prisma.CourseUpdateInput): Promise<Course> {
  return prisma.course.update({ where: { id }, data });
}

function remove(id: string): Promise<Course> {
  return prisma.course.delete({ where: { id } });
}

function findManyWithLessons(skip: number, take: number, search?: string) {
  return prisma.course.findMany({
    where: buildSearchFilter(search),
    include: {
      lessons: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { lessons: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
}

function count(search?: string): Promise<number> {
  return prisma.course.count({ where: buildSearchFilter(search) });
}

function countLessons(courseId: string): Promise<number> {
  return prisma.lesson.count({ where: { courseId } });
}

export {
  create,
  findById,
  findByIdWithLessons,
  update,
  remove,
  findManyWithLessons,
  count,
  countLessons,
};
