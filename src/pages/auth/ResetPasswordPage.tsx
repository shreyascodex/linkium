import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from 'lucide-react';
import { ApiClientError } from '@/src/services/api';
import { authService } from '@/src/services/auth.service';
import { validateResetPasswordForm } from '@/src/lib/validation';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { PasswordStrengthMeter } from '@/src/components/auth/PasswordStrengthMeter';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token')?.trim() ?? '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<'token' | 'newPassword' | 'confirmPassword', string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateResetPasswordForm({ newPassword, confirmPassword });
    const nextErrors: typeof errors = { ...validation.errors };
    if (!token.trim() || token.trim().length < 16) {
      nextErrors.token = 'A valid password reset token is required.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await authService.resetPassword({
        token: token.trim(),
        newPassword,
      });
      setCompleted(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to reset password. Your link may have expired.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <section className="py-12 sm:py-20 bg-[#F8FAFC]">
        <PageContainer>
          <div className="max-w-md mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            <div className="w-11 h-11 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                Password updated
              </h1>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Your password has been reset and previous sessions were signed out for
                your security. You can now sign in with your new password.
              </p>
            </div>
            <Button to="/login" variant="primary" size="lg" fullWidth>
              Sign In
            </Button>
          </div>
        </PageContainer>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 bg-[#F8FAFC]">
      <PageContainer>
        <div className="max-w-md mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4">
            <KeyRound className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1.5 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Choose a new password
            </h1>
            <p className="text-sm text-[#64748B]">
              Enter a strong password to regain access to your account.
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex flex-col gap-2 text-xs text-[#B91C1C]"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{serverError}</span>
              </div>
              <Link to="/forgot-password" className="pl-6 font-medium text-[#4F46E5] hover:underline">
                Request a new reset link
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {!initialToken && (
              <Input
                id="reset-token"
                type="text"
                label="Reset Token"
                placeholder="Paste your password reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                error={errors.token}
              />
            )}

            <div className="flex flex-col gap-1.5">
              <Input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                label="New Password"
                placeholder="Create a strong password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
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
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <Input
              id="reset-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              label="Confirm New Password"
              placeholder="Repeat your new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              }
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Resetting Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </section>
  );
}
