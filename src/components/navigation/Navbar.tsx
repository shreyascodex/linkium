import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { Button } from '@/src/components/ui/Button';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { useAuth } from '@/src/hooks/useAuth';
import { cn } from '@/src/lib/cn';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Explore Opportunities', to: '/opportunities' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Pricing', to: '/pricing' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, profile, logout } = useAuth();

  const onboardingDone = Boolean(
    profile?.onboardingCompleted ?? user?.onboardingCompleted
  );
  const appTarget = onboardingDone ? '/dashboard' : '/onboarding';
  const appLabel = onboardingDone ? 'Dashboard' : 'Continue Setup';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#E2E8F0]">
      <PageContainer>
        <div className="h-16 flex items-center justify-between gap-8">
          <BrandMark />

          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 py-1',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded-sm',
                    isActive
                      ? 'text-[#4F46E5]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 px-2 py-1.5 rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                >
                  Sign Out
                </button>
                <Button to={appTarget} variant="primary" size="sm">
                  {appLabel}
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 px-2 py-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                >
                  Sign In
                </Link>
                <Button to="/register" variant="primary" size="sm">
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2 -mr-2 rounded-lg text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </PageContainer>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden border-t border-[#E2E8F0] bg-[#FFFFFF]"
        >
          <PageContainer className="py-4 flex flex-col gap-1">
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#EEF2FF] text-[#4F46E5]'
                        : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Button to={appTarget} variant="primary" size="md" fullWidth>
                    {appLabel}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => void handleLogout()}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button to="/login" variant="outline" size="md" fullWidth>
                    Sign In
                  </Button>
                  <Button to="/register" variant="primary" size="md" fullWidth>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </PageContainer>
        </div>
      )}
    </header>
  );
}
