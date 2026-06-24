import { Router } from 'express';
import * as studentsController from '../controllers/students.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { idParamSchema } from '../validations/common.validation';
import {
  createStudentSchema,
  updateStudentSchema,
  listStudentsQuerySchema,
} from '../validations/students.validation';

const router = Router();

// All student-management routes are admin-only.
router.use(authenticate, requireAdmin);

// POST /api/admin/students
router.post('/', validate(createStudentSchema), asyncHandler(studentsController.create));

// GET /api/admin/students
router.get('/', validate(listStudentsQuerySchema, 'query'), asyncHandler(studentsController.list));

// GET /api/admin/students/:studentId
router.get(
  '/:studentId',
  validate(idParamSchema('studentId'), 'params'),
  asyncHandler(studentsController.getById),
);

// PUT /api/admin/students/:studentId
router.put(
  '/:studentId',
  validate(idParamSchema('studentId'), 'params'),
  validate(updateStudentSchema),
  asyncHandler(studentsController.update),
);

// DELETE /api/admin/students/:studentId
router.delete(
  '/:studentId',
  validate(idParamSchema('studentId'), 'params'),
  asyncHandler(studentsController.remove),
);

export default router;
