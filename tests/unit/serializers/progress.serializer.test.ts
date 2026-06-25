import { toCourseProgress } from '../../../src/serializers/progress.serializer';
import { CourseProgressSummary } from '../../../src/helpers/progress.helper';
import { buildVideoProgress, EPOCH } from '../../support/factories';

const course = {
  id: 'course-1',
  title: 'Intro to TypeScript',
  lessons: [
    { id: 'lesson-1', title: 'Lesson One', duration: 600 },
    { id: 'lesson-2', title: 'Lesson Two', duration: 900 },
  ],
};

const summary: CourseProgressSummary = {
  totalLessons: 2,
  completedLessons: 1,
  startedLessons: 1,
  completionPercentage: 50,
  totalTimeSpentSeconds: 600,
};

describe('progress.serializer', () => {
  it('merges recorded progress and defaults untouched lessons to zero', () => {
    const rows = [
      buildVideoProgress({
        lessonId: 'lesson-1',
        percentage: 100,
        completed: true,
        lastPositionSeconds: 600,
        timeSpentSeconds: 600,
        completedAt: EPOCH,
      }),
    ];

    const view = toCourseProgress(course, rows, summary);

    expect(view.course).toEqual({ id: 'course-1', title: 'Intro to TypeScript' });
    expect(view.summary).toBe(summary);

    expect(view.lessons[0]).toEqual({
      lessonId: 'lesson-1',
      title: 'Lesson One',
      duration: 600,
      percentage: 100,
      completed: true,
      lastPositionSeconds: 600,
      timeSpentSeconds: 600,
      completedAt: EPOCH,
    });

    // lesson-2 has no progress row → zeroed defaults
    expect(view.lessons[1]).toMatchObject({
      lessonId: 'lesson-2',
      percentage: 0,
      completed: false,
      lastPositionSeconds: 0,
      timeSpentSeconds: 0,
      completedAt: null,
    });
  });

  it('zeroes every lesson when no progress exists', () => {
    const view = toCourseProgress(course, [], summary);
    expect(view.lessons.every((l) => l.percentage === 0 && !l.completed)).toBe(true);
  });
});
