import { PricingTier } from '@/src/types/opportunity';

export interface BenefitItem {
  id: string;
  title: string;
  description: string;
  iconName: 'Compass' | 'Users' | 'Layers' | 'Sparkles' | 'Globe';
}

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  summary: string;
  detail: string;
}

export interface JourneyStage {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  outcomes: string[];
}

export const PLATFORM_BENEFITS: BenefitItem[] = [
  {
    id: 'beyond-network',
    title: 'Discover beyond your immediate circle',
    description:
      'Break out of closed campus groups and scattered chat threads with structured, searchable opportunities across cities and disciplines.',
    iconName: 'Compass',
  },
  {
    id: 'shared-ambitions',
    title: 'Meet people by shared ambition',
    description:
      'Connect around concrete goals, complementary skills, and curiosity—not social feed popularity or vanity engagement.',
    iconName: 'Users',
  },
  {
    id: 'meaningful-builds',
    title: 'Turn intent into shipped work',
    description:
      'Move smoothly from discovering an idea or challenge to forming a focused team and documenting real outcomes.',
    iconName: 'Layers',
  },
];

export const LANDING_HOW_IT_WORKS: HowItWorksStep[] = [
  {
    stepNumber: '01',
    title: 'Discover',
    summary: 'Find opportunities that match your interests.',
    detail:
      'Filter projects, internships, competitions, and learning cohorts by skills, location, and collaboration format.',
  },
  {
    stepNumber: '02',
    title: 'Connect',
    summary: 'Meet people with complementary skills and ambitions.',
    detail:
      'Reach builders, designers, researchers, and organizers who are actively looking for thoughtful collaborators.',
  },
  {
    stepNumber: '03',
    title: 'Build',
    summary: 'Turn ideas into real projects and achievements.',
    detail:
      'Collaborate with clarity, ship tangible work, and build a credible track record of initiatives you helped bring to life.',
  },
];

export const WHY_CHOOSE_POINTS = [
  {
    title: 'Discover opportunities beyond your existing network',
    description:
      'Access curated projects, internships, fellowships, and competitions without needing personal introductions first.',
  },
  {
    title: 'Meet people based on shared ambitions',
    description:
      'Signal what you want to build or learn next so aligned peers and mentors can find you intentionally.',
  },
  {
    title: 'Find reliable collaborators',
    description:
      'Clear expectations around timeline, skills, and commitment make it easier to form committed project teams.',
  },
  {
    title: 'Showcase your abilities through real work',
    description:
      'Let prototypes, designs, research notes, and community contributions speak louder than static resumes.',
  },
  {
    title: 'Build meaningful projects that last',
    description:
      'Start in Nepal’s growing builder ecosystem and connect into a wider international network as the platform scales.',
  },
];

export const FULL_USER_JOURNEY: JourneyStage[] = [
  {
    stepNumber: '01',
    title: 'Create a profile',
    subtitle: 'Share your skills, interests, and direction',
    description:
      'Set up a focused profile highlighting what you can contribute, what you are currently learning, and the types of opportunities you want to explore.',
    outcomes: [
      'List technical, creative, or operational skills clearly',
      'Specify preferred cities, remote availability, and time commitment',
      'Highlight past projects, coursework, or community initiatives',
    ],
  },
  {
    stepNumber: '02',
    title: 'Discover opportunities',
    subtitle: 'Search with precision instead of scrolling feeds',
    description:
      'Browse opportunities organized by clear categories—projects, jobs and internships, competitions, events, learning cohorts, and volunteering.',
    outcomes: [
      'Filter by category, location, and remote or on-site format',
      'Review transparent scope, timeline, and skill expectations upfront',
      'Bookmark relevant opportunities for your current semester or quarter',
    ],
  },
  {
    stepNumber: '03',
    title: 'Connect',
    subtitle: 'Start purposeful conversations',
    description:
      'Introduce yourself directly to opportunity creators and fellow applicants with context around how your skills complement the team.',
    outcomes: [
      'Avoid cold, generic outreach with structured context',
      'Find co-builders who balance your strengths—like pairing engineering with design',
      'Build trusted relationships across universities, studios, and cities',
    ],
  },
  {
    stepNumber: '04',
    title: 'Collaborate',
    subtitle: 'Align on scope and execute together',
    description:
      'Move from initial interest to clear milestones, whether you are shipping an open-source tool, entering a hackathon, or joining an internship cohort.',
    outcomes: [
      'Define shared goals and realistic weekly commitments',
      'Work effectively across remote, hybrid, or local campus setups',
      'Iterate with feedback from peers and organizers',
    ],
  },
  {
    stepNumber: '05',
    title: 'Achieve',
    subtitle: 'Build verifiable momentum over time',
    description:
      'Each completed project, competition entry, or mentorship cohort strengthens your visible body of work and opens the door to larger opportunities.',
    outcomes: [
      'Document tangible outcomes and shipped deliverables',
      'Grow a credible reputation based on contribution',
      'Unlock future collaborations across Nepal and globally',
    ],
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Community Access',
    audience: 'For students, builders, and individual explorers',
    priceLabel: 'Free',
    billingNote: 'Planned permanent free tier',
    description:
      'Everything individuals need to discover opportunities, connect with collaborators, and participate in the ecosystem.',
    features: [
      'Public opportunity discovery and structured search',
      'Personal capability and interest profile',
      'Apply or express interest in open opportunities',
      'Post community projects and collaboration calls',
      'Participate in regional Nepal invite-only beta cohorts',
    ],
    ctaLabel: 'Join the Beta Preview',
    ctaTo: '/register',
    isHighlighted: false,
  },
  {
    id: 'premium',
    name: 'Pro & Organizations',
    audience: 'For teams, startups, universities, and power organizers',
    priceLabel: 'Coming Soon',
    billingNote: 'Pricing to be announced after beta',
    description:
      'Advanced matching, structured applicant workflows, and ecosystem tools for organizations hosting fellowships, roles, and competitions.',
    features: [
      'Everything in Community Access',
      'Structured applicant shortlisting and skill-based matching',
      'Organization profiles for studios, startups, and campus clubs',
      'Multi-seat team collaboration for hiring and event hosts',
      'Priority support during regional and global rollouts',
    ],
    ctaLabel: 'Request Early Access Info',
    ctaTo: '/contact',
    isHighlighted: true,
  },
];
