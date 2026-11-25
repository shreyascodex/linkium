import { ArrowRight, FolderKanban, MessageSquare, Users } from 'lucide-react';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { Button } from '@/src/components/ui/Button';

export type ComingSoonSection = 'connections' | 'projects' | 'messages';

const SECTION_COPY: Record<
  ComingSoonSection,
  {
    title: string;
    heading: string;
    description: string;
    icon: typeof Users;
  }
> = {
  connections: {
    title: 'Connections',
    heading: 'Meaningful connections are coming in Stage 3',
    description:
      'Discover like-minded builders, send collaborator requests, and build trusted networks across Nepal and beyond once our beta directory opens.',
    icon: Users,
  },
  projects: {
    title: 'Projects',
    heading: 'Collaborative project spaces are coming soon',
    description:
      'Create project rooms, define collaborator roles, and invite teammates directly from opportunity matches in the upcoming release.',
    icon: FolderKanban,
  },
  messages: {
    title: 'Messages',
    heading: 'Direct messaging is scheduled for Stage 3',
    description:
      'Purposeful 1-on-1 and team conversations tied to opportunities and collaborations will launch after member onboarding cohorts settle.',
    icon: MessageSquare,
  },
};

export function ComingSoonPage({ section }: { section: ComingSoonSection }) {
  const config = SECTION_COPY[section];
  const Icon = config.icon;

  return (
    <DashboardLayout title={config.title}>
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-8 sm:p-12 max-w-2xl">
        <div className="w-11 h-11 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-5">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mb-2">
          {config.heading}
        </h2>
        <p className="text-sm text-[#64748B] leading-relaxed mb-6">
          {config.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button to="/opportunities" variant="primary" size="md">
            Discover Opportunities
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button to="/dashboard" variant="outline" size="md">
            Back to Overview
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
