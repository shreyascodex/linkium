import { Router } from 'express';
import { authRateLimiter } from '../middleware/rate-limit.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { handleValidateInvitation } from '../modules/auth/auth.controller.js';
import { validateInvitationParamsSchema } from '../modules/auth/auth.validation.js';

export const invitationRouter = Router();

invitationRouter.get(
  '/validate/:token',
  authRateLimiter,
  validateRequest({ params: validateInvitationParamsSchema }),
  handleValidateInvitation
);
