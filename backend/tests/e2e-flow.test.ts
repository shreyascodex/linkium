import { randomUUID } from 'node:crypto';
import type { IdentityMode, UserStatus } from '@prisma/client';
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

interface MemProfile {
  id: string;
  userId: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  identityMode: IdentityMode;
  location: string | null;
  onboardingStep: number;
  onboardingCompleted: boolean;
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

interface MemSkill {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

interface MemInterest {
  id: string;
  name: string;
  slug: string;
}

interface MemUserSkill {
  userId: string;
  skillId: string;
  proficiency: string | null;
  createdAt: Date;
}

interface MemUserInterest {
  userId: string;
  interestId: string;
}

interface MemUserGoal {
  id: string;
  userId: string;
  goalType: string;
  createdAt: Date;
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
  profiles: [] as MemProfile[],
  sessions: [] as MemSession[],
  skills: [] as MemSkill[],
  interests: [] as MemInterest[],
  userSkills: [] as MemUserSkill[],
  userInterests: [] as MemUserInterest[],
  userGoals: [] as MemUserGoal[],
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
      findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
        const user =
          where.email !== undefined
            ? store.users.find((u) => u.email === where.email)
            : store.users.find((u) => u.id === where.id);
        if (!user) return null;
        const profile = store.profiles.find((p) => p.userId === user.id) ?? null;
        return {
          ...user,
          profile: profile ? { onboardingCompleted: profile.onboardingCompleted } : null,
        };
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
    profile: {
      findUnique: async ({
        where,
      }: {
        where: { userId?: string; username?: string };
      }) => {
        if (where.userId !== undefined) {
          return store.profiles.find((p) => p.userId === where.userId) ?? null;
        }
        if (where.username !== undefined) {
          return store.profiles.find((p) => p.username === where.username) ?? null;
        }
        return null;
      },
      create: async ({ data }: { data: Partial<MemProfile> & { userId: string } }) => {
        const now = new Date();
        const profile: MemProfile = {
          id: randomUUID(),
          userId: data.userId,
          username: data.username ?? null,
          displayName: data.displayName ?? null,
          bio: data.bio ?? null,
          avatarUrl: data.avatarUrl ?? null,
          identityMode: data.identityMode ?? 'REAL',
          location: data.location ?? null,
          onboardingStep: data.onboardingStep ?? 1,
          onboardingCompleted: data.onboardingCompleted ?? false,
          createdAt: now,
          updatedAt: now,
        };
        store.profiles.push(profile);
        return profile;
      },
      update: async ({
        where,
        data,
      }: {
        where: { userId: string };
        data: Partial<MemProfile>;
      }) => {
        const profile = store.profiles.find((p) => p.userId === where.userId);
        if (!profile) throw new Error('Profile not found');
        Object.assign(profile, data, { updatedAt: new Date() });
        return profile;
      },
    },
    skill: {
      createMany: async ({
        data,
      }: {
        data: Array<{ name: string; slug: string }>;
        skipDuplicates?: boolean;
      }) => {
        let count = 0;
        for (const item of data) {
          if (!store.skills.some((s) => s.slug === item.slug)) {
            store.skills.push({
              id: randomUUID(),
              name: item.name,
              slug: item.slug,
              createdAt: new Date(),
            });
            count += 1;
          }
        }
        return { count };
      },
      findMany: async ({
        where,
      }: {
        where?: { id?: { in: string[] } };
      } = {}) => {
        const items = where?.id?.in
          ? store.skills.filter((s) => where.id!.in.includes(s.id))
          : [...store.skills];
        return items.sort((a, b) => a.name.localeCompare(b.name));
      },
    },
    interest: {
      createMany: async ({
        data,
      }: {
        data: Array<{ name: string; slug: string }>;
        skipDuplicates?: boolean;
      }) => {
        let count = 0;
        for (const item of data) {
          if (!store.interests.some((i) => i.slug === item.slug)) {
            store.interests.push({
              id: randomUUID(),
              name: item.name,
              slug: item.slug,
            });
            count += 1;
          }
        }
        return { count };
      },
      findMany: async ({
        where,
      }: {
        where?: { id?: { in: string[] } };
      } = {}) => {
        const items = where?.id?.in
          ? store.interests.filter((i) => where.id!.in.includes(i.id))
          : [...store.interests];
        return items.sort((a, b) => a.name.localeCompare(b.name));
      },
    },
    userSkill: {
      findMany: async ({ where }: { where: { userId: string } }) =>
        store.userSkills
          .filter((us) => us.userId === where.userId)
          .map((us) => ({
            ...us,
            skill: store.skills.find((s) => s.id === us.skillId)!,
          })),
      count: async ({ where }: { where: { userId: string } }) =>
        store.userSkills.filter((us) => us.userId === where.userId).length,
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        const before = store.userSkills.length;
        store.userSkills = store.userSkills.filter((us) => us.userId !== where.userId);
        return { count: before - store.userSkills.length };
      },
      createMany: async ({
        data,
      }: {
        data: Array<{ userId: string; skillId: string; proficiency: string | null }>;
      }) => {
        for (const item of data) {
          store.userSkills.push({ ...item, createdAt: new Date() });
        }
        return { count: data.length };
      },
    },
    userInterest: {
      findMany: async ({ where }: { where: { userId: string } }) =>
        store.userInterests
          .filter((ui) => ui.userId === where.userId)
          .map((ui) => ({
            ...ui,
            interest: store.interests.find((i) => i.id === ui.interestId)!,
          })),
      count: async ({ where }: { where: { userId: string } }) =>
        store.userInterests.filter((ui) => ui.userId === where.userId).length,
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        const before = store.userInterests.length;
        store.userInterests = store.userInterests.filter(
          (ui) => ui.userId !== where.userId
        );
        return { count: before - store.userInterests.length };
      },
      createMany: async ({
        data,
      }: {
        data: Array<{ userId: string; interestId: string }>;
      }) => {
        for (const item of data) {
          store.userInterests.push({ ...item });
        }
        return { count: data.length };
      },
    },
    userGoal: {
      findMany: async ({ where }: { where: { userId: string } }) =>
        store.userGoals.filter((ug) => ug.userId === where.userId),
      count: async ({ where }: { where: { userId: string } }) =>
        store.userGoals.filter((ug) => ug.userId === where.userId).length,
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        const before = store.userGoals.length;
        store.userGoals = store.userGoals.filter((ug) => ug.userId !== where.userId);
        return { count: before - store.userGoals.length };
      },
      createMany: async ({
        data,
      }: {
        data: Array<{ userId: string; goalType: string }>;
      }) => {
        for (const item of data) {
          store.userGoals.push({
            id: randomUUID(),
            userId: item.userId,
            goalType: item.goalType,
            createdAt: new Date(),
          });
        }
        return { count: data.length };
      },
    },
    emailVerificationToken: {
      findUnique: async ({ where }: { where: { tokenHash: string } }) => {
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
      findUnique: async ({ where }: { where: { tokenHash: string } }) => {
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
        const profile = store.profiles.find((p) => p.userId === user.id) ?? null;
        return {
          ...session,
          user: {
            ...user,
            profile: profile ? { onboardingCompleted: profile.onboardingCompleted } : null,
          },
        };
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
      const snapshot = {
        users: store.users.map((u) => ({ ...u })),
        profiles: store.profiles.map((p) => ({ ...p })),
        sessions: store.sessions.map((s) => ({ ...s })),
        userSkills: store.userSkills.map((s) => ({ ...s })),
        userInterests: store.userInterests.map((i) => ({ ...i })),
        userGoals: store.userGoals.map((g) => ({ ...g })),
        invitations: store.invitations.map((i) => ({ ...i })),
        verificationTokens: store.verificationTokens.map((t) => ({ ...t })),
        passwordResetTokens: store.passwordResetTokens.map((t) => ({ ...t })),
      };
      try {
        return await fn(tx);
      } catch (err) {
        store.users = snapshot.users;
        store.profiles = snapshot.profiles;
        store.sessions = snapshot.sessions;
        store.userSkills = snapshot.userSkills;
        store.userInterests = snapshot.userInterests;
        store.userGoals = snapshot.userGoals;
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
import { logger } from '../src/config/logger.js';
import { emailService } from '../src/emails/email.service.js';
import { ResendEmailProvider } from '../src/emails/providers/resend.provider.js';
import { generateSecureToken, hashToken } from '../src/utils/crypto.js';

function extractLastEmailToken(paramName: string): string {
  const last = store.dispatchedEmails[store.dispatchedEmails.length - 1];
  expect(last).toBeDefined();
  const match = last.text.match(new RegExp(`${paramName}=([^\\s]+)`));
  expect(match?.[1]).toBeTruthy();
  return decodeURIComponent(match![1]);
}

describe('LINKIUM Stage 2E End-to-End Lifecycle & Email Failure Safety', () => {
  beforeEach(() => {
    store.users = [];
    store.profiles = [];
    store.sessions = [];
    store.skills = [];
    store.interests = [];
    store.userSkills = [];
    store.userInterests = [];
    store.userGoals = [];
    store.invitations = [];
    store.verificationTokens = [];
    store.passwordResetTokens = [];
    store.dispatchedEmails = [];

    emailService.setProvider({
      name: 'e2e-capture',
      async send(message) {
        store.dispatchedEmails.push(message);
        return { provider: 'e2e-capture', messageId: 'e2e-msg' };
      },
    });
  });

  it('executes the complete 15-step member journey from invitation through password reset and session revocation', async () => {
    const email = 'nepal.builder@example.com';
    const initialPassword = 'InitialPassword123!';
    const changedPassword = 'ChangedPassword123!';
    const resetPassword = 'ResetPassword123!';

    // 1. Create & validate invitation
    const rawInvite = generateSecureToken(32);
    store.invitations.push({
      id: randomUUID(),
      email,
      tokenHash: hashToken(rawInvite),
      note: 'Kathmandu Beta Cohort',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
      usedAt: null,
      createdAt: new Date(),
    });

    const inviteRes = await request(app).get(`/api/v1/invitations/validate/${rawInvite}`);
    expect(inviteRes.status).toBe(200);
    expect(inviteRes.body.data.valid).toBe(true);
    expect(inviteRes.body.data.email).toBe(email);

    // 2. Register with invitation
    const registerRes = await request(app).post('/api/v1/auth/register').send({
      email,
      password: initialPassword,
      invitationToken: rawInvite,
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.user.status).toBe('PENDING_VERIFICATION');

    // 3. Receive verification email
    expect(store.dispatchedEmails).toHaveLength(1);
    expect(store.dispatchedEmails[0].subject).toContain('Verify');
    const verifyToken = extractLastEmailToken('token');

    // 4. Verify account
    const verifyRes = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: verifyToken });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.verified).toBe(true);

    // 5. Log in (HttpOnly cookie session)
    const primaryAgent = request.agent(app);
    const loginRes = await primaryAgent.post('/api/v1/auth/login').send({
      email,
      password: initialPassword,
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.onboardingCompleted).toBe(false);
    expect(loginRes.headers['set-cookie']?.[0]).toContain('HttpOnly');

    const csrfRes = await primaryAgent.get('/api/v1/auth/csrf');
    const csrfToken = csrfRes.body.data.csrfToken as string;

    // 6. Complete all 5 onboarding steps with mid-flow refresh persistence checks
    const initialProfile = await primaryAgent.get('/api/v1/profiles/me');
    expect(initialProfile.status).toBe(200);
    expect(initialProfile.body.data.profile.onboardingStep).toBe(1);

    // Step 1: Identity Mode
    await primaryAgent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({ identityMode: 'REAL', onboardingStep: 2 })
      .expect(200);

    // Step 2: Basic Profile
    await primaryAgent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({
        username: 'nepal_builder',
        displayName: 'Nepal Builder',
        location: 'Kathmandu, Nepal',
        avatarUrl: 'https://example.com/nepal-builder.png',
        bio: 'Building open-source civic tools across Nepal.',
        onboardingStep: 3,
      })
      .expect(200);

    // 7. Reload/re-fetch mid-onboarding to verify progress persists
    const midReload = await primaryAgent.get('/api/v1/profiles/me');
    expect(midReload.status).toBe(200);
    expect(midReload.body.data.profile.onboardingStep).toBe(3);
    expect(midReload.body.data.profile.username).toBe('nepal_builder');
    expect(midReload.body.data.profile.onboardingCompleted).toBe(false);

    // Step 3: Skills
    const skillsCatalog = await primaryAgent.get('/api/v1/skills');
    const chosenSkillId = skillsCatalog.body.data.skills[0].id as string;
    await primaryAgent
      .put('/api/v1/profiles/me/skills')
      .set('X-CSRF-Token', csrfToken)
      .send({ skills: [{ skillId: chosenSkillId, proficiency: 'Advanced' }] })
      .expect(200);
    await primaryAgent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({ onboardingStep: 4 })
      .expect(200);

    // Step 4: Interests
    const interestsCatalog = await primaryAgent.get('/api/v1/interests');
    const chosenInterestId = interestsCatalog.body.data.interests[0].id as string;
    await primaryAgent
      .put('/api/v1/profiles/me/interests')
      .set('X-CSRF-Token', csrfToken)
      .send({ interestIds: [chosenInterestId] })
      .expect(200);
    await primaryAgent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({ onboardingStep: 5 })
      .expect(200);

    // Step 5: Goals + Finalize Onboarding
    await primaryAgent
      .put('/api/v1/profiles/me/goals')
      .set('X-CSRF-Token', csrfToken)
      .send({ goals: ['find_collaborators', 'discover_projects'] })
      .expect(200);

    const completeRes = await primaryAgent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({ onboardingStep: 5, onboardingCompleted: true });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.profile.onboardingCompleted).toBe(true);

    // 8. Refresh & Dashboard state check
    const postReloadAuth = await primaryAgent.get('/api/v1/auth/me');
    expect(postReloadAuth.status).toBe(200);
    expect(postReloadAuth.body.data.user.onboardingCompleted).toBe(true);

    const dashboardProfile = await primaryAgent.get('/api/v1/profiles/me');
    expect(dashboardProfile.status).toBe(200);
    expect(dashboardProfile.body.data.profile.completionPercentage).toBe(100);
    expect(dashboardProfile.body.data.profile.skills).toHaveLength(1);
    expect(dashboardProfile.body.data.profile.interests).toHaveLength(1);
    expect(dashboardProfile.body.data.profile.goals).toEqual([
      'find_collaborators',
      'discover_projects',
    ]);

    // 9. Edit profile
    const editRes = await primaryAgent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({
        identityMode: 'PSEUDONYMOUS',
        location: 'Lalitpur, Nepal',
        bio: 'Updated bio after completing onboarding.',
      });
    expect(editRes.status).toBe(200);
    expect(editRes.body.data.profile.identityMode).toBe('PSEUDONYMOUS');
    expect(editRes.body.data.profile.location).toBe('Lalitpur, Nepal');

    // Open a secondary session to verify selective session revocation on password change
    const secondaryAgent = request.agent(app);
    await secondaryAgent
      .post('/api/v1/auth/login')
      .send({ email, password: initialPassword })
      .expect(200);

    // 10. Change password
    const changePwRes = await primaryAgent
      .post('/api/v1/auth/change-password')
      .set('X-CSRF-Token', csrfToken)
      .send({
        currentPassword: initialPassword,
        newPassword: changedPassword,
      });
    expect(changePwRes.status).toBe(200);

    // Other session is revoked while current session stays active
    expect((await secondaryAgent.get('/api/v1/auth/me')).status).toBe(401);
    expect((await primaryAgent.get('/api/v1/auth/me')).status).toBe(200);

    // 11. Log out
    const logoutRes = await primaryAgent
      .post('/api/v1/auth/logout')
      .set('X-CSRF-Token', csrfToken);
    expect(logoutRes.status).toBe(200);

    // Logged-out session is revoked
    expect((await primaryAgent.get('/api/v1/auth/me')).status).toBe(401);
    expect((await primaryAgent.get('/api/v1/profiles/me')).status).toBe(401);

    // 12. Log in again with updated password
    const reloginAgent = request.agent(app);
    await reloginAgent
      .post('/api/v1/auth/login')
      .send({ email, password: changedPassword })
      .expect(200);

    // 13. Forgot password
    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email });
    expect(forgotRes.status).toBe(200);
    expect(store.dispatchedEmails).toHaveLength(2);
    const resetToken = extractLastEmailToken('token');

    // 14. Reset password
    const resetRes = await request(app).post('/api/v1/auth/reset-password').send({
      token: resetToken,
      newPassword: resetPassword,
    });
    expect(resetRes.status).toBe(200);

    // 15. Confirm revoked session returns 401
    expect((await reloginAgent.get('/api/v1/auth/me')).status).toBe(401);
    expect((await reloginAgent.get('/api/v1/profiles/me')).status).toBe(401);

    // Verify new reset password logs in cleanly and preserves profile state
    const finalAgent = request.agent(app);
    await finalAgent
      .post('/api/v1/auth/login')
      .send({ email, password: resetPassword })
      .expect(200);
    const finalProfile = await finalAgent.get('/api/v1/profiles/me');
    expect(finalProfile.status).toBe(200);
    expect(finalProfile.body.data.profile.location).toBe('Lalitpur, Nepal');
  });

  it('maps Resend API/network errors to 502 EMAIL_DELIVERY_FAILED, rolls back registration transaction, and never logs secrets', async () => {
    const errorSpy = vi.spyOn(logger, 'error');
    const provider = new ResendEmailProvider('re_secret_test_key_12345', 'LINKIUM <no-reply@example.com>');

    // Simulate Resend API error response
    const mockClient = (provider as unknown as {
      client: { emails: { send: ReturnType<typeof vi.fn> } };
    }).client;
    mockClient.emails.send = vi.fn().mockResolvedValue({
      data: null,
      error: { name: 'validation_error', message: 'Domain not verified' },
    });

    emailService.setProvider(provider);

    const rawInvite = generateSecureToken(32);
    store.invitations.push({
      id: randomUUID(),
      email: 'rollback@example.com',
      tokenHash: hashToken(rawInvite),
      note: 'Rollback test',
      expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
      usedAt: null,
      createdAt: new Date(),
    });

    const apiFailRes = await request(app).post('/api/v1/auth/register').send({
      email: 'rollback@example.com',
      password: 'StrongPassword123!',
      invitationToken: rawInvite,
    });

    expect(apiFailRes.status).toBe(502);
    expect(apiFailRes.body.errors[0]?.code).toBe('EMAIL_DELIVERY_FAILED');
    // Transaction rolled back cleanly: no user created, invitation remains unused
    expect(store.users).toHaveLength(0);
    expect(store.verificationTokens).toHaveLength(0);
    expect(store.invitations[0].usedAt).toBeNull();

    // Simulate network transport exception
    mockClient.emails.send = vi.fn().mockRejectedValue(new Error('ECONNRESET'));

    const networkFailRes = await request(app).post('/api/v1/auth/register').send({
      email: 'rollback@example.com',
      password: 'StrongPassword123!',
      invitationToken: rawInvite,
    });

    expect(networkFailRes.status).toBe(502);
    expect(networkFailRes.body.errors[0]?.code).toBe('EMAIL_DELIVERY_FAILED');
    expect(store.users).toHaveLength(0);
    expect(store.invitations[0].usedAt).toBeNull();

    const serializedLogs = JSON.stringify(errorSpy.mock.calls);
    expect(serializedLogs).not.toContain('re_secret_test_key_12345');
    expect(serializedLogs).not.toContain('rollback@example.com');
  });
});
