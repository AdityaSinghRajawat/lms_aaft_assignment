import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { ApiError } from '../utils/apiError';

type RequestSegment = 'body' | 'query' | 'params';

export function validate(schema: ObjectSchema, segment: RequestSegment = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { value, error } = schema.validate(req[segment], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      throw ApiError.badRequest('Validation failed', details);
    }

    // `req.query`/`req.params` are read-only getters in Express 5 but plain
    // assignment works in Express 4; mutate in place to stay compatible.
    if (segment === 'body') req.body = value;
    else if (segment === 'params') req.params = value;
    else Object.assign(req.query, value);

    next();
  };
}
