export type OpportunityCategoryId =
  | 'projects-collaborations'
  | 'jobs-internships'
  | 'competitions'
  | 'events'
  | 'learning'
  | 'volunteering-other';

export type WorkMode = 'Remote' | 'On-site' | 'Hybrid';

export type OpportunityStatus = 'Open (Demo)' | 'Accepting Collaborators (Demo)' | 'Upcoming (Demo)';

export interface OpportunityCategory {
  id: OpportunityCategoryId;
  name: string;
  shortLabel: string;
  description: string;
  iconName:
    | 'FolderGit2'
    | 'Briefcase'
    | 'Trophy'
    | 'Calendar'
    | 'BookOpen'
    | 'HeartHandshake';
  exampleFocus: string;
}

export interface Opportunity {
  id: string;
  title: string;
  categoryId: OpportunityCategoryId;
  categoryLabel: string;
  description: string;
  fullSummary: string;
  location: string;
  workMode: WorkMode;
  requiredSkills: string[];
  creatorName: string;
  creatorRole: string;
  status: OpportunityStatus;
  timeline: string;
  commitment: string;
  isFeatured: boolean;
  isDemo: true;
}

export interface OpportunityFilters {
  search: string;
  category: OpportunityCategoryId | 'all';
  location: string;
  workMode: WorkMode | 'all';
}

export interface PricingTier {
  id: 'free' | 'premium';
  name: string;
  audience: string;
  priceLabel: string;
  billingNote: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaTo: string;
  isHighlighted?: boolean;
}
