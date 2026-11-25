import { useState } from 'react';
import { ArrowRight, Check, Compass, Globe, Layers, Users } from 'lucide-react';
import { BRAND_CONFIG } from '@/src/config/brand';
import { OPPORTUNITY_CATEGORIES } from '@/src/data/categories';
import { DEMO_OPPORTUNITIES } from '@/src/data/opportunities';
import {
  LANDING_HOW_IT_WORKS,
  PLATFORM_BENEFITS,
  WHY_CHOOSE_POINTS,
} from '@/src/data/platform';
import { Opportunity } from '@/src/types/opportunity';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Button } from '@/src/components/ui/Button';
import { SectionHeading } from '@/src/components/ui/SectionHeading';
import { CategoryCard } from '@/src/components/opportunities/CategoryCard';
import { OpportunityCard } from '@/src/components/opportunities/OpportunityCard';
import { OpportunityDetailModal } from '@/src/components/opportunities/OpportunityDetailModal';
import { HeroProductPreview } from '@/src/components/sections/HeroProductPreview';

export function HomePage() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const featuredOpportunities = DEMO_OPPORTUNITIES.filter((item) => item.isFeatured);

  const renderBenefitIcon = (iconName: 'Compass' | 'Users' | 'Layers' | 'Sparkles' | 'Globe') => {
    const className = 'w-5 h-5 text-[#4F46E5]';
    switch (iconName) {
      case 'Compass':
        return <Compass className={className} aria-hidden="true" />;
      case 'Users':
        return <Users className={className} aria-hidden="true" />;
      case 'Layers':
      case 'Sparkles':
        return <Layers className={className} aria-hidden="true" />;
      case 'Globe':
        return <Globe className={className} aria-hidden="true" />;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <PageContainer className="py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-6 flex flex-col gap-6">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
                {BRAND_CONFIG.launchRegion}
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#0F172A] leading-[1.1]">
                Your next opportunity starts here.
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl">
                Discover opportunities, meet people who share your ambitions, and turn your ideas into something meaningful.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Button to="/register" variant="primary" size="lg">
                  Get Started
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
                <Button to="/opportunities" variant="outline" size="lg">
                  Explore Opportunities
                </Button>
              </div>

              <p className="text-xs text-[#64748B] pt-1">
                Built for students, developers, designers, entrepreneurs, professionals, and organizations.
              </p>
            </div>

            <div className="lg:col-span-6">
              <HeroProductPreview />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Platform Benefits */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <PageContainer>
          <SectionHeading
            eyebrow="Why This Ecosystem"
            title="An opportunity-driven network, not another social feed"
            description="Traditional platforms optimize for noise and status updates. We organize around real initiatives, complementary skills, and tangible outcomes."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLATFORM_BENEFITS.map((benefit) => (
              <div
                key={benefit.id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  {renderBenefitIcon(benefit.iconName)}
                </div>
                <h3 className="text-base font-semibold text-[#0F172A]">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <PageContainer>
          <SectionHeading
            eyebrow="How It Works"
            title="From discovery to meaningful execution in three steps"
            action={
              <Button to="/how-it-works" variant="outline" size="md">
                See Full Journey
              </Button>
            }
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {LANDING_HOW_IT_WORKS.map((step) => (
              <div
                key={step.stepNumber}
                className="p-6 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col gap-3"
              >
                <span className="text-xs font-semibold text-[#4F46E5] tabular-nums">
                  {step.stepNumber}
                </span>
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-[#0F172A]">
                  {step.summary}
                </p>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Opportunity Categories */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <PageContainer>
          <SectionHeading
            eyebrow="Categories"
            title="Explore opportunities across six focused tracks"
            description="Select any category to jump directly into filtered demonstration listings."
          />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OPPORTUNITY_CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Featured Opportunities (Demonstration Data) */}
      <section className="py-16 sm:py-20 bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <PageContainer>
          <SectionHeading
            eyebrow="Demonstration Listings · Nepal"
            title="Featured opportunities"
            description="Sample opportunities illustrating how projects, internships, challenges, and learning circles are structured. These examples are demonstration data for Stage 1."
            action={
              <Button to="/opportunities" variant="outline" size="md">
                View All Demo Opportunities
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            }
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onSelect={setSelectedOpportunity}
              />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Why Choose This Platform */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
                Core Value
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] leading-tight">
                Designed to help ambitious people find each other early
              </h2>
              <p className="text-base text-[#64748B] leading-relaxed">
                Great ideas stall when builders cannot find the right designer, engineer, mentor, or opportunity at the right time.
              </p>
              <div className="pt-2">
                <Button to="/about" variant="outline" size="md">
                  Read Our Mission
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl divide-y divide-[#E2E8F0]">
              {WHY_CHOOSE_POINTS.map((point) => (
                <div key={point.title} className="p-5 sm:p-6 flex items-start gap-4">
                  <div className="w-6 h-6 rounded-md bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm sm:text-base font-semibold text-[#0F172A]">
                      {point.title}
                    </h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 bg-[#FFFFFF]">
        <PageContainer size="narrow">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-6 py-12 sm:px-12 sm:py-16 text-center flex flex-col items-center gap-5">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0F172A] max-w-xl leading-tight">
              Your next big opportunity could be one connection away.
            </h2>
            <p className="text-base text-[#64748B] max-w-lg leading-relaxed">
              Explore our Nepal invite-only beta roadmap, preview open demonstration tracks, and prepare your profile for launch.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button to="/register" variant="primary" size="lg">
                Join the Community
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button to="/opportunities" variant="outline" size="lg">
                Browse Demo Listings
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </div>
  );
}
