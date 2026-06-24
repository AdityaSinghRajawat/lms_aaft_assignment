import Joi from 'joi';
import { uuid } from './common.validation';
import { PROGRESS } from '../constants/progress.constants';

export const upsertProgressSchema = Joi.object({
  lessonId: uuid.required(),
  lastPositionSeconds: Joi.number().integer().min(0).required(),
  percentage: Joi.number().min(PROGRESS.MIN_PERCENT).max(PROGRESS.MAX_PERCENT).required(),
  completed: Joi.boolean().optional(),
  timeSpentDeltaSeconds: Joi.number().integer().min(0).default(0),
});

export const lessonIdParamSchema = Joi.object({
  lessonId: uuid.required(),
});

export const courseIdParamSchema = Joi.object({
  courseId: uuid.required(),
});
