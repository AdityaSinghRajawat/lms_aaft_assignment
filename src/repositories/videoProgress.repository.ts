import { Prisma, VideoProgress } from '@prisma/client';
import { prisma } from '../config/db';

/**
 * Video progress repository — Prisma queries only.
 */
export const videoProgressRepository = {
  findByStudentAndLesson(studentId: string, lessonId: string): Promise<VideoProgress | null> {
    return prisma.videoProgress.findUnique({
      where: { studentId_lessonId: { studentId, lessonId } },
    });
  },

  /**
   * Idempotent create-or-update of a student's progress on a lesson.
   */
  upsert(
    studentId: string,
    lessonId: string,
    courseId: string,
    data: {
      lastPositionSeconds: number;
      percentage: number;
      completed: boolean;
      timeSpentSeconds: number;
      completedAt: Date | null;
    },
  ): Promise<VideoProgress> {
    return prisma.videoProgress.upsert({
      where: { studentId_lessonId: { studentId, lessonId } },
      create: { studentId, lessonId, courseId, ...data },
      update: {
        lastPositionSeconds: data.lastPositionSeconds,
        percentage: data.percentage,
        completed: data.completed,
        timeSpentSeconds: data.timeSpentSeconds,
        completedAt: data.completedAt,
      },
    });
  },

  findManyByStudentAndCourse(studentId: string, courseId: string): Promise<VideoProgress[]> {
    return prisma.videoProgress.findMany({ where: { studentId, courseId } });
  },

  findManyByStudent(studentId: string): Promise<VideoProgress[]> {
    return prisma.videoProgress.findMany({ where: { studentId } });
  },

  findManyByCourse(courseId: string): Promise<VideoProgress[]> {
    return prisma.videoProgress.findMany({ where: { courseId } });
  },

  /** Aggregate progress rows grouped by course for a student (reporting). */
  groupByCourseForStudent(studentId: string) {
    return prisma.videoProgress.groupBy({
      by: ['courseId'],
      where: { studentId },
      _count: { _all: true },
      _sum: { timeSpentSeconds: true },
    });
  },

  whereMany(where: Prisma.VideoProgressWhereInput): Promise<VideoProgress[]> {
    return prisma.videoProgress.findMany({ where });
  },
};
