import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema } from '../validations/auth.validation';

const router = Router();

router.post('/admin/login', validate(loginSchema), asyncHandler(authController.adminLogin));
router.post('/student/login', validate(loginSchema), asyncHandler(authController.studentLogin));
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
