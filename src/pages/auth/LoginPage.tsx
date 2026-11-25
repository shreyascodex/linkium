import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { BRAND_CONFIG } from '@/src/config/brand';
import { useAuth } from '@/src/hooks/useAuth';
import { ApiClientError } from '@/src/services/api';
import { authService } from '@/src/services/auth.service';
import { validateLoginForm } from '@/src/lib/validation';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [resendStatus, setResendStatus] = useState<{
    sending: boolean;
    message: string | null;
    error: string | null;
  }>({ sending: false, message: null, error: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setNeedsVerification(false);
    setResendStatus({ sending: false, message: null, error: null });

    const validation = validateLoginForm({ email, password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const { user, profile } = await login({
        email: email.trim(),
        password,
      });

      const onboardingDone = Boolean(
        profile?.onboardingCompleted ?? user.onboardingCompleted
      );
      navigate(onboardingDone ? '/dashboard' : '/onboarding', { replace: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.primaryCode === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true);
        }
        setServerError(error.message);
      } else {
        setServerError('Unable to sign in right now. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) return;
    setResendStatus({ sending: true, message: null, error: null });
    try {
      const res = await authService.resendVerification(email.trim());
      setResendStatus({ sending: false, message: res.message, error: null });
    } catch (error) {
      setResendStatus({
        sending: false,
        message: null,
        error:
          error instanceof ApiClientError
            ? error.message
            : 'Unable to resend verification email.',
      });
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-[#F8FAFC]">
      <PageContainer>
        <div className="max-w-md mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Sign in to {BRAND_CONFIG.name}
            </h1>
            <p className="text-sm text-[#64748B]">
              Access your profile, onboarding, and personalized opportunity discovery.
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex flex-col gap-2.5 text-xs text-[#B91C1C]"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{serverError}</span>
              </div>

              {needsVerification && (
                <div className="pl-6">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus.sending}
                    className="font-semibold text-[#4F46E5] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {resendStatus.sending
                      ? 'Sending verification email...'
                      : 'Resend verification email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {resendStatus.message && (
            <div
              role="status"
              className="mb-5 p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2.5 text-xs text-[#166534]"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{resendStatus.message}</span>
            </div>
          )}

          {resendStatus.error && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#B91C1C]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{resendStatus.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              id="login-email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-sm font-medium text-[#0F172A]"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  className={`w-full h-11 px-3.5 pr-11 rounded-lg bg-[#FFFFFF] text-sm text-[#0F172A] placeholder:text-[#94A3B8] border transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
                      : 'border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5]/20'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
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
                </div>
              </div>
              {errors.password && (
                <p className="text-xs text-[#DC2626]" role="alert">
                  {errors.password}
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center text-sm text-[#64748B]">
            Have an invitation to {BRAND_CONFIG.name}?{' '}
            <Link
              to="/register"
              className="font-medium text-[#4F46E5] hover:text-[#4338CA] hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
