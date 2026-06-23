import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validations/common.validation';

const router = Router();

// Reporting is admin-only.
router.use(authenticate, requireAdmin);

// GET /api/admin/reports/students/:studentId/progress
router.get(
  '/students/:studentId/progress',
  validate(idParamSchema('studentId'), 'params'),
  asyncHandler(reportsController.studentProgress),
);

// GET /api/admin/reports/courses/:courseId/progress
router.get(
  '/courses/:courseId/progress',
  validate(idParamSchema('courseId'), 'params'),
  asyncHandler(reportsController.courseProgress),
);

export default router;
