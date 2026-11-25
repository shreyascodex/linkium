import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const shouldRunIntegration = Boolean(TEST_DATABASE_URL);

describe.skipIf(!shouldRunIntegration)(
  'LINKIUM Auth Integration (Dedicated Test PostgreSQL)',
  () => {
    beforeAll(async () => {
      process.env.DATABASE_URL = TEST_DATABASE_URL;
    });

    afterAll(async () => {
      const { disconnectDatabase } = await import('../src/config/database.js');
      await disconnectDatabase();
    });

    it('completes full invitation -> register -> verify -> login -> csrf -> logout lifecycle against PostgreSQL', async () => {
      const { prisma } = await import('../src/config/database.js');
      const { app } = await import('../src/app.js');
      const { emailService } = await import('../src/emails/email.service.js');
      const { generateSecureToken, hashToken } = await import('../src/utils/crypto.js');

      const testEmail = `integration-${Date.now()}@example.com`;
      const rawInvite = generateSecureToken(32);
      const sentTexts: string[] = [];

      emailService.setProvider({
        name: 'integration-capture',
        async send(message) {
          sentTexts.push(message.text);
          return { provider: 'integration-capture', messageId: 'int-1' };
        },
      });

      await prisma.invitation.create({
        data: {
          email: testEmail,
          tokenHash: hashToken(rawInvite),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      try {
        const validateRes = await request(app).get(
          `/api/v1/invitations/validate/${rawInvite}`
        );
        expect(validateRes.status).toBe(200);

        const registerRes = await request(app).post('/api/v1/auth/register').send({
          email: testEmail,
          password: 'StrongPassword123!',
          invitationToken: rawInvite,
        });
        expect(registerRes.status).toBe(201);

        const match = sentTexts[0]?.match(/token=([^\s]+)/);
        const verifyToken = decodeURIComponent(match![1]);

        const verifyRes = await request(app)
          .post('/api/v1/auth/verify-email')
          .send({ token: verifyToken });
        expect(verifyRes.status).toBe(200);

        const agent = request.agent(app);
        const loginRes = await agent.post('/api/v1/auth/login').send({
          email: testEmail,
          password: 'StrongPassword123!',
        });
        expect(loginRes.status).toBe(200);

        const meRes = await agent.get('/api/v1/auth/me');
        expect(meRes.status).toBe(200);
        expect(meRes.body.data.user.email).toBe(testEmail);

        const csrfRes = await agent.get('/api/v1/auth/csrf');
        const csrfToken = csrfRes.body.data.csrfToken as string;

        const [skillsRes, interestsRes] = await Promise.all([
          agent.get('/api/v1/skills'),
          agent.get('/api/v1/interests'),
        ]);
        expect(skillsRes.status).toBe(200);
        expect(interestsRes.status).toBe(200);

        const profilePatch = await agent
          .patch('/api/v1/profiles/me')
          .set('X-CSRF-Token', csrfToken)
          .send({
            identityMode: 'REAL',
            username: `int_user_${Date.now()}`,
            displayName: 'Integration Builder',
            location: 'Kathmandu, Nepal',
            onboardingStep: 3,
          });
        expect(profilePatch.status).toBe(200);

        await agent
          .put('/api/v1/profiles/me/skills')
          .set('X-CSRF-Token', csrfToken)
          .send({ skills: [{ skillId: skillsRes.body.data.skills[0].id }] });

        await agent
          .put('/api/v1/profiles/me/interests')
          .set('X-CSRF-Token', csrfToken)
          .send({ interestIds: [interestsRes.body.data.interests[0].id] });

        await agent
          .put('/api/v1/profiles/me/goals')
          .set('X-CSRF-Token', csrfToken)
          .send({ goals: ['find_collaborators'] });

        const completeRes = await agent
          .patch('/api/v1/profiles/me')
          .set('X-CSRF-Token', csrfToken)
          .send({ onboardingStep: 5, onboardingCompleted: true });
        expect(completeRes.status).toBe(200);
        expect(completeRes.body.data.profile.onboardingCompleted).toBe(true);

        // Reload / dashboard verification
        const reloadedProfile = await agent.get('/api/v1/profiles/me');
        expect(reloadedProfile.status).toBe(200);
        expect(reloadedProfile.body.data.profile.onboardingCompleted).toBe(true);

        // Edit profile
        const editRes = await agent
          .patch('/api/v1/profiles/me')
          .set('X-CSRF-Token', csrfToken)
          .send({ location: 'Pokhara, Nepal', identityMode: 'PSEUDONYMOUS' });
        expect(editRes.status).toBe(200);
        expect(editRes.body.data.profile.location).toBe('Pokhara, Nepal');

        const changePwRes = await agent
          .post('/api/v1/auth/change-password')
          .set('X-CSRF-Token', csrfToken)
          .send({
            currentPassword: 'StrongPassword123!',
            newPassword: 'UpdatedPassword123!',
          });
        expect(changePwRes.status).toBe(200);

        const logoutRes = await agent
          .post('/api/v1/auth/logout')
          .set('X-CSRF-Token', csrfToken);
        expect(logoutRes.status).toBe(200);

        // Revoked after logout
        expect((await agent.get('/api/v1/auth/me')).status).toBe(401);

        // Log in again with updated password
        const reloginAgent = request.agent(app);
        await reloginAgent
          .post('/api/v1/auth/login')
          .send({ email: testEmail, password: 'UpdatedPassword123!' })
          .expect(200);

        // Forgot password & reset password
        await request(app)
          .post('/api/v1/auth/forgot-password')
          .send({ email: testEmail })
          .expect(200);

        const resetMatch = sentTexts[sentTexts.length - 1]?.match(/token=([^\s]+)/);
        const resetToken = decodeURIComponent(resetMatch![1]);

        await request(app)
          .post('/api/v1/auth/reset-password')
          .send({ token: resetToken, newPassword: 'FinalResetPassword123!' })
          .expect(200);

        // Confirm pre-reset session returns 401
        expect((await reloginAgent.get('/api/v1/auth/me')).status).toBe(401);
        expect((await reloginAgent.get('/api/v1/profiles/me')).status).toBe(401);
      } finally {
        await prisma.user.deleteMany({ where: { email: testEmail } });
        await prisma.invitation.deleteMany({ where: { email: testEmail } });
      }
    });
  }
);
