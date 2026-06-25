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

router.use(authenticate, requireAdmin);

router.post('/', validate(createStudentSchema), asyncHandler(studentsController.create));
router.get('/', validate(listStudentsQuerySchema, 'query'), asyncHandler(studentsController.list));

router.get(
  '/:studentId',
  validate(idParamSchema('studentId'), 'params'),
  asyncHandler(studentsController.getById),
);

router.put(
  '/:studentId',
  validate(idParamSchema('studentId'), 'params'),
  validate(updateStudentSchema),
  asyncHandler(studentsController.update),
);

router.delete(
  '/:studentId',
  validate(idParamSchema('studentId'), 'params'),
  asyncHandler(studentsController.remove),
);

export default router;
