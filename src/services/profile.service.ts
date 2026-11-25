import type {
  CatalogItem,
  GoalType,
  IdentityMode,
  UserProfile,
} from '@/src/types/profile';
import { apiRequest } from './api';

export interface UpdateProfilePayload {
  identityMode?: IdentityMode;
  username?: string;
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  location?: string | null;
  onboardingStep?: number;
  onboardingCompleted?: boolean;
}

export const profileService = {
  async getMyProfile(): Promise<UserProfile> {
    const res = await apiRequest<{ profile: UserProfile }>('/api/v1/profiles/me');
    return res.data.profile;
  },

  async updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const res = await apiRequest<{ profile: UserProfile }>('/api/v1/profiles/me', {
      method: 'PATCH',
      body: payload,
      requiresCsrf: true,
    });
    return res.data.profile;
  },

  async getSkillsCatalog(): Promise<CatalogItem[]> {
    const res = await apiRequest<{ skills: CatalogItem[] }>('/api/v1/skills');
    return res.data.skills;
  },

  async getInterestsCatalog(): Promise<CatalogItem[]> {
    const res = await apiRequest<{ interests: CatalogItem[] }>('/api/v1/interests');
    return res.data.interests;
  },

  async updateMySkills(
    skills: Array<{ skillId: string; proficiency?: string | null }>
  ): Promise<UserProfile> {
    const res = await apiRequest<{ profile: UserProfile }>(
      '/api/v1/profiles/me/skills',
      {
        method: 'PUT',
        body: { skills },
        requiresCsrf: true,
      }
    );
    return res.data.profile;
  },

  async updateMyInterests(interestIds: string[]): Promise<UserProfile> {
    const res = await apiRequest<{ profile: UserProfile }>(
      '/api/v1/profiles/me/interests',
      {
        method: 'PUT',
        body: { interestIds },
        requiresCsrf: true,
      }
    );
    return res.data.profile;
  },

  async updateMyGoals(goals: GoalType[]): Promise<UserProfile> {
    const res = await apiRequest<{ profile: UserProfile }>(
      '/api/v1/profiles/me/goals',
      {
        method: 'PUT',
        body: { goals },
        requiresCsrf: true,
      }
    );
    return res.data.profile;
  },
};
