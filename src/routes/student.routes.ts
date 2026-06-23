import { Router } from 'express';
import { studentCoursesController } from '../controllers/studentCourses.controller';
import { progressController } from '../controllers/progress.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireStudent } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationQuerySchema } from '../validations/common.validation';
import {
  upsertProgressSchema,
  lessonIdParamSchema,
  courseIdParamSchema,
} from '../validations/progress.validation';
import { lessonParamsSchema } from '../validations/lessons.validation';

const router = Router();

// Every student route requires an authenticated STUDENT.
router.use(authenticate, requireStudent);

// ── Course access ────────────────────────────────────────────────────────────
// GET /api/student/courses
router.get(
  '/courses',
  validate(paginationQuerySchema, 'query'),
  asyncHandler(studentCoursesController.listAssigned),
);

// GET /api/student/courses/:courseId
router.get(
  '/courses/:courseId',
  validate(courseIdParamSchema, 'params'),
  asyncHandler(studentCoursesController.getCourse),
);

// GET /api/student/courses/:courseId/progress
router.get(
  '/courses/:courseId/progress',
  validate(courseIdParamSchema, 'params'),
  asyncHandler(progressController.getCourseProgress),
);

// GET /api/student/courses/:courseId/lessons/:lessonId
router.get(
  '/courses/:courseId/lessons/:lessonId',
  validate(lessonParamsSchema, 'params'),
  asyncHandler(studentCoursesController.getLesson),
);

// ── Video progress ───────────────────────────────────────────────────────────
// POST /api/student/progress
router.post(
  '/progress',
  validate(upsertProgressSchema),
  asyncHandler(progressController.update),
);

// GET /api/student/progress/:lessonId
router.get(
  '/progress/:lessonId',
  validate(lessonIdParamSchema, 'params'),
  asyncHandler(progressController.getLessonProgress),
);

export default router;
