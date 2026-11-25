import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthUser } from '@/src/types/auth';
import type { UserProfile } from '@/src/types/profile';
import { clearCsrfToken } from '@/src/services/api';
import { authService } from '@/src/services/auth.service';
import { profileService } from '@/src/services/profile.service';

export interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{
    user: AuthUser;
    profile: UserProfile | null;
  }>;
  register: (payload: {
    email: string;
    password: string;
    invitationToken: string;
  }) => Promise<{ user: Pick<AuthUser, 'id' | 'email' | 'status'>; message: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

let inFlightSessionCheck: Promise<{
  authenticated: boolean;
  user: AuthUser | null;
}> | null = null;

function fetchSessionOnce() {
  if (!inFlightSessionCheck) {
    inFlightSessionCheck = authService.getSession().finally(() => {
      inFlightSessionCheck = null;
    });
  }
  return inFlightSessionCheck;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessionState = useCallback(async () => {
    try {
      const session = await fetchSessionOnce();
      if (!session.authenticated || !session.user) {
        clearCsrfToken();
        setUser(null);
        setProfileState(null);
        return;
      }

      setUser(session.user);
      try {
        const fetchedProfile = await profileService.getMyProfile();
        setProfileState(fetchedProfile);
        setUser((prev) =>
          prev
            ? { ...prev, onboardingCompleted: fetchedProfile.onboardingCompleted }
            : prev
        );
      } catch {
        setProfileState(null);
      }
    } catch {
      clearCsrfToken();
      setUser(null);
      setProfileState(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadSessionState();
      if (active) {
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadSessionState]);

  const setProfile = useCallback((nextProfile: UserProfile | null) => {
    setProfileState(nextProfile);
    if (nextProfile) {
      setUser((prev) =>
        prev
          ? { ...prev, onboardingCompleted: nextProfile.onboardingCompleted }
          : prev
      );
    }
  }, []);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const loggedInUser = await authService.login(credentials);
      let loadedProfile: UserProfile | null = null;
      try {
        loadedProfile = await profileService.getMyProfile();
      } catch {
        loadedProfile = null;
      }
      const hydratedUser: AuthUser = {
        ...loggedInUser,
        onboardingCompleted:
          loadedProfile?.onboardingCompleted ?? loggedInUser.onboardingCompleted ?? false,
      };
      setUser(hydratedUser);
      setProfileState(loadedProfile);
      return { user: hydratedUser, profile: loadedProfile };
    },
    []
  );

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      invitationToken: string;
    }) => {
      return authService.register(payload);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearCsrfToken();
      setUser(null);
      setProfileState(null);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await loadSessionState();
  }, [loadSessionState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshAuth,
      setProfile,
    }),
    [user, profile, isLoading, login, register, logout, refreshAuth, setProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
