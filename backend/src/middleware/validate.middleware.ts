import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError, type ApiErrorDetail } from '../utils/api-response.js';

export interface RequestValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validateRequest(schemas: RequestValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: ApiErrorDetail[] = [];

    if (schemas.params) {
      const parsed = schemas.params.safeParse(req.params);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errors.push({
            field: ['params', ...issue.path].join('.'),
            code: issue.code,
            message: issue.message,
          });
        }
      } else {
        req.params = parsed.data as Request['params'];
      }
    }

    if (schemas.query) {
      const parsed = schemas.query.safeParse(req.query);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errors.push({
            field: ['query', ...issue.path].join('.'),
            code: issue.code,
            message: issue.message,
          });
        }
      } else {
        req.query = parsed.data as Request['query'];
      }
    }

    if (schemas.body) {
      const parsed = schemas.body.safeParse(req.body);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errors.push({
            field: ['body', ...issue.path].join('.'),
            code: issue.code,
            message: issue.message,
          });
        }
      } else {
        req.body = parsed.data;
      }
    }

    if (errors.length > 0) {
      next(new AppError('Invalid request data', 400, errors));
      return;
    }

    next();
  };
}
