export type IdentityMode = 'REAL' | 'PSEUDONYMOUS';

export interface CatalogItem {
  id: string;
  name: string;
  slug: string;
}

export interface ProfileSkill {
  skillId: string;
  name: string;
  slug: string;
  proficiency: string | null;
}

export interface ProfileInterest {
  interestId: string;
  name: string;
  slug: string;
}

export interface UserProfile {
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
  skills: ProfileSkill[];
  interests: ProfileInterest[];
  goals: GoalType[];
  completionPercentage: number;
  missingFields: string[];
  createdAt: string;
  updatedAt: string;
}

export const GOAL_OPTIONS = [
  {
    id: 'find_collaborators',
    label: 'Find collaborators',
    description: 'Meet builders, designers, or researchers to work alongside you.',
  },
  {
    id: 'discover_projects',
    label: 'Discover projects',
    description: 'Browse active builds, open-source initiatives, and civic prototypes.',
  },
  {
    id: 'find_internships',
    label: 'Find internships',
    description: 'Explore mentored early-career roles and cohort internships.',
  },
  {
    id: 'find_jobs',
    label: 'Find jobs',
    description: 'Connect with startups and teams hiring across product and engineering.',
  },
  {
    id: 'build_startup',
    label: 'Build a startup',
    description: 'Find founding partners, domain experts, and early product feedback.',
  },
  {
    id: 'join_team',
    label: 'Join a team',
    description: 'Contribute your skills to an existing team with clear goals.',
  },
  {
    id: 'learn_skills',
    label: 'Learn skills',
    description: 'Join peer study groups, cohorts, and hands-on learning circles.',
  },
  {
    id: 'participate_competitions',
    label: 'Participate in competitions',
    description: 'Form teams for hackathons, design sprints, and innovation challenges.',
  },
  {
    id: 'find_mentors',
    label: 'Find mentors',
    description: 'Get practical guidance from experienced builders and operators.',
  },
  {
    id: 'share_ideas',
    label: 'Share ideas',
    description: 'Publish early concepts and test resonance with the community.',
  },
] as const;

export type GoalType = (typeof GOAL_OPTIONS)[number]['id'];

export function getGoalLabel(goalId: string): string {
  return GOAL_OPTIONS.find((item) => item.id === goalId)?.label ?? goalId;
}
