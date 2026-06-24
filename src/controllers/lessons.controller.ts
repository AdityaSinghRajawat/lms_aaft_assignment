import { Request, Response } from 'express';
import * as lessonsService from '../services/lessons.service';
import { sendSuccess, sendCreated } from '../utils/response';

async function create(req: Request, res: Response): Promise<void> {
  const lesson = await lessonsService.createLesson(req.params.courseId, req.body);
  sendCreated(res, lesson, 'Lesson created successfully');
}

async function list(req: Request, res: Response): Promise<void> {
  const lessons = await lessonsService.listLessons(req.params.courseId);
  sendSuccess(res, lessons, 'Lessons fetched successfully');
}

async function getById(req: Request, res: Response): Promise<void> {
  const lesson = await lessonsService.getLesson(req.params.courseId, req.params.lessonId);
  sendSuccess(res, lesson, 'Lesson fetched successfully');
}

async function update(req: Request, res: Response): Promise<void> {
  const lesson = await lessonsService.updateLesson(req.params.courseId, req.params.lessonId, req.body);
  sendSuccess(res, lesson, 'Lesson updated successfully');
}

async function remove(req: Request, res: Response): Promise<void> {
  await lessonsService.deleteLesson(req.params.courseId, req.params.lessonId);
  sendSuccess(res, null, 'Lesson deleted successfully');
}

export { create, list, getById, update, remove };
