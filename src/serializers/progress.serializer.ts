import { VideoProgress } from '@prisma/client';
import { CourseProgressSummary } from '../helpers/progress.helper';

interface CourseWithLessons {
  id: string;
  title: string;
  lessons: Array<{ id: string; title: string; duration: number }>;
}

interface LessonProgressView {
  lessonId: string;
  title: string;
  duration: number;
  percentage: number;
  completed: boolean;
  lastPositionSeconds: number;
  timeSpentSeconds: number;
  completedAt: Date | null;
}

interface CourseProgressView {
  course: { id: string; title: string };
  summary: CourseProgressSummary;
  lessons: LessonProgressView[];
}

function toCourseProgress(
  course: CourseWithLessons,
  rows: VideoProgress[],
  summary: CourseProgressSummary,
): CourseProgressView {
  const byLesson = new Map(rows.map((r) => [r.lessonId, r]));

  const lessons: LessonProgressView[] = course.lessons.map((lesson) => {
    const progress = byLesson.get(lesson.id);
    return {
      lessonId: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      percentage: progress?.percentage ?? 0,
      completed: progress?.completed ?? false,
      lastPositionSeconds: progress?.lastPositionSeconds ?? 0,
      timeSpentSeconds: progress?.timeSpentSeconds ?? 0,
      completedAt: progress?.completedAt ?? null,
    };
  });

  return { course: { id: course.id, title: course.title }, summary, lessons };
}

export { toCourseProgress };
export type { CourseProgressView };
