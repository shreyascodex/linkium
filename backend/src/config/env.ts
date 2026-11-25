import 'dotenv/config';
import { z } from 'zod';

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

  return {
    ...result.data,
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
