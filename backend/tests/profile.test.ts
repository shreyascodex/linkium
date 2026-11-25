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
        where: { id?: string; userId?: string; revokedAt: null };
        data: { revokedAt: Date };
      }) => {
        let count = 0;
        for (const session of store.sessions) {
          const matchesId = where.id ? session.id === where.id : true;
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
import { emailService } from '../src/emails/email.service.js';
import { generateSecureToken, hashToken } from '../src/utils/crypto.js';

async function registerVerifyAndSignIn(email: string) {
  const rawInvite = generateSecureToken(32);
  store.invitations.push({
    id: randomUUID(),
    email: email.toLowerCase(),
    tokenHash: hashToken(rawInvite),
    note: 'Onboarding Test',
    expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
    usedAt: null,
    createdAt: new Date(),
  });

  await request(app).post('/api/v1/auth/register').send({
    email,
    password: 'StrongPassword123!',
    invitationToken: rawInvite,
  });

  const lastEmail = store.dispatchedEmails[store.dispatchedEmails.length - 1];
  const verifyToken = decodeURIComponent(lastEmail.text.match(/token=([^\s]+)/)![1]);
  await request(app).post('/api/v1/auth/verify-email').send({ token: verifyToken });

  const agent = request.agent(app);
  await agent.post('/api/v1/auth/login').send({
    email,
    password: 'StrongPassword123!',
  });

  const csrfRes = await agent.get('/api/v1/auth/csrf');
  const csrfToken = csrfRes.body.data.csrfToken as string;
  return { agent, csrfToken };
}

describe('LINKIUM Stage 2C/2D Profile, Catalog & Onboarding API', () => {
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
    store.dispatchedEmails = [];

    emailService.setProvider({
      name: 'mock-capture',
      async send(message) {
        store.dispatchedEmails.push(message);
        return { provider: 'mock-capture', messageId: 'msg-1' };
      },
    });
  });

  it('requires authentication on /api/v1/profiles/me and enforces CSRF on mutations', async () => {
    const unauth = await request(app).get('/api/v1/profiles/me');
    expect(unauth.status).toBe(401);

    const { agent } = await registerVerifyAndSignIn('csrf@example.com');
    const missingCsrf = await agent
      .patch('/api/v1/profiles/me')
      .send({ identityMode: 'PSEUDONYMOUS' });
    expect(missingCsrf.status).toBe(403);
  });

  it('seeds and lists skills and interests catalogs', async () => {
    const skillsRes = await request(app).get('/api/v1/skills');
    expect(skillsRes.status).toBe(200);
    expect(skillsRes.body.data.skills.length).toBeGreaterThanOrEqual(10);

    const interestsRes = await request(app).get('/api/v1/interests');
    expect(interestsRes.status).toBe(200);
    expect(interestsRes.body.data.interests.length).toBeGreaterThanOrEqual(8);
  });

  it('supports step-by-step onboarding persistence, enforces uniqueness & URL safety, and marks onboarding complete', async () => {
    const { agent, csrfToken } = await registerVerifyAndSignIn('onboarder@example.com');

    // Initial GET auto-creates empty profile
    const initialRes = await agent.get('/api/v1/profiles/me');
    expect(initialRes.status).toBe(200);
    expect(initialRes.body.data.profile.onboardingCompleted).toBe(false);
    expect(initialRes.body.data.profile.onboardingStep).toBe(1);

    // Rejects completing onboarding prematurely
    const prematureComplete = await agent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({ onboardingCompleted: true });
    expect(prematureComplete.status).toBe(400);
    expect(prematureComplete.body.errors[0]?.code).toBe('ONBOARDING_INCOMPLETE');

    // Rejects unsafe avatar URLs
    const unsafeAvatar = await agent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({ avatarUrl: 'javascript:alert(1)' });
    expect(unsafeAvatar.status).toBe(400);

    // Step 1: Identity Mode
    const step1 = await agent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({ identityMode: 'PSEUDONYMOUS', onboardingStep: 2 });
    expect(step1.status).toBe(200);
    expect(step1.body.data.profile.identityMode).toBe('PSEUDONYMOUS');

    // Step 2: Profile details
    const step2 = await agent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({
        username: 'Himalayan_Builder',
        displayName: 'Himalayan Builder',
        bio: 'Exploring civic tech and distributed collaboration from Pokhara.',
        location: 'Pokhara, Nepal',
        avatarUrl: 'https://example.com/avatar.png',
        onboardingStep: 3,
      });
    expect(step2.status).toBe(200);
    expect(step2.body.data.profile.username).toBe('himalayan_builder');

    // Step 3: Skills
    const skillsRes = await request(app).get('/api/v1/skills');
    const selectedSkillIds = skillsRes.body.data.skills.slice(0, 2).map((s: { id: string }) => s.id);
    const step3 = await agent
      .put('/api/v1/profiles/me/skills')
      .set('X-CSRF-Token', csrfToken)
      .send({
        skills: selectedSkillIds.map((skillId: string) => ({
          skillId,
          proficiency: 'Intermediate',
        })),
      });
    expect(step3.status).toBe(200);
    expect(step3.body.data.profile.skills).toHaveLength(2);

    // Rejects unknown skill IDs
    const badSkill = await agent
      .put('/api/v1/profiles/me/skills')
      .set('X-CSRF-Token', csrfToken)
      .send({ skills: [{ skillId: randomUUID() }] });
    expect(badSkill.status).toBe(400);

    // Step 4: Interests
    const interestsRes = await request(app).get('/api/v1/interests');
    const selectedInterestIds = interestsRes.body.data.interests
      .slice(0, 2)
      .map((i: { id: string }) => i.id);
    const step4 = await agent
      .put('/api/v1/profiles/me/interests')
      .set('X-CSRF-Token', csrfToken)
      .send({ interestIds: selectedInterestIds });
    expect(step4.status).toBe(200);
    expect(step4.body.data.profile.interests).toHaveLength(2);

    // Step 5: Goals
    const step5 = await agent
      .put('/api/v1/profiles/me/goals')
      .set('X-CSRF-Token', csrfToken)
      .send({ goals: ['find_collaborators', 'discover_projects'] });
    expect(step5.status).toBe(200);
    expect(step5.body.data.profile.goals).toEqual([
      'find_collaborators',
      'discover_projects',
    ]);

    // Complete onboarding
    const completeRes = await agent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', csrfToken)
      .send({ onboardingStep: 5, onboardingCompleted: true });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.profile.onboardingCompleted).toBe(true);
    expect(completeRes.body.data.profile.completionPercentage).toBe(100);

    // Auth /me reflects onboardingCompleted = true
    const meRes = await agent.get('/api/v1/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.onboardingCompleted).toBe(true);

    // Second user cannot claim the same username
    const second = await registerVerifyAndSignIn('second@example.com');
    const dupUsernameRes = await second.agent
      .patch('/api/v1/profiles/me')
      .set('X-CSRF-Token', second.csrfToken)
      .send({ username: 'himalayan_builder', displayName: 'Second User' });
    expect(dupUsernameRes.status).toBe(409);
    expect(dupUsernameRes.body.errors[0]?.code).toBe('USERNAME_TAKEN');
  });
});
