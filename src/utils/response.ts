import { Response } from 'express';
import { PaginationMeta } from '../types/common';
import { HTTP_STATUS } from '../constants/http.constants';

export interface SuccessBody<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorBody {
  success: false;
  message: string;
  errors?: unknown;
}

function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: number = HTTP_STATUS.OK,
  meta?: PaginationMeta,
): Response<SuccessBody<T>> {
  const body: SuccessBody<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function sendCreated<T>(res: Response, data: T, message = 'Created'): Response<SuccessBody<T>> {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
): Response<ErrorBody> {
  const body: ErrorBody = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return res.status(statusCode).json(body);
}

export { sendSuccess, sendCreated, sendError };
