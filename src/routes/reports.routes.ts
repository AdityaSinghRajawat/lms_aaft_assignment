import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validations/common.validation';

const router = Router();

router.use(authenticate, requireAdmin);

router.get(
  '/students/:studentId/progress',
  validate(idParamSchema('studentId'), 'params'),
  asyncHandler(reportsController.studentProgress),
);

router.get(
  '/courses/:courseId/progress',
  validate(idParamSchema('courseId'), 'params'),
  asyncHandler(reportsController.courseProgress),
);

export default router;
