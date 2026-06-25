jest.mock('../../../src/config/db', () => {
  const { createPrismaMock } = require('../../support/prismaMock');
  return { prisma: createPrismaMock() };
});

import { prisma } from '../../../src/config/db';
import * as videoProgressRepository from '../../../src/repositories/videoProgress.repository';
import { PrismaMock } from '../../support/prismaMock';
import { buildVideoProgress } from '../../support/factories';

const db = prisma as unknown as PrismaMock;

describe('videoProgress.repository (soft-delete aware)', () => {
  it('findByStudentAndLesson excludes soft-deleted rows', async () => {
    db.videoProgress.findFirst.mockResolvedValue(buildVideoProgress());
    await videoProgressRepository.findByStudentAndLesson('user-1', 'lesson-1');
    expect(db.videoProgress.findFirst).toHaveBeenCalledWith({
      where: { studentId: 'user-1', lessonId: 'lesson-1', deletedAt: null },
    });
  });

  it('findManyByStudentAndCourse filters by student, course, deletedAt and a live lesson', async () => {
    db.videoProgress.findMany.mockResolvedValue([]);
    await videoProgressRepository.findManyByStudentAndCourse('user-1', 'course-1');
    expect(db.videoProgress.findMany).toHaveBeenCalledWith({
      where: { studentId: 'user-1', courseId: 'course-1', deletedAt: null, lesson: { deletedAt: null } },
    });
  });

  it('findManyByStudent filters by student, deletedAt and a live lesson', async () => {
    db.videoProgress.findMany.mockResolvedValue([]);
    await videoProgressRepository.findManyByStudent('user-1');
    expect(db.videoProgress.findMany).toHaveBeenCalledWith({
      where: { studentId: 'user-1', deletedAt: null, lesson: { deletedAt: null } },
    });
  });

  it('findManyByCourse filters by course, deletedAt and a live lesson', async () => {
    db.videoProgress.findMany.mockResolvedValue([]);
    await videoProgressRepository.findManyByCourse('course-1');
    expect(db.videoProgress.findMany).toHaveBeenCalledWith({
      where: { courseId: 'course-1', deletedAt: null, lesson: { deletedAt: null } },
    });
  });

  it('upsert keys on the unique (student, lesson) pair and writes both create and update payloads', async () => {
    db.videoProgress.upsert.mockResolvedValue(buildVideoProgress());

    await videoProgressRepository.upsert('user-1', 'lesson-1', 'course-1', {
      lastPositionSeconds: 90,
      percentage: 95,
      completed: true,
      timeSpentSeconds: 90,
      completedAt: null,
    });

    const arg = db.videoProgress.upsert.mock.calls[0][0];
    expect(arg.where).toEqual({ studentId_lessonId: { studentId: 'user-1', lessonId: 'lesson-1' } });
    expect(arg.create).toMatchObject({ studentId: 'user-1', lessonId: 'lesson-1', courseId: 'course-1', percentage: 95 });
    expect(arg.update).toMatchObject({ percentage: 95, completed: true });
  });
});
