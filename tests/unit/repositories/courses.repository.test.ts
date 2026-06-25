jest.mock('../../../src/config/db', () => {
  const { createPrismaMock } = require('../../support/prismaMock');
  return { prisma: createPrismaMock() };
});

import { prisma } from '../../../src/config/db';
import * as coursesRepository from '../../../src/repositories/courses.repository';
import { PrismaMock } from '../../support/prismaMock';
import { buildCourse } from '../../support/factories';

const db = prisma as unknown as PrismaMock;

describe('courses.repository (soft-delete aware)', () => {
  it('findById excludes soft-deleted rows', async () => {
    db.course.findFirst.mockResolvedValue(buildCourse());

    await coursesRepository.findById('course-1');

    expect(db.course.findFirst).toHaveBeenCalledWith({ where: { id: 'course-1', deletedAt: null } });
  });

  it('findByIdWithLessons filters the course and its included lessons', async () => {
    db.course.findFirst.mockResolvedValue(null);

    await coursesRepository.findByIdWithLessons('course-1');

    expect(db.course.findFirst).toHaveBeenCalledWith({
      where: { id: 'course-1', deletedAt: null },
      include: { lessons: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
    });
  });

  it('findManyWithLessons filters lessons and counts only non-deleted lessons', async () => {
    db.course.findMany.mockResolvedValue([]);

    await coursesRepository.findManyWithLessons(0, 10);

    const arg = db.course.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ deletedAt: null });
    expect(arg.include.lessons.where).toEqual({ deletedAt: null });
    expect(arg.include._count.select.lessons.where).toEqual({ deletedAt: null });
    expect(arg).toMatchObject({ skip: 0, take: 10, orderBy: { createdAt: 'desc' } });
  });

  it('findManyWithLessons adds a search filter alongside the soft-delete filter', async () => {
    db.course.findMany.mockResolvedValue([]);

    await coursesRepository.findManyWithLessons(0, 10, 'type');

    const where = db.course.findMany.mock.calls[0][0].where;
    expect(where.deletedAt).toBeNull();
    expect(where.OR).toEqual([
      { title: { contains: 'type', mode: 'insensitive' } },
      { description: { contains: 'type', mode: 'insensitive' } },
    ]);
  });

  it('count excludes soft-deleted courses', async () => {
    db.course.count.mockResolvedValue(2);
    await coursesRepository.count();
    expect(db.course.count).toHaveBeenCalledWith({ where: { deletedAt: null } });
  });

  it('countLessons counts only non-deleted lessons of a course', async () => {
    db.lesson.count.mockResolvedValue(5);

    const total = await coursesRepository.countLessons('course-1');

    expect(db.lesson.count).toHaveBeenCalledWith({ where: { courseId: 'course-1', deletedAt: null } });
    expect(total).toBe(5);
  });

  it('remove performs a soft delete', async () => {
    await coursesRepository.remove('course-1');

    expect(db.course.delete).not.toHaveBeenCalled();
    const arg = db.course.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'course-1' });
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });
});
