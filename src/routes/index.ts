import { Router } from 'express';
import authRoutes from './auth.routes';
import studentsRoutes from './students.routes';
import coursesRoutes from './courses.routes';
import enrollmentsRoutes from './enrollments.routes';
import reportsRoutes from './reports.routes';
import studentRoutes from './student.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin/students', studentsRoutes);
router.use('/admin/courses', coursesRoutes);
router.use('/admin/enrollments', enrollmentsRoutes);
router.use('/admin/reports', reportsRoutes);
router.use('/student', studentRoutes);

export default router;
