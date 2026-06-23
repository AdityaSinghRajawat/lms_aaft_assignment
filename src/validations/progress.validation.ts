import Joi from 'joi';
import { uuid } from './common.validation';

export const upsertProgressSchema = Joi.object({
  lessonId: uuid.required(),
  lastPositionSeconds: Joi.number().integer().min(0).required(),
  percentage: Joi.number().min(0).max(100).required(),
  completed: Joi.boolean().optional(),
  timeSpentDeltaSeconds: Joi.number().integer().min(0).default(0),
});

export const lessonIdParamSchema = Joi.object({
  lessonId: uuid.required(),
});

export const courseIdParamSchema = Joi.object({
  courseId: uuid.required(),
});
