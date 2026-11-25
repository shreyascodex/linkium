import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from 'lucide-react';
import { ApiClientError } from '@/src/services/api';
import { authService } from '@/src/services/auth.service';
import { validateEmail } from '@/src/lib/validation';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

type VerifyStatus =
  | { state: 'missing' }
  | { state: 'verifying' }
  | { state: 'verified' }
  | { state: 'error'; message: string };

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [status, setStatus] = useState<VerifyStatus>(
    token ? { state: 'verifying' } : { state: 'missing' }
  );

  const [resendEmail, setResendEmail] = useState('');
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus({ state: 'missing' });
      return;
    }

    let cancelled = false;
    setStatus({ state: 'verifying' });

    authService
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setStatus({ state: 'verified' });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setStatus({
            state: 'error',
            message:
              error instanceof ApiClientError
                ? error.message
                : 'This verification link could not be validated.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendSuccess(null);

    const emailErr = validateEmail(resendEmail);
    if (emailErr) {
      setResendError(emailErr);
      return;
    }

    setResending(true);
    try {
      const res = await authService.resendVerification(resendEmail.trim());
      setResendSuccess(res.message);
    } catch (error) {
      setResendError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to send verification link right now.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-[#F8FAFC]">
      <PageContainer>
        <div className="max-w-md mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
          {status.state === 'verifying' && (
            <div className="py-6 flex flex-col items-center text-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" aria-hidden="true" />
              <h1 className="text-xl font-bold text-[#0F172A]">Verifying your email</h1>
              <p className="text-sm text-[#64748B]">
                Please wait a moment while we confirm your verification link.
              </p>
            </div>
          )}

          {status.state === 'verified' && (
            <div className="flex flex-col gap-5">
              <div className="w-11 h-11 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Email verified
                </h1>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Your account is now active. Sign in to complete your profile setup and
                  start discovering opportunities.
                </p>
              </div>
              <Button to="/login" variant="primary" size="lg" fullWidth>
                Sign In to Continue
              </Button>
            </div>
          )}

          {(status.state === 'error' || status.state === 'missing') && (
            <div className="flex flex-col gap-5">
              <div className="w-11 h-11 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center">
                {status.state === 'missing' ? (
                  <MailCheck className="w-5 h-5 text-[#4F46E5]" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  {status.state === 'missing'
                    ? 'Verification token missing'
                    : 'Verification link invalid or expired'}
                </h1>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {status.state === 'error'
                    ? status.message
                    : 'Open the verification link from your email inbox, or request a new verification email below.'}
                </p>
              </div>

              <form
                onSubmit={handleResend}
                noValidate
                className="pt-4 border-t border-[#E2E8F0] flex flex-col gap-3"
              >
                <Input
                  id="resend-verify-email"
                  type="email"
                  label="Request a new verification link"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  error={resendError ?? undefined}
                />

                {resendSuccess && (
                  <p role="status" className="text-xs text-[#166534]">
                    {resendSuccess}
                  </p>
                )}

                <Button type="submit" variant="primary" size="md" fullWidth disabled={resending}>
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </form>

              <Button to="/login" variant="ghost" size="sm" fullWidth>
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
