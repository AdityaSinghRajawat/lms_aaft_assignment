/** Per-course progress block within a student report. */
export interface StudentCourseProgress {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  startedLessons: number;
  completionPercentage: number;
  totalTimeSpentSeconds: number;
}

/** Student-wise progress report across all assigned courses. */
export interface StudentProgressReport {
  student: {
    id: string;
    name: string;
    email: string;
  };
  overall: {
    totalCourses: number;
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    totalTimeSpentSeconds: number;
  };
  courses: StudentCourseProgress[];
}

/** Per-student row within a course-wise report. */
export interface CourseStudentProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  completedLessons: number;
  completionPercentage: number;
  totalTimeSpentSeconds: number;
  isCompleted: boolean;
}

/** Course-wise completion report across all enrolled students. */
export interface CourseProgressReport {
  course: {
    id: string;
    title: string;
    totalLessons: number;
  };
  summary: {
    totalStudents: number;
    studentsCompleted: number;
    averageCompletionPercentage: number;
    totalTimeSpentSeconds: number;
  };
  students: CourseStudentProgress[];
}
