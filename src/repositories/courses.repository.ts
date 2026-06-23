import { Course, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

/**
 * Courses repository — Prisma queries only.
 */
export const coursesRepository = {
  create(data: Prisma.CourseCreateInput): Promise<Course> {
    return prisma.course.create({ data });
  },

  findById(id: string): Promise<Course | null> {
    return prisma.course.findUnique({ where: { id } });
  },

  /** Course with its lessons ordered for playback (avoids N+1 via include). */
  findByIdWithLessons(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: { lessons: { orderBy: { sortOrder: 'asc' } } },
    });
  },

  update(id: string, data: Prisma.CourseUpdateInput): Promise<Course> {
    return prisma.course.update({ where: { id }, data });
  },

  delete(id: string): Promise<Course> {
    return prisma.course.delete({ where: { id } });
  },

  /** Paginated courses each with lessons + a lesson count (single query, no N+1). */
  findManyWithLessons(skip: number, take: number, search?: string) {
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
  },

  count(search?: string): Promise<number> {
    return prisma.course.count({ where: buildSearchFilter(search) });
  },

  countLessons(courseId: string): Promise<number> {
    return prisma.lesson.count({ where: { courseId } });
  },
};

function buildSearchFilter(search?: string): Prisma.CourseWhereInput {
  if (!search) return {};
  return {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ],
  };
}
