import { VideoProgress } from '@prisma/client';
import { prisma } from '../config/db';

const notDeleted = { deletedAt: null };

interface UpsertProgressData {
  lastPositionSeconds: number;
  percentage: number;
  completed: boolean;
  timeSpentSeconds: number;
  completedAt: Date | null;
}

function findByStudentAndLesson(studentId: string, lessonId: string): Promise<VideoProgress | null> {
  return prisma.videoProgress.findFirst({ where: { studentId, lessonId, ...notDeleted } });
}

function upsert(
  studentId: string,
  lessonId: string,
  courseId: string,
  data: UpsertProgressData,
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
}

function findManyByStudentAndCourse(studentId: string, courseId: string): Promise<VideoProgress[]> {
  return prisma.videoProgress.findMany({ where: { studentId, courseId, ...notDeleted } });
}

function findManyByStudent(studentId: string): Promise<VideoProgress[]> {
  return prisma.videoProgress.findMany({ where: { studentId, ...notDeleted } });
}

function findManyByCourse(courseId: string): Promise<VideoProgress[]> {
  return prisma.videoProgress.findMany({ where: { courseId, ...notDeleted } });
}

export {
  findByStudentAndLesson,
  upsert,
  findManyByStudentAndCourse,
  findManyByStudent,
  findManyByCourse,
};
