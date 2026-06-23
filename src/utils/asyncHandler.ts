import { NextFunction, Request, Response, RequestHandler } from 'express';

/**
 * Wrap an async route handler so rejected promises are forwarded
 * to the Express error middleware instead of crashing the process.
 * Generic + stateless utility.
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
