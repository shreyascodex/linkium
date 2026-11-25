import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/api-response.js';

export function createRateLimiter(options: {
  windowMinutes?: number;
  maxRequests: number;
  message: string;
}): RateLimitRequestHandler {
  const windowMs = (options.windowMinutes ?? env.RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000;

  return rateLimit({
    windowMs,
    limit: options.maxRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      sendError(res, {
        statusCode: 429,
        message: options.message,
        errors: [
          {
            code: 'RATE_LIMIT_EXCEEDED',
            message: options.message,
          },
        ],
      });
    },
  });
}

export const authRateLimiter = createRateLimiter({
  maxRequests: env.RATE_LIMIT_AUTH_MAX,
  message: 'Too many authentication attempts. Please try again later.',
});

export const emailRateLimiter = createRateLimiter({
  maxRequests: env.RATE_LIMIT_EMAIL_MAX,
  message: 'Too many email requests. Please wait before trying again.',
});
