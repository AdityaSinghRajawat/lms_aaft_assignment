import { Lesson, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

const notDeleted = { deletedAt: null };

function create(data: Prisma.LessonUncheckedCreateInput): Promise<Lesson> {
  return prisma.lesson.create({ data });
}

function findById(id: string): Promise<Lesson | null> {
  return prisma.lesson.findFirst({ where: { id, ...notDeleted } });
}

function findByIdAndCourse(id: string, courseId: string): Promise<Lesson | null> {
  return prisma.lesson.findFirst({ where: { id, courseId, ...notDeleted } });
}

function findManyByCourse(courseId: string): Promise<Lesson[]> {
  return prisma.lesson.findMany({
    where: { courseId, ...notDeleted },
    orderBy: { sortOrder: 'asc' },
  });
}

function update(id: string, data: Prisma.LessonUpdateInput): Promise<Lesson> {
  return prisma.lesson.update({ where: { id }, data });
}

function remove(id: string): Promise<Lesson> {
  return prisma.lesson.update({ where: { id }, data: { deletedAt: new Date() } });
}

export { create, findById, findByIdAndCourse, findManyByCourse, update, remove };
