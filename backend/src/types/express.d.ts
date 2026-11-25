import type { UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  status: UserStatus;
  emailVerifiedAt: Date;
  createdAt: Date;
  onboardingCompleted: boolean;
}

export interface AuthenticatedRequestContext {
  sessionId: string;
  csrfTokenHash: string;
  rawSessionToken: string;
  user: AuthenticatedUser;
}

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: AuthenticatedRequestContext;
    }
  }
}

export {};
