import { Request, Response } from 'express';
import { studentsService } from '../services/students.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { resolvePagination, buildPaginationMeta } from '../utils/pagination';

/**
 * Students controller — request/response handling only.
 */
export const studentsController = {
  async create(req: Request, res: Response): Promise<void> {
    const student = await studentsService.createStudent(req.body);
    sendCreated(res, student, 'Student created successfully');
  },

  async list(req: Request, res: Response): Promise<void> {
    const pagination = resolvePagination(req.query.page, req.query.limit);
    const search = req.query.search as string | undefined;
    const { items, totalItems } = await studentsService.listStudents(pagination, search || undefined);
    sendSuccess(res, items, 'Students fetched successfully', 200, buildPaginationMeta(totalItems, pagination));
  },

  async getById(req: Request, res: Response): Promise<void> {
    const student = await studentsService.getStudentById(req.params.studentId);
    sendSuccess(res, student, 'Student fetched successfully');
  },

  async update(req: Request, res: Response): Promise<void> {
    const student = await studentsService.updateStudent(req.params.studentId, req.body);
    sendSuccess(res, student, 'Student updated successfully');
  },

  async remove(req: Request, res: Response): Promise<void> {
    await studentsService.deleteStudent(req.params.studentId);
    sendSuccess(res, null, 'Student deleted successfully');
  },
};
