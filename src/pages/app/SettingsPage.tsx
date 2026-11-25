import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { ApiClientError } from '@/src/services/api';
import { authService } from '@/src/services/auth.service';
import { profileService } from '@/src/services/profile.service';
import { validateChangePasswordForm } from '@/src/lib/validation';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { PasswordStrengthMeter } from '@/src/components/auth/PasswordStrengthMeter';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, setProfile, logout } = useAuth();

  // Quick identity mode toggle
  const [identitySaving, setIdentitySaving] = useState(false);
  const [identityFeedback, setIdentityFeedback] = useState<string | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwErrors, setPwErrors] = useState<
    Partial<Record<'currentPassword' | 'newPassword' | 'confirmPassword', string>>
  >({});
  const [pwServerError, setPwServerError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const handleToggleIdentityMode = async (mode: 'REAL' | 'PSEUDONYMOUS') => {
    setIdentityFeedback(null);
    setIdentitySaving(true);
    try {
      const updated = await profileService.updateMyProfile({ identityMode: mode });
      setProfile(updated);
      setIdentityFeedback(
        `Identity visibility updated to ${
          mode === 'PSEUDONYMOUS' ? 'Pseudonymous' : 'Real Identity'
        }.`
      );
    } catch {
      setIdentityFeedback('Unable to update identity visibility.');
    } finally {
      setIdentitySaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwServerError(null);
    setPwSuccess(null);

    const validation = validateChangePasswordForm({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!validation.isValid) {
      setPwErrors(validation.errors);
      return;
    }

    setPwErrors({});
    setPwSubmitting(true);

    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
      });
      setPwSuccess(
        `${res.message}. Any other active browser sessions have been signed out.`
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPwServerError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to update password right now.'
      );
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl flex flex-col gap-6">
        {/* Account Overview */}
        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MailCheck className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
            <h2 className="text-base font-semibold text-[#0F172A]">Account</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="text-xs text-[#64748B] mb-0.5">Email Address</p>
              <p className="font-medium text-[#0F172A] break-all">{user?.email}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="text-xs text-[#64748B] mb-0.5">Account Status</p>
              <p className="font-medium text-[#166534]">
                Verified & Active
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F1F5F9] flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Identity Mode</p>
                <p className="text-xs text-[#64748B]">
                  Choose whether you appear publicly with your real name or a pseudonym.
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-[#E2E8F0] p-1 bg-[#F8FAFC]">
                {(['REAL', 'PSEUDONYMOUS'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={identitySaving}
                    onClick={() => void handleToggleIdentityMode(mode)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      profile?.identityMode === mode
                        ? 'bg-[#FFFFFF] text-[#0F172A] shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {mode === 'REAL' ? 'Real' : 'Pseudonymous'}
                  </button>
                ))}
              </div>
            </div>
            {identityFeedback && (
              <p className="text-xs text-[#4F46E5]">{identityFeedback}</p>
            )}
          </div>
        </section>

        {/* Change Password */}
        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
            <h2 className="text-base font-semibold text-[#0F172A]">Security</h2>
          </div>

          <p className="text-xs text-[#64748B] leading-relaxed">
            Update your password regularly. Changing your password revokes any other
            active sessions while keeping your current session signed in.
          </p>

          {pwSuccess && (
            <div
              role="status"
              className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2.5 text-xs text-[#166534]"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwServerError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#B91C1C]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{pwServerError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} noValidate className="flex flex-col gap-4">
            <Input
              id="settings-current-password"
              type={showCurrent ? 'text' : 'password'}
              label="Current Password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={pwErrors.currentPassword}
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                  className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              }
            />

            <div className="flex flex-col gap-1.5">
              <Input
                id="settings-new-password"
                type={showNew ? 'text' : 'password'}
                label="New Password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={pwErrors.newPassword}
                rightAdornment={
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                    className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer"
                  >
                    {showNew ? (
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
              id="settings-confirm-password"
              type={showNew ? 'text' : 'password'}
              label="Confirm New Password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={pwErrors.confirmPassword}
            />

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="primary" size="md" disabled={pwSubmitting}>
                {pwSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Updating Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Session Control */}
        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">Active Session</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Signed in via secure HttpOnly cookie with CSRF protection enabled.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </Button>
        </section>
      </div>
    </DashboardLayout>
  );
}
