import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { interestsRouter, skillsRouter } from './catalog.routes.js';
import { healthRouter } from './health.routes.js';
import { invitationRouter } from './invitation.routes.js';
import { profileRouter } from './profile.routes.js';

export const apiV1Router = Router();

apiV1Router.use('/health', healthRouter);
apiV1Router.use('/auth', authRouter);
apiV1Router.use('/invitations', invitationRouter);
apiV1Router.use('/profiles', profileRouter);
apiV1Router.use('/skills', skillsRouter);
apiV1Router.use('/interests', interestsRouter);
