import * as enrollmentsRepository from '../repositories/enrollments.repository';
import * as coursesRepository from '../repositories/courses.repository';
import * as lessonsRepository from '../repositories/lessons.repository';
import * as enrollmentsService from './enrollments.service';
import { ApiError } from '../utils/apiError';
import { PaginationParams } from '../types/common';

async function listAssignedCourses(studentId: string, pagination: PaginationParams) {
  const [enrollments, totalItems] = await Promise.all([
    enrollmentsRepository.findAssignedCourses(studentId, pagination.skip, pagination.limit),
    enrollmentsRepository.countByStudent(studentId),
  ]);

  const items = enrollments.map((e) => ({
    enrollmentId: e.id,
    assignedAt: e.createdAt,
    course: {
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      isPublished: e.course.isPublished,
      totalLessons: e.course._count.lessons,
      createdAt: e.course.createdAt,
      updatedAt: e.course.updatedAt,
    },
  }));

  return { items, totalItems };
}

async function getAssignedCourseDetail(studentId: string, courseId: string) {
  await enrollmentsService.assertEnrolled(studentId, courseId);
  const course = await coursesRepository.findByIdWithLessons(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  return course;
}

async function getLessonDetail(studentId: string, courseId: string, lessonId: string) {
  await enrollmentsService.assertEnrolled(studentId, courseId);
  const lesson = await lessonsRepository.findByIdAndCourse(lessonId, courseId);
  if (!lesson) throw ApiError.notFound('Lesson not found');
  return lesson;
}

export { listAssignedCourses, getAssignedCourseDetail, getLessonDetail };
