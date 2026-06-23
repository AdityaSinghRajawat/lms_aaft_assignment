import { Request, Response } from 'express';
import { coursesService } from '../services/courses.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { resolvePagination, buildPaginationMeta } from '../utils/pagination';

/**
 * Courses controller — request/response handling only.
 */
export const coursesController = {
  async create(req: Request, res: Response): Promise<void> {
    const course = await coursesService.createCourse(req.body);
    sendCreated(res, course, 'Course created successfully');
  },

  async list(req: Request, res: Response): Promise<void> {
    const pagination = resolvePagination(req.query.page, req.query.limit);
    const search = req.query.search as string | undefined;
    const { items, totalItems } = await coursesService.listCourses(pagination, search || undefined);
    sendSuccess(res, items, 'Courses fetched successfully', 200, buildPaginationMeta(totalItems, pagination));
  },

  async getById(req: Request, res: Response): Promise<void> {
    const course = await coursesService.getCourseWithLessons(req.params.courseId);
    sendSuccess(res, course, 'Course fetched successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const course = await coursesService.updateCourse(req.params.courseId, req.body);
    sendSuccess(res, course, 'Course updated successfully');
  },

  async remove(req: Request, res: Response): Promise<void> {
    await coursesService.deleteCourse(req.params.courseId);
    sendSuccess(res, null, 'Course deleted successfully');
  },
};
