import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' && !process.env.LOG_LEVEL ? 'silent' : env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      'tokenHash',
      'DATABASE_URL',
    ],
    censor: '[REDACTED]',
  },
  base: {
    service: 'linkium-api',
    env: env.NODE_ENV,
  },
});
