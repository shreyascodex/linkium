import { OpportunityCategory } from '@/src/types/opportunity';

export const OPPORTUNITY_CATEGORIES: OpportunityCategory[] = [
  {
    id: 'projects-collaborations',
    name: 'Projects & Collaborations',
    shortLabel: 'Projects',
    description:
      'Find co-builders, designers, engineers, and researchers to launch side projects, civic tools, or early-stage products.',
    iconName: 'FolderGit2',
    exampleFocus: 'Open-source tools, startup prototypes, research builds',
  },
  {
    id: 'jobs-internships',
    name: 'Jobs & Internships',
    shortLabel: 'Jobs & Internships',
    description:
      'Explore early-career roles, fellowships, and structured internships with growing teams and studios.',
    iconName: 'Briefcase',
    exampleFocus: 'Engineering, product design, operations, research',
  },
  {
    id: 'competitions',
    name: 'Competitions',
    shortLabel: 'Competitions',
    description:
      'Discover hackathons, design challenges, case competitions, and student innovation sprints.',
    iconName: 'Trophy',
    exampleFocus: 'Hackathons, climate challenges, product pitch events',
  },
  {
    id: 'events',
    name: 'Events',
    shortLabel: 'Events',
    description:
      'Join focused builder meetups, founder roundtables, portfolio reviews, and technical workshops.',
    iconName: 'Calendar',
    exampleFocus: 'City chapters, demo days, design critiques',
  },
  {
    id: 'learning',
    name: 'Learning Opportunities',
    shortLabel: 'Learning',
    description:
      'Apply for peer cohorts, technical mentorship circles, scholarships, and structured skill workshops.',
    iconName: 'BookOpen',
    exampleFocus: 'Study cohorts, fellowships, mentored tracks',
  },
  {
    id: 'volunteering-other',
    name: 'Volunteering & Other',
    shortLabel: 'Volunteering',
    description:
      'Contribute skills to community initiatives, nonprofit technology programs, and regional ecosystem efforts.',
    iconName: 'HeartHandshake',
    exampleFocus: 'Civic initiatives, education outreach, community ops',
  },
];
