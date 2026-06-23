import Joi from 'joi';

/** Reusable Joi fragments shared across resource validations. */
export const uuid = Joi.string().uuid({ version: ['uuidv4'] });

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

/** Build a params schema validating a single uuid path parameter. */
export function idParamSchema(name: string): Joi.ObjectSchema {
  return Joi.object({
    [name]: uuid.required(),
  });
}

export const passwordRule = Joi.string().min(8).max(128).messages({
  'string.min': 'password must be at least 8 characters long',
});
