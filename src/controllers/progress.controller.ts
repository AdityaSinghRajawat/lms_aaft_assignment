import { Request, Response } from 'express';
import { progressService } from '../services/progress.service';
import { sendSuccess } from '../utils/response';

/**
 * Video progress controller — request/response handling only.
 */
export const progressController = {
  async update(req: Request, res: Response): Promise<void> {
    const progress = await progressService.updateProgress(req.user!.sub, req.body);
    sendSuccess(res, progress, 'Progress updated successfully');
  },

  async getLessonProgress(req: Request, res: Response): Promise<void> {
    const progress = await progressService.getLessonProgress(req.user!.sub, req.params.lessonId);
    sendSuccess(res, progress, 'Lesson progress fetched successfully');
  },

  async getCourseProgress(req: Request, res: Response): Promise<void> {
    const progress = await progressService.getCourseProgress(req.user!.sub, req.params.courseId);
    sendSuccess(res, progress, 'Course progress fetched successfully');
  },
};
