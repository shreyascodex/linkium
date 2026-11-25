import { Router } from 'express';
import {
  handleListInterests,
  handleListSkills,
} from '../modules/profiles/profile.controller.js';

export const skillsRouter = Router();
skillsRouter.get('/', handleListSkills);

export const interestsRouter = Router();
interestsRouter.get('/', handleListInterests);
