import { VideoProgress } from '@prisma/client';
import * as videoProgressRepository from '../repositories/videoProgress.repository';
import * as lessonsRepository from '../repositories/lessons.repository';
import * as enrollmentsService from './enrollments.service';
import * as coursesService from './courses.service';
import { ApiError } from '../utils/apiError';
import { UpsertProgressInput } from '../types/videoProgress.types';
import {
  clampPercentage,
  resolveCompletion,
  summariseCourseProgress,
} from '../helpers/progress.helper';

async function updateProgress(studentId: string, input: UpsertProgressInput): Promise<VideoProgress> {
  const lesson = await lessonsRepository.findById(input.lessonId);
  if (!lesson) throw ApiError.notFound('Lesson not found');

  await enrollmentsService.assertEnrolled(studentId, lesson.courseId);

  const percentage = clampPercentage(input.percentage);
  const completed = resolveCompletion(percentage, input.completed);

  const existing = await videoProgressRepository.findByStudentAndLesson(studentId, input.lessonId);
  const timeSpentSeconds = (existing?.timeSpentSeconds ?? 0) + (input.timeSpentDeltaSeconds ?? 0);

  // Preserve the original completion timestamp; only stamp it on first completion.
  const completedAt = completed ? existing?.completedAt ?? new Date() : null;

  return videoProgressRepository.upsert(studentId, input.lessonId, lesson.courseId, {
    lastPositionSeconds: input.lastPositionSeconds,
    percentage,
    completed,
    timeSpentSeconds,
    completedAt,
  });
}

async function getLessonProgress(studentId: string, lessonId: string): Promise<VideoProgress> {
  const lesson = await lessonsRepository.findById(lessonId);
  if (!lesson) throw ApiError.notFound('Lesson not found');

  const progress = await videoProgressRepository.findByStudentAndLesson(studentId, lessonId);
  if (!progress) throw ApiError.notFound('No progress recorded for this lesson yet');
  return progress;
}

async function getCourseProgress(studentId: string, courseId: string) {
  await enrollmentsService.assertEnrolled(studentId, courseId);
  const course = await coursesService.getCourseWithLessons(courseId);

  const rows = await videoProgressRepository.findManyByStudentAndCourse(studentId, courseId);
  const summary = summariseCourseProgress(course.lessons.length, rows);

  const byLesson = new Map(rows.map((r) => [r.lessonId, r]));
  const lessons = course.lessons.map((lesson) => {
    const p = byLesson.get(lesson.id);
    return {
      lessonId: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      percentage: p?.percentage ?? 0,
      completed: p?.completed ?? false,
      lastPositionSeconds: p?.lastPositionSeconds ?? 0,
      timeSpentSeconds: p?.timeSpentSeconds ?? 0,
      completedAt: p?.completedAt ?? null,
    };
  });

  return { course: { id: course.id, title: course.title }, summary, lessons };
}

export { updateProgress, getLessonProgress, getCourseProgress };
