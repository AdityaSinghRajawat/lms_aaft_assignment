import { ApiError } from '../../../src/utils/apiError';
import { HTTP_STATUS } from '../../../src/constants/http.constants';

describe('ApiError', () => {
  it('is an Error subclass marked operational', () => {
    const err = new ApiError(HTTP_STATUS.BAD_REQUEST, 'boom');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe('ApiError');
  });

  it('carries optional details', () => {
    const details = [{ field: 'email', message: 'invalid' }];
    const err = ApiError.badRequest('Validation failed', details);
    expect(err.details).toEqual(details);
  });

  describe.each([
    ['badRequest', HTTP_STATUS.BAD_REQUEST, 'Bad request'],
    ['unauthorized', HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'],
    ['forbidden', HTTP_STATUS.FORBIDDEN, 'Forbidden'],
    ['notFound', HTTP_STATUS.NOT_FOUND, 'Resource not found'],
    ['conflict', HTTP_STATUS.CONFLICT, 'Resource already exists'],
    ['internal', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal server error'],
  ] as const)('%s factory', (method, status, defaultMessage) => {
    it(`maps to ${status} with a default message`, () => {
      const err = (ApiError[method] as (msg?: string) => ApiError)();
      expect(err.statusCode).toBe(status);
      expect(err.message).toBe(defaultMessage);
    });

    it('honours a custom message', () => {
      const err = (ApiError[method] as (msg?: string) => ApiError)('custom');
      expect(err.message).toBe('custom');
    });
  });
});
