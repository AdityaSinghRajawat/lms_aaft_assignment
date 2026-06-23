import {
  clampPercentage,
  resolveCompletion,
  summariseCourseProgress,
  COMPLETION_THRESHOLD_PERCENT,
} from '../src/helpers/progress.helper';

describe('progress.helper', () => {
  describe('clampPercentage', () => {
    it('clamps values into the 0–100 range', () => {
      expect(clampPercentage(-5)).toBe(0);
      expect(clampPercentage(150)).toBe(100);
      expect(clampPercentage(42.5)).toBe(42.5);
    });

    it('treats NaN as 0', () => {
      expect(clampPercentage(NaN)).toBe(0);
    });
  });

  describe('resolveCompletion', () => {
    it('auto-completes at the 90% threshold', () => {
      expect(resolveCompletion(COMPLETION_THRESHOLD_PERCENT)).toBe(true);
      expect(resolveCompletion(89.9)).toBe(false);
    });

    it('honours an explicit completed flag', () => {
      expect(resolveCompletion(10, true)).toBe(true);
      expect(resolveCompletion(95, false)).toBe(true); // threshold still wins on >=90
    });
  });

  describe('summariseCourseProgress', () => {
    it('aggregates completed lessons and time spent', () => {
      const summary = summariseCourseProgress(4, [
        { completed: true, timeSpentSeconds: 100 },
        { completed: true, timeSpentSeconds: 200 },
        { completed: false, timeSpentSeconds: 50 },
      ]);

      expect(summary.totalLessons).toBe(4);
      expect(summary.completedLessons).toBe(2);
      expect(summary.startedLessons).toBe(3);
      expect(summary.completionPercentage).toBe(50);
      expect(summary.totalTimeSpentSeconds).toBe(350);
    });

    it('handles a course with no lessons', () => {
      const summary = summariseCourseProgress(0, []);
      expect(summary.completionPercentage).toBe(0);
    });
  });
});
