import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireCsrf } from '../middleware/csrf.middleware.js';
import { validateOrigin } from '../middleware/origin.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  handleGetMyProfile,
  handleUpdateMyGoals,
  handleUpdateMyInterests,
  handleUpdateMyProfile,
  handleUpdateMySkills,
} from '../modules/profiles/profile.controller.js';
import {
  updateGoalsBodySchema,
  updateInterestsBodySchema,
  updateProfileBodySchema,
  updateSkillsBodySchema,
} from '../modules/profiles/profile.validation.js';

export const profileRouter = Router();

profileRouter.get('/me', requireAuth, handleGetMyProfile);

profileRouter.patch(
  '/me',
  validateOrigin,
  requireAuth,
  requireCsrf,
  validateRequest({ body: updateProfileBodySchema }),
  handleUpdateMyProfile
);

profileRouter.put(
  '/me/skills',
  validateOrigin,
  requireAuth,
  requireCsrf,
  validateRequest({ body: updateSkillsBodySchema }),
  handleUpdateMySkills
);

profileRouter.put(
  '/me/interests',
  validateOrigin,
  requireAuth,
  requireCsrf,
  validateRequest({ body: updateInterestsBodySchema }),
  handleUpdateMyInterests
);

profileRouter.put(
  '/me/goals',
  validateOrigin,
  requireAuth,
  requireCsrf,
  validateRequest({ body: updateGoalsBodySchema }),
  handleUpdateMyGoals
);
