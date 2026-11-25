import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Info } from 'lucide-react';
import { BRAND_CONFIG } from '@/src/config/brand';
import { validateRegisterForm } from '@/src/lib/validation';
import { PageContainer } from '@/src/components/layout/PageContainer';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

const ROLE_OPTIONS = [
  { value: '', label: 'Select your primary focus' },
  { value: 'student', label: 'Student' },
  { value: 'developer', label: 'Developer / Engineer' },
  { value: 'designer', label: 'Designer / Creative' },
  { value: 'entrepreneur', label: 'Entrepreneur / Founder' },
  { value: 'professional', label: 'Industry Professional' },
  { value: 'organization', label: 'Organization / Community Host' },
];

export function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<
      Record<'fullName' | 'email' | 'role' | 'password' | 'confirmPassword' | 'acceptedTerms', string>
    >
  >({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateRegisterForm({
      fullName,
      email,
      role,
      password,
      confirmPassword,
      acceptedTerms,
    });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setPreviewSubmitted(true);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#F8FAFC]">
      <PageContainer>
        <div className="max-w-lg mx-auto bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Join {BRAND_CONFIG.name}
            </h1>
            <p className="text-sm text-[#64748B]">
              Preview the registration flow for our Nepal invite-only beta.
            </p>
          </div>

          <div className="mb-6 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-[#64748B] leading-relaxed">
            <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Stage 1 frontend-only form. Submitting validates your inputs locally without persisting an account or writing to storage.
            </span>
          </div>

          {previewSubmitted ? (
            <div className="py-4 flex flex-col gap-5">
              <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-[#0F172A]">
                    Registration preview validated
                  </p>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Welcome, <span className="font-medium">{fullName}</span>. Your form details passed client-side checks. Live account provisioning will arrive in the next development stage.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button to="/opportunities" variant="primary" size="md" fullWidth>
                  Browse Demo Opportunities
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setPreviewSubmitted(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Edit Form
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Input
                id="register-fullname"
                type="text"
                label="Full Name"
                placeholder="e.g., Sita Gurung"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
              />

              <Input
                id="register-email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-role" className="text-sm font-medium text-[#0F172A]">
                  Primary Focus
                </label>
                <select
                  id="register-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  aria-invalid={Boolean(errors.role)}
                  className="w-full h-11 px-3.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-xs text-[#DC2626]" role="alert">
                    {errors.role}
                  </p>
                )}
              </div>

              <Input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="At least 8 characters"
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
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
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
                    I understand this is a Stage 1 interface preview and agree to the{' '}
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
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Get Started
                </Button>
              </div>
            </form>
          )}

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
