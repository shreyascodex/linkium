import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/api-response.js';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function validateOrigin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!STATE_CHANGING_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const secFetchSite = req.header('sec-fetch-site');
  if (secFetchSite && secFetchSite.toLowerCase() === 'cross-site') {
    next(
      new AppError('Cross-site request rejected', 403, [
        {
          code: 'ORIGIN_FORBIDDEN',
          message: 'Cross-site state-changing requests are not permitted.',
        },
      ])
    );
    return;
  }

  const originHeader = req.header('origin');
  if (originHeader) {
    if (!env.FRONTEND_ORIGINS.includes(originHeader)) {
      next(
        new AppError('Origin not allowed', 403, [
          {
            code: 'ORIGIN_FORBIDDEN',
            message: 'Request origin is not in the configured allowlist.',
          },
        ])
      );
      return;
    }
    next();
    return;
  }

  const refererHeader = req.header('referer');
  if (refererHeader) {
    try {
      const refererOrigin = new URL(refererHeader).origin;
      if (!env.FRONTEND_ORIGINS.includes(refererOrigin)) {
        next(
          new AppError('Referer origin not allowed', 403, [
            {
              code: 'ORIGIN_FORBIDDEN',
              message: 'Request referer origin is not in the configured allowlist.',
            },
          ])
        );
        return;
      }
    } catch {
      next(
        new AppError('Invalid Referer header', 403, [
          {
            code: 'ORIGIN_FORBIDDEN',
            message: 'Request referer header is malformed.',
          },
        ])
      );
      return;
    }
  }

  next();
}
