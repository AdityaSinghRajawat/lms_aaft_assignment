jest.mock('../../../src/config/db', () => {
  const { createPrismaMock } = require('../../support/prismaMock');
  return { prisma: createPrismaMock() };
});

import { prisma } from '../../../src/config/db';
import * as enrollmentsRepository from '../../../src/repositories/enrollments.repository';
import { PrismaMock } from '../../support/prismaMock';
import { buildEnrollment } from '../../support/factories';

const db = prisma as unknown as PrismaMock;

describe('enrollments.repository (soft-delete aware)', () => {
  it('findById excludes soft-deleted enrollments', async () => {
    db.enrollment.findFirst.mockResolvedValue(buildEnrollment());
    await enrollmentsRepository.findById('enrollment-1');
    expect(db.enrollment.findFirst).toHaveBeenCalledWith({
      where: { id: 'enrollment-1', deletedAt: null },
    });
  });

  it('findByStudentAndCourse uses a non-deleted composite lookup', async () => {
    await enrollmentsRepository.findByStudentAndCourse('user-1', 'course-1');
    expect(db.enrollment.findFirst).toHaveBeenCalledWith({
      where: { studentId: 'user-1', courseId: 'course-1', deletedAt: null },
    });
  });

  it('findMany merges the caller filter with the soft-delete filter and includes refs', async () => {
    db.enrollment.findMany.mockResolvedValue([]);

    await enrollmentsRepository.findMany({ studentId: 'user-1' }, 0, 10);

    const arg = db.enrollment.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ studentId: 'user-1', deletedAt: null });
    expect(arg.include).toEqual({
      student: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    });
    expect(arg).toMatchObject({ skip: 0, take: 10, orderBy: { createdAt: 'desc' } });
  });

  it('count merges the caller filter with the soft-delete filter', async () => {
    db.enrollment.count.mockResolvedValue(1);
    await enrollmentsRepository.count({ courseId: 'course-1' });
    expect(db.enrollment.count).toHaveBeenCalledWith({
      where: { courseId: 'course-1', deletedAt: null },
    });
  });

  it('findAssignedCourses filters lesson counts to non-deleted lessons', async () => {
    db.enrollment.findMany.mockResolvedValue([]);

    await enrollmentsRepository.findAssignedCourses('user-1', 0, 10);

    const arg = db.enrollment.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ studentId: 'user-1', deletedAt: null });
    expect(arg.include.course.include._count.select.lessons.where).toEqual({ deletedAt: null });
  });

  it('countByStudent counts only non-deleted enrollments', async () => {
    db.enrollment.count.mockResolvedValue(2);
    await enrollmentsRepository.countByStudent('user-1');
    expect(db.enrollment.count).toHaveBeenCalledWith({ where: { studentId: 'user-1', deletedAt: null } });
  });

  it('remove performs a soft delete', async () => {
    await enrollmentsRepository.remove('enrollment-1');
    expect(db.enrollment.delete).not.toHaveBeenCalled();
    const arg = db.enrollment.update.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'enrollment-1' });
    expect(arg.data.deletedAt).toBeInstanceOf(Date);
  });
});
