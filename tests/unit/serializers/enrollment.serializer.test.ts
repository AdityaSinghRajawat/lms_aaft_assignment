import { toAssignedCourses } from '../../../src/serializers/enrollment.serializer';
import { EPOCH } from '../../support/factories';

function buildAssignedEnrollment(overrides: { id?: string; lessons?: number } = {}) {
  return {
    id: overrides.id ?? 'enrollment-1',
    createdAt: EPOCH,
    course: {
      id: 'course-1',
      title: 'Intro to TypeScript',
      description: 'desc',
      isPublished: true,
      createdAt: EPOCH,
      updatedAt: EPOCH,
      _count: { lessons: overrides.lessons ?? 3 },
    },
  };
}

describe('enrollment.serializer', () => {
  it('maps an enrollment to the assigned-course view with lesson count', () => {
    const [view] = toAssignedCourses([buildAssignedEnrollment()]);

    expect(view).toEqual({
      enrollmentId: 'enrollment-1',
      assignedAt: EPOCH,
      course: {
        id: 'course-1',
        title: 'Intro to TypeScript',
        description: 'desc',
        isPublished: true,
        totalLessons: 3,
        createdAt: EPOCH,
        updatedAt: EPOCH,
      },
    });
  });

  it('does not leak the raw _count object onto the view', () => {
    const [view] = toAssignedCourses([buildAssignedEnrollment()]);
    expect(view.course).not.toHaveProperty('_count');
  });

  it('returns an empty array when there are no enrollments', () => {
    expect(toAssignedCourses([])).toEqual([]);
  });
});
