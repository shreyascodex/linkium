import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  EyeOff,
  Loader2,
  LogOut,
  Search,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { ApiClientError } from '@/src/services/api';
import { profileService } from '@/src/services/profile.service';
import {
  GOAL_OPTIONS,
  type CatalogItem,
  type GoalType,
  type IdentityMode,
} from '@/src/types/profile';
import { validateProfileDetailsForm } from '@/src/lib/validation';
import { BrandMark } from '@/src/components/navigation/BrandMark';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { cn } from '@/src/lib/cn';

const STEP_LABELS = [
  'Identity',
  'Profile',
  'Skills',
  'Interests',
  'Goals',
] as const;

const PROFICIENCY_OPTIONS = ['Exploring', 'Intermediate', 'Advanced'] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, setProfile, logout } = useAuth();

  const [initializing, setInitializing] = useState(true);
  const [step, setStep] = useState<number>(1);
  const [skillsCatalog, setSkillsCatalog] = useState<CatalogItem[]>([]);
  const [interestsCatalog, setInterestsCatalog] = useState<CatalogItem[]>([]);

  // Step 1
  const [identityMode, setIdentityMode] = useState<IdentityMode>('REAL');
  // Step 2
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileErrors, setProfileErrors] = useState<
    Partial<Record<'username' | 'displayName' | 'bio' | 'avatarUrl' | 'location', string>>
  >({});

  // Step 3
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string | null>>({});

  // Step 4
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);

  // Step 5
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);

  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [loadedProfile, skills, interests] = await Promise.all([
          profile ? Promise.resolve(profile) : profileService.getMyProfile(),
          profileService.getSkillsCatalog(),
          profileService.getInterestsCatalog(),
        ]);

        if (!active) return;

        setProfile(loadedProfile);
        setSkillsCatalog(skills);
        setInterestsCatalog(interests);

        const clampedStep = Math.min(5, Math.max(1, loadedProfile.onboardingStep || 1));
        setStep(clampedStep);
        setIdentityMode(loadedProfile.identityMode);
        setUsername(loadedProfile.username ?? '');
        setDisplayName(loadedProfile.displayName ?? '');
        setLocation(loadedProfile.location ?? '');
        setBio(loadedProfile.bio ?? '');
        setAvatarUrl(loadedProfile.avatarUrl ?? '');

        const skillMap: Record<string, string | null> = {};
        for (const item of loadedProfile.skills) {
          skillMap[item.skillId] = item.proficiency;
        }
        setSelectedSkills(skillMap);
        setSelectedInterestIds(loadedProfile.interests.map((i) => i.interestId));
        setSelectedGoals(loadedProfile.goals);
      } catch (error) {
        if (active) {
          setStepError(
            error instanceof ApiClientError
              ? error.message
              : 'Unable to load onboarding data. Please refresh and try again.'
          );
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    })();

    return () => {
      active = false;
    };
    // Run once on mount to hydrate saved onboarding progress
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return skillsCatalog;
    return skillsCatalog.filter((skill) => skill.name.toLowerCase().includes(q));
  }, [skillsCatalog, skillSearch]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const next = { ...prev };
      if (skillId in next) {
        delete next[skillId];
      } else {
        next[skillId] = 'Intermediate';
      }
      return next;
    });
    setStepError(null);
  };

  const setSkillProficiency = (skillId: string, proficiency: string) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skillId]: proficiency,
    }));
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterestIds((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
    setStepError(null);
  };

  const toggleGoal = (goal: GoalType) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]
    );
    setStepError(null);
  };

  const handleBack = () => {
    setStepError(null);
    setProfileErrors({});
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleStep1Next = async () => {
    setStepError(null);
    setSaving(true);
    try {
      const updated = await profileService.updateMyProfile({
        identityMode,
        onboardingStep: 2,
      });
      setProfile(updated);
      setStep(2);
    } catch (error) {
      setStepError(
        error instanceof ApiClientError ? error.message : 'Unable to save identity preference.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStep2Next = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);

    const validation = validateProfileDetailsForm({
      username,
      displayName,
      bio,
      avatarUrl,
      location,
    });

    if (!validation.isValid) {
      setProfileErrors(validation.errors);
      return;
    }

    setProfileErrors({});
    setSaving(true);
    try {
      const updated = await profileService.updateMyProfile({
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        location: location.trim() || null,
        onboardingStep: 3,
      });
      setProfile(updated);
      setStep(3);
    } catch (error) {
      if (error instanceof ApiClientError) {
        const usernameErr = error.getFieldError('username');
        const avatarErr = error.getFieldError('avatarUrl');
        if (usernameErr || avatarErr) {
          setProfileErrors({
            ...(usernameErr ? { username: usernameErr } : {}),
            ...(avatarErr ? { avatarUrl: avatarErr } : {}),
          });
        }
        setStepError(error.message);
      } else {
        setStepError('Unable to save profile details.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStep3Next = async () => {
    const entries = Object.entries(selectedSkills);
    if (entries.length === 0) {
      setStepError('Select at least one skill so collaborators and opportunities match you.');
      return;
    }

    setStepError(null);
    setSaving(true);
    try {
      await profileService.updateMySkills(
        entries.map(([skillId, proficiency]) => ({ skillId, proficiency }))
      );
      const updated = await profileService.updateMyProfile({ onboardingStep: 4 });
      setProfile(updated);
      setStep(4);
    } catch (error) {
      setStepError(
        error instanceof ApiClientError ? error.message : 'Unable to save selected skills.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStep4Next = async () => {
    if (selectedInterestIds.length === 0) {
      setStepError('Choose at least one area of interest.');
      return;
    }

    setStepError(null);
    setSaving(true);
    try {
      await profileService.updateMyInterests(selectedInterestIds);
      const updated = await profileService.updateMyProfile({ onboardingStep: 5 });
      setProfile(updated);
      setStep(5);
    } catch (error) {
      setStepError(
        error instanceof ApiClientError ? error.message : 'Unable to save selected interests.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (selectedGoals.length === 0) {
      setStepError('Select at least one goal to finish setting up your account.');
      return;
    }

    setStepError(null);
    setSaving(true);
    try {
      await profileService.updateMyGoals(selectedGoals);
      const completedProfile = await profileService.updateMyProfile({
        onboardingStep: 5,
        onboardingCompleted: true,
      });
      setProfile(completedProfile);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setStepError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to complete onboarding right now.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <LoadingState label="Preparing your onboarding workspace..." />
      </div>
    );
  }

  const progressPercent = Math.round((step / STEP_LABELS.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-[#64748B] truncate max-w-[200px]">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] px-2.5 py-1.5 rounded-md hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-medium text-[#64748B] mb-2 tabular-nums">
              <span>
                Step {step} of {STEP_LABELS.length} — {STEP_LABELS[step - 1]}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F46E5] transition-all duration-200 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="hidden sm:grid grid-cols-5 gap-2 mt-3">
              {STEP_LABELS.map((label, idx) => {
                const stepNum = idx + 1;
                const isCurrent = stepNum === step;
                const isDone = stepNum < step;
                return (
                  <div
                    key={label}
                    className={cn(
                      'text-xs font-medium flex items-center gap-1.5',
                      isCurrent
                        ? 'text-[#4F46E5]'
                        : isDone
                        ? 'text-[#0F172A]'
                        : 'text-[#94A3B8]'
                    )}
                  >
                    <span
                      className={cn(
                        'w-5 h-5 rounded-full text-[11px] flex items-center justify-center border tabular-nums shrink-0',
                        isCurrent
                          ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]'
                          : isDone
                          ? 'border-[#16A34A] bg-[#F0FDF4] text-[#16A34A]'
                          : 'border-[#CBD5E1] bg-[#FFFFFF]'
                      )}
                    >
                      {isDone ? <Check className="w-3 h-3" aria-hidden="true" /> : stepNum}
                    </span>
                    <span className="truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
            {stepError && (
              <div
                role="alert"
                className="mb-6 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#B91C1C]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{stepError}</span>
              </div>
            )}

            {/* STEP 1: IDENTITY MODE */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mb-2">
                    Choose how you appear on LINKIUM
                  </h1>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    Whether you collaborate under your real name or explore ideas
                    pseudonymously, your account email remains private and protected.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIdentityMode('REAL')}
                    className={cn(
                      'text-left p-5 rounded-xl border transition-all cursor-pointer flex flex-col gap-3',
                      identityMode === 'REAL'
                        ? 'border-[#4F46E5] bg-[#EEF2FF]/40 ring-2 ring-[#4F46E5]/15'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                        <UserCheck className="w-5 h-5" aria-hidden="true" />
                      </div>
                      {identityMode === 'REAL' && (
                        <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#0F172A]">
                        Real Identity
                      </h2>
                      <p className="text-xs text-[#64748B] leading-relaxed mt-1">
                        Present your real name and professional background for internships,
                        jobs, and verified startup teams.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIdentityMode('PSEUDONYMOUS')}
                    className={cn(
                      'text-left p-5 rounded-xl border transition-all cursor-pointer flex flex-col gap-3',
                      identityMode === 'PSEUDONYMOUS'
                        ? 'border-[#4F46E5] bg-[#EEF2FF]/40 ring-2 ring-[#4F46E5]/15'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center">
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      </div>
                      {identityMode === 'PSEUDONYMOUS' && (
                        <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center">
                          <Check className="w-3 h-3" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#0F172A]">
                        Pseudonymous Identity
                      </h2>
                      <p className="text-xs text-[#64748B] leading-relaxed mt-1">
                        Participate with a chosen handle and alias while keeping your real
                        identity private from other members.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-[#475569]">
                  <Shield className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    You can switch your identity mode or update your display name anytime
                    in Profile & Settings.
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={saving}
                    onClick={() => void handleStep1Next()}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: BASIC PROFILE */}
            {step === 2 && (
              <form onSubmit={handleStep2Next} noValidate className="flex flex-col gap-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mb-2">
                    Set up your public profile
                  </h1>
                  <p className="text-sm text-[#64748B]">
                    {identityMode === 'PSEUDONYMOUS'
                      ? 'Choose a pseudonymous handle and alias visible across projects and opportunities.'
                      : 'Tell collaborators who you are and where you are based.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="onboard-display-name"
                    type="text"
                    label={identityMode === 'PSEUDONYMOUS' ? 'Alias / Display Name' : 'Display Name'}
                    placeholder={
                      identityMode === 'PSEUDONYMOUS' ? 'e.g., Himalayan Builder' : 'e.g., Sita Gurung'
                    }
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    error={profileErrors.displayName}
                  />

                  <Input
                    id="onboard-username"
                    type="text"
                    label="Username"
                    placeholder="e.g., sita_builds"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    error={profileErrors.username}
                    hint="3–30 characters: lowercase letters, numbers, underscores."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="onboard-location"
                    type="text"
                    label="Location (Optional)"
                    placeholder="e.g., Kathmandu, Nepal"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    error={profileErrors.location}
                  />

                  <Input
                    id="onboard-avatar"
                    type="url"
                    label="Avatar URL (Optional)"
                    placeholder="https://example.com/photo.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    error={profileErrors.avatarUrl}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="onboard-bio" className="text-sm font-medium text-[#0F172A]">
                      Short Bio (Optional)
                    </label>
                    <span className="text-xs text-[#64748B] tabular-nums">
                      {bio.length}/500
                    </span>
                  </div>
                  <textarea
                    id="onboard-bio"
                    rows={3}
                    maxLength={500}
                    placeholder="Share what you build, study, or hope to collaborate on..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                  {profileErrors.bio && (
                    <p className="text-xs text-[#DC2626]" role="alert">
                      {profileErrors.bio}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" size="md" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    Back
                  </Button>
                  <Button type="submit" variant="primary" size="lg" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save & Continue
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: SKILLS */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mb-2">
                    What skills do you bring?
                  </h1>
                  <p className="text-sm text-[#64748B]">
                    Select one or more skills so we can highlight relevant projects and roles.
                  </p>
                </div>

                <div className="relative">
                  <Search
                    className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skills (e.g., React, UI/UX, Python, Marketing)..."
                    aria-label="Search skills"
                    className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {filteredSkills.map((skill) => {
                    const selected = skill.id in selectedSkills;
                    return (
                      <div
                        key={skill.id}
                        className={cn(
                          'rounded-lg border p-3 transition-colors flex flex-col gap-2',
                          selected
                            ? 'border-[#4F46E5] bg-[#EEF2FF]/50'
                            : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className="w-full flex items-center justify-between gap-2 text-left cursor-pointer"
                        >
                          <span className="text-sm font-medium text-[#0F172A]">
                            {skill.name}
                          </span>
                          <span
                            className={cn(
                              'w-5 h-5 rounded-md border flex items-center justify-center shrink-0',
                              selected
                                ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                                : 'border-[#CBD5E1] bg-white'
                            )}
                          >
                            {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                          </span>
                        </button>

                        {selected && (
                          <div className="flex items-center gap-1.5 pt-1">
                            {PROFICIENCY_OPTIONS.map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setSkillProficiency(skill.id, level)}
                                className={cn(
                                  'px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors',
                                  selectedSkills[skill.id] === level
                                    ? 'bg-[#4F46E5] text-white'
                                    : 'bg-[#FFFFFF] text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]'
                                )}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" size="md" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={saving}
                    onClick={() => void handleStep3Next()}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Saving Skills...
                      </>
                    ) : (
                      <>
                        Save & Continue ({Object.keys(selectedSkills).length})
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: INTERESTS */}
            {step === 4 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mb-2">
                    Pick your areas of interest
                  </h1>
                  <p className="text-sm text-[#64748B]">
                    Select the domains and communities you want to follow on LINKIUM.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {interestsCatalog.map((interest) => {
                    const selected = selectedInterestIds.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={cn(
                          'p-3.5 rounded-lg border text-left flex items-center justify-between gap-2 cursor-pointer transition-colors',
                          selected
                            ? 'border-[#4F46E5] bg-[#EEF2FF]/50'
                            : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                        )}
                      >
                        <span className="text-sm font-medium text-[#0F172A]">
                          {interest.name}
                        </span>
                        <span
                          className={cn(
                            'w-5 h-5 rounded-md border flex items-center justify-center shrink-0',
                            selected
                              ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                              : 'border-[#CBD5E1] bg-white'
                          )}
                        >
                          {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" size="md" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={saving}
                    onClick={() => void handleStep4Next()}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Saving Interests...
                      </>
                    ) : (
                      <>
                        Save & Continue ({selectedInterestIds.length})
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: GOALS */}
            {step === 5 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mb-2">
                    What are you hoping to achieve on LINKIUM?
                  </h1>
                  <p className="text-sm text-[#64748B]">
                    Select all goals that apply so we can personalize your workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map((goal) => {
                    const selected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          'p-4 rounded-xl border text-left flex items-start justify-between gap-3 cursor-pointer transition-colors',
                          selected
                            ? 'border-[#4F46E5] bg-[#EEF2FF]/50'
                            : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1]'
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">
                            {goal.label}
                          </p>
                          <p className="text-xs text-[#64748B] leading-relaxed mt-0.5">
                            {goal.description}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5',
                            selected
                              ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                              : 'border-[#CBD5E1] bg-white'
                          )}
                        >
                          {selected && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="outline" size="md" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={saving}
                    onClick={() => void handleCompleteOnboarding()}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Finishing Setup...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
