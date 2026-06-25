import { Router } from 'express';
import * as lessonsController from '../controllers/lessons.controller';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createLessonSchema,
  updateLessonSchema,
  courseIdParamSchema,
  lessonParamsSchema,
} from '../validations/lessons.validation';

// `mergeParams` exposes the parent router's :courseId. Auth is applied by the
// parent courses router, so this router intentionally has no guard of its own.
const router = Router({ mergeParams: true });

router.post(
  '/',
  validate(courseIdParamSchema, 'params'),
  validate(createLessonSchema),
  asyncHandler(lessonsController.create),
);

router.get('/', validate(courseIdParamSchema, 'params'), asyncHandler(lessonsController.list));

router.get(
  '/:lessonId',
  validate(lessonParamsSchema, 'params'),
  asyncHandler(lessonsController.getById),
);

router.put(
  '/:lessonId',
  validate(lessonParamsSchema, 'params'),
  validate(updateLessonSchema),
  asyncHandler(lessonsController.update),
);

router.delete(
  '/:lessonId',
  validate(lessonParamsSchema, 'params'),
  asyncHandler(lessonsController.remove),
);

export default router;
