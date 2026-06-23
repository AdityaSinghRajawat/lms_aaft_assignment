import Joi from 'joi';
import { passwordRule } from './common.validation';

export const createStudentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: passwordRule.required(),
});

export const updateStudentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  email: Joi.string().email().lowercase().trim(),
  password: passwordRule,
  isActive: Joi.boolean(),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided to update' });

export const listStudentsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(120).allow('').optional(),
});
