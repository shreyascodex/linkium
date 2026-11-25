import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { GuestRoute } from '@/src/components/auth/GuestRoute';
import { useAuth } from '@/src/hooks/useAuth';
import { HomePage } from '@/src/pages/public/HomePage';
import { AboutPage } from '@/src/pages/public/AboutPage';
import { HowItWorksPage } from '@/src/pages/public/HowItWorksPage';
import { OpportunitiesPage } from '@/src/pages/public/OpportunitiesPage';
import { PricingPage } from '@/src/pages/public/PricingPage';
import { ContactPage } from '@/src/pages/public/ContactPage';
import { LegalPage } from '@/src/pages/public/LegalPage';
import { LoginPage } from '@/src/pages/auth/LoginPage';
import { RegisterPage } from '@/src/pages/auth/RegisterPage';
import { VerifyEmailPage } from '@/src/pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '@/src/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/src/pages/auth/ResetPasswordPage';
import { OnboardingPage } from '@/src/pages/app/OnboardingPage';
import { DashboardPage } from '@/src/pages/app/DashboardPage';
import { ProfilePage } from '@/src/pages/app/ProfilePage';
import { SettingsPage } from '@/src/pages/app/SettingsPage';
import { ComingSoonPage } from '@/src/pages/app/ComingSoonPage';

function PublicShell() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
}

function OpportunitiesRoute() {
  const { isAuthenticated, user, profile } = useAuth();
  const isOnboardingDone = Boolean(
    profile?.onboardingCompleted ?? user?.onboardingCompleted
  );

  if (isAuthenticated && isOnboardingDone) {
    return (
      <DashboardLayout title="Discover Opportunities">
        <OpportunitiesPage />
      </DashboardLayout>
    );
  }

  return (
    <PublicLayout>
      <OpportunitiesPage />
    </PublicLayout>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Auth routes with PublicLayout */}
        <Route element={<PublicShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Opportunities works seamlessly for both guests and signed-in members */}
        <Route path="/opportunities" element={<OpportunitiesRoute />} />

        {/* Onboarding (authenticated & uncompleted only) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute onboardingOnly>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Authenticated Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireOnboardingComplete>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireOnboardingComplete>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requireOnboardingComplete>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connections"
          element={
            <ProtectedRoute requireOnboardingComplete>
              <ComingSoonPage section="connections" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute requireOnboardingComplete>
              <ComingSoonPage section="projects" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute requireOnboardingComplete>
              <ComingSoonPage section="messages" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
