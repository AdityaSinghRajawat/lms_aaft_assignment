import { VideoProgress } from '@prisma/client';
import { videoProgressRepository } from '../repositories/videoProgress.repository';
import { lessonsRepository } from '../repositories/lessons.repository';
import { enrollmentsService } from './enrollments.service';
import { coursesService } from './courses.service';
import { ApiError } from '../utils/apiError';
import { UpsertProgressInput } from '../models/videoProgress.model';
import {
  clampPercentage,
  resolveCompletion,
  summariseCourseProgress,
} from '../helpers/progress.helper';

/**
 * Video progress service — tracks per-lesson watch progress for a student,
 * auto-completing at the 90% threshold and supporting resume-from-position.
 */
export const progressService = {
  async updateProgress(studentId: string, input: UpsertProgressInput): Promise<VideoProgress> {
    const lesson = await lessonsRepository.findById(input.lessonId);
    if (!lesson) throw ApiError.notFound('Lesson not found');

    // Student must be enrolled in the lesson's course.
    await enrollmentsService.assertEnrolled(studentId, lesson.courseId);

    const percentage = clampPercentage(input.percentage);
    const completed = resolveCompletion(percentage, input.completed);

    // Accumulate watch time onto any prior record.
    const existing = await videoProgressRepository.findByStudentAndLesson(studentId, input.lessonId);
    const priorTime = existing?.timeSpentSeconds ?? 0;
    const timeSpentSeconds = priorTime + (input.timeSpentDeltaSeconds ?? 0);

    // Preserve an earlier completion timestamp; stamp a new one on first completion.
    const completedAt = completed ? existing?.completedAt ?? new Date() : null;

    return videoProgressRepository.upsert(studentId, input.lessonId, lesson.courseId, {
      lastPositionSeconds: input.lastPositionSeconds,
      percentage,
      completed,
      timeSpentSeconds,
      completedAt,
    });
  },

  async getLessonProgress(studentId: string, lessonId: string): Promise<VideoProgress> {
    const lesson = await lessonsRepository.findById(lessonId);
    if (!lesson) throw ApiError.notFound('Lesson not found');

    const progress = await videoProgressRepository.findByStudentAndLesson(studentId, lessonId);
    if (!progress) throw ApiError.notFound('No progress recorded for this lesson yet');
    return progress;
  },

  async getCourseProgress(studentId: string, courseId: string) {
    await enrollmentsService.assertEnrolled(studentId, courseId);
    const course = await coursesService.getCourseWithLessons(courseId);

    const rows = await videoProgressRepository.findManyByStudentAndCourse(studentId, courseId);
    const summary = summariseCourseProgress(course.lessons.length, rows);

    // Per-lesson breakdown including not-yet-started lessons.
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

    return {
      course: { id: course.id, title: course.title },
      summary,
      lessons,
    };
  },
};
