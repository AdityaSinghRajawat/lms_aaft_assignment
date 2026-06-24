export interface StudentCourseProgress {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  startedLessons: number;
  completionPercentage: number;
  totalTimeSpentSeconds: number;
}

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

export interface CourseStudentProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  completedLessons: number;
  completionPercentage: number;
  totalTimeSpentSeconds: number;
  isCompleted: boolean;
}

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
