import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/api-response.js';
import { clearSessionCookie, SESSION_COOKIE_NAME } from '../utils/cookies.js';
import { hashToken } from '../utils/crypto.js';

type SessionResolveResult =
  | {
      ok: true;
      auth: NonNullable<Request['auth']>;
    }
  | {
      ok: false;
      code: 'AUTHENTICATION_REQUIRED' | 'INVALID_SESSION' | 'ACCOUNT_INACTIVE';
      message: string;
      detail: string;
    };

async function resolveSessionFromToken(
  rawToken: unknown
): Promise<SessionResolveResult> {
  if (typeof rawToken !== 'string' || rawToken.trim().length === 0) {
    return {
      ok: false,
      code: 'AUTHENTICATION_REQUIRED',
      message: 'Authentication required',
      detail: 'You must be signed in to access this resource.',
    };
  }

  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
          profile: {
            select: {
              onboardingCompleted: true,
            },
          },
        },
      },
    },
  });

  const now = new Date();
  if (!session || session.revokedAt !== null || session.expiresAt <= now) {
    return {
      ok: false,
      code: 'INVALID_SESSION',
      message: 'Invalid or expired session',
      detail: 'Your session is invalid or has expired.',
    };
  }

  if (session.user.status !== 'ACTIVE' || session.user.emailVerifiedAt === null) {
    return {
      ok: false,
      code: 'ACCOUNT_INACTIVE',
      message: 'Account is not active',
      detail: 'Your account is not active or email is unverified.',
    };
  }

  return {
    ok: true,
    auth: {
      sessionId: session.id,
      csrfTokenHash: session.csrfTokenHash,
      rawSessionToken: rawToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        status: session.user.status,
        emailVerifiedAt: session.user.emailVerifiedAt,
        createdAt: session.user.createdAt,
        onboardingCompleted: session.user.profile?.onboardingCompleted ?? false,
      },
    },
  };
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
    const resolved = await resolveSessionFromToken(rawToken);

    if (!resolved.ok) {
      next(
        new AppError(resolved.message, 401, [
          {
            code: resolved.code,
            message: resolved.detail,
          },
        ])
      );
      return;
    }

    req.auth = resolved.auth;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = req.cookies?.[SESSION_COOKIE_NAME];
    if (typeof rawToken !== 'string' || rawToken.trim().length === 0) {
      req.auth = undefined;
      next();
      return;
    }

    const resolved = await resolveSessionFromToken(rawToken);
    if (!resolved.ok) {
      clearSessionCookie(res);
      req.auth = undefined;
      next();
      return;
    }

    req.auth = resolved.auth;
    next();
  } catch (error) {
    next(error);
  }
}
