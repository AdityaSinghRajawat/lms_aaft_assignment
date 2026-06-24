import { uuid, paginationQuerySchema } from './common.validation';
import Joi from 'joi';

export const createEnrollmentSchema = Joi.object({
  studentId: uuid.required(),
  courseId: uuid.required(),
});

export const listEnrollmentsQuerySchema = paginationQuerySchema.keys({
  studentId: uuid.optional(),
  courseId: uuid.optional(),
});

export const enrollmentIdParamSchema = Joi.object({
  enrollmentId: uuid.required(),
});
