import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Info } from 'lucide-react';
import { BRAND_CONFIG } from '@/src/config/brand';
import { validateLoginForm } from '@/src/lib/validation';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLoginForm({ email, password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setPreviewSubmitted(true);
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
              Enter your credentials to preview the sign-in workflow.
            </p>
          </div>

          <div className="mb-6 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-[#64748B] leading-relaxed">
            <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Stage 1 visual preview only. Real user authentication and account sessions will be introduced in a future stage.
            </span>
          </div>

          {previewSubmitted ? (
            <div className="py-4 flex flex-col gap-4">
              <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Form validation passed
                  </p>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Input checks succeeded for <span className="font-medium">{email}</span>. No session or localStorage state was created because authentication is disabled in Stage 1.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button to="/opportunities" variant="primary" size="md" fullWidth>
                  Explore Demo Opportunities
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setPreviewSubmitted(false);
                    setPassword('');
                  }}
                >
                  Reset Form
                </Button>
              </div>
            </div>
          ) : (
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

              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Minimum 8 characters"
                autoComplete="current-password"
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

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Sign In
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center text-sm text-[#64748B]">
            New to {BRAND_CONFIG.name}?{' '}
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
