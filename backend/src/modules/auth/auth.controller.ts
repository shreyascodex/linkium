import type { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../utils/api-response.js';
import { clearSessionCookie, setSessionCookie } from '../../utils/cookies.js';
import { deriveCsrfToken } from '../../utils/crypto.js';
import {
  changeUserPassword,
  loginWithCredentials,
  logoutSession,
  registerWithInvitation,
  requestPasswordReset,
  resendVerificationEmail,
  resetPasswordWithToken,
  validateInvitationToken,
  verifyEmailToken,
} from './auth.service.js';
import type {
  ChangePasswordInput,
  EmailOnlyInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './auth.validation.js';

export async function handleRegister(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as RegisterInput;
    const user = await registerWithInvitation(body);

    sendSuccess(res, {
      statusCode: 201,
      message: 'Registration successful. Please verify your email address.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as LoginInput;
    const result = await loginWithCredentials(body, {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    setSessionCookie(res, result.rawSessionToken);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleLogout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.auth) {
      await logoutSession(req.auth.sessionId);
    }
    clearSessionCookie(res);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Logged out successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export function handleGetMe(req: Request, res: Response): void {
  sendSuccess(res, {
    statusCode: 200,
    message: 'Authenticated user retrieved',
    data: {
      user: req.auth?.user,
    },
  });
}

export function handleGetSession(req: Request, res: Response): void {
  const user = req.auth?.user ?? null;
  sendSuccess(res, {
    statusCode: 200,
    message: user ? 'Active session retrieved' : 'No active session',
    data: {
      authenticated: Boolean(user),
      user,
    },
  });
}

export function handleGetCsrfToken(req: Request, res: Response): void {
  const auth = req.auth!;
  const csrfToken = deriveCsrfToken(auth.sessionId, auth.rawSessionToken);

  sendSuccess(res, {
    statusCode: 200,
    message: 'CSRF token issued',
    data: {
      csrfToken,
    },
  });
}

export async function handleVerifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as VerifyEmailInput;
    const result = await verifyEmailToken(body);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Email verified successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleResendVerification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as EmailOnlyInput;
    await resendVerificationEmail(body);

    sendSuccess(res, {
      statusCode: 200,
      message:
        'If an eligible unverified account exists for that email, a verification email has been sent.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function handleForgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as EmailOnlyInput;
    await requestPasswordReset(body);

    sendSuccess(res, {
      statusCode: 200,
      message:
        'If an eligible account exists for that email, a password reset link has been sent.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function handleResetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as ResetPasswordInput;
    await resetPasswordWithToken(body);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Password reset successful. Please sign in with your new password.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
}

export async function handleValidateInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = String(req.params.token ?? '');
    const result = await validateInvitationToken(token);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Invitation is valid',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleChangePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = req.auth!;
    const body = req.body as ChangePasswordInput;
    await changeUserPassword(auth.user.id, auth.sessionId, body);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Password updated successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
}
