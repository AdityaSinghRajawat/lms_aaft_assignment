import { Request, Response } from 'express';
import { reportsService } from '../services/reports.service';
import { sendSuccess } from '../utils/response';

/**
 * Reports controller — request/response handling only.
 */
export const reportsController = {
  async studentProgress(req: Request, res: Response): Promise<void> {
    const report = await reportsService.studentProgress(req.params.studentId);
    sendSuccess(res, report, 'Student progress report generated successfully');
  },

  async courseProgress(req: Request, res: Response): Promise<void> {
    const report = await reportsService.courseProgress(req.params.courseId);
    sendSuccess(res, report, 'Course progress report generated successfully');
  },
};
