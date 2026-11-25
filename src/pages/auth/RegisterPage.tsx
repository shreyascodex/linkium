import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  ShieldCheck,
  TicketCheck,
} from 'lucide-react';
import { BRAND_CONFIG } from '@/src/config/brand';
import { useAuth } from '@/src/hooks/useAuth';
import { ApiClientError } from '@/src/services/api';
import { authService } from '@/src/services/auth.service';
import { validateRegisterForm } from '@/src/lib/validation';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { PasswordStrengthMeter } from '@/src/components/auth/PasswordStrengthMeter';

type InviteCheckState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'valid'; email: string; expiresAt: string }
  | { status: 'invalid'; message: string };

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialInvite = searchParams.get('invitation')?.trim() ?? '';

  const { register } = useAuth();

  const [invitationToken, setInvitationToken] = useState(initialInvite);
  const [inviteCheck, setInviteCheck] = useState<InviteCheckState>(
    initialInvite ? { status: 'checking' } : { status: 'idle' }
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<
    Partial<
      Record<
        'invitationToken' | 'email' | 'password' | 'confirmPassword' | 'acceptedTerms',
        string
      >
    >
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<{
    sending: boolean;
    message: string | null;
    error: string | null;
  }>({ sending: false, message: null, error: null });

  const verifyInvitation = async (tokenValue: string) => {
    const trimmed = tokenValue.trim();
    if (trimmed.length < 16) {
      setInviteCheck({ status: 'idle' });
      return;
    }

    setInviteCheck({ status: 'checking' });
    try {
      const result = await authService.validateInvitation(trimmed);
      setInviteCheck({
        status: 'valid',
        email: result.email,
        expiresAt: result.expiresAt,
      });
      setEmail(result.email);
      setErrors((prev) => ({ ...prev, invitationToken: undefined, email: undefined }));
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'Unable to validate invitation token right now.';
      setInviteCheck({ status: 'invalid', message });
    }
  };

  useEffect(() => {
    if (initialInvite) {
      void verifyInvitation(initialInvite);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInvite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateRegisterForm({
      invitationToken,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const result = await register({
        invitationToken: invitationToken.trim(),
        email: email.trim(),
        password,
      });
      setRegisteredEmail(result.user.email);
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof ApiClientError) {
        const nextFieldErrors: typeof errors = {};
        for (const detail of error.errors) {
          if (detail.field === 'email') nextFieldErrors.email = detail.message;
          if (detail.field === 'password') nextFieldErrors.password = detail.message;
          if (detail.field === 'invitationToken') {
            nextFieldErrors.invitationToken = detail.message;
          }
        }
        if (Object.keys(nextFieldErrors).length > 0) {
          setErrors(nextFieldErrors);
        }
        setServerError(error.message);
      } else {
        setServerError('Unable to complete registration. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    setResendState({ sending: true, message: null, error: null });
    try {
      const res = await authService.resendVerification(registeredEmail);
      setResendState({ sending: false, message: res.message, error: null });
    } catch (error) {
      setResendState({
        sending: false,
        message: null,
        error:
          error instanceof ApiClientError
            ? error.message
            : 'Failed to resend verification email.',
      });
    }
  };

  if (registeredEmail) {
    return (
      <section className="py-12 sm:py-20 bg-[#F8FAFC]">
        <PageContainer>
          <div className="max-w-lg mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="w-11 h-11 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-5">
              <MailCheck className="w-5 h-5" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mb-2">
              Verify your email address
            </h1>
            <p className="text-sm text-[#64748B] leading-relaxed mb-6">
              We created your {BRAND_CONFIG.name} beta account and sent a verification link to{' '}
              <span className="font-medium text-[#0F172A]">{registeredEmail}</span>. Open the
              link in your inbox to activate your account before signing in.
            </p>

            <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] leading-relaxed mb-6">
              Verification links expire after 30 minutes for security. If you don’t see the
              email within a minute, check your spam folder or request a fresh link below.
            </div>

            {resendState.message && (
              <div
                role="status"
                className="mb-4 p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2.5 text-xs text-[#166534]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{resendState.message}</span>
              </div>
            )}

            {resendState.error && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#B91C1C]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{resendState.error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={handleResendVerification}
                disabled={resendState.sending}
              >
                {resendState.sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              <Button to="/login" variant="primary" size="md" fullWidth>
                Continue to Sign In
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-[#F8FAFC]">
      <PageContainer>
        <div className="max-w-lg mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Join {BRAND_CONFIG.name}
            </h1>
            <p className="text-sm text-[#64748B]">
              {BRAND_CONFIG.launchRegion}. Registration requires an active invitation token.
            </p>
          </div>

          {inviteCheck.status === 'checking' && (
            <div className="mb-5 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2.5 text-xs text-[#475569]">
              <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" aria-hidden="true" />
              <span>Validating your invitation token...</span>
            </div>
          )}

          {inviteCheck.status === 'valid' && (
            <div className="mb-5 p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2.5 text-xs text-[#166534]">
              <TicketCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#16A34A]" aria-hidden="true" />
              <span>
                Invitation verified for{' '}
                <strong className="font-semibold">{inviteCheck.email}</strong>. Complete
                your password below to create your account.
              </span>
            </div>
          )}

          {inviteCheck.status === 'invalid' && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#B91C1C]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{inviteCheck.message}</span>
            </div>
          )}

          {serverError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#B91C1C]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    id="register-invitation"
                    type="text"
                    label="Invitation Token"
                    placeholder="Paste your beta invitation token"
                    autoComplete="off"
                    value={invitationToken}
                    onChange={(e) => {
                      setInvitationToken(e.target.value);
                      if (inviteCheck.status !== 'idle') {
                        setInviteCheck({ status: 'idle' });
                      }
                    }}
                    error={errors.invitationToken}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="h-11 shrink-0"
                  disabled={
                    invitationToken.trim().length < 16 || inviteCheck.status === 'checking'
                  }
                  onClick={() => void verifyInvitation(invitationToken)}
                >
                  Check
                </Button>
              </div>
              <p className="text-xs text-[#64748B]">
                Need an invitation?{' '}
                <Link to="/contact" className="text-[#4F46E5] hover:underline">
                  Request early beta access
                </Link>
                .
              </p>
            </div>

            <Input
              id="register-email"
              type="email"
              label="Invited Email Address"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              readOnly={inviteCheck.status === 'valid'}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              hint={
                inviteCheck.status === 'valid'
                  ? 'Matched to your verified invitation.'
                  : 'Must match the email address associated with your invitation.'
              }
            />

            <div className="flex flex-col gap-1.5">
              <Input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                rightAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                }
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <Input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  }
                  className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              }
            />

            <div className="flex flex-col gap-1.5 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5]"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#4F46E5] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-[#4F46E5] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.acceptedTerms && (
                <p className="text-xs text-[#DC2626]" role="alert">
                  {errors.acceptedTerms}
                </p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    Create Beta Account
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center text-sm text-[#64748B]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[#4F46E5] hover:text-[#4338CA] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
