import Joi from 'joi';
import { PAGINATION } from '../constants/pagination.constants';
import { PASSWORD } from '../constants/security.constants';

export const uuid = Joi.string().uuid({ version: ['uuidv4'] });

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(PAGINATION.MIN_PAGE).default(PAGINATION.DEFAULT_PAGE),
  limit: Joi.number()
    .integer()
    .min(PAGINATION.MIN_LIMIT)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
});

export function idParamSchema(name: string): Joi.ObjectSchema {
  return Joi.object({
    [name]: uuid.required(),
  });
}

export const passwordRule = Joi.string()
  .min(PASSWORD.MIN_LENGTH)
  .max(PASSWORD.MAX_LENGTH)
  .messages({
    'string.min': `password must be at least ${PASSWORD.MIN_LENGTH} characters long`,
  });
