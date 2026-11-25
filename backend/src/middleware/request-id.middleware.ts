import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const SAFE_REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{8,64}$/;

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const incoming = req.header('x-request-id');
  const requestId =
    incoming && SAFE_REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
