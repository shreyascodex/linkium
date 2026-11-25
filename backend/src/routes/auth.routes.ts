import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware.js';
import { requireCsrf } from '../middleware/csrf.middleware.js';
import { validateOrigin } from '../middleware/origin.middleware.js';
import {
  authRateLimiter,
  emailRateLimiter,
} from '../middleware/rate-limit.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  handleChangePassword,
  handleForgotPassword,
  handleGetCsrfToken,
  handleGetMe,
  handleGetSession,
  handleLogin,
  handleLogout,
  handleRegister,
  handleResendVerification,
  handleResetPassword,
  handleVerifyEmail,
} from '../modules/auth/auth.controller.js';
import {
  changePasswordBodySchema,
  emailOnlyBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} from '../modules/auth/auth.validation.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  validateOrigin,
  authRateLimiter,
  validateRequest({ body: registerBodySchema }),
  handleRegister
);

authRouter.post(
  '/login',
  validateOrigin,
  authRateLimiter,
  validateRequest({ body: loginBodySchema }),
  handleLogin
);

authRouter.post(
  '/logout',
  validateOrigin,
  requireAuth,
  requireCsrf,
  handleLogout
);

authRouter.get('/me', requireAuth, handleGetMe);

authRouter.get('/session', optionalAuth, handleGetSession);

authRouter.get('/csrf', requireAuth, handleGetCsrfToken);

authRouter.post(
  '/change-password',
  validateOrigin,
  requireAuth,
  requireCsrf,
  authRateLimiter,
  validateRequest({ body: changePasswordBodySchema }),
  handleChangePassword
);

authRouter.post(
  '/verify-email',
  validateOrigin,
  authRateLimiter,
  validateRequest({ body: verifyEmailBodySchema }),
  handleVerifyEmail
);

authRouter.post(
  '/resend-verification',
  validateOrigin,
  emailRateLimiter,
  validateRequest({ body: emailOnlyBodySchema }),
  handleResendVerification
);

authRouter.post(
  '/forgot-password',
  validateOrigin,
  emailRateLimiter,
  validateRequest({ body: emailOnlyBodySchema }),
  handleForgotPassword
);

authRouter.post(
  '/reset-password',
  validateOrigin,
  authRateLimiter,
  validateRequest({ body: resetPasswordBodySchema }),
  handleResetPassword
);
