import { prisma } from '../../config/database.js';

export interface CatalogItemDto {
  id: string;
  name: string;
  slug: string;
}

export const DEFAULT_SKILLS: ReadonlyArray<{ name: string; slug: string }> = [
  { name: 'Frontend Development', slug: 'frontend-development' },
  { name: 'Backend Development', slug: 'backend-development' },
  { name: 'Full-Stack Development', slug: 'full-stack-development' },
  { name: 'UI/UX Design', slug: 'ui-ux-design' },
  { name: 'Graphic Design', slug: 'graphic-design' },
  { name: 'Python', slug: 'python' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'React', slug: 'react' },
  { name: 'Node.js', slug: 'nodejs' },
  { name: 'Data Visualization', slug: 'data-visualization' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Content Creation', slug: 'content-creation' },
  { name: 'Technical Writing', slug: 'technical-writing' },
  { name: 'Business Development', slug: 'business-development' },
  { name: 'Project Management', slug: 'project-management' },
  { name: 'Product Strategy', slug: 'product-strategy' },
];

export const DEFAULT_INTERESTS: ReadonlyArray<{ name: string; slug: string }> = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Startups', slug: 'startups' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { name: 'Design & Craft', slug: 'design-craft' },
  { name: 'Entrepreneurship', slug: 'entrepreneurship' },
  { name: 'Open Source', slug: 'open-source' },
  { name: 'Civic Tech', slug: 'civic-tech' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Education', slug: 'education' },
  { name: 'Science & Research', slug: 'science-research' },
  { name: 'Sports & Community', slug: 'sports-community' },
  { name: 'Creative Projects', slug: 'creative-projects' },
];

export const VALID_GOAL_TYPES = [
  'find_collaborators',
  'discover_projects',
  'find_internships',
  'find_jobs',
  'build_startup',
  'join_team',
  'learn_skills',
  'participate_competitions',
  'find_mentors',
  'share_ideas',
] as const;

export type GoalType = (typeof VALID_GOAL_TYPES)[number];

export async function listSkills(): Promise<CatalogItemDto[]> {
  await prisma.skill.createMany({
    data: [...DEFAULT_SKILLS],
    skipDuplicates: true,
  });

  return prisma.skill.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function listInterests(): Promise<CatalogItemDto[]> {
  await prisma.interest.createMany({
    data: [...DEFAULT_INTERESTS],
    skipDuplicates: true,
  });

  return prisma.interest.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  });
}
