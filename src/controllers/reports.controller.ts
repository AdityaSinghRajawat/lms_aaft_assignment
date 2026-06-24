import { Request, Response } from 'express';
import * as reportsService from '../services/reports.service';
import { sendSuccess } from '../utils/response';

async function studentProgress(req: Request, res: Response): Promise<void> {
  const report = await reportsService.studentProgress(req.params.studentId);
  sendSuccess(res, report, 'Student progress report generated successfully');
}

async function courseProgress(req: Request, res: Response): Promise<void> {
  const report = await reportsService.courseProgress(req.params.courseId);
  sendSuccess(res, report, 'Course progress report generated successfully');
}

export { studentProgress, courseProgress };
