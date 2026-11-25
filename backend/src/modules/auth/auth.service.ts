import { randomUUID } from 'node:crypto';
import type { UserStatus } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { emailService } from '../../emails/email.service.js';
import { AppError } from '../../utils/api-response.js';
import {
  deriveCsrfToken,
  generateSecureToken,
  hashPassword,
  hashToken,
  normalizeEmail,
  verifyPassword,
} from '../../utils/crypto.js';
import type {
  ChangePasswordInput,
  EmailOnlyInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './auth.validation.js';

export interface SafeUserDto {
  id: string;
  email: string;
  status: UserStatus;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  onboardingCompleted?: boolean;
}

export interface LoginResult {
  user: SafeUserDto;
  rawSessionToken: string;
}

export interface InvitationValidationResult {
  valid: true;
  email: string;
  expiresAt: Date;
}

const DUMMY_ARGON2_HASH =
  '$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHRmb3J0aW1pbmc$8n4R1mZ1uN7g9w3xP5rQ2sT6vW8yZ0aB2cD4eF6gH8i';

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function validateInvitationToken(
  rawToken: string
): Promise<InvitationValidationResult> {
  const tokenHash = hashToken(rawToken);
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
    select: {
      email: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  const now = new Date();
  if (!invitation || invitation.usedAt !== null || invitation.expiresAt <= now) {
    throw new AppError('Invitation is invalid or has expired', 400, [
      {
        code: 'INVALID_INVITATION',
        message: 'This invitation link is invalid, expired, or has already been used.',
      },
    ]);
  }

  return {
    valid: true,
    email: invitation.email,
    expiresAt: invitation.expiresAt,
  };
}

export async function registerWithInvitation(
  input: RegisterInput
): Promise<SafeUserDto> {
  const email = normalizeEmail(input.email);
  const invitationTokenHash = hashToken(input.invitationToken);
  const passwordHash = await hashPassword(input.password);
  const rawVerificationToken = generateSecureToken(32);
  const verificationTokenHash = hashToken(rawVerificationToken);
  const now = new Date();
  const verificationExpiresAt = addMinutes(
    now,
    env.VERIFICATION_TOKEN_EXPIRY_MINUTES
  );

  const createdUser = await prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { tokenHash: invitationTokenHash },
    });

    if (!invitation || invitation.usedAt !== null || invitation.expiresAt <= now) {
      throw new AppError('Invalid or expired invitation', 400, [
        {
          code: 'INVALID_INVITATION',
          message: 'This invitation token is invalid, expired, or already used.',
        },
      ]);
    }

    if (normalizeEmail(invitation.email) !== email) {
      throw new AppError('Invitation email mismatch', 400, [
        {
          code: 'INVITATION_EMAIL_MISMATCH',
          message: 'The submitted email does not match this invitation.',
        },
      ]);
    }

    const existingUser = await tx.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError('Unable to complete registration', 409, [
        {
          code: 'REGISTRATION_CONFLICT',
          message: 'Registration could not be completed with the provided details.',
        },
      ]);
    }

    const claimed = await tx.invitation.updateMany({
      where: {
        id: invitation.id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        usedAt: now,
      },
    });

    if (claimed.count !== 1) {
      throw new AppError('Invalid or expired invitation', 400, [
        {
          code: 'INVALID_INVITATION',
          message: 'This invitation token is invalid, expired, or already used.',
        },
      ]);
    }

    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        status: 'PENDING_VERIFICATION',
      },
      select: {
        id: true,
        email: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: verificationTokenHash,
        expiresAt: verificationExpiresAt,
      },
    });

    await emailService.sendVerificationEmail(user.email, rawVerificationToken);

    return user;
  });

  return createdUser;
}

export async function verifyEmailToken(
  input: VerifyEmailInput
): Promise<{ verified: true }> {
  const tokenHash = hashToken(input.token);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const record = await tx.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            emailVerifiedAt: true,
          },
        },
      },
    });

    if (!record || record.usedAt !== null || record.expiresAt <= now) {
      throw new AppError('Invalid or expired verification token', 400, [
        {
          code: 'INVALID_VERIFICATION_TOKEN',
          message: 'This verification link is invalid, expired, or has already been used.',
        },
      ]);
    }

    if (record.user.status === 'SUSPENDED' || record.user.status === 'DELETED') {
      throw new AppError('Account cannot be verified', 403, [
        {
          code: 'ACCOUNT_UNAVAILABLE',
          message: 'This account is not eligible for verification.',
        },
      ]);
    }

    const markedUsed = await tx.emailVerificationToken.updateMany({
      where: {
        id: record.id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        usedAt: now,
      },
    });

    if (markedUsed.count !== 1) {
      throw new AppError('Invalid or expired verification token', 400, [
        {
          code: 'INVALID_VERIFICATION_TOKEN',
          message: 'This verification link is invalid, expired, or has already been used.',
        },
      ]);
    }

    await tx.emailVerificationToken.updateMany({
      where: {
        userId: record.userId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    await tx.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: record.user.emailVerifiedAt ?? now,
        status:
          record.user.status === 'PENDING_VERIFICATION'
            ? 'ACTIVE'
            : record.user.status,
      },
    });
  });

  return { verified: true };
}

export async function resendVerificationEmail(
  input: EmailOnlyInput
): Promise<void> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      status: true,
      emailVerifiedAt: true,
    },
  });

  if (!user || user.status !== 'PENDING_VERIFICATION' || user.emailVerifiedAt !== null) {
    return;
  }

  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const now = new Date();
  const expiresAt = addMinutes(now, env.VERIFICATION_TOKEN_EXPIRY_MINUTES);

  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await emailService.sendVerificationEmail(user.email, rawToken);
  });
}

export async function loginWithCredentials(
  input: LoginInput,
  metadata: { userAgent?: string; ipAddress?: string }
): Promise<LoginResult> {
  const email = normalizeEmail(input.email);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true,
      status: true,
      createdAt: true,
      profile: {
        select: {
          onboardingCompleted: true,
        },
      },
    },
  });

  if (!user || !user.passwordHash) {
    await verifyPassword(DUMMY_ARGON2_HASH, input.password);
    throw new AppError('Invalid email or password', 401, [
      {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      },
    ]);
  }

  const passwordValid = await verifyPassword(user.passwordHash, input.password);
  if (!passwordValid) {
    throw new AppError('Invalid email or password', 401, [
      {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      },
    ]);
  }

  if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
    throw new AppError('This account is not active', 403, [
      {
        code: 'ACCOUNT_UNAVAILABLE',
        message: 'This account has been suspended or deleted.',
      },
    ]);
  }

  if (user.status !== 'ACTIVE' || user.emailVerifiedAt === null) {
    throw new AppError('Email verification required', 403, [
      {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before signing in.',
      },
    ]);
  }

  const rawSessionToken = generateSecureToken(32);
  const tokenHash = hashToken(rawSessionToken);
  const sessionId = randomUUID();
  const csrfToken = deriveCsrfToken(sessionId, rawSessionToken);
  const csrfTokenHash = hashToken(csrfToken);
  const now = new Date();
  const expiresAt = addDays(now, env.SESSION_MAX_AGE_DAYS);

  await prisma.$transaction(async (tx) => {
    await tx.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash,
        csrfTokenHash,
        expiresAt,
        userAgent: metadata.userAgent?.slice(0, 512) ?? null,
        ipAddress: metadata.ipAddress?.slice(0, 64) ?? null,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: now,
      },
    });
  });

  return {
    rawSessionToken,
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      onboardingCompleted: user.profile?.onboardingCompleted ?? false,
    },
  };
}

export async function logoutSession(sessionId: string): Promise<void> {
  await prisma.session.updateMany({
    where: {
      id: sessionId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function requestPasswordReset(input: EmailOnlyInput): Promise<void> {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      status: true,
      emailVerifiedAt: true,
    },
  });

  if (!user || user.status !== 'ACTIVE' || user.emailVerifiedAt === null) {
    return;
  }

  const rawResetToken = generateSecureToken(32);
  const tokenHash = hashToken(rawResetToken);
  const now = new Date();
  const expiresAt = addMinutes(now, env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await emailService.sendPasswordResetEmail(user.email, rawResetToken);
  });
}

export async function resetPasswordWithToken(
  input: ResetPasswordInput
): Promise<void> {
  const tokenHash = hashToken(input.token);
  const newPasswordHash = await hashPassword(input.newPassword);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const resetRecord = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!resetRecord || resetRecord.usedAt !== null || resetRecord.expiresAt <= now) {
      throw new AppError('Invalid or expired password reset token', 400, [
        {
          code: 'INVALID_RESET_TOKEN',
          message: 'This password reset link is invalid, expired, or has already been used.',
        },
      ]);
    }

    if (resetRecord.user.status === 'SUSPENDED' || resetRecord.user.status === 'DELETED') {
      throw new AppError('Account is not eligible for password reset', 403, [
        {
          code: 'ACCOUNT_UNAVAILABLE',
          message: 'This account is suspended or deleted.',
        },
      ]);
    }

    const markedUsed = await tx.passwordResetToken.updateMany({
      where: {
        id: resetRecord.id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        usedAt: now,
      },
    });

    if (markedUsed.count !== 1) {
      throw new AppError('Invalid or expired password reset token', 400, [
        {
          code: 'INVALID_RESET_TOKEN',
          message: 'This password reset link is invalid, expired, or has already been used.',
        },
      ]);
    }

    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetRecord.userId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    await tx.user.update({
      where: { id: resetRecord.userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    await tx.session.updateMany({
      where: {
        userId: resetRecord.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });
  });
}

export async function changeUserPassword(
  userId: string,
  currentSessionId: string,
  input: ChangePasswordInput
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
      status: true,
    },
  });

  if (!user || !user.passwordHash || user.status !== 'ACTIVE') {
    throw new AppError('Account unavailable', 403, [
      {
        code: 'ACCOUNT_UNAVAILABLE',
        message: 'Unable to update password for this account.',
      },
    ]);
  }

  const currentValid = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!currentValid) {
    throw new AppError('Current password is incorrect', 401, [
      {
        code: 'INVALID_CREDENTIALS',
        message: 'Your current password is incorrect.',
      },
    ]);
  }

  const newPasswordHash = await hashPassword(input.newPassword);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    // Revoke other active sessions while keeping the current session active
    await tx.session.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });
  });
}
