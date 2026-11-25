import { randomUUID } from 'node:crypto';
import type { UserStatus } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

interface MemUser {
  id: string;
  email: string;
  passwordHash: string | null;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface MemSession {
  id: string;
  userId: string;
  tokenHash: string;
  csrfTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MemInvitation {
  id: string;
  email: string;
  tokenHash: string;
  note: string | null;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

interface MemTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

const store = vi.hoisted(() => ({
  users: [] as MemUser[],
  sessions: [] as MemSession[],
  invitations: [] as MemInvitation[],
  verificationTokens: [] as MemTokenRecord[],
  passwordResetTokens: [] as MemTokenRecord[],
  dispatchedEmails: [] as Array<{ to: string; subject: string; html: string; text: string }>,
}));

function buildMockDb() {
  const tx = {
    invitation: {
      findUnique: async ({ where }: { where: { tokenHash: string } }) =>
        store.invitations.find((inv) => inv.tokenHash === where.tokenHash) ?? null,
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; usedAt: null; expiresAt: { gt: Date } };
        data: { usedAt: Date };
      }) => {
        let count = 0;
        for (const inv of store.invitations) {
          if (inv.id === where.id && inv.usedAt === null && inv.expiresAt > where.expiresAt.gt) {
            inv.usedAt = data.usedAt;
            count += 1;
          }
        }
        return { count };
      },
    },
    user: {
      findUnique: async ({
        where,
      }: {
        where: { email?: string; id?: string };
      }) => {
        if (where.email !== undefined) {
          return store.users.find((u) => u.email === where.email) ?? null;
        }
        if (where.id !== undefined) {
          return store.users.find((u) => u.id === where.id) ?? null;
        }
        return null;
      },
      create: async ({
        data,
      }: {
        data: { email: string; passwordHash: string; status: UserStatus };
      }) => {
        const now = new Date();
        const user: MemUser = {
          id: randomUUID(),
          email: data.email,
          passwordHash: data.passwordHash,
          emailVerifiedAt: null,
          lastLoginAt: null,
          status: data.status,
          createdAt: now,
          updatedAt: now,
        };
        store.users.push(user);
        return user;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<MemUser>;
      }) => {
        const user = store.users.find((u) => u.id === where.id);
        if (!user) throw new Error('User not found');
        Object.assign(user, data, { updatedAt: new Date() });
        return user;
      },
    },
    emailVerificationToken: {
      findUnique: async ({
        where,
      }: {
        where: { tokenHash: string };
      }) => {
        const record = store.verificationTokens.find((t) => t.tokenHash === where.tokenHash);
        if (!record) return null;
        const user = store.users.find((u) => u.id === record.userId)!;
        return { ...record, user };
      },
      create: async ({
        data,
      }: {
        data: { userId: string; tokenHash: string; expiresAt: Date };
      }) => {
        const record: MemTokenRecord = {
          id: randomUUID(),
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          usedAt: null,
          createdAt: new Date(),
        };
        store.verificationTokens.push(record);
        return record;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { id?: string; userId?: string; usedAt: null; expiresAt?: { gt: Date } };
        data: { usedAt: Date };
      }) => {
        let count = 0;
        for (const token of store.verificationTokens) {
          const matchesId = where.id ? token.id === where.id : true;
          const matchesUser = where.userId ? token.userId === where.userId : true;
          const matchesUnused = token.usedAt === null;
          const matchesExpiry = where.expiresAt ? token.expiresAt > where.expiresAt.gt : true;
          if (matchesId && matchesUser && matchesUnused && matchesExpiry) {
            token.usedAt = data.usedAt;
            count += 1;
          }
        }
        return { count };
      },
    },
    passwordResetToken: {
      findUnique: async ({
        where,
      }: {
        where: { tokenHash: string };
      }) => {
        const record = store.passwordResetTokens.find((t) => t.tokenHash === where.tokenHash);
        if (!record) return null;
        const user = store.users.find((u) => u.id === record.userId)!;
        return { ...record, user };
      },
      create: async ({
        data,
      }: {
        data: { userId: string; tokenHash: string; expiresAt: Date };
      }) => {
        const record: MemTokenRecord = {
          id: randomUUID(),
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          usedAt: null,
          createdAt: new Date(),
        };
        store.passwordResetTokens.push(record);
        return record;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { id?: string; userId?: string; usedAt: null; expiresAt?: { gt: Date } };
        data: { usedAt: Date };
      }) => {
        let count = 0;
        for (const token of store.passwordResetTokens) {
          const matchesId = where.id ? token.id === where.id : true;
          const matchesUser = where.userId ? token.userId === where.userId : true;
          const matchesUnused = token.usedAt === null;
          const matchesExpiry = where.expiresAt ? token.expiresAt > where.expiresAt.gt : true;
          if (matchesId && matchesUser && matchesUnused && matchesExpiry) {
            token.usedAt = data.usedAt;
            count += 1;
          }
        }
        return { count };
      },
    },
    session: {
      findUnique: async ({ where }: { where: { tokenHash: string } }) => {
        const session = store.sessions.find((s) => s.tokenHash === where.tokenHash);
        if (!session) return null;
        const user = store.users.find((u) => u.id === session.userId)!;
        return { ...session, user };
      },
      create: async ({
        data,
      }: {
        data: {
          id: string;
          userId: string;
          tokenHash: string;
          csrfTokenHash: string;
          expiresAt: Date;
          userAgent: string | null;
          ipAddress: string | null;
        };
      }) => {
        const now = new Date();
        const session: MemSession = {
          ...data,
          revokedAt: null,
          createdAt: now,
          updatedAt: now,
        };
        store.sessions.push(session);
        return session;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { id?: string | { not: string }; userId?: string; revokedAt: null };
        data: { revokedAt: Date };
      }) => {
        let count = 0;
        for (const session of store.sessions) {
          const matchesId =
            typeof where.id === 'string'
              ? session.id === where.id
              : where.id && typeof where.id === 'object' && 'not' in where.id
              ? session.id !== where.id.not
              : true;
          const matchesUser = where.userId ? session.userId === where.userId : true;
          if (matchesId && matchesUser && session.revokedAt === null) {
            session.revokedAt = data.revokedAt;
            count += 1;
          }
        }
        return { count };
      },
    },
  };

  return {
    ...tx,
    $transaction: async <T>(fn: (client: typeof tx) => Promise<T>): Promise<T> => {
      // Snapshot arrays so simulated rollbacks revert cleanly on errors
      const snapshot = {
        users: store.users.map((u) => ({ ...u })),
        sessions: store.sessions.map((s) => ({ ...s })),
        invitations: store.invitations.map((i) => ({ ...i })),
        verificationTokens: store.verificationTokens.map((t) => ({ ...t })),
        passwordResetTokens: store.passwordResetTokens.map((t) => ({ ...t })),
      };
      try {
        return await fn(tx);
      } catch (err) {
        store.users = snapshot.users;
        store.sessions = snapshot.sessions;
        store.invitations = snapshot.invitations;
        store.verificationTokens = snapshot.verificationTokens;
        store.passwordResetTokens = snapshot.passwordResetTokens;
        throw err;
      }
    },
  };
}

vi.mock('../src/config/database.js', () => ({
  prisma: buildMockDb(),
  checkDatabaseHealth: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  disconnectDatabase: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));

import { app } from '../src/app.js';
import { parseEnv } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';
import { emailService } from '../src/emails/email.service.js';
import { ConsoleEmailProvider } from '../src/emails/providers/console.provider.js';
import { createRateLimiter } from '../src/middleware/rate-limit.middleware.js';
import { generateSecureToken, hashToken } from '../src/utils/crypto.js';
import express from 'express';

function seedInvitation(options: {
  email?: string;
  expired?: boolean;
  used?: boolean;
}) {
  const rawToken = generateSecureToken(32);
  const invitation: MemInvitation = {
    id: randomUUID(),
    email: (options.email ?? 'builder@example.com').toLowerCase(),
    tokenHash: hashToken(rawToken),
    note: 'Beta Cohort',
    expiresAt: options.expired
      ? new Date(Date.now() - 60_000)
      : new Date(Date.now() + 7 * 24 * 60 * 60_000),
    usedAt: options.used ? new Date() : null,
    createdAt: new Date(),
  };
  store.invitations.push(invitation);
  return { rawToken, invitation };
}

function extractTokenFromEmail(urlParam: string): string {
  const lastEmail = store.dispatchedEmails[store.dispatchedEmails.length - 1];
  expect(lastEmail).toBeDefined();
  const match = lastEmail.text.match(new RegExp(`${urlParam}=([^\\s]+)`));
  expect(match?.[1]).toBeTruthy();
  return decodeURIComponent(match![1]);
}

describe('LINKIUM Stage 2B Authentication System', () => {
  beforeEach(() => {
    store.users = [];
    store.sessions = [];
    store.invitations = [];
    store.verificationTokens = [];
    store.passwordResetTokens = [];
    store.dispatchedEmails = [];

    emailService.setProvider({
      name: 'mock-capture',
      async send(message) {
        store.dispatchedEmails.push(message);
        return { provider: 'mock-capture', messageId: 'msg-1' };
      },
    });
  });

  describe('Invitation validation (GET /api/v1/invitations/validate/:token)', () => {
    it('validates a valid unused invitation without consuming it', async () => {
      const { rawToken, invitation } = seedInvitation({ email: 'sita@example.com' });

      const res = await request(app).get(`/api/v1/invitations/validate/${rawToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.email).toBe('sita@example.com');
      expect(invitation.usedAt).toBeNull();
    });

    it('rejects invalid, expired, and already-used invitations', async () => {
      const invalidRes = await request(app).get(
        `/api/v1/invitations/validate/${generateSecureToken(32)}`
      );
      expect(invalidRes.status).toBe(400);

      const expired = seedInvitation({ expired: true });
      const expiredRes = await request(app).get(
        `/api/v1/invitations/validate/${expired.rawToken}`
      );
      expect(expiredRes.status).toBe(400);

      const used = seedInvitation({ used: true });
      const usedRes = await request(app).get(
        `/api/v1/invitations/validate/${used.rawToken}`
      );
      expect(usedRes.status).toBe(400);
    });
  });

  describe('Registration (POST /api/v1/auth/register)', () => {
    it('registers a user with a valid invitation, hashes password with Argon2id, consumes invitation, and sends verification email', async () => {
      const { rawToken, invitation } = seedInvitation({ email: 'Aarav@Example.com' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: '  Aarav@Example.com ',
          password: 'StrongPassword123!',
          invitationToken: rawToken,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('aarav@example.com');
      expect(res.body.data.user.status).toBe('PENDING_VERIFICATION');
      expect(res.headers['set-cookie']).toBeUndefined();

      expect(store.users).toHaveLength(1);
      expect(store.users[0].passwordHash).toMatch(/^\$argon2id\$/);
      expect(store.users[0].passwordHash).not.toContain('StrongPassword123!');
      expect(invitation.usedAt).not.toBeNull();

      expect(store.verificationTokens).toHaveLength(1);
      expect(store.dispatchedEmails).toHaveLength(1);
      const rawVerifyToken = extractTokenFromEmail('token');
      expect(store.verificationTokens[0].tokenHash).toBe(hashToken(rawVerifyToken));
    });

    it('rejects invalid, expired, used, and email-mismatched invitations', async () => {
      const invalidRes = await request(app).post('/api/v1/auth/register').send({
        email: 'user@example.com',
        password: 'StrongPassword123!',
        invitationToken: generateSecureToken(32),
      });
      expect(invalidRes.status).toBe(400);

      const expired = seedInvitation({ email: 'user@example.com', expired: true });
      const expiredRes = await request(app).post('/api/v1/auth/register').send({
        email: 'user@example.com',
        password: 'StrongPassword123!',
        invitationToken: expired.rawToken,
      });
      expect(expiredRes.status).toBe(400);

      const used = seedInvitation({ email: 'user@example.com', used: true });
      const usedRes = await request(app).post('/api/v1/auth/register').send({
        email: 'user@example.com',
        password: 'StrongPassword123!',
        invitationToken: used.rawToken,
      });
      expect(usedRes.status).toBe(400);

      const mismatch = seedInvitation({ email: 'invited@example.com' });
      const mismatchRes = await request(app).post('/api/v1/auth/register').send({
        email: 'other@example.com',
        password: 'StrongPassword123!',
        invitationToken: mismatch.rawToken,
      });
      expect(mismatchRes.status).toBe(400);
      expect(mismatch.invitation.usedAt).toBeNull();
    });

    it('rejects weak passwords and duplicate emails', async () => {
      const first = seedInvitation({ email: 'dup@example.com' });
      const weakRes = await request(app).post('/api/v1/auth/register').send({
        email: 'dup@example.com',
        password: 'weak',
        invitationToken: first.rawToken,
      });
      expect(weakRes.status).toBe(400);

      await request(app).post('/api/v1/auth/register').send({
        email: 'dup@example.com',
        password: 'StrongPassword123!',
        invitationToken: first.rawToken,
      });

      const second = seedInvitation({ email: 'dup@example.com' });
      const dupRes = await request(app).post('/api/v1/auth/register').send({
        email: 'dup@example.com',
        password: 'StrongPassword123!',
        invitationToken: second.rawToken,
      });
      expect(dupRes.status).toBe(409);
      expect(second.invitation.usedAt).toBeNull();
    });
  });

  describe('Email verification & resend', () => {
    it('activates user on valid token and rejects invalid, expired, or reused tokens', async () => {
      const { rawToken } = seedInvitation({ email: 'verify@example.com' });
      await request(app).post('/api/v1/auth/register').send({
        email: 'verify@example.com',
        password: 'StrongPassword123!',
        invitationToken: rawToken,
      });

      const verifyToken = extractTokenFromEmail('token');

      const invalidRes = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: generateSecureToken(32) });
      expect(invalidRes.status).toBe(400);

      const okRes = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: verifyToken });
      expect(okRes.status).toBe(200);
      expect(store.users[0].status).toBe('ACTIVE');
      expect(store.users[0].emailVerifiedAt).not.toBeNull();

      // Reused token fails
      const reuseRes = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: verifyToken });
      expect(reuseRes.status).toBe(400);

      // Expired token fails
      const expiredRaw = generateSecureToken(32);
      store.verificationTokens.push({
        id: randomUUID(),
        userId: store.users[0].id,
        tokenHash: hashToken(expiredRaw),
        expiresAt: new Date(Date.now() - 10_000),
        usedAt: null,
        createdAt: new Date(),
      });
      const expiredRes = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: expiredRaw });
      expect(expiredRes.status).toBe(400);
    });

    it('resends verification generically without account enumeration and supersedes prior tokens', async () => {
      const { rawToken } = seedInvitation({ email: 'resend@example.com' });
      await request(app).post('/api/v1/auth/register').send({
        email: 'resend@example.com',
        password: 'StrongPassword123!',
        invitationToken: rawToken,
      });

      const firstToken = extractTokenFromEmail('token');

      const unknownRes = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'nobody@example.com' });
      expect(unknownRes.status).toBe(200);
      expect(store.dispatchedEmails).toHaveLength(1);

      const knownRes = await request(app)
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'resend@example.com' });
      expect(knownRes.status).toBe(200);
      expect(knownRes.body.message).toBe(unknownRes.body.message);
      expect(store.dispatchedEmails).toHaveLength(2);

      // Old token was superseded
      const oldVerifyRes = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: firstToken });
      expect(oldVerifyRes.status).toBe(400);

      // Latest token works
      const secondToken = extractTokenFromEmail('token');
      const newVerifyRes = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: secondToken });
      expect(newVerifyRes.status).toBe(200);
    });
  });

  describe('Login, Sessions, CSRF, and Logout', () => {
    async function createVerifiedUser(email = 'active@example.com', password = 'StrongPassword123!') {
      const { rawToken } = seedInvitation({ email });
      await request(app).post('/api/v1/auth/register').send({
        email,
        password,
        invitationToken: rawToken,
      });
      const verifyToken = extractTokenFromEmail('token');
      await request(app).post('/api/v1/auth/verify-email').send({ token: verifyToken });
      return store.users.find((u) => u.email === email.toLowerCase())!;
    }

    it('rejects unverified, suspended, unknown, and wrong-password login attempts', async () => {
      const { rawToken } = seedInvitation({ email: 'pending@example.com' });
      await request(app).post('/api/v1/auth/register').send({
        email: 'pending@example.com',
        password: 'StrongPassword123!',
        invitationToken: rawToken,
      });

      const unverifiedRes = await request(app).post('/api/v1/auth/login').send({
        email: 'pending@example.com',
        password: 'StrongPassword123!',
      });
      expect(unverifiedRes.status).toBe(403);

      const activeUser = await createVerifiedUser('member@example.com');

      const wrongPassRes = await request(app).post('/api/v1/auth/login').send({
        email: 'member@example.com',
        password: 'WrongPassword123!',
      });
      expect(wrongPassRes.status).toBe(401);

      const unknownRes = await request(app).post('/api/v1/auth/login').send({
        email: 'missing@example.com',
        password: 'StrongPassword123!',
      });
      expect(unknownRes.status).toBe(401);

      activeUser.status = 'SUSPENDED';
      const suspendedRes = await request(app).post('/api/v1/auth/login').send({
        email: 'member@example.com',
        password: 'StrongPassword123!',
      });
      expect(suspendedRes.status).toBe(403);
    });

    it('creates HttpOnly session cookie, authenticates /me, enforces CSRF on logout, and rejects expired/revoked sessions', async () => {
      await createVerifiedUser('session@example.com');

      const agent = request.agent(app);
      const loginRes = await agent.post('/api/v1/auth/login').send({
        email: 'session@example.com',
        password: 'StrongPassword123!',
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.email).toBe('session@example.com');
      expect(JSON.stringify(loginRes.body)).not.toContain('passwordHash');
      expect(JSON.stringify(loginRes.body)).not.toContain('tokenHash');

      const setCookie = loginRes.headers['set-cookie']?.[0] ?? '';
      expect(setCookie).toContain('linkium_session=');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('SameSite=Lax');
      expect(store.sessions).toHaveLength(1);

      // Missing session: /auth/session returns 200 { authenticated: false }, while /auth/me returns 401
      const unauthSession = await request(app).get('/api/v1/auth/session');
      expect(unauthSession.status).toBe(200);
      expect(unauthSession.body.data).toEqual({ authenticated: false, user: null });

      const unauthMe = await request(app).get('/api/v1/auth/me');
      expect(unauthMe.status).toBe(401);

      // Invalid cookie returns 401 on /me and 200 { authenticated: false } on /session
      const badCookieMe = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['linkium_session=invalid-token-value']);
      expect(badCookieMe.status).toBe(401);

      // Valid session returns 200 on both /session and /me
      const validSession = await agent.get('/api/v1/auth/session');
      expect(validSession.status).toBe(200);
      expect(validSession.body.data.authenticated).toBe(true);
      expect(validSession.body.data.user.email).toBe('session@example.com');

      const meRes = await agent.get('/api/v1/auth/me');
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.email).toBe('session@example.com');

      // CSRF enforcement on logout
      const missingCsrfLogout = await agent.post('/api/v1/auth/logout');
      expect(missingCsrfLogout.status).toBe(403);

      const wrongCsrfLogout = await agent
        .post('/api/v1/auth/logout')
        .set('X-CSRF-Token', 'forged-csrf-token');
      expect(wrongCsrfLogout.status).toBe(403);

      // Retrieve valid CSRF token and log out
      const csrfRes = await agent.get('/api/v1/auth/csrf');
      expect(csrfRes.status).toBe(200);
      const csrfToken = csrfRes.body.data.csrfToken as string;
      expect(csrfToken.length).toBeGreaterThan(20);

      const logoutRes = await agent
        .post('/api/v1/auth/logout')
        .set('X-CSRF-Token', csrfToken);
      expect(logoutRes.status).toBe(200);
      expect(store.sessions[0].revokedAt).not.toBeNull();

      // Revoked session cannot access /me
      const postLogoutMe = await agent.get('/api/v1/auth/me');
      expect(postLogoutMe.status).toBe(401);

      // Expired session rejected
      const agent2 = request.agent(app);
      await agent2.post('/api/v1/auth/login').send({
        email: 'session@example.com',
        password: 'StrongPassword123!',
      });
      store.sessions[1].expiresAt = new Date(Date.now() - 5000);
      const expiredMe = await agent2.get('/api/v1/auth/me');
      expect(expiredMe.status).toBe(401);
    });
  });

  describe('Password Reset', () => {
    it('resets password with valid token, revokes active sessions, and blocks expired or reused tokens', async () => {
      const { rawToken } = seedInvitation({ email: 'reset@example.com' });
      await request(app).post('/api/v1/auth/register').send({
        email: 'reset@example.com',
        password: 'OldPassword123!',
        invitationToken: rawToken,
      });
      await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: extractTokenFromEmail('token') });

      const agent = request.agent(app);
      await agent.post('/api/v1/auth/login').send({
        email: 'reset@example.com',
        password: 'OldPassword123!',
      });

      const forgotUnknown = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'unknown@example.com' });
      expect(forgotUnknown.status).toBe(200);

      const forgotKnown = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'reset@example.com' });
      expect(forgotKnown.status).toBe(200);
      expect(forgotKnown.body.message).toBe(forgotUnknown.body.message);

      const resetToken = extractTokenFromEmail('token');

      const invalidReset = await request(app).post('/api/v1/auth/reset-password').send({
        token: generateSecureToken(32),
        newPassword: 'NewStrongPassword123!',
      });
      expect(invalidReset.status).toBe(400);

      const resetRes = await request(app).post('/api/v1/auth/reset-password').send({
        token: resetToken,
        newPassword: 'NewStrongPassword123!',
      });
      expect(resetRes.status).toBe(200);

      // Reused token rejected
      const reuseRes = await request(app).post('/api/v1/auth/reset-password').send({
        token: resetToken,
        newPassword: 'AnotherPassword123!',
      });
      expect(reuseRes.status).toBe(400);

      // Expired token rejected
      const expiredRaw = generateSecureToken(32);
      store.passwordResetTokens.push({
        id: randomUUID(),
        userId: store.users[0].id,
        tokenHash: hashToken(expiredRaw),
        expiresAt: new Date(Date.now() - 5000),
        usedAt: null,
        createdAt: new Date(),
      });
      const expiredRes = await request(app).post('/api/v1/auth/reset-password').send({
        token: expiredRaw,
        newPassword: 'AnotherPassword123!',
      });
      expect(expiredRes.status).toBe(400);

      // Existing session was revoked
      const meAfterReset = await agent.get('/api/v1/auth/me');
      expect(meAfterReset.status).toBe(401);

      // Old password fails, new password works
      const oldPassLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'reset@example.com',
        password: 'OldPassword123!',
      });
      expect(oldPassLogin.status).toBe(401);

      const newPassLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'reset@example.com',
        password: 'NewStrongPassword123!',
      });
      expect(newPassLogin.status).toBe(200);
    });
  });

  describe('Change Password (POST /api/v1/auth/change-password)', () => {
    it('changes password, enforces CSRF and current password check, keeps current session, and revokes other sessions', async () => {
      const { rawToken } = seedInvitation({ email: 'changepw@example.com' });
      await request(app).post('/api/v1/auth/register').send({
        email: 'changepw@example.com',
        password: 'CurrentPassword123!',
        invitationToken: rawToken,
      });
      await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: extractTokenFromEmail('token') });

      const currentAgent = request.agent(app);
      await currentAgent.post('/api/v1/auth/login').send({
        email: 'changepw@example.com',
        password: 'CurrentPassword123!',
      });

      const otherAgent = request.agent(app);
      await otherAgent.post('/api/v1/auth/login').send({
        email: 'changepw@example.com',
        password: 'CurrentPassword123!',
      });

      const csrfRes = await currentAgent.get('/api/v1/auth/csrf');
      const csrfToken = csrfRes.body.data.csrfToken as string;

      // Missing CSRF rejected
      const noCsrf = await currentAgent.post('/api/v1/auth/change-password').send({
        currentPassword: 'CurrentPassword123!',
        newPassword: 'UpdatedPassword123!',
      });
      expect(noCsrf.status).toBe(403);

      // Same password rejected
      const samePw = await currentAgent
        .post('/api/v1/auth/change-password')
        .set('X-CSRF-Token', csrfToken)
        .send({
          currentPassword: 'CurrentPassword123!',
          newPassword: 'CurrentPassword123!',
        });
      expect(samePw.status).toBe(400);

      // Wrong current password rejected
      const wrongPw = await currentAgent
        .post('/api/v1/auth/change-password')
        .set('X-CSRF-Token', csrfToken)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'UpdatedPassword123!',
        });
      expect(wrongPw.status).toBe(401);

      // Valid password change succeeds
      const okRes = await currentAgent
        .post('/api/v1/auth/change-password')
        .set('X-CSRF-Token', csrfToken)
        .send({
          currentPassword: 'CurrentPassword123!',
          newPassword: 'UpdatedPassword123!',
        });
      expect(okRes.status).toBe(200);

      // Current session remains valid while other session is revoked
      const currentMe = await currentAgent.get('/api/v1/auth/me');
      expect(currentMe.status).toBe(200);
      const otherMe = await otherAgent.get('/api/v1/auth/me');
      expect(otherMe.status).toBe(401);

      // New password works for fresh login
      const reloginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'changepw@example.com',
        password: 'UpdatedPassword123!',
      });
      expect(reloginRes.status).toBe(200);
    });
  });

  describe('Security Controls: Origin, Rate Limiting, Log Redaction, and Env Safety', () => {
    it('rejects state-changing requests from disallowed Origin or cross-site Sec-Fetch-Site', async () => {
      const badOriginRes = await request(app)
        .post('/api/v1/auth/login')
        .set('Origin', 'https://evil.example.net')
        .send({ email: 'a@b.com', password: 'Password123!' });
      expect(badOriginRes.status).toBe(403);

      const crossSiteRes = await request(app)
        .post('/api/v1/auth/login')
        .set('Sec-Fetch-Site', 'cross-site')
        .send({ email: 'a@b.com', password: 'Password123!' });
      expect(crossSiteRes.status).toBe(403);
    });

    it('enforces rate limiting with HTTP 429 when max requests are exceeded', async () => {
      const limitedApp = express();
      limitedApp.post(
        '/limited',
        createRateLimiter({ windowMinutes: 1, maxRequests: 2, message: 'Too many requests' }),
        (_req, res) => {
          res.status(200).json({ ok: true });
        }
      );

      expect((await request(limitedApp).post('/limited')).status).toBe(200);
      expect((await request(limitedApp).post('/limited')).status).toBe(200);
      const blocked = await request(limitedApp).post('/limited');
      expect(blocked.status).toBe(429);
      expect(blocked.body.success).toBe(false);
      expect(blocked.body.errors[0]?.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('never leaks raw tokens or passwords via ConsoleEmailProvider logs', async () => {
      const spy = vi.spyOn(logger, 'info');
      const consoleProvider = new ConsoleEmailProvider();
      const secretToken = 'raw-secret-verification-token-12345';

      await consoleProvider.send({
        to: 'builder@example.com',
        subject: 'Verify your LINKIUM email address',
        html: `<a href="http://localhost:5173/verify-email?token=${secretToken}">Verify</a>`,
        text: `http://localhost:5173/verify-email?token=${secretToken}`,
      });

      expect(spy).toHaveBeenCalledTimes(1);
      const serialized = JSON.stringify(spy.mock.calls);
      expect(serialized).not.toContain(secretToken);
      expect(serialized).not.toContain('builder@example.com');
    });

    it('enforces real email provider and long SESSION_SECRET in production env validation', () => {
      expect(() =>
        parseEnv({
          NODE_ENV: 'production',
          PORT: '5000',
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/linkium',
          FRONTEND_URL: 'https://linkium.example.com',
          APP_BASE_URL: 'https://linkium.example.com',
          SESSION_SECRET: 'short',
          EMAIL_PROVIDER: 'resend',
          EMAIL_API_KEY: 're_placeholder',
        })
      ).toThrowError(/SESSION_SECRET/);

      expect(() =>
        parseEnv({
          NODE_ENV: 'production',
          PORT: '5000',
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/linkium',
          FRONTEND_URL: 'https://linkium.example.com',
          APP_BASE_URL: 'https://linkium.example.com',
          SESSION_SECRET: 'a-very-long-production-session-secret-key-32-plus',
          EMAIL_PROVIDER: 'console',
        })
      ).toThrowError(/EMAIL_PROVIDER cannot be "console" in production/);
    });
  });
});
