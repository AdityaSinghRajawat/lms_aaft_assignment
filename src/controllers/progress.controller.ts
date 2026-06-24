import { Request, Response } from 'express';
import * as progressService from '../services/progress.service';
import { sendSuccess } from '../utils/response';

async function update(req: Request, res: Response): Promise<void> {
  const progress = await progressService.updateProgress(req.user!.sub, req.body);
  sendSuccess(res, progress, 'Progress updated successfully');
}

async function getLessonProgress(req: Request, res: Response): Promise<void> {
  const progress = await progressService.getLessonProgress(req.user!.sub, req.params.lessonId);
  sendSuccess(res, progress, 'Lesson progress fetched successfully');
}

async function getCourseProgress(req: Request, res: Response): Promise<void> {
  const progress = await progressService.getCourseProgress(req.user!.sub, req.params.courseId);
  sendSuccess(res, progress, 'Course progress fetched successfully');
}

export { update, getLessonProgress, getCourseProgress };
