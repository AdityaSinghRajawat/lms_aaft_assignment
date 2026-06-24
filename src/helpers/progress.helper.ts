import { PROGRESS } from '../constants/progress.constants';
import { roundTo } from '../utils/number';

function clampPercentage(value: number): number {
  if (Number.isNaN(value)) return PROGRESS.MIN_PERCENT;
  return Math.min(Math.max(value, PROGRESS.MIN_PERCENT), PROGRESS.MAX_PERCENT);
}

function resolveCompletion(percentage: number, explicit?: boolean): boolean {
  if (explicit === true) return true;
  return percentage >= PROGRESS.COMPLETION_THRESHOLD_PERCENT;
}

export interface CourseProgressSummary {
  totalLessons: number;
  completedLessons: number;
  startedLessons: number;
  completionPercentage: number;
  totalTimeSpentSeconds: number;
}

function summariseCourseProgress(
  totalLessons: number,
  rows: Array<{ completed: boolean; timeSpentSeconds: number }>,
): CourseProgressSummary {
  const completedLessons = rows.filter((r) => r.completed).length;
  const startedLessons = rows.length;
  const totalTimeSpentSeconds = rows.reduce((sum, r) => sum + r.timeSpentSeconds, 0);
  const completionPercentage =
    totalLessons > 0 ? roundTo((completedLessons / totalLessons) * 100, 2) : 0;

  return {
    totalLessons,
    completedLessons,
    startedLessons,
    completionPercentage,
    totalTimeSpentSeconds,
  };
}

export { clampPercentage, resolveCompletion, summariseCourseProgress };
