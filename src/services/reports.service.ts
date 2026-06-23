import { Role } from '@prisma/client';
import { usersRepository } from '../repositories/users.repository';
import { enrollmentsRepository } from '../repositories/enrollments.repository';
import { videoProgressRepository } from '../repositories/videoProgress.repository';
import { coursesRepository } from '../repositories/courses.repository';
import { ApiError } from '../utils/apiError';
import { roundTo, summariseCourseProgress } from '../helpers/progress.helper';
import {
  CourseProgressReport,
  CourseStudentProgress,
  StudentCourseProgress,
  StudentProgressReport,
} from '../models/report.model';

/**
 * Reports service — admin analytics: student-wise and course-wise progress,
 * including completion percentages and time-spent metrics.
 *
 * Each report uses a bounded number of queries (no per-lesson / per-student
 * round trips) to avoid N+1 problems.
 */
export const reportsService = {
  async studentProgress(studentId: string): Promise<StudentProgressReport> {
    const student = await usersRepository.findByIdAndRole(studentId, Role.STUDENT);
    if (!student) throw ApiError.notFound('Student not found');

    const [enrollments, progressRows] = await Promise.all([
      enrollmentsRepository.findAllByStudentWithCourse(studentId),
      videoProgressRepository.findManyByStudent(studentId),
    ]);

    // Bucket progress rows by course once.
    const rowsByCourse = groupBy(progressRows, (r) => r.courseId);

    const courses: StudentCourseProgress[] = enrollments.map((e) => {
      const rows = rowsByCourse.get(e.courseId) ?? [];
      const summary = summariseCourseProgress(e.course._count.lessons, rows);
      return {
        courseId: e.course.id,
        courseTitle: e.course.title,
        totalLessons: summary.totalLessons,
        completedLessons: summary.completedLessons,
        startedLessons: summary.startedLessons,
        completionPercentage: summary.completionPercentage,
        totalTimeSpentSeconds: summary.totalTimeSpentSeconds,
      };
    });

    const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0);
    const completedLessons = courses.reduce((s, c) => s + c.completedLessons, 0);
    const totalTimeSpentSeconds = courses.reduce((s, c) => s + c.totalTimeSpentSeconds, 0);

    return {
      student: { id: student.id, name: student.name, email: student.email },
      overall: {
        totalCourses: courses.length,
        totalLessons,
        completedLessons,
        completionPercentage: totalLessons > 0 ? roundTo((completedLessons / totalLessons) * 100, 2) : 0,
        totalTimeSpentSeconds,
      },
      courses,
    };
  },

  async courseProgress(courseId: string): Promise<CourseProgressReport> {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw ApiError.notFound('Course not found');

    const [totalLessons, enrollments, progressRows] = await Promise.all([
      coursesRepository.countLessons(courseId),
      enrollmentsRepository.findAllByCourseWithStudent(courseId),
      videoProgressRepository.findManyByCourse(courseId),
    ]);

    const rowsByStudent = groupBy(progressRows, (r) => r.studentId);

    const students: CourseStudentProgress[] = enrollments.map((e) => {
      const rows = rowsByStudent.get(e.studentId) ?? [];
      const summary = summariseCourseProgress(totalLessons, rows);
      return {
        studentId: e.student.id,
        studentName: e.student.name,
        studentEmail: e.student.email,
        completedLessons: summary.completedLessons,
        completionPercentage: summary.completionPercentage,
        totalTimeSpentSeconds: summary.totalTimeSpentSeconds,
        isCompleted: totalLessons > 0 && summary.completedLessons === totalLessons,
      };
    });

    const studentsCompleted = students.filter((s) => s.isCompleted).length;
    const totalTimeSpentSeconds = students.reduce((s, st) => s + st.totalTimeSpentSeconds, 0);
    const averageCompletionPercentage =
      students.length > 0
        ? roundTo(students.reduce((s, st) => s + st.completionPercentage, 0) / students.length, 2)
        : 0;

    return {
      course: { id: course.id, title: course.title, totalLessons },
      summary: {
        totalStudents: students.length,
        studentsCompleted,
        averageCompletionPercentage,
        totalTimeSpentSeconds,
      },
      students,
    };
  },
};

/** Group an array into a Map keyed by the selector. */
function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  return map;
}
