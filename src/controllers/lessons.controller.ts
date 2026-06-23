import { Request, Response } from 'express';
import { lessonsService } from '../services/lessons.service';
import { sendSuccess, sendCreated } from '../utils/response';

/**
 * Lessons controller — request/response handling only.
 */
export const lessonsController = {
  async create(req: Request, res: Response): Promise<void> {
    const lesson = await lessonsService.createLesson(req.params.courseId, req.body);
    sendCreated(res, lesson, 'Lesson created successfully');
  },

  async list(req: Request, res: Response): Promise<void> {
    const lessons = await lessonsService.listLessons(req.params.courseId);
    sendSuccess(res, lessons, 'Lessons fetched successfully');
  },

  async getById(req: Request, res: Response): Promise<void> {
    const lesson = await lessonsService.getLesson(req.params.courseId, req.params.lessonId);
    sendSuccess(res, lesson, 'Lesson fetched successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const lesson = await lessonsService.updateLesson(
      req.params.courseId,
      req.params.lessonId,
      req.body,
    );
    sendSuccess(res, lesson, 'Lesson updated successfully');
  },

  async remove(req: Request, res: Response): Promise<void> {
    await lessonsService.deleteLesson(req.params.courseId, req.params.lessonId);
    sendSuccess(res, null, 'Lesson deleted successfully');
  },
};
