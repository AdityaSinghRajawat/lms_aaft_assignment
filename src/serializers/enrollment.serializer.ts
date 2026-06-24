interface AssignedEnrollment {
  id: string;
  createdAt: Date;
  course: {
    id: string;
    title: string;
    description: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: { lessons: number };
  };
}

interface AssignedCourseView {
  enrollmentId: string;
  assignedAt: Date;
  course: {
    id: string;
    title: string;
    description: string | null;
    isPublished: boolean;
    totalLessons: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

function toAssignedCourse(enrollment: AssignedEnrollment): AssignedCourseView {
  return {
    enrollmentId: enrollment.id,
    assignedAt: enrollment.createdAt,
    course: {
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      isPublished: enrollment.course.isPublished,
      totalLessons: enrollment.course._count.lessons,
      createdAt: enrollment.course.createdAt,
      updatedAt: enrollment.course.updatedAt,
    },
  };
}

function toAssignedCourses(enrollments: AssignedEnrollment[]): AssignedCourseView[] {
  return enrollments.map(toAssignedCourse);
}

export { toAssignedCourses };
export type { AssignedCourseView };
