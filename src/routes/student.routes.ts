import { Router } from 'express';
import * as studentCoursesController from '../controllers/studentCourses.controller';
import * as progressController from '../controllers/progress.controller';
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

router.use(authenticate, requireStudent);

router.get(
  '/courses',
  validate(paginationQuerySchema, 'query'),
  asyncHandler(studentCoursesController.listAssigned),
);

router.get(
  '/courses/:courseId',
  validate(courseIdParamSchema, 'params'),
  asyncHandler(studentCoursesController.getCourse),
);

router.get(
  '/courses/:courseId/progress',
  validate(courseIdParamSchema, 'params'),
  asyncHandler(progressController.getCourseProgress),
);

router.get(
  '/courses/:courseId/lessons/:lessonId',
  validate(lessonParamsSchema, 'params'),
  asyncHandler(studentCoursesController.getLesson),
);

router.post('/progress', validate(upsertProgressSchema), asyncHandler(progressController.update));

router.get(
  '/progress/:lessonId',
  validate(lessonIdParamSchema, 'params'),
  asyncHandler(progressController.getLessonProgress),
);

export default router;
