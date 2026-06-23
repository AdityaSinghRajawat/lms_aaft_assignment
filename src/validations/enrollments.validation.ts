import Joi from 'joi';
import { uuid } from './common.validation';

export const createEnrollmentSchema = Joi.object({
  studentId: uuid.required(),
  courseId: uuid.required(),
});

export const listEnrollmentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  studentId: uuid.optional(),
  courseId: uuid.optional(),
});

export const enrollmentIdParamSchema = Joi.object({
  enrollmentId: uuid.required(),
});
