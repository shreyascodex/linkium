import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { FULL_USER_JOURNEY } from '@/src/data/platform';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/cn';

export function HowItWorksPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentStage = FULL_USER_JOURNEY[activeIndex];

  return (
    <div>
      <section className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <PageContainer className="py-14 sm:py-20">
          <div className="max-w-3xl flex flex-col gap-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
              How It Works
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] leading-tight">
              A clear path from curiosity to shipped collaboration
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
              Follow the five-stage workflow designed to replace aimless networking with structured discovery and action.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Interactive Journey Explorer */}
      <section className="py-14 sm:py-20 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 flex flex-col gap-2.5" role="tablist" aria-label="User journey stages">
              {FULL_USER_JOURNEY.map((stage, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={stage.stepNumber}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer flex items-start gap-4',
                      isActive
                        ? 'bg-[#FFFFFF] border-[#4F46E5] shadow-xs'
                        : 'bg-[#FFFFFF]/70 border-[#E2E8F0] hover:bg-[#FFFFFF] hover:border-[#CBD5E1]'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-semibold tabular-nums px-2 py-1 rounded-md shrink-0',
                        isActive
                          ? 'bg-[#4F46E5] text-white'
                          : 'bg-[#F1F5F9] text-[#64748B]'
                      )}
                    >
                      {stage.stepNumber}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {stage.title}
                      </span>
                      <span className="text-xs text-[#64748B] truncate">
                        {stage.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <span className="text-xs font-semibold text-[#4F46E5] tabular-nums">
                    Stage {currentStage.stepNumber} of 05
                  </span>
                  <h2 className="text-2xl font-bold text-[#0F172A] mt-1">
                    {currentStage.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeIndex === 0}
                    onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeIndex === FULL_USER_JOURNEY.length - 1}
                    onClick={() =>
                      setActiveIndex((prev) =>
                        Math.min(FULL_USER_JOURNEY.length - 1, prev + 1)
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>

              <p className="text-base text-[#475569] leading-relaxed">
                {currentStage.description}
              </p>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  What happens in this stage
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {currentStage.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2.5 text-sm text-[#0F172A]"
                    >
                      <CheckCircle2
                        className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#64748B]">
                  Ready to see how opportunities are structured?
                </span>
                <Button to="/opportunities" variant="primary" size="md">
                  Explore Opportunities
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Complete Linear Summary */}
      <section className="py-16 bg-[#FFFFFF]">
        <PageContainer>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-[#0F172A]">
                Prepare for the invite-only beta
              </h2>
              <p className="text-sm text-[#64748B]">
                Preview the onboarding flow or review upcoming community and organization plans.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button to="/pricing" variant="outline" size="md">
                View Plans
              </Button>
              <Button to="/register" variant="primary" size="md">
                Get Started
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
