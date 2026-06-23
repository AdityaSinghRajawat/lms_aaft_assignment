import Joi from 'joi';

export const createCourseSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().max(2000).allow('').optional(),
  isPublished: Joi.boolean().optional(),
});

export const updateCourseSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().max(2000).allow(''),
  isPublished: Joi.boolean(),
})
  .min(1)
  .messages({ 'object.min': 'At least one field must be provided to update' });

export const listCoursesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).allow('').optional(),
});
