import type { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../utils/api-response.js';
import { listInterests, listSkills } from './catalog.service.js';
import {
  getOrCreateUserProfile,
  replaceUserGoals,
  replaceUserInterests,
  replaceUserSkills,
  updateUserProfile,
} from './profile.service.js';
import type {
  UpdateGoalsInput,
  UpdateInterestsInput,
  UpdateProfileInput,
  UpdateSkillsInput,
} from './profile.validation.js';

export async function handleGetMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.auth!.user.id;
    const profile = await getOrCreateUserProfile(userId);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.auth!.user.id;
    const body = req.body as UpdateProfileInput;
    const profile = await updateUserProfile(userId, body);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateMySkills(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.auth!.user.id;
    const body = req.body as UpdateSkillsInput;
    const profile = await replaceUserSkills(userId, body);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Skills updated successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateMyInterests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.auth!.user.id;
    const body = req.body as UpdateInterestsInput;
    const profile = await replaceUserInterests(userId, body);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Interests updated successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateMyGoals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.auth!.user.id;
    const body = req.body as UpdateGoalsInput;
    const profile = await replaceUserGoals(userId, body);

    sendSuccess(res, {
      statusCode: 200,
      message: 'Goals updated successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleListSkills(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const skills = await listSkills();

    sendSuccess(res, {
      statusCode: 200,
      message: 'Skills catalog retrieved',
      data: {
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function handleListInterests(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const interests = await listInterests();

    sendSuccess(res, {
      statusCode: 200,
      message: 'Interests catalog retrieved',
      data: {
        interests,
      },
    });
  } catch (error) {
    next(error);
  }
}
