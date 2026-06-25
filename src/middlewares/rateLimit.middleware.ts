import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../constants/rateLimit.constants';
import { HTTP_STATUS } from '../constants/http.constants';
import { isTest } from '../config/env';
import { ApiError } from '../utils/apiError';

// Disabled under NODE_ENV=test so the integration suite isn't throttled.
export const apiRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  limit: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => isTest,
  handler: (_req, _res, next) => {
    next(new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, 'Too many requests, please try again later'));
  },
});
