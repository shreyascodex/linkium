import { randomBytes } from 'node:crypto';
import 'dotenv/config';
import { z } from 'zod';

const ephemeralDevSessionSecret = randomBytes(32).toString('hex');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  DATABASE_URL: z
    .string()
    .trim()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (val) => val.startsWith('postgresql://') || val.startsWith('postgres://'),
      'DATABASE_URL must be a valid PostgreSQL connection string'
    ),
  FRONTEND_URL: z
    .string()
    .trim()
    .min(1, 'FRONTEND_URL is required')
    .default('http://localhost:5173'),
  APP_BASE_URL: z
    .string()
    .trim()
    .url('APP_BASE_URL must be a valid http(s) URL')
    .default('http://localhost:5173'),
  SESSION_SECRET: z.string().trim().optional().default(''),
  COOKIE_SAME_SITE: z.enum(['lax', 'none']).default('lax'),
  EMAIL_PROVIDER: z.enum(['console', 'resend']).default('console'),
  EMAIL_FROM: z
    .string()
    .trim()
    .min(3, 'EMAIL_FROM is required')
    .default('LINKIUM <no-reply@example.com>'),
  EMAIL_API_KEY: z.string().trim().optional().default(''),
  SESSION_MAX_AGE_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  VERIFICATION_TOKEN_EXPIRY_MINUTES: z.coerce
    .number()
    .int()
    .min(5)
    .max(1440)
    .default(30),
  PASSWORD_RESET_TOKEN_EXPIRY_MINUTES: z.coerce
    .number()
    .int()
    .min(5)
    .max(1440)
    .default(30),
  INVITATION_EXPIRY_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().min(1).max(120).default(15),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().min(1).max(500).default(20),
  RATE_LIMIT_EMAIL_MAX: z.coerce.number().int().min(1).max(100).default(5),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

export interface AppEnv {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  FRONTEND_URL: string;
  FRONTEND_ORIGINS: string[];
  APP_BASE_URL: string;
  SESSION_SECRET: string;
  COOKIE_SAME_SITE: 'lax' | 'none';
  EMAIL_PROVIDER: 'console' | 'resend';
  EMAIL_FROM: string;
  EMAIL_API_KEY: string;
  SESSION_MAX_AGE_DAYS: number;
  VERIFICATION_TOKEN_EXPIRY_MINUTES: number;
  PASSWORD_RESET_TOKEN_EXPIRY_MINUTES: number;
  INVITATION_EXPIRY_DAYS: number;
  RATE_LIMIT_WINDOW_MINUTES: number;
  RATE_LIMIT_AUTH_MAX: number;
  RATE_LIMIT_EMAIL_MAX: number;
  LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
}

export function parseEnv(raw: NodeJS.ProcessEnv): AppEnv {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid backend environment configuration:\n${formatted}`);
  }

  const origins = result.data.FRONTEND_URL.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  for (const origin of origins) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`Unsupported protocol for origin: ${origin}`);
      }
    } catch {
      throw new Error(
        `Invalid FRONTEND_URL origin "${origin}". Must be a valid http(s) URL.`
      );
    }
  }

  if (origins.length === 0) {
    throw new Error('FRONTEND_URL must include at least one valid origin.');
  }

  const baseUrlParsed = new URL(result.data.APP_BASE_URL);
  if (baseUrlParsed.protocol !== 'http:' && baseUrlParsed.protocol !== 'https:') {
    throw new Error('APP_BASE_URL must use http or https protocol.');
  }

  if (result.data.NODE_ENV === 'production') {
    if (result.data.SESSION_SECRET.length < 32) {
      throw new Error(
        'SESSION_SECRET must be at least 32 characters in production.'
      );
    }
    if (result.data.EMAIL_PROVIDER === 'console') {
      throw new Error(
        'EMAIL_PROVIDER cannot be "console" in production. Configure a real email provider such as "resend".'
      );
    }
  }

  if (result.data.SESSION_SECRET.length > 0 && result.data.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters when provided.');
  }

  if (result.data.EMAIL_PROVIDER === 'resend' && !result.data.EMAIL_API_KEY) {
    throw new Error('EMAIL_API_KEY is required when EMAIL_PROVIDER is set to "resend".');
  }

  const resolvedSessionSecret =
    result.data.SESSION_SECRET.length >= 32
      ? result.data.SESSION_SECRET
      : ephemeralDevSessionSecret;

  return {
    ...result.data,
    APP_BASE_URL: result.data.APP_BASE_URL.replace(/\/+$/, ''),
    SESSION_SECRET: resolvedSessionSecret,
    FRONTEND_ORIGINS: origins,
  };
}

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }
  return cachedEnv;
}

export const env: AppEnv = getEnv();
