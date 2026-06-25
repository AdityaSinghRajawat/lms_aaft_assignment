import { Router } from 'express';
import * as coursesController from '../controllers/courses.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validations/common.validation';
import {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
} from '../validations/courses.validation';
import lessonsRouter from './lessons.routes';

const router = Router();

router.use(authenticate, requireAdmin);
router.use('/:courseId/lessons', lessonsRouter);

router.post('/', validate(createCourseSchema), asyncHandler(coursesController.create));
router.get('/', validate(listCoursesQuerySchema, 'query'), asyncHandler(coursesController.list));

router.get(
  '/:courseId',
  validate(idParamSchema('courseId'), 'params'),
  asyncHandler(coursesController.getById),
);

router.put(
  '/:courseId',
  validate(idParamSchema('courseId'), 'params'),
  validate(updateCourseSchema),
  asyncHandler(coursesController.update),
);

router.delete(
  '/:courseId',
  validate(idParamSchema('courseId'), 'params'),
  asyncHandler(coursesController.remove),
);

export default router;
