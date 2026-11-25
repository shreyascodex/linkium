import type { AuthUser, InvitationValidationData } from '@/src/types/auth';
import { apiRequest, clearCsrfToken } from './api';

export const authService = {
  async validateInvitation(token: string): Promise<InvitationValidationData> {
    const res = await apiRequest<InvitationValidationData>(
      `/api/v1/invitations/validate/${encodeURIComponent(token.trim())}`
    );
    return res.data;
  },

  async register(input: {
    email: string;
    password: string;
    invitationToken: string;
  }): Promise<{ user: Pick<AuthUser, 'id' | 'email' | 'status'>; message: string }> {
    const res = await apiRequest<{ user: Pick<AuthUser, 'id' | 'email' | 'status'> }>(
      '/api/v1/auth/register',
      {
        method: 'POST',
        body: input,
      }
    );
    return { ...res.data, message: res.message };
  },

  async verifyEmail(token: string): Promise<{ verified: true; message: string }> {
    const res = await apiRequest<{ verified: true }>('/api/v1/auth/verify-email', {
      method: 'POST',
      body: { token },
    });
    return { ...res.data, message: res.message };
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const res = await apiRequest<Record<string, never>>(
      '/api/v1/auth/resend-verification',
      {
        method: 'POST',
        body: { email },
      }
    );
    return { message: res.message };
  },

  async login(input: { email: string; password: string }): Promise<AuthUser> {
    clearCsrfToken();
    const res = await apiRequest<{ user: AuthUser }>('/api/v1/auth/login', {
      method: 'POST',
      body: input,
    });
    return res.data.user;
  },

  async getMe(): Promise<AuthUser> {
    const res = await apiRequest<{ user: AuthUser }>('/api/v1/auth/me');
    return res.data.user;
  },

  async getSession(): Promise<{ authenticated: boolean; user: AuthUser | null }> {
    const res = await apiRequest<{ authenticated: boolean; user: AuthUser | null }>(
      '/api/v1/auth/session'
    );
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<Record<string, never>>('/api/v1/auth/logout', {
        method: 'POST',
        requiresCsrf: true,
      });
    } finally {
      clearCsrfToken();
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiRequest<Record<string, never>>(
      '/api/v1/auth/forgot-password',
      {
        method: 'POST',
        body: { email },
      }
    );
    return { message: res.message };
  },

  async resetPassword(input: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const res = await apiRequest<Record<string, never>>(
      '/api/v1/auth/reset-password',
      {
        method: 'POST',
        body: input,
      }
    );
    return { message: res.message };
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const res = await apiRequest<Record<string, never>>(
      '/api/v1/auth/change-password',
      {
        method: 'POST',
        body: input,
        requiresCsrf: true,
      }
    );
    return { message: res.message };
  },
};
