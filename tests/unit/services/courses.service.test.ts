jest.mock('../../../src/repositories/courses.repository');

import * as coursesRepository from '../../../src/repositories/courses.repository';
import {
  createCourse,
  listCourses,
  getCourseWithLessons,
  ensureCourseExists,
  updateCourse,
  deleteCourse,
} from '../../../src/services/courses.service';
import { buildCourse } from '../../support/factories';

const create = coursesRepository.create as jest.Mock;
const findById = coursesRepository.findById as jest.Mock;
const findByIdWithLessons = coursesRepository.findByIdWithLessons as jest.Mock;
const update = coursesRepository.update as jest.Mock;
const remove = coursesRepository.remove as jest.Mock;
const findManyWithLessons = coursesRepository.findManyWithLessons as jest.Mock;
const count = coursesRepository.count as jest.Mock;

const pagination = { page: 1, limit: 10, skip: 0 };

describe('courses.service', () => {
  describe('createCourse', () => {
    it('defaults isPublished to true when omitted', async () => {
      create.mockResolvedValue(buildCourse());

      await createCourse({ title: 'New', description: 'd' });

      expect(create).toHaveBeenCalledWith({ title: 'New', description: 'd', isPublished: true });
    });

    it('respects an explicit isPublished flag', async () => {
      create.mockResolvedValue(buildCourse({ isPublished: false }));
      await createCourse({ title: 'Draft', isPublished: false });
      expect(create).toHaveBeenCalledWith({ title: 'Draft', description: undefined, isPublished: false });
    });
  });

  describe('listCourses', () => {
    it('returns courses and the total count', async () => {
      findManyWithLessons.mockResolvedValue([buildCourse()]);
      count.mockResolvedValue(1);

      const result = await listCourses(pagination, 'type');

      expect(findManyWithLessons).toHaveBeenCalledWith(0, 10, 'type');
      expect(result).toEqual({ items: [expect.objectContaining({ id: 'course-1' })], totalItems: 1 });
    });
  });

  describe('getCourseWithLessons', () => {
    it('returns the course when found', async () => {
      const course = { ...buildCourse(), lessons: [] };
      findByIdWithLessons.mockResolvedValue(course);
      await expect(getCourseWithLessons('course-1')).resolves.toBe(course);
    });

    it('throws 404 when the course is missing', async () => {
      findByIdWithLessons.mockResolvedValue(null);
      await expect(getCourseWithLessons('missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('ensureCourseExists', () => {
    it('throws 404 when the course is missing', async () => {
      findById.mockResolvedValue(null);
      await expect(ensureCourseExists('missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('updateCourse', () => {
    it('updates after confirming the course exists', async () => {
      findById.mockResolvedValue(buildCourse());
      update.mockResolvedValue(buildCourse({ title: 'Updated' }));

      const result = await updateCourse('course-1', { title: 'Updated' });

      expect(update).toHaveBeenCalledWith('course-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('throws 404 (and skips update) when the course is missing', async () => {
      findById.mockResolvedValue(null);
      await expect(updateCourse('missing', { title: 'x' })).rejects.toMatchObject({ statusCode: 404 });
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCourse', () => {
    it('soft-deletes after confirming existence', async () => {
      findById.mockResolvedValue(buildCourse());
      remove.mockResolvedValue(buildCourse());
      await deleteCourse('course-1');
      expect(remove).toHaveBeenCalledWith('course-1');
    });

    it('throws 404 when the course is missing', async () => {
      findById.mockResolvedValue(null);
      await expect(deleteCourse('missing')).rejects.toMatchObject({ statusCode: 404 });
      expect(remove).not.toHaveBeenCalled();
    });
  });
});
