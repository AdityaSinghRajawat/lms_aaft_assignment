export interface CreateEnrollmentInput {
  studentId: string;
  courseId: string;
}

export interface EnrollmentFilter {
  studentId?: string;
  courseId?: string;
}
