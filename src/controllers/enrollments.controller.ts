import { Request, Response } from 'express';
import * as enrollmentsService from '../services/enrollments.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { resolvePagination, buildPaginationMeta } from '../utils/pagination';

async function create(req: Request, res: Response): Promise<void> {
  const enrollment = await enrollmentsService.assignCourse(req.body, req.user!.sub);
  sendCreated(res, enrollment, 'Course assigned to student successfully');
}

async function list(req: Request, res: Response): Promise<void> {
  const pagination = resolvePagination(req.query.page, req.query.limit);
  const { items, totalItems } = await enrollmentsService.listEnrollments(
    {
      studentId: req.query.studentId as string | undefined,
      courseId: req.query.courseId as string | undefined,
    },
    pagination,
  );
  sendSuccess(res, items, 'Enrollments fetched successfully', 200, buildPaginationMeta(totalItems, pagination));
}

async function remove(req: Request, res: Response): Promise<void> {
  await enrollmentsService.removeEnrollment(req.params.enrollmentId);
  sendSuccess(res, null, 'Enrollment removed successfully');
}

export { create, list, remove };
