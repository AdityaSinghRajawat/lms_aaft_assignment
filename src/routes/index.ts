import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import studentsRoutes from './students.routes';
import coursesRoutes from './courses.routes';
import enrollmentsRoutes from './enrollments.routes';
import reportsRoutes from './reports.routes';
import studentRoutes from './student.routes';

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
