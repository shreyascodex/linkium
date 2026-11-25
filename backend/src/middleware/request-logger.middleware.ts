import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.js';

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const logPayload = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    };

    if (res.statusCode >= 500) {
      logger.error(logPayload, 'HTTP request failed');
    } else if (res.statusCode >= 400) {
      logger.info(logPayload, 'HTTP request returned client status');
    } else {
      logger.info(logPayload, 'HTTP request completed');
    }
  });

  next();
}
