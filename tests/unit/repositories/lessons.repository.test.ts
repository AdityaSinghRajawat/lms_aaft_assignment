jest.mock('../../../src/config/db', () => {
  const { createPrismaMock } = require('../../support/prismaMock');
  return { prisma: createPrismaMock() };
});

import { prisma } from '../../../src/config/db';
import * as lessonsRepository from '../../../src/repositories/lessons.repository';
import { PrismaMock } from '../../support/prismaMock';
import { buildLesson } from '../../support/factories';

const db = prisma as unknown as PrismaMock;

describe('lessons.repository (soft-delete aware)', () => {
  it('findById excludes soft-deleted lessons', async () => {
    db.lesson.findFirst.mockResolvedValue(buildLesson());
    await lessonsRepository.findById('lesson-1');
    expect(db.lesson.findFirst).toHaveBeenCalledWith({ where: { id: 'lesson-1', deletedAt: null } });
  });

  it('findByIdAndCourse scopes to the course and excludes soft-deleted lessons', async () => {
    await lessonsRepository.findByIdAndCourse('lesson-1', 'course-1');
    expect(db.lesson.findFirst).toHaveBeenCalledWith({
      where: { id: 'lesson-1', courseId: 'course-1', deletedAt: null },
    });
  });

  it('findManyByCourse returns ordered, non-deleted lessons', async () => {
    db.lesson.findMany.mockResolvedValue([]);
    await lessonsRepository.findManyByCourse('course-1');
    expect(db.lesson.findMany).toHaveBeenCalledWith({
      where: { courseId: 'course-1', deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  });

  it('create delegates to prisma.lesson.create', async () => {
    const data = { courseId: 'course-1', title: 'L', videoUrl: 'u', duration: 1, sortOrder: 0 };
    await lessonsRepository.create(data);
    expect(db.lesson.create).toHaveBeenCalledWith({ data });
  });

  it('remove performs a soft delete', async () => {
    await lessonsRepository.remove('lesson-1');
    expect(db.lesson.delete).not.toHaveBeenCalled();
    const arg = db.lesson.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'lesson-1' });
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });
});
