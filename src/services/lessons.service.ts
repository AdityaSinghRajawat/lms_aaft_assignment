import { Lesson } from '@prisma/client';
import * as lessonsRepository from '../repositories/lessons.repository';
import * as coursesService from './courses.service';
import { ApiError } from '../utils/apiError';
import { CreateLessonInput, UpdateLessonInput } from '../types/lesson.types';

async function createLesson(courseId: string, input: CreateLessonInput): Promise<Lesson> {
  await coursesService.ensureCourseExists(courseId);
  return lessonsRepository.create({
    courseId,
    title: input.title,
    description: input.description,
    videoUrl: input.videoUrl,
    duration: input.duration ?? 0,
    sortOrder: input.sortOrder ?? 0,
  });
}

async function listLessons(courseId: string): Promise<Lesson[]> {
  await coursesService.ensureCourseExists(courseId);
  return lessonsRepository.findManyByCourse(courseId);
}

async function getLesson(courseId: string, lessonId: string): Promise<Lesson> {
  const lesson = await lessonsRepository.findByIdAndCourse(lessonId, courseId);
  if (!lesson) throw ApiError.notFound('Lesson not found');
  return lesson;
}

async function updateLesson(
  courseId: string,
  lessonId: string,
  input: UpdateLessonInput,
): Promise<Lesson> {
  await getLesson(courseId, lessonId);
  return lessonsRepository.update(lessonId, input);
}

async function deleteLesson(courseId: string, lessonId: string): Promise<void> {
  await getLesson(courseId, lessonId);
  await lessonsRepository.remove(lessonId);
}

export { createLesson, listLessons, getLesson, updateLesson, deleteLesson };
