import { roundTo } from '../utils/number';
import { CourseProgressSummary } from '../helpers/progress.helper';
import {
  CourseProgressReport,
  CourseStudentProgress,
  StudentProgressReport,
} from '../types/report.types';

interface StudentRef {
  id: string;
  name: string;
  email: string;
}

interface CourseRef {
  id: string;
  title: string;
}

interface StudentCourseInput {
  course: CourseRef;
  summary: CourseProgressSummary;
}

interface CourseStudentInput {
  student: StudentRef;
  summary: CourseProgressSummary;
}

function toStudentProgressReport(
  student: StudentRef,
  courses: StudentCourseInput[],
): StudentProgressReport {
  const mappedCourses = courses.map(({ course, summary }) => ({
    courseId: course.id,
    courseTitle: course.title,
    totalLessons: summary.totalLessons,
    completedLessons: summary.completedLessons,
    startedLessons: summary.startedLessons,
    completionPercentage: summary.completionPercentage,
    totalTimeSpentSeconds: summary.totalTimeSpentSeconds,
  }));

  const totalLessons = mappedCourses.reduce((s, c) => s + c.totalLessons, 0);
  const completedLessons = mappedCourses.reduce((s, c) => s + c.completedLessons, 0);
  const totalTimeSpentSeconds = mappedCourses.reduce((s, c) => s + c.totalTimeSpentSeconds, 0);

  return {
    student,
    overall: {
      totalCourses: mappedCourses.length,
      totalLessons,
      completedLessons,
      completionPercentage: totalLessons > 0 ? roundTo((completedLessons / totalLessons) * 100, 2) : 0,
      totalTimeSpentSeconds,
    },
    courses: mappedCourses,
  };
}

function toCourseProgressReport(
  course: CourseRef,
  totalLessons: number,
  students: CourseStudentInput[],
): CourseProgressReport {
  const mappedStudents: CourseStudentProgress[] = students.map(({ student, summary }) => ({
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    completedLessons: summary.completedLessons,
    completionPercentage: summary.completionPercentage,
    totalTimeSpentSeconds: summary.totalTimeSpentSeconds,
    isCompleted: totalLessons > 0 && summary.completedLessons === totalLessons,
  }));

  const studentsCompleted = mappedStudents.filter((s) => s.isCompleted).length;
  const totalTimeSpentSeconds = mappedStudents.reduce((s, st) => s + st.totalTimeSpentSeconds, 0);
  const averageCompletionPercentage =
    mappedStudents.length > 0
      ? roundTo(
          mappedStudents.reduce((s, st) => s + st.completionPercentage, 0) / mappedStudents.length,
          2,
        )
      : 0;

  return {
    course: { id: course.id, title: course.title, totalLessons },
    summary: {
      totalStudents: mappedStudents.length,
      studentsCompleted,
      averageCompletionPercentage,
      totalTimeSpentSeconds,
    },
    students: mappedStudents,
  };
}

export { toStudentProgressReport, toCourseProgressReport };
