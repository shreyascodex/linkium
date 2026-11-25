import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { BRAND_CONFIG } from '@/src/config/brand';
import { BrandMark } from './BrandMark';
import { PageContainer } from '@/src/components/layout/PageContainer';

export function Footer() {
  const getSocialIcon = (id: 'linkedin' | 'github' | 'x') => {
    switch (id) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4" aria-hidden="true" />;
      case 'github':
        return <Github className="w-4 h-4" aria-hidden="true" />;
      case 'x':
        return <Twitter className="w-4 h-4" aria-hidden="true" />;
    }
  };

  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0]">
      <PageContainer className="py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 flex flex-col gap-4">
            <BrandMark />
            <p className="text-sm text-[#64748B] max-w-sm leading-relaxed">
              {BRAND_CONFIG.philosophy}
            </p>
            <p className="text-xs text-[#64748B]">
              {BRAND_CONFIG.launchRegion} · {BRAND_CONFIG.temporaryNotice}
            </p>
          </div>

          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Platform
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#64748B]">
              <li>
                <Link to="/opportunities" className="hover:text-[#0F172A] transition-colors">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[#0F172A] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[#0F172A] transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Company
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#64748B]">
              <li>
                <Link to="/about" className="hover:text-[#0F172A] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#0F172A] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#0F172A] transition-colors">
                  Join Beta
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0F172A]">
              Legal & Social
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#64748B]">
              <li>
                <Link to="/privacy" className="hover:text-[#0F172A] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#0F172A] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-2">
              {BRAND_CONFIG.socialLinks.map((social) => (
                <Link
                  key={social.id}
                  to={`/contact?channel=${social.id}`}
                  aria-label={`${social.label} (configurable placeholder)`}
                  title={`${social.label} — placeholder link`}
                  className="p-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-colors"
                >
                  {getSocialIcon(social.id)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>
            © {BRAND_CONFIG.copyrightYear} {BRAND_CONFIG.name}. All rights reserved.
          </p>
          <p>
            Stage 1 Public Foundation · Demonstration data only
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
