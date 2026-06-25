jest.mock('../../../src/repositories/lessons.repository');
jest.mock('../../../src/services/courses.service');

import * as lessonsRepository from '../../../src/repositories/lessons.repository';
import * as coursesService from '../../../src/services/courses.service';
import {
  createLesson,
  listLessons,
  getLesson,
  updateLesson,
  deleteLesson,
} from '../../../src/services/lessons.service';
import { ApiError } from '../../../src/utils/apiError';
import { buildCourse, buildLesson } from '../../support/factories';

const ensureCourseExists = coursesService.ensureCourseExists as jest.Mock;
const create = lessonsRepository.create as jest.Mock;
const findByIdAndCourse = lessonsRepository.findByIdAndCourse as jest.Mock;
const findManyByCourse = lessonsRepository.findManyByCourse as jest.Mock;
const update = lessonsRepository.update as jest.Mock;
const remove = lessonsRepository.remove as jest.Mock;

describe('lessons.service', () => {
  describe('createLesson', () => {
    it('verifies the parent course then creates with default duration/sortOrder', async () => {
      ensureCourseExists.mockResolvedValue(buildCourse());
      create.mockResolvedValue(buildLesson());

      await createLesson('course-1', { title: 'L', videoUrl: 'https://v/1.mp4' });

      expect(ensureCourseExists).toHaveBeenCalledWith('course-1');
      expect(create).toHaveBeenCalledWith({
        courseId: 'course-1',
        title: 'L',
        description: undefined,
        videoUrl: 'https://v/1.mp4',
        duration: 0,
        sortOrder: 0,
      });
    });

    it('propagates 404 when the parent course is missing', async () => {
      ensureCourseExists.mockRejectedValue(ApiError.notFound('Course not found'));

      await expect(
        createLesson('missing', { title: 'L', videoUrl: 'https://v/1.mp4' }),
      ).rejects.toMatchObject({ statusCode: 404 });
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe('listLessons', () => {
    it('verifies the course then lists its lessons', async () => {
      ensureCourseExists.mockResolvedValue(buildCourse());
      findManyByCourse.mockResolvedValue([buildLesson()]);

      const result = await listLessons('course-1');

      expect(ensureCourseExists).toHaveBeenCalledWith('course-1');
      expect(findManyByCourse).toHaveBeenCalledWith('course-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getLesson', () => {
    it('returns the lesson scoped to its course', async () => {
      findByIdAndCourse.mockResolvedValue(buildLesson());
      const result = await getLesson('course-1', 'lesson-1');
      expect(findByIdAndCourse).toHaveBeenCalledWith('lesson-1', 'course-1');
      expect(result.id).toBe('lesson-1');
    });

    it('throws 404 when the lesson does not belong to the course', async () => {
      findByIdAndCourse.mockResolvedValue(null);
      await expect(getLesson('course-1', 'missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('updateLesson', () => {
    it('updates an existing lesson', async () => {
      findByIdAndCourse.mockResolvedValue(buildLesson());
      update.mockResolvedValue(buildLesson({ title: 'New' }));

      const result = await updateLesson('course-1', 'lesson-1', { title: 'New' });

      expect(update).toHaveBeenCalledWith('lesson-1', { title: 'New' });
      expect(result.title).toBe('New');
    });

    it('throws 404 when the lesson is missing', async () => {
      findByIdAndCourse.mockResolvedValue(null);
      await expect(updateLesson('course-1', 'missing', { title: 'x' })).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe('deleteLesson', () => {
    it('soft-deletes an existing lesson', async () => {
      findByIdAndCourse.mockResolvedValue(buildLesson());
      remove.mockResolvedValue(buildLesson());
      await deleteLesson('course-1', 'lesson-1');
      expect(remove).toHaveBeenCalledWith('lesson-1');
    });

    it('throws 404 when the lesson is missing', async () => {
      findByIdAndCourse.mockResolvedValue(null);
      await expect(deleteLesson('course-1', 'missing')).rejects.toMatchObject({ statusCode: 404 });
      expect(remove).not.toHaveBeenCalled();
    });
  });
});
