import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/src/hooks/useAuth';
import { LoadingState } from '@/src/components/ui/LoadingState';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, user, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LoadingState label="Checking session..." />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const isOnboardingDone = Boolean(
      profile?.onboardingCompleted ?? user.onboardingCompleted
    );
    return <Navigate to={isOnboardingDone ? '/dashboard' : '/onboarding'} replace />;
  }

  return <>{children}</>;
}
