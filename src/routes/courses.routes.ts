import { Router } from 'express';
import { coursesController } from '../controllers/courses.controller';
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

// All admin course/lesson routes are admin-only.
router.use(authenticate, requireAdmin);

// Nested lesson routes: /api/admin/courses/:courseId/lessons/...
router.use('/:courseId/lessons', lessonsRouter);

// POST /api/admin/courses
router.post('/', validate(createCourseSchema), asyncHandler(coursesController.create));

// GET /api/admin/courses
router.get('/', validate(listCoursesQuerySchema, 'query'), asyncHandler(coursesController.list));

// GET /api/admin/courses/:courseId
router.get(
  '/:courseId',
  validate(idParamSchema('courseId'), 'params'),
  asyncHandler(coursesController.getById),
);

// PUT /api/admin/courses/:courseId
router.put(
  '/:courseId',
  validate(idParamSchema('courseId'), 'params'),
  validate(updateCourseSchema),
  asyncHandler(coursesController.update),
);

// DELETE /api/admin/courses/:courseId
router.delete(
  '/:courseId',
  validate(idParamSchema('courseId'), 'params'),
  asyncHandler(coursesController.remove),
);

export default router;
