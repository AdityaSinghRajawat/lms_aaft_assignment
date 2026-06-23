import { Request, Response } from 'express';
import { studentCoursesService } from '../services/studentCourses.service';
import { sendSuccess } from '../utils/response';
import { resolvePagination, buildPaginationMeta } from '../utils/pagination';

/**
 * Student course-access controller — request/response handling only.
 */
export const studentCoursesController = {
  async listAssigned(req: Request, res: Response): Promise<void> {
    const pagination = resolvePagination(req.query.page, req.query.limit);
    const { items, totalItems } = await studentCoursesService.listAssignedCourses(
      req.user!.sub,
      pagination,
    );
    sendSuccess(res, items, 'Assigned courses fetched successfully', 200, buildPaginationMeta(totalItems, pagination));
  },

  async getCourse(req: Request, res: Response): Promise<void> {
    const course = await studentCoursesService.getAssignedCourseDetail(
      req.user!.sub,
      req.params.courseId,
    );
    sendSuccess(res, course, 'Course details fetched successfully');
  },

  async getLesson(req: Request, res: Response): Promise<void> {
    const lesson = await studentCoursesService.getLessonDetail(
      req.user!.sub,
      req.params.courseId,
      req.params.lessonId,
    );
    sendSuccess(res, lesson, 'Lesson details fetched successfully');
  },
};
