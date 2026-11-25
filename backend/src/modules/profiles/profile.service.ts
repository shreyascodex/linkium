import type { IdentityMode, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/api-response.js';
import type {
  UpdateGoalsInput,
  UpdateInterestsInput,
  UpdateProfileInput,
  UpdateSkillsInput,
} from './profile.validation.js';

export interface ProfileSkillDto {
  skillId: string;
  name: string;
  slug: string;
  proficiency: string | null;
}

export interface ProfileInterestDto {
  interestId: string;
  name: string;
  slug: string;
}

export interface UserProfileDto {
  id: string;
  userId: string;
  identityMode: IdentityMode;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  onboardingStep: number;
  onboardingCompleted: boolean;
  skills: ProfileSkillDto[];
  interests: ProfileInterestDto[];
  goals: string[];
  completionPercentage: number;
  missingFields: string[];
  createdAt: Date;
  updatedAt: Date;
}

function calculateProfileCompletion(params: {
  username: string | null;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  skillsCount: number;
  interestsCount: number;
  goalsCount: number;
}): { completionPercentage: number; missingFields: string[] } {
  const checks: Array<{ key: string; label: string; weight: number; done: boolean }> = [
    { key: 'username', label: 'Username', weight: 15, done: Boolean(params.username) },
    { key: 'displayName', label: 'Display Name', weight: 15, done: Boolean(params.displayName) },
    { key: 'skills', label: 'At least one skill', weight: 20, done: params.skillsCount > 0 },
    { key: 'interests', label: 'At least one interest', weight: 15, done: params.interestsCount > 0 },
    { key: 'goals', label: 'At least one goal', weight: 15, done: params.goalsCount > 0 },
    { key: 'bio', label: 'Short bio', weight: 10, done: Boolean(params.bio) },
    { key: 'location', label: 'Location', weight: 5, done: Boolean(params.location) },
    { key: 'avatarUrl', label: 'Avatar image URL', weight: 5, done: Boolean(params.avatarUrl) },
  ];

  let score = 0;
  const missingFields: string[] = [];
  for (const item of checks) {
    if (item.done) {
      score += item.weight;
    } else {
      missingFields.push(item.label);
    }
  }

  return {
    completionPercentage: score,
    missingFields,
  };
}

async function fetchUserProfileDto(
  tx: Prisma.TransactionClient,
  userId: string
): Promise<UserProfileDto> {
  let profile = await tx.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await tx.profile.create({
      data: {
        userId,
        identityMode: 'REAL',
        onboardingStep: 1,
        onboardingCompleted: false,
      },
    });
  }

  const [userSkills, userInterests, userGoals] = await Promise.all([
    tx.userSkill.findMany({
      where: { userId },
      include: {
        skill: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    tx.userInterest.findMany({
      where: { userId },
      include: {
        interest: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    tx.userGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const skills: ProfileSkillDto[] = userSkills.map((item) => ({
    skillId: item.skillId,
    name: item.skill.name,
    slug: item.skill.slug,
    proficiency: item.proficiency,
  }));

  const interests: ProfileInterestDto[] = userInterests
    .map((item) => ({
      interestId: item.interestId,
      name: item.interest.name,
      slug: item.interest.slug,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const goals = userGoals.map((item) => item.goalType);

  const { completionPercentage, missingFields } = calculateProfileCompletion({
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    location: profile.location,
    avatarUrl: profile.avatarUrl,
    skillsCount: skills.length,
    interestsCount: interests.length,
    goalsCount: goals.length,
  });

  return {
    id: profile.id,
    userId: profile.userId,
    identityMode: profile.identityMode,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    location: profile.location,
    onboardingStep: profile.onboardingStep,
    onboardingCompleted: profile.onboardingCompleted,
    skills,
    interests,
    goals,
    completionPercentage,
    missingFields,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function getOrCreateUserProfile(
  userId: string
): Promise<UserProfileDto> {
  return prisma.$transaction((tx) => fetchUserProfileDto(tx, userId));
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<UserProfileDto> {
  return prisma.$transaction(async (tx) => {
    let existing = await tx.profile.findUnique({
      where: { userId },
    });

    if (!existing) {
      existing = await tx.profile.create({
        data: {
          userId,
          identityMode: 'REAL',
          onboardingStep: 1,
          onboardingCompleted: false,
        },
      });
    }

    if (input.username !== undefined) {
      const conflict = await tx.profile.findUnique({
        where: { username: input.username },
        select: { userId: true },
      });

      if (conflict && conflict.userId !== userId) {
        throw new AppError('Username is already taken', 409, [
          {
            field: 'username',
            code: 'USERNAME_TAKEN',
            message: 'That username is already in use. Please choose another.',
          },
        ]);
      }
    }

    const nextUsername =
      input.username !== undefined ? input.username : existing.username;
    const nextDisplayName =
      input.displayName !== undefined ? input.displayName : existing.displayName;
    const nextIdentityMode =
      input.identityMode !== undefined ? input.identityMode : existing.identityMode;

    if (input.onboardingCompleted === true) {
      const [skillsCount, interestsCount, goalsCount] = await Promise.all([
        tx.userSkill.count({ where: { userId } }),
        tx.userInterest.count({ where: { userId } }),
        tx.userGoal.count({ where: { userId } }),
      ]);

      const missing: string[] = [];
      if (!nextIdentityMode) missing.push('identityMode');
      if (!nextUsername) missing.push('username');
      if (!nextDisplayName) missing.push('displayName');
      if (skillsCount === 0) missing.push('skills');
      if (interestsCount === 0) missing.push('interests');
      if (goalsCount === 0) missing.push('goals');

      if (missing.length > 0) {
        throw new AppError('Complete all required onboarding steps first', 400, [
          {
            code: 'ONBOARDING_INCOMPLETE',
            message: `Required onboarding details missing: ${missing.join(', ')}.`,
          },
        ]);
      }
    }

    await tx.profile.update({
      where: { userId },
      data: {
        ...(input.identityMode !== undefined
          ? { identityMode: input.identityMode }
          : {}),
        ...(input.username !== undefined ? { username: input.username } : {}),
        ...(input.displayName !== undefined
          ? { displayName: input.displayName }
          : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.onboardingStep !== undefined
          ? { onboardingStep: input.onboardingStep }
          : {}),
        ...(input.onboardingCompleted !== undefined
          ? { onboardingCompleted: input.onboardingCompleted }
          : {}),
      },
    });

    return fetchUserProfileDto(tx, userId);
  });
}

export async function replaceUserSkills(
  userId: string,
  input: UpdateSkillsInput
): Promise<UserProfileDto> {
  const dedupedMap = new Map<string, string | null>();
  for (const item of input.skills) {
    dedupedMap.set(item.skillId, item.proficiency ?? null);
  }
  const uniqueIds = Array.from(dedupedMap.keys());

  return prisma.$transaction(async (tx) => {
    if (uniqueIds.length > 0) {
      const existingSkills = await tx.skill.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });

      if (existingSkills.length !== uniqueIds.length) {
        throw new AppError('One or more selected skills were not found', 400, [
          {
            field: 'skills',
            code: 'INVALID_SKILL_IDS',
            message: 'Please select skills from the available catalog.',
          },
        ]);
      }
    }

    await tx.userSkill.deleteMany({ where: { userId } });

    if (uniqueIds.length > 0) {
      await tx.userSkill.createMany({
        data: uniqueIds.map((skillId) => ({
          userId,
          skillId,
          proficiency: dedupedMap.get(skillId) ?? null,
        })),
      });
    }

    return fetchUserProfileDto(tx, userId);
  });
}

export async function replaceUserInterests(
  userId: string,
  input: UpdateInterestsInput
): Promise<UserProfileDto> {
  const uniqueIds = Array.from(new Set(input.interestIds));

  return prisma.$transaction(async (tx) => {
    if (uniqueIds.length > 0) {
      const existingInterests = await tx.interest.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });

      if (existingInterests.length !== uniqueIds.length) {
        throw new AppError('One or more selected interests were not found', 400, [
          {
            field: 'interestIds',
            code: 'INVALID_INTEREST_IDS',
            message: 'Please select interests from the available catalog.',
          },
        ]);
      }
    }

    await tx.userInterest.deleteMany({ where: { userId } });

    if (uniqueIds.length > 0) {
      await tx.userInterest.createMany({
        data: uniqueIds.map((interestId) => ({
          userId,
          interestId,
        })),
      });
    }

    return fetchUserProfileDto(tx, userId);
  });
}

export async function replaceUserGoals(
  userId: string,
  input: UpdateGoalsInput
): Promise<UserProfileDto> {
  const uniqueGoals = Array.from(new Set(input.goals));

  return prisma.$transaction(async (tx) => {
    await tx.userGoal.deleteMany({ where: { userId } });

    if (uniqueGoals.length > 0) {
      await tx.userGoal.createMany({
        data: uniqueGoals.map((goalType) => ({
          userId,
          goalType,
        })),
      });
    }

    return fetchUserProfileDto(tx, userId);
  });
}
