import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export const SESSION_COOKIE_NAME = 'linkium_session';

export function getSessionCookieOptions(): CookieOptions {
  const sameSite = env.COOKIE_SAME_SITE;
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
    maxAge: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function getClearSessionCookieOptions(): CookieOptions {
  const sameSite = env.COOKIE_SAME_SITE;
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  };
}

export function setSessionCookie(res: Response, rawSessionToken: string): void {
  res.cookie(SESSION_COOKIE_NAME, rawSessionToken, getSessionCookieOptions());
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, getClearSessionCookieOptions());
}
