import { Router } from 'express';
import { enrollmentsController } from '../controllers/enrollments.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createEnrollmentSchema,
  listEnrollmentsQuerySchema,
  enrollmentIdParamSchema,
} from '../validations/enrollments.validation';

const router = Router();

// Course assignment is admin-only.
router.use(authenticate, requireAdmin);

// POST /api/admin/enrollments
router.post('/', validate(createEnrollmentSchema), asyncHandler(enrollmentsController.create));

// GET /api/admin/enrollments?studentId=&courseId=
router.get(
  '/',
  validate(listEnrollmentsQuerySchema, 'query'),
  asyncHandler(enrollmentsController.list),
);

// DELETE /api/admin/enrollments/:enrollmentId
router.delete(
  '/:enrollmentId',
  validate(enrollmentIdParamSchema, 'params'),
  asyncHandler(enrollmentsController.remove),
);

export default router;
