import { Request, Response } from 'express';
import * as studentCoursesService from '../services/studentCourses.service';
import { sendSuccess } from '../utils/response';
import { resolvePagination, buildPaginationMeta } from '../utils/pagination';
import { HTTP_STATUS } from '../constants/http.constants';

async function listAssigned(req: Request, res: Response): Promise<void> {
  const pagination = resolvePagination(req.query.page, req.query.limit);
  const { items, totalItems } = await studentCoursesService.listAssignedCourses(req.user!.sub, pagination);
  sendSuccess(res, items, 'Assigned courses fetched successfully', HTTP_STATUS.OK, buildPaginationMeta(totalItems, pagination));
}

async function getCourse(req: Request, res: Response): Promise<void> {
  const course = await studentCoursesService.getAssignedCourseDetail(req.user!.sub, req.params.courseId);
  sendSuccess(res, course, 'Course details fetched successfully');
}

async function getLesson(req: Request, res: Response): Promise<void> {
  const lesson = await studentCoursesService.getLessonDetail(
    req.user!.sub,
    req.params.courseId,
    req.params.lessonId,
  );
  sendSuccess(res, lesson, 'Lesson details fetched successfully');
}

export { listAssigned, getCourse, getLesson };
