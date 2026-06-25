import { Course, Enrollment, Lesson, Role, User, VideoProgress } from '@prisma/client';

/**
 * Deterministic entity factories for unit tests.
 * Every field has a sensible default; pass `overrides` to vary a single field
 * without repeating the whole object (no duplicated setup across test files).
 */
const EPOCH = new Date('2026-01-01T00:00:00.000Z');

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@student.test',
    password: 'hashed-password',
    role: Role.STUDENT,
    isActive: true,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    deletedAt: null,
    ...overrides,
  };
}

function buildAdmin(overrides: Partial<User> = {}): User {
  return buildUser({ id: 'admin-1', name: 'Admin', email: 'admin@lms.test', role: Role.ADMIN, ...overrides });
}

function buildCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'course-1',
    title: 'Intro to TypeScript',
    description: 'A gentle introduction.',
    isPublished: true,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    deletedAt: null,
    ...overrides,
  };
}

function buildLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: 'lesson-1',
    courseId: 'course-1',
    title: 'Variables & Types',
    description: 'Lesson description.',
    videoUrl: 'https://cdn.lms.test/v1.mp4',
    duration: 600,
    sortOrder: 1,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    deletedAt: null,
    ...overrides,
  };
}

function buildEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  return {
    id: 'enrollment-1',
    studentId: 'user-1',
    courseId: 'course-1',
    assignedById: 'admin-1',
    createdAt: EPOCH,
    updatedAt: EPOCH,
    deletedAt: null,
    ...overrides,
  };
}

function buildVideoProgress(overrides: Partial<VideoProgress> = {}): VideoProgress {
  return {
    id: 'progress-1',
    studentId: 'user-1',
    lessonId: 'lesson-1',
    courseId: 'course-1',
    lastPositionSeconds: 120,
    percentage: 50,
    completed: false,
    timeSpentSeconds: 120,
    completedAt: null,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    deletedAt: null,
    ...overrides,
  };
}

export { EPOCH, buildUser, buildAdmin, buildCourse, buildLesson, buildEnrollment, buildVideoProgress };
