import { BRAND_CONFIG } from '@/src/config/brand';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Button } from '@/src/components/ui/Button';

export interface LegalPageProps {
  type: 'privacy' | 'terms';
}

export function LegalPage({ type }: LegalPageProps) {
  const isPrivacy = type === 'privacy';

  return (
    <section className="py-14 sm:py-20 bg-[#F8FAFC]">
      <PageContainer size="narrow">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-7 sm:p-10 flex flex-col gap-6">
          <div className="border-b border-[#E2E8F0] pb-5">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
              Stage 1 Legal Placeholder
            </span>
            <h1 className="text-3xl font-bold text-[#0F172A] mt-2">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
            <p className="text-xs text-[#64748B] mt-2">
              {BRAND_CONFIG.name} · Draft placeholder for pre-beta public preview
            </p>
          </div>

          {isPrivacy ? (
            <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
              <p>
                During Stage 1 of the {BRAND_CONFIG.name} public website foundation, no backend database, user authentication system, or persistent personal data storage is active.
              </p>
              <p>
                Entries typed into preview forms (such as sign-in, registration, or contact previews) remain strictly in temporary browser memory for UI validation and are never transmitted to external servers or stored in localStorage.
              </p>
              <p>
                Full privacy disclosures, data retention policies, and regional compliance notices will be published prior to opening the Nepal invite-only beta.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
              <p>
                This website represents Stage 1 of the {BRAND_CONFIG.name} platform foundation. All listed opportunities, profiles, and collaboration briefs are demonstration examples only.
              </p>
              <p>
                No commercial transactions, live applications, or binding commitments are executed through this preview build. Paid organization plans remain marked as Coming Soon.
              </p>
              <p>
                Complete terms governing community conduct, opportunity postings, and organization accounts will accompany Stage 2 platform onboarding.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-[#E2E8F0]">
            <Button to="/" variant="outline" size="md">
              Return to Home
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
