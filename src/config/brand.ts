export interface SocialLinkConfig {
  id: 'linkedin' | 'github' | 'x';
  label: string;
  href: string;
}

export interface BrandConfig {
  /** Temporary brand name placeholder — update in one central location */
  name: string;
  /** Short placeholder notice for Stage 1 configuration */
  temporaryNotice: string;
  tagline: string;
  philosophy: string;
  launchRegion: string;
  contactEmail: string;
  copyrightYear: number;
  socialLinks: SocialLinkConfig[];
}

export const BRAND_CONFIG: BrandConfig = {
  name: 'LINKIUM',
  temporaryNotice: 'Temporary working name',
  tagline: 'Your next opportunity starts here.',
  philosophy: 'Discover opportunities. Connect with people. Build something meaningful.',
  launchRegion: 'Launching first in Nepal (Invite-Only Beta)',
  contactEmail: 'hello@linkium.example.org',
  copyrightYear: 2026,
  socialLinks: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: '#social-linkedin',
    },
    {
      id: 'github',
      label: 'GitHub',
      href: '#social-github',
    },
    {
      id: 'x',
      label: 'X (Twitter)',
      href: '#social-x',
    },
  ],
};
