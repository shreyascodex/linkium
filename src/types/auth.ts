export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DELETED';

export interface AuthUser {
  id: string;
  email: string;
  status: UserStatus;
  emailVerifiedAt: string | null;
  createdAt: string;
  onboardingCompleted?: boolean;
}

export interface InvitationValidationData {
  valid: true;
  email: string;
  expiresAt: string;
}

export interface ApiErrorDetail {
  field?: string;
  code?: string;
  message: string;
}
