import { Lesson, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

/**
 * Lessons repository — Prisma queries only.
 */
export const lessonsRepository = {
  create(data: Prisma.LessonUncheckedCreateInput): Promise<Lesson> {
    return prisma.lesson.create({ data });
  },

  findById(id: string): Promise<Lesson | null> {
    return prisma.lesson.findUnique({ where: { id } });
  },

  findByIdAndCourse(id: string, courseId: string): Promise<Lesson | null> {
    return prisma.lesson.findFirst({ where: { id, courseId } });
  },

  findManyByCourse(courseId: string): Promise<Lesson[]> {
    return prisma.lesson.findMany({ where: { courseId }, orderBy: { sortOrder: 'asc' } });
  },

  update(id: string, data: Prisma.LessonUpdateInput): Promise<Lesson> {
    return prisma.lesson.update({ where: { id }, data });
  },

  delete(id: string): Promise<Lesson> {
    return prisma.lesson.delete({ where: { id } });
  },
};
