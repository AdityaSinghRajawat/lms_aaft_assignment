/**
 * Domain-specific helpers for video-progress calculations.
 */

/** A video is considered complete once at least this fraction is watched. */
export const COMPLETION_THRESHOLD_PERCENT = 90;

/** Clamp a raw percentage into the valid 0–100 range. */
export function clampPercentage(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 100);
}

/**
 * Decide whether a lesson should be marked complete.
 * Auto-completes at the 90% threshold; an explicit `completed=true` also wins.
 */
export function resolveCompletion(percentage: number, explicit?: boolean): boolean {
  if (explicit === true) return true;
  return percentage >= COMPLETION_THRESHOLD_PERCENT;
}

export interface CourseProgressSummary {
  totalLessons: number;
  completedLessons: number;
  startedLessons: number;
  completionPercentage: number;
  totalTimeSpentSeconds: number;
}

/**
 * Aggregate a set of per-lesson progress rows into a course-level summary.
 */
export function summariseCourseProgress(
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

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
