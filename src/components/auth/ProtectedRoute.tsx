import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/hooks/useAuth';
import { LoadingState } from '@/src/components/ui/LoadingState';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboardingComplete?: boolean;
  onboardingOnly?: boolean;
}

export function ProtectedRoute({
  children,
  requireOnboardingComplete = false,
  onboardingOnly = false,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, user, profile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <LoadingState label="Restoring your session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.status !== 'ACTIVE' || !user.emailVerifiedAt) {
    return <Navigate to="/login" replace />;
  }

  const isOnboardingDone = Boolean(
    profile?.onboardingCompleted ?? user.onboardingCompleted
  );

  if (requireOnboardingComplete && !isOnboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingOnly && isOnboardingDone) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
