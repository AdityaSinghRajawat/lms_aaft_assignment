import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema } from '../validations/auth.validation';

const router = Router();

// POST /api/auth/admin/login
router.post('/admin/login', validate(loginSchema), asyncHandler(authController.adminLogin));

// POST /api/auth/student/login
router.post('/student/login', validate(loginSchema), asyncHandler(authController.studentLogin));

// GET /api/auth/me — current authenticated user (admin or student)
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
