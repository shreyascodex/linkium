import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/api-response.js';
import { hashToken, timingSafeEqualHex } from '../utils/crypto.js';

export function requireCsrf(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.auth) {
    next(
      new AppError('Authentication required', 401, [
        {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authenticated session required before CSRF verification.',
        },
      ])
    );
    return;
  }

  const csrfHeader = req.header('x-csrf-token');
  if (!csrfHeader || csrfHeader.trim().length === 0) {
    next(
      new AppError('CSRF token missing', 403, [
        {
          code: 'CSRF_TOKEN_MISSING',
          message: 'X-CSRF-Token header is required for this request.',
        },
      ])
    );
    return;
  }

  const suppliedHash = hashToken(csrfHeader.trim());
  const isValid = timingSafeEqualHex(suppliedHash, req.auth.csrfTokenHash);

  if (!isValid) {
    next(
      new AppError('Invalid CSRF token', 403, [
        {
          code: 'CSRF_TOKEN_INVALID',
          message: 'CSRF token validation failed.',
        },
      ])
    );
    return;
  }

  next();
}
