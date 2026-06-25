import {
  toStudentProgressReport,
  toCourseProgressReport,
} from '../../../src/serializers/report.serializer';
import { CourseProgressSummary } from '../../../src/helpers/progress.helper';

const summary = (over: Partial<CourseProgressSummary>): CourseProgressSummary => ({
  totalLessons: 0,
  completedLessons: 0,
  startedLessons: 0,
  completionPercentage: 0,
  totalTimeSpentSeconds: 0,
  ...over,
});

describe('report.serializer', () => {
  describe('toStudentProgressReport', () => {
    it('maps per-course rows and aggregates overall totals', () => {
      const report = toStudentProgressReport(
        { id: 'user-1', name: 'Jane', email: 'jane@student.test' },
        [
          {
            course: { id: 'c1', title: 'A' },
            summary: summary({ totalLessons: 4, completedLessons: 2, startedLessons: 3, completionPercentage: 50, totalTimeSpentSeconds: 300 }),
          },
          {
            course: { id: 'c2', title: 'B' },
            summary: summary({ totalLessons: 2, completedLessons: 2, startedLessons: 2, completionPercentage: 100, totalTimeSpentSeconds: 200 }),
          },
        ],
      );

      expect(report.student).toEqual({ id: 'user-1', name: 'Jane', email: 'jane@student.test' });
      expect(report.courses).toHaveLength(2);
      expect(report.courses[0]).toMatchObject({ courseId: 'c1', courseTitle: 'A', completedLessons: 2 });
      expect(report.overall).toEqual({
        totalCourses: 2,
        totalLessons: 6,
        completedLessons: 4,
        completionPercentage: 66.67, // round(4/6*100, 2)
        totalTimeSpentSeconds: 500,
      });
    });

    it('returns zeroed totals for a student with no courses', () => {
      const report = toStudentProgressReport({ id: 'u', name: 'N', email: 'e' }, []);
      expect(report.courses).toEqual([]);
      expect(report.overall).toEqual({
        totalCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        completionPercentage: 0,
        totalTimeSpentSeconds: 0,
      });
    });
  });

  describe('toCourseProgressReport', () => {
    it('flags fully-completed students and averages completion', () => {
      const report = toCourseProgressReport({ id: 'c1', title: 'A' }, 4, [
        {
          student: { id: 's1', name: 'S1', email: 's1@test' },
          summary: summary({ completedLessons: 4, completionPercentage: 100, totalTimeSpentSeconds: 300 }),
        },
        {
          student: { id: 's2', name: 'S2', email: 's2@test' },
          summary: summary({ completedLessons: 2, completionPercentage: 50, totalTimeSpentSeconds: 100 }),
        },
      ]);

      expect(report.course).toEqual({ id: 'c1', title: 'A', totalLessons: 4 });
      expect(report.students[0].isCompleted).toBe(true);
      expect(report.students[1].isCompleted).toBe(false);
      expect(report.summary).toEqual({
        totalStudents: 2,
        studentsCompleted: 1,
        averageCompletionPercentage: 75, // (100 + 50) / 2
        totalTimeSpentSeconds: 400,
      });
    });

    it('never marks students complete when the course has no lessons', () => {
      const report = toCourseProgressReport({ id: 'c1', title: 'A' }, 0, [
        { student: { id: 's1', name: 'S1', email: 's1@test' }, summary: summary({ completedLessons: 0 }) },
      ]);
      expect(report.students[0].isCompleted).toBe(false);
    });

    it('returns zeroed summary for a course with no students', () => {
      const report = toCourseProgressReport({ id: 'c1', title: 'A' }, 4, []);
      expect(report.summary).toEqual({
        totalStudents: 0,
        studentsCompleted: 0,
        averageCompletionPercentage: 0,
        totalTimeSpentSeconds: 0,
      });
    });
  });
});
