import { Course, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

const notDeleted = { deletedAt: null };

function buildSearchFilter(search?: string): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = { ...notDeleted };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  return where;
}

function create(data: Prisma.CourseCreateInput): Promise<Course> {
  return prisma.course.create({ data });
}

function findById(id: string): Promise<Course | null> {
  return prisma.course.findFirst({ where: { id, ...notDeleted } });
}

function findByIdWithLessons(id: string) {
  return prisma.course.findFirst({
    where: { id, ...notDeleted },
    include: { lessons: { where: notDeleted, orderBy: { sortOrder: 'asc' } } },
  });
}

function update(id: string, data: Prisma.CourseUpdateInput): Promise<Course> {
  return prisma.course.update({ where: { id }, data });
}

function remove(id: string): Promise<Course> {
  return prisma.course.update({ where: { id }, data: { deletedAt: new Date() } });
}

function findManyWithLessons(skip: number, take: number, search?: string) {
  return prisma.course.findMany({
    where: buildSearchFilter(search),
    include: {
      lessons: { where: notDeleted, orderBy: { sortOrder: 'asc' } },
      _count: { select: { lessons: { where: notDeleted } } },
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
  return prisma.lesson.count({ where: { courseId, ...notDeleted } });
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
