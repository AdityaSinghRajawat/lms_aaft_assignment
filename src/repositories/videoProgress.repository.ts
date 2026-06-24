import { VideoProgress } from '@prisma/client';
import { prisma } from '../config/db';

interface UpsertProgressData {
  lastPositionSeconds: number;
  percentage: number;
  completed: boolean;
  timeSpentSeconds: number;
  completedAt: Date | null;
}

function findByStudentAndLesson(studentId: string, lessonId: string): Promise<VideoProgress | null> {
  return prisma.videoProgress.findUnique({
    where: { studentId_lessonId: { studentId, lessonId } },
  });
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
  return prisma.videoProgress.findMany({ where: { studentId, courseId } });
}

function findManyByStudent(studentId: string): Promise<VideoProgress[]> {
  return prisma.videoProgress.findMany({ where: { studentId } });
}

function findManyByCourse(courseId: string): Promise<VideoProgress[]> {
  return prisma.videoProgress.findMany({ where: { courseId } });
}

export {
  findByStudentAndLesson,
  upsert,
  findManyByStudentAndCourse,
  findManyByStudent,
  findManyByCourse,
};
