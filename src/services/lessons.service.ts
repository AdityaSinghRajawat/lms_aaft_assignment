import { Lesson } from '@prisma/client';
import { lessonsRepository } from '../repositories/lessons.repository';
import { coursesService } from './courses.service';
import { ApiError } from '../utils/apiError';
import { CreateLessonInput, UpdateLessonInput } from '../models/lesson.model';

/**
 * Lessons service — video lesson management business logic.
 * Lessons always live within a parent course.
 */
export const lessonsService = {
  async createLesson(courseId: string, input: CreateLessonInput): Promise<Lesson> {
    await coursesService.ensureCourseExists(courseId);
    return lessonsRepository.create({
      courseId,
      title: input.title,
      description: input.description,
      videoUrl: input.videoUrl,
      duration: input.duration ?? 0,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async listLessons(courseId: string): Promise<Lesson[]> {
    await coursesService.ensureCourseExists(courseId);
    return lessonsRepository.findManyByCourse(courseId);
  },

  async getLesson(courseId: string, lessonId: string): Promise<Lesson> {
    const lesson = await lessonsRepository.findByIdAndCourse(lessonId, courseId);
    if (!lesson) throw ApiError.notFound('Lesson not found');
    return lesson;
  },

  async updateLesson(
    courseId: string,
    lessonId: string,
    input: UpdateLessonInput,
  ): Promise<Lesson> {
    await this.getLesson(courseId, lessonId);
    return lessonsRepository.update(lessonId, input);
  },

  async deleteLesson(courseId: string, lessonId: string): Promise<void> {
    await this.getLesson(courseId, lessonId);
    await lessonsRepository.delete(lessonId);
  },
};
