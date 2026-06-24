import { Role } from '@prisma/client';
import * as usersRepository from '../repositories/users.repository';
import * as enrollmentsRepository from '../repositories/enrollments.repository';
import * as videoProgressRepository from '../repositories/videoProgress.repository';
import * as coursesRepository from '../repositories/courses.repository';
import { toStudentProgressReport, toCourseProgressReport } from '../serializers/report.serializer';
import { ApiError } from '../utils/apiError';
import { groupBy } from '../utils/collection';
import { summariseCourseProgress } from '../helpers/progress.helper';
import { CourseProgressReport, StudentProgressReport } from '../types/report.types';

async function studentProgress(studentId: string): Promise<StudentProgressReport> {
  const student = await usersRepository.findByIdAndRole(studentId, Role.STUDENT);
  if (!student) throw ApiError.notFound('Student not found');

  const [enrollments, progressRows] = await Promise.all([
    enrollmentsRepository.findAllByStudentWithCourse(studentId),
    videoProgressRepository.findManyByStudent(studentId),
  ]);

  const rowsByCourse = groupBy(progressRows, (r) => r.courseId);

  const courses = enrollments.map((e) => ({
    course: { id: e.course.id, title: e.course.title },
    summary: summariseCourseProgress(e.course._count.lessons, rowsByCourse.get(e.courseId) ?? []),
  }));

  return toStudentProgressReport(
    { id: student.id, name: student.name, email: student.email },
    courses,
  );
}

async function courseProgress(courseId: string): Promise<CourseProgressReport> {
  const course = await coursesRepository.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  const [totalLessons, enrollments, progressRows] = await Promise.all([
    coursesRepository.countLessons(courseId),
    enrollmentsRepository.findAllByCourseWithStudent(courseId),
    videoProgressRepository.findManyByCourse(courseId),
  ]);

  const rowsByStudent = groupBy(progressRows, (r) => r.studentId);

  const students = enrollments.map((e) => ({
    student: e.student,
    summary: summariseCourseProgress(totalLessons, rowsByStudent.get(e.studentId) ?? []),
  }));

  return toCourseProgressReport({ id: course.id, title: course.title }, totalLessons, students);
}

export { studentProgress, courseProgress };
