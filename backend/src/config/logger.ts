import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' && !process.env.LOG_LEVEL ? 'silent' : env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-csrf-token"]',
      'authorization',
      'cookie',
      'password',
      'currentPassword',
      'newPassword',
      'passwordHash',
      'token',
      'rawToken',
      'invitationToken',
      'csrfToken',
      'csrfTokenHash',
      'tokenHash',
      '*.password',
      '*.currentPassword',
      '*.newPassword',
      '*.token',
      '*.rawToken',
      '*.invitationToken',
      'SESSION_SECRET',
      'EMAIL_API_KEY',
      'DATABASE_URL',
    ],
    censor: '[REDACTED]',
  },
  base: {
    service: 'linkium-api',
    env: env.NODE_ENV,
  },
});
