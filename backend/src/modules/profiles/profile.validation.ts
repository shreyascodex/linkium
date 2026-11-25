import { z } from 'zod';
import { VALID_GOAL_TYPES } from './catalog.service.js';

const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

function isSafeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const optionalTrimmedString = (maxLength: number, label: string) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} must not exceed ${maxLength} characters`)
    .transform((val) => (val.length === 0 ? null : val));

export const updateProfileBodySchema = z.object({
  identityMode: z.enum(['REAL', 'PSEUDONYMOUS']).optional(),
  username: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase())
    .refine(
      (val) => USERNAME_PATTERN.test(val),
      'Username must be 3–30 characters using lowercase letters, numbers, or underscores'
    )
    .optional(),
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must not exceed 100 characters')
    .optional(),
  bio: z
    .union([optionalTrimmedString(500, 'Bio'), z.null()])
    .optional(),
  avatarUrl: z
    .union([
      z
        .string()
        .trim()
        .max(500, 'Avatar URL must not exceed 500 characters')
        .transform((val) => (val.length === 0 ? null : val))
        .refine(
          (val) => val === null || isSafeHttpUrl(val),
          'Avatar URL must be a valid http or https URL'
        ),
      z.null(),
    ])
    .optional(),
  location: z
    .union([optionalTrimmedString(120, 'Location'), z.null()])
    .optional(),
  onboardingStep: z.number().int().min(1).max(5).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export const updateSkillsBodySchema = z.object({
  skills: z
    .array(
      z.object({
        skillId: z.string().uuid('Skill ID must be a valid UUID'),
        proficiency: z
          .union([
            z
              .string()
              .trim()
              .max(50, 'Proficiency must not exceed 50 characters')
              .transform((val) => (val.length === 0 ? null : val)),
            z.null(),
          ])
          .optional(),
      })
    )
    .max(30, 'You can select up to 30 skills'),
});

export const updateInterestsBodySchema = z.object({
  interestIds: z
    .array(z.string().uuid('Interest ID must be a valid UUID'))
    .max(30, 'You can select up to 30 interests'),
});

export const updateGoalsBodySchema = z.object({
  goals: z
    .array(z.enum(VALID_GOAL_TYPES))
    .max(10, 'You can select up to 10 goals'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;
export type UpdateSkillsInput = z.infer<typeof updateSkillsBodySchema>;
export type UpdateInterestsInput = z.infer<typeof updateInterestsBodySchema>;
export type UpdateGoalsInput = z.infer<typeof updateGoalsBodySchema>;
