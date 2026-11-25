import type { Request, Response } from 'express';
import { sendError } from '../utils/api-response.js';

export function notFoundMiddleware(req: Request, res: Response): void {
  sendError(res, {
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errors: [
      {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested endpoint does not exist.',
      },
    ],
  });
}
