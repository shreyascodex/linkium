import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(255, 'Email must not exceed 255 characters')
  .email('Please provide a valid email address')
  .transform((val) => val.toLowerCase());

export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .refine((val) => /[a-z]/.test(val), 'Password must include at least one lowercase letter')
  .refine((val) => /[A-Z]/.test(val), 'Password must include at least one uppercase letter')
  .refine((val) => /\d/.test(val), 'Password must include at least one number')
  .refine(
    (val) => /[^A-Za-z0-9]/.test(val),
    'Password must include at least one special character'
  );

const tokenSchema = z
  .string()
  .trim()
  .min(16, 'Token is invalid')
  .max(512, 'Token is invalid');

export const registerBodySchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  invitationToken: tokenSchema,
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must not exceed 128 characters'),
});

export const verifyEmailBodySchema = z.object({
  token: tokenSchema,
});

export const emailOnlyBodySchema = z.object({
  email: emailSchema,
});

export const resetPasswordBodySchema = z.object({
  token: tokenSchema,
  newPassword: strongPasswordSchema,
});

export const changePasswordBodySchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .max(128, 'Password must not exceed 128 characters'),
    newPassword: strongPasswordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  });

export const validateInvitationParamsSchema = z.object({
  token: tokenSchema,
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailBodySchema>;
export type EmailOnlyInput = z.infer<typeof emailOnlyBodySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordBodySchema>;
