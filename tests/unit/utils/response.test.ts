import { Response } from 'express';
import { sendSuccess, sendCreated, sendError } from '../../../src/utils/response';
import { HTTP_STATUS } from '../../../src/constants/http.constants';
import { PaginationMeta } from '../../../src/types/common';

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('response util', () => {
  describe('sendSuccess', () => {
    it('defaults to 200 and the standard success envelope', () => {
      const res = mockResponse();

      sendSuccess(res, { id: 1 });

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Success', data: { id: 1 } });
    });

    it('uses the provided message and status code', () => {
      const res = mockResponse();

      sendSuccess(res, [], 'Fetched', HTTP_STATUS.OK);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Fetched', data: [] });
    });

    it('includes pagination meta only when supplied', () => {
      const res = mockResponse();
      const meta: PaginationMeta = {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      sendSuccess(res, [], 'Listed', HTTP_STATUS.OK, meta);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Listed', data: [], meta });
    });
  });

  describe('sendCreated', () => {
    it('responds with 201', () => {
      const res = mockResponse();

      sendCreated(res, { id: 1 }, 'Made');

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Made', data: { id: 1 } });
    });
  });

  describe('sendError', () => {
    it('produces the error envelope without an errors field by default', () => {
      const res = mockResponse();

      sendError(res, HTTP_STATUS.NOT_FOUND, 'Not found');

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
    });

    it('includes the errors field when provided', () => {
      const res = mockResponse();
      const errors = [{ field: 'email', message: 'required' }];

      sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Validation failed', errors });
    });
  });
});
