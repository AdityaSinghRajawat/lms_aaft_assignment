jest.mock('../../../src/repositories/videoProgress.repository');
jest.mock('../../../src/repositories/lessons.repository');
jest.mock('../../../src/services/enrollments.service');
jest.mock('../../../src/services/courses.service');

import * as videoProgressRepository from '../../../src/repositories/videoProgress.repository';
import * as lessonsRepository from '../../../src/repositories/lessons.repository';
import * as enrollmentsService from '../../../src/services/enrollments.service';
import * as coursesService from '../../../src/services/courses.service';
import {
  updateProgress,
  getLessonProgress,
  getCourseProgress,
} from '../../../src/services/progress.service';
import { buildLesson, buildVideoProgress } from '../../support/factories';

const lessonFindById = lessonsRepository.findById as jest.Mock;
const assertEnrolled = enrollmentsService.assertEnrolled as jest.Mock;
const findByStudentAndLesson = videoProgressRepository.findByStudentAndLesson as jest.Mock;
const upsert = videoProgressRepository.upsert as jest.Mock;
const findManyByStudentAndCourse = videoProgressRepository.findManyByStudentAndCourse as jest.Mock;
const getCourseWithLessons = coursesService.getCourseWithLessons as jest.Mock;

const baseInput = { lessonId: 'lesson-1', lastPositionSeconds: 100, percentage: 50 };

describe('progress.service', () => {
  describe('updateProgress', () => {
    beforeEach(() => {
      lessonFindById.mockResolvedValue(buildLesson({ id: 'lesson-1', courseId: 'course-1' }));
      assertEnrolled.mockResolvedValue(undefined);
      upsert.mockResolvedValue(buildVideoProgress());
    });

    it('throws 404 when the lesson does not exist', async () => {
      lessonFindById.mockResolvedValue(null);
      await expect(updateProgress('user-1', baseInput)).rejects.toMatchObject({ statusCode: 404 });
      expect(upsert).not.toHaveBeenCalled();
    });

    it('checks enrollment in the lesson course before writing', async () => {
      findByStudentAndLesson.mockResolvedValue(null);
      await updateProgress('user-1', baseInput);
      expect(assertEnrolled).toHaveBeenCalledWith('user-1', 'course-1');
    });

    it('auto-completes at the 90% threshold and stamps completedAt', async () => {
      findByStudentAndLesson.mockResolvedValue(null);

      await updateProgress('user-1', { ...baseInput, percentage: 90 });

      const [, , , data] = upsert.mock.calls[0];
      expect(data.completed).toBe(true);
      expect(data.completedAt).toBeInstanceOf(Date);
      expect(data.percentage).toBe(90);
    });

    it('does not complete below 90% and leaves completedAt null', async () => {
      findByStudentAndLesson.mockResolvedValue(null);

      await updateProgress('user-1', { ...baseInput, percentage: 50 });

      const [, , , data] = upsert.mock.calls[0];
      expect(data.completed).toBe(false);
      expect(data.completedAt).toBeNull();
    });

    it('honours an explicit completed flag below the threshold', async () => {
      findByStudentAndLesson.mockResolvedValue(null);
      await updateProgress('user-1', { ...baseInput, percentage: 10, completed: true });
      expect(upsert.mock.calls[0][3].completed).toBe(true);
    });

    it('keeps completion sticky — a later low percentage does not un-complete', async () => {
      findByStudentAndLesson.mockResolvedValue(
        buildVideoProgress({ completed: true, completedAt: new Date('2026-01-01') }),
      );

      await updateProgress('user-1', { ...baseInput, percentage: 5 });

      const [, , , data] = upsert.mock.calls[0];
      expect(data.completed).toBe(true);
      expect(data.completedAt).toEqual(new Date('2026-01-01'));
    });

    it('accumulates watch time onto the existing record', async () => {
      findByStudentAndLesson.mockResolvedValue(buildVideoProgress({ timeSpentSeconds: 100 }));

      await updateProgress('user-1', { ...baseInput, timeSpentDeltaSeconds: 50 });

      expect(upsert.mock.calls[0][3].timeSpentSeconds).toBe(150);
    });

    it('clamps an out-of-range percentage into 0–100', async () => {
      findByStudentAndLesson.mockResolvedValue(null);
      await updateProgress('user-1', { ...baseInput, percentage: 150 });
      expect(upsert.mock.calls[0][3].percentage).toBe(100);
    });
  });

  describe('getLessonProgress', () => {
    it('returns the recorded progress', async () => {
      lessonFindById.mockResolvedValue(buildLesson());
      findByStudentAndLesson.mockResolvedValue(buildVideoProgress());

      const result = await getLessonProgress('user-1', 'lesson-1');
      expect(result.id).toBe('progress-1');
    });

    it('throws 404 when the lesson does not exist', async () => {
      lessonFindById.mockResolvedValue(null);
      await expect(getLessonProgress('user-1', 'missing')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 404 when no progress has been recorded yet', async () => {
      lessonFindById.mockResolvedValue(buildLesson());
      findByStudentAndLesson.mockResolvedValue(null);
      await expect(getLessonProgress('user-1', 'lesson-1')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('getCourseProgress', () => {
    it('asserts enrollment, summarises and serializes course progress', async () => {
      assertEnrolled.mockResolvedValue(undefined);
      getCourseWithLessons.mockResolvedValue({
        id: 'course-1',
        title: 'Intro',
        lessons: [
          { id: 'lesson-1', title: 'One', duration: 600 },
          { id: 'lesson-2', title: 'Two', duration: 900 },
        ],
      });
      findManyByStudentAndCourse.mockResolvedValue([
        buildVideoProgress({ lessonId: 'lesson-1', completed: true, timeSpentSeconds: 600 }),
      ]);

      const result = await getCourseProgress('user-1', 'course-1');

      expect(assertEnrolled).toHaveBeenCalledWith('user-1', 'course-1');
      expect(result.course).toEqual({ id: 'course-1', title: 'Intro' });
      expect(result.summary).toMatchObject({ totalLessons: 2, completedLessons: 1, completionPercentage: 50 });
      expect(result.lessons).toHaveLength(2);
    });

    it('throws 403 when the student is not enrolled', async () => {
      assertEnrolled.mockRejectedValue(
        Object.assign(new Error('forbidden'), { statusCode: 403 }),
      );
      await expect(getCourseProgress('user-1', 'course-1')).rejects.toMatchObject({ statusCode: 403 });
      expect(getCourseWithLessons).not.toHaveBeenCalled();
    });
  });
});
