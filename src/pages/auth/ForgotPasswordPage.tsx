import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { ApiClientError } from '@/src/services/api';
import { authService } from '@/src/services/auth.service';
import { validateEmail } from '@/src/lib/validation';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const err = validateEmail(email);
    if (err) {
      setFieldError(err);
      return;
    }

    setFieldError(undefined);
    setSubmitting(true);

    try {
      const res = await authService.forgotPassword(email.trim());
      setSubmittedMessage(res.message);
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to send reset instructions right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-[#F8FAFC]">
      <PageContainer>
        <div className="max-w-md mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
          {submittedMessage ? (
            <div className="flex flex-col gap-5">
              <div className="w-11 h-11 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Check your inbox
                </h1>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {submittedMessage}
                </p>
              </div>
              <Button to="/login" variant="primary" size="md" fullWidth>
                Return to Sign In
              </Button>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1.5 mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  Reset your password
                </h1>
                <p className="text-sm text-[#64748B]">
                  Enter the email address for your account and we will send a password reset
                  link.
                </p>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#B91C1C]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                  id="forgot-email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldError}
                />

                <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Sending Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center text-sm text-[#64748B]">
                Remembered your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-[#4F46E5] hover:text-[#4338CA] hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </section>
  );
}
