import { Router } from 'express';
import * as enrollmentsController from '../controllers/enrollments.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createEnrollmentSchema,
  listEnrollmentsQuerySchema,
  enrollmentIdParamSchema,
} from '../validations/enrollments.validation';

const router = Router();

router.use(authenticate, requireAdmin);

router.post('/', validate(createEnrollmentSchema), asyncHandler(enrollmentsController.create));
router.get('/', validate(listEnrollmentsQuerySchema, 'query'), asyncHandler(enrollmentsController.list));

router.delete(
  '/:enrollmentId',
  validate(enrollmentIdParamSchema, 'params'),
  asyncHandler(enrollmentsController.remove),
);

export default router;
