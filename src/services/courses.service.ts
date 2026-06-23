import { Course } from '@prisma/client';
import { coursesRepository } from '../repositories/courses.repository';
import { ApiError } from '../utils/apiError';
import { CreateCourseInput, UpdateCourseInput } from '../models/course.model';
import { PaginationParams } from '../types/common';

/**
 * Courses service — course management business logic.
 */
export const coursesService = {
  createCourse(input: CreateCourseInput): Promise<Course> {
    return coursesRepository.create({
      title: input.title,
      description: input.description,
      isPublished: input.isPublished ?? true,
    });
  },

  async listCourses(pagination: PaginationParams, search?: string) {
    const [items, totalItems] = await Promise.all([
      coursesRepository.findManyWithLessons(pagination.skip, pagination.limit, search),
      coursesRepository.count(search),
    ]);
    return { items, totalItems };
  },

  async getCourseWithLessons(courseId: string) {
    const course = await coursesRepository.findByIdWithLessons(courseId);
    if (!course) throw ApiError.notFound('Course not found');
    return course;
  },

  async ensureCourseExists(courseId: string): Promise<Course> {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw ApiError.notFound('Course not found');
    return course;
  },

  async updateCourse(courseId: string, input: UpdateCourseInput): Promise<Course> {
    await this.ensureCourseExists(courseId);
    return coursesRepository.update(courseId, input);
  },

  async deleteCourse(courseId: string): Promise<void> {
    await this.ensureCourseExists(courseId);
    // Lessons / enrollments / progress cascade via FK onDelete rules.
    await coursesRepository.delete(courseId);
  },
};
