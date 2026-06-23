import Joi from 'joi';
import { uuid } from './common.validation';

export const createLessonSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(2000).allow('').optional(),
  videoUrl: Joi.string().uri().max(2048).required(),
  duration: Joi.number().integer().min(0).default(0),
  sortOrder: Joi.number().integer().min(0).default(0),
});

export const updateLessonSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(2000).allow(''),
  videoUrl: Joi.string().uri().max(2048),
  duration: Joi.number().integer().min(0),
  sortOrder: Joi.number().integer().min(0),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided to update' });

export const courseIdParamSchema = Joi.object({
  courseId: uuid.required(),
});

export const lessonParamsSchema = Joi.object({
  courseId: uuid.required(),
  lessonId: uuid.required(),
});
