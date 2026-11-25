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
              Nepal Invite-Only Beta
            </span>
            <h1 className="text-3xl font-bold text-[#0F172A] mt-2">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
            <p className="text-xs text-[#64748B] mt-2">
              {BRAND_CONFIG.name} · Beta Platform Notice
            </p>
          </div>

          {isPrivacy ? (
            <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
              <p>
                During the {BRAND_CONFIG.name} invite-only beta, we collect only the information required to operate member accounts and personalized onboarding: your invited email address, securely hashed password (Argon2id), chosen identity mode (real or pseudonymous), and optional profile details, skills, interests, and goals.
              </p>
              <p>
                Authentication relies on secure, HttpOnly session cookies and session-bound CSRF protection rather than browser localStorage. Single-use verification and password reset tokens are stored strictly as cryptographic hashes and expire automatically.
              </p>
              <p>
                Your account email remains private and is never sold or shared for third-party advertising. You may update your identity visibility, profile information, or password at any time from Profile &amp; Settings.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
              <p>
                Access to {BRAND_CONFIG.name} member accounts during the initial Nepal rollout requires a valid single-use invitation and verified email address. Members are responsible for maintaining accurate or respectful pseudonymous profiles in line with community trust standards.
              </p>
              <p>
                Opportunity listings currently displayed in the public and member discovery directory are sample demonstration records used to illustrate platform categories and scoping. No commercial transactions or paid organization subscriptions are active during the beta.
              </p>
              <p>
                We reserve the right to suspend accounts that misuse invitations, automate credential stuffing, or distribute harmful content.
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
