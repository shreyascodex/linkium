import { Globe, Layers, Target } from 'lucide-react';
import { BRAND_CONFIG } from '@/src/config/brand';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Button } from '@/src/components/ui/Button';
import { SectionHeading } from '@/src/components/ui/SectionHeading';

const PILLARS = [
  {
    icon: Target,
    title: 'Mission',
    body: 'Make meaningful opportunities and reliable collaborators discoverable regardless of who you already know or which university or city you start from.',
  },
  {
    icon: Globe,
    title: 'Vision',
    body: 'Begin in Nepal with a high-trust, invite-only builder ecosystem and expand thoughtfully into a global network connecting emerging talent with real projects.',
  },
  {
    icon: Layers,
    title: 'Philosophy',
    body: 'This is not a noisy social media timeline. Every feature exists to help people find aligned opportunities, form focused teams, and build something lasting.',
  },
];

const AUDIENCE_GROUPS = [
  {
    group: 'Students & Early Builders',
    detail: 'Move beyond classroom assignments by joining real collaborative projects, hackathons, and study circles.',
  },
  {
    group: 'Developers & Designers',
    detail: 'Find complementary teammates, open-source initiatives, and product studios aligned with your craft.',
  },
  {
    group: 'Entrepreneurs & Founders',
    detail: 'Meet early collaborators, test ideas in regional challenges, and connect with thoughtful contributors.',
  },
  {
    group: 'Professionals & Organizations',
    detail: 'Host internships, mentor emerging talent, share technical workshops, and publish structured opportunities.',
  },
];

export function AboutPage() {
  return (
    <div>
      <section className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <PageContainer className="py-14 sm:py-20">
          <div className="max-w-3xl flex flex-col gap-5">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
              About {BRAND_CONFIG.name}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] leading-tight">
              Discover opportunities. Connect with people. Build something meaningful.
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
              Across universities, studios, and growing cities, talented people often miss life-changing projects simply because opportunities are trapped inside private group chats and closed networks. {BRAND_CONFIG.name} is being built to change that.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <PageContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-bold text-[#0F172A]">{pillar.title}</h2>
                  <p className="text-sm text-[#64748B] leading-relaxed">{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 sm:py-20 bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <PageContainer>
          <SectionHeading
            eyebrow="Who It Serves"
            title="Built for people who want to contribute and grow"
            description="Whether you are starting your first weekend build or coordinating an organization fellowship, the ecosystem adapts to practical collaboration."
          />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {AUDIENCE_GROUPS.map((item) => (
              <div
                key={item.group}
                className="p-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col gap-2"
              >
                <h3 className="text-base font-semibold text-[#0F172A]">{item.group}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 sm:py-20 bg-[#F8FAFC]">
        <PageContainer size="narrow">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-lg">
              <h2 className="text-xl font-bold text-[#0F172A]">
                Starting in Nepal, designed for global scale
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Our initial invite-only beta focuses on Kathmandu, Lalitpur, Pokhara, Chitwan, Biratnagar, and remote builders across Nepal before opening internationally.
              </p>
            </div>
            <div className="shrink-0">
              <Button to="/opportunities" variant="primary" size="md">
                Explore Demo Feed
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
