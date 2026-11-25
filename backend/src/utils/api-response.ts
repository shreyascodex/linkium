import type { Response } from 'express';

export interface ApiErrorDetail {
  field?: string;
  code?: string;
  message: string;
}

export interface ApiSuccessPayload<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: ApiErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errors: ApiErrorDetail[] = [],
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function sendSuccess<T>(
  res: Response,
  options: {
    statusCode?: number;
    message: string;
    data: T;
  }
): Response<ApiSuccessPayload<T>> {
  const { statusCode = 200, message, data } = options;
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  options: {
    statusCode?: number;
    message: string;
    errors?: ApiErrorDetail[];
  }
): Response<ApiErrorPayload> {
  const { statusCode = 500, message, errors = [] } = options;
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
