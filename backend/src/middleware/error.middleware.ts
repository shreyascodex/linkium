import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { AppError, sendError } from '../utils/api-response.js';

interface BodyParserError extends SyntaxError {
  status?: number;
  type?: string;
}

function isMalformedJsonError(err: unknown): err is BodyParserError {
  return (
    err instanceof SyntaxError &&
    typeof (err as BodyParserError).status === 'number' &&
    (err as BodyParserError).status === 400
  );
}

function isPayloadTooLargeError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type?: string }).type === 'entity.too.large'
  );
}

function isCorsRejectedError(err: unknown): boolean {
  return err instanceof Error && err.message === 'Origin not allowed by CORS';
}

function isDatabaseUnavailableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') {
    return false;
  }
  const maybeErr = err as { name?: string; code?: string; message?: string };
  if (
    maybeErr.name === 'PrismaClientInitializationError' ||
    maybeErr.name === 'PrismaClientRustPanicError'
  ) {
    return true;
  }
  if (
    maybeErr.code &&
    ['P1000', 'P1001', 'P1002', 'P1003', 'P1008', 'P1017'].includes(maybeErr.code)
  ) {
    return true;
  }
  if (
    typeof maybeErr.message === 'string' &&
    (maybeErr.message.includes("Can't reach database server") ||
      maybeErr.message.includes('ECONNREFUSED'))
  ) {
    return true;
  }
  return false;
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) {
    return;
  }

  if (isMalformedJsonError(err)) {
    sendError(res, {
      statusCode: 400,
      message: 'Invalid JSON request body',
      errors: [
        {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON.',
        },
      ],
    });
    return;
  }

  if (isPayloadTooLargeError(err)) {
    sendError(res, {
      statusCode: 413,
      message: 'Request payload too large',
      errors: [
        {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request body exceeds the allowed size limit.',
        },
      ],
    });
    return;
  }

  if (isCorsRejectedError(err)) {
    sendError(res, {
      statusCode: 403,
      message: 'Origin not allowed',
      errors: [
        {
          code: 'CORS_FORBIDDEN',
          message: 'Request origin is not permitted.',
        },
      ],
    });
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, {
      statusCode: 400,
      message: 'Invalid request data',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.') || undefined,
        code: issue.code,
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational || err.statusCode >= 500) {
      logger.error(
        {
          requestId: req.requestId,
          statusCode: err.statusCode,
          errName: err.name,
        },
        err.message
      );
    }

    const exposeSafeUpstream =
      err.isOperational && (err.statusCode === 502 || err.statusCode === 503);
    const hideDetails = err.statusCode >= 500 && !exposeSafeUpstream;

    sendError(res, {
      statusCode: err.statusCode,
      message: hideDetails ? 'Internal server error' : err.message,
      errors: hideDetails ? [] : err.errors,
    });
    return;
  }

  if (isDatabaseUnavailableError(err)) {
    logger.warn(
      {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
      },
      'Database unavailable during API request'
    );

    sendError(res, {
      statusCode: 503,
      message: 'Database is unavailable',
      errors: [
        {
          code: 'DATABASE_UNAVAILABLE',
          message: 'PostgreSQL connection is currently unavailable.',
        },
      ],
    });
    return;
  }

  logger.error(
    {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      errMessage: err instanceof Error ? err.message : 'Unknown error',
    },
    'Unhandled server error'
  );

  sendError(res, {
    statusCode: 500,
    message: 'Internal server error',
    errors: [],
  });
}
