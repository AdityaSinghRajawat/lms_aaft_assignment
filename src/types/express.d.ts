import { AuthPayload } from './common';

/**
 * Augment Express' Request with the authenticated user payload,
 * populated by the auth middleware after JWT verification.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export {};
