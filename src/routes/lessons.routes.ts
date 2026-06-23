import { Router } from 'express';
import { lessonsController } from '../controllers/lessons.controller';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createLessonSchema,
  updateLessonSchema,
  courseIdParamSchema,
  lessonParamsSchema,
} from '../validations/lessons.validation';

/**
 * Admin lesson routes, nested under /api/admin/courses/:courseId/lessons.
 * `mergeParams` exposes :courseId from the parent router.
 * Mounted behind the admin auth guard by the courses router.
 */
const router = Router({ mergeParams: true });

// POST /api/admin/courses/:courseId/lessons
router.post(
  '/',
  validate(courseIdParamSchema, 'params'),
  validate(createLessonSchema),
  asyncHandler(lessonsController.create),
);

// GET /api/admin/courses/:courseId/lessons
router.get(
  '/',
  validate(courseIdParamSchema, 'params'),
  asyncHandler(lessonsController.list),
);

// GET /api/admin/courses/:courseId/lessons/:lessonId
router.get(
  '/:lessonId',
  validate(lessonParamsSchema, 'params'),
  asyncHandler(lessonsController.getById),
);

// PUT /api/admin/courses/:courseId/lessons/:lessonId
router.put(
  '/:lessonId',
  validate(lessonParamsSchema, 'params'),
  validate(updateLessonSchema),
  asyncHandler(lessonsController.update),
);

// DELETE /api/admin/courses/:courseId/lessons/:lessonId
router.delete(
  '/:lessonId',
  validate(lessonParamsSchema, 'params'),
  asyncHandler(lessonsController.remove),
);

export default router;
