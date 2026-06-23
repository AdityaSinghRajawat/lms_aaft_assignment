import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import studentsRoutes from './students.routes';
import coursesRoutes from './courses.routes';
import enrollmentsRoutes from './enrollments.routes';
import reportsRoutes from './reports.routes';
import studentRoutes from './student.routes';

/**
 * Root API router — composes every resource router under its base path.
 *
 *   /auth                 → admin & student login + profile
 *   /admin/students       → student management (admin)
 *   /admin/courses        → course + nested lesson management (admin)
 *   /admin/enrollments    → course assignment (admin)
 *   /admin/reports        → analytics (admin)
 *   /student              → student course access + video progress
 */
const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'OK', data: { status: 'healthy' } });
});

router.use('/auth', authRoutes);
router.use('/admin/students', studentsRoutes);
router.use('/admin/courses', coursesRoutes);
router.use('/admin/enrollments', enrollmentsRoutes);
router.use('/admin/reports', reportsRoutes);
router.use('/student', studentRoutes);

export default router;
