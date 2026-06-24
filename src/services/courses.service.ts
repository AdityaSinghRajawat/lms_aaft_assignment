import { Course } from '@prisma/client';
import * as coursesRepository from '../repositories/courses.repository';
import { ApiError } from '../utils/apiError';
import { CreateCourseInput, UpdateCourseInput } from '../types/course.types';
import { PaginationParams } from '../types/common';

function createCourse(input: CreateCourseInput): Promise<Course> {
  return coursesRepository.create({
    title: input.title,
    description: input.description,
    isPublished: input.isPublished ?? true,
  });
}

async function listCourses(pagination: PaginationParams, search?: string) {
  const [items, totalItems] = await Promise.all([
    coursesRepository.findManyWithLessons(pagination.skip, pagination.limit, search),
    coursesRepository.count(search),
  ]);
  return { items, totalItems };
}

async function getCourseWithLessons(courseId: string) {
  const course = await coursesRepository.findByIdWithLessons(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  return course;
}

async function ensureCourseExists(courseId: string): Promise<Course> {
  const course = await coursesRepository.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  return course;
}

async function updateCourse(courseId: string, input: UpdateCourseInput): Promise<Course> {
  await ensureCourseExists(courseId);
  return coursesRepository.update(courseId, input);
}

async function deleteCourse(courseId: string): Promise<void> {
  await ensureCourseExists(courseId);
  await coursesRepository.remove(courseId);
}

export {
  createCourse,
  listCourses,
  getCourseWithLessons,
  ensureCourseExists,
  updateCourse,
  deleteCourse,
};
