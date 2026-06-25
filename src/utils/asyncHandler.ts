import { NextFunction, Request, Response, RequestHandler } from 'express';

// Express 4 doesn't catch rejected promises from async handlers; forward them to
// the error middleware so they surface as proper responses instead of crashing.
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
