import { Check } from 'lucide-react';
import { PRICING_TIERS } from '@/src/data/platform';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/cn';

export function PricingPage() {
  return (
    <div>
      <section className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <PageContainer className="py-14 sm:py-20">
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
              Planned Pricing
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A]">
              Accessible for individuals, scalable for organizations
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
              Individual discovery and community participation are designed to stay free. Paid organization tools are currently in development.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-14 sm:py-20 bg-[#F8FAFC]">
        <PageContainer size="narrow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={cn(
                  'bg-[#FFFFFF] rounded-xl p-7 sm:p-8 flex flex-col justify-between gap-8 border',
                  tier.isHighlighted
                    ? 'border-[#4F46E5] shadow-sm'
                    : 'border-[#E2E8F0]'
                )}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-[#0F172A]">{tier.name}</h2>
                      <p className="text-xs text-[#64748B] mt-1">{tier.audience}</p>
                    </div>
                    {tier.isHighlighted && (
                      <Badge variant="primary">Coming Soon</Badge>
                    )}
                  </div>

                  <div className="pb-5 border-b border-[#E2E8F0]">
                    <div className="text-3xl font-bold text-[#0F172A] tracking-tight">
                      {tier.priceLabel}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{tier.billingNote}</p>
                  </div>

                  <p className="text-sm text-[#475569] leading-relaxed">
                    {tier.description}
                  </p>

                  <ul className="flex flex-col gap-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-[#0F172A]"
                      >
                        <Check
                          className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  to={tier.ctaTo}
                  variant={tier.isHighlighted ? 'primary' : 'outline'}
                  size="lg"
                  fullWidth
                >
                  {tier.ctaLabel}
                </Button>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
