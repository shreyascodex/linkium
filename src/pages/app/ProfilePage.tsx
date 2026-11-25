import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Loader2,
  Search,
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
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { UserAvatar } from '@/src/components/profile/UserAvatar';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { LoadingState } from '@/src/components/ui/LoadingState';
import { cn } from '@/src/lib/cn';

const PROFICIENCY_OPTIONS = ['Exploring', 'Intermediate', 'Advanced'] as const;

export function ProfilePage() {
  const { profile, setProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [skillsCatalog, setSkillsCatalog] = useState<CatalogItem[]>([]);
  const [interestsCatalog, setInterestsCatalog] = useState<CatalogItem[]>([]);

  const [identityMode, setIdentityMode] = useState<IdentityMode>('REAL');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'username' | 'displayName' | 'bio' | 'avatarUrl' | 'location', string>>
  >({});

  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string | null>>({});
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingTaxonomies, setSavingTaxonomies] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [loadedProfile, skills, interests] = await Promise.all([
          profileService.getMyProfile(),
          profileService.getSkillsCatalog(),
          profileService.getInterestsCatalog(),
        ]);

        if (!active) return;

        setProfile(loadedProfile);
        setSkillsCatalog(skills);
        setInterestsCatalog(interests);

        setIdentityMode(loadedProfile.identityMode);
        setUsername(loadedProfile.username ?? '');
        setDisplayName(loadedProfile.displayName ?? '');
        setLocation(loadedProfile.location ?? '');
        setBio(loadedProfile.bio ?? '');
        setAvatarUrl(loadedProfile.avatarUrl ?? '');

        const map: Record<string, string | null> = {};
        for (const s of loadedProfile.skills) {
          map[s.skillId] = s.proficiency;
        }
        setSelectedSkills(map);
        setSelectedInterestIds(loadedProfile.interests.map((i) => i.interestId));
        setSelectedGoals(loadedProfile.goals);
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof ApiClientError
              ? error.message
              : 'Unable to load your profile.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [setProfile]);

  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return skillsCatalog;
    return skillsCatalog.filter((skill) => skill.name.toLowerCase().includes(q));
  }, [skillsCatalog, skillSearch]);

  const handleSaveBasicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const validation = validateProfileDetailsForm({
      username,
      displayName,
      bio,
      avatarUrl,
      location,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setSavingProfile(true);
    try {
      const updated = await profileService.updateMyProfile({
        identityMode,
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        location: location.trim() || null,
      });
      setProfile(updated);
      setStatusMessage('Profile details updated.');
    } catch (error) {
      if (error instanceof ApiClientError) {
        const usernameErr = error.getFieldError('username');
        if (usernameErr) {
          setFieldErrors((prev) => ({ ...prev, username: usernameErr }));
        }
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to save profile details.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSkillsInterestsGoals = async () => {
    setStatusMessage(null);
    setErrorMessage(null);
    setSavingTaxonomies(true);
    try {
      await profileService.updateMySkills(
        Object.entries(selectedSkills).map(([skillId, proficiency]) => ({
          skillId,
          proficiency,
        }))
      );
      await profileService.updateMyInterests(selectedInterestIds);
      const updated = await profileService.updateMyGoals(selectedGoals);
      setProfile(updated);
      setStatusMessage('Skills, interests, and goals updated.');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to update skills, interests, and goals.'
      );
    } finally {
      setSavingTaxonomies(false);
    }
  };

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
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="py-12">
          <LoadingState label="Loading your profile..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="flex flex-col gap-6">
        {statusMessage && (
          <div
            role="status"
            className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-2.5 text-xs text-[#166534]"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2.5 text-xs text-[#B91C1C]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Header summary */}
        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={displayName || username}
              avatarUrl={avatarUrl || profile?.avatarUrl}
              size="lg"
            />
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                {displayName || 'Unnamed Builder'}
              </h2>
              <p className="text-xs text-[#64748B]">
                {username ? `@${username}` : 'No username set'} ·{' '}
                {identityMode === 'PSEUDONYMOUS' ? 'Pseudonymous mode' : 'Real identity'}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-[#64748B]">Profile completion</p>
            <p className="text-lg font-bold text-[#4F46E5] tabular-nums">
              {profile?.completionPercentage ?? 0}%
            </p>
          </div>
        </section>

        {/* Basic Profile Form */}
        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserCheck className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
            <h2 className="text-base font-semibold text-[#0F172A]">
              Identity & Basic Information
            </h2>
          </div>

          <form onSubmit={handleSaveBasicProfile} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#0F172A]">Identity Mode</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['REAL', 'PSEUDONYMOUS'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setIdentityMode(mode)}
                    className={cn(
                      'p-3 rounded-lg border text-left text-xs cursor-pointer transition-colors',
                      identityMode === mode
                        ? 'border-[#4F46E5] bg-[#EEF2FF]/50 text-[#0F172A]'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B]'
                    )}
                  >
                    <p className="font-semibold text-[#0F172A]">
                      {mode === 'REAL' ? 'Real Identity' : 'Pseudonymous Identity'}
                    </p>
                    <p className="mt-0.5">
                      {mode === 'REAL'
                        ? 'Display your real name on your public profile.'
                        : 'Display an alias and handle while keeping your real identity private.'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="profile-display-name"
                type="text"
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                error={fieldErrors.displayName}
              />

              <Input
                id="profile-username"
                type="text"
                label="Username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                error={fieldErrors.username}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="profile-location"
                type="text"
                label="Location"
                placeholder="e.g., Kathmandu, Nepal"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={fieldErrors.location}
              />

              <Input
                id="profile-avatar-url"
                type="url"
                label="Avatar Image URL"
                placeholder="https://example.com/avatar.png"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                error={fieldErrors.avatarUrl}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="profile-bio" className="text-sm font-medium text-[#0F172A]">
                  Bio
                </label>
                <span className="text-xs text-[#64748B] tabular-nums">
                  {bio.length}/500
                </span>
              </div>
              <textarea
                id="profile-bio"
                rows={3}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
              {fieldErrors.bio && (
                <p className="text-xs text-[#DC2626]" role="alert">
                  {fieldErrors.bio}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" disabled={savingProfile}>
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Saving Details...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Skills, Interests & Goals */}
        <section className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A] mb-1">
              Skills, Interests & Goals
            </h2>
            <p className="text-xs text-[#64748B]">
              Keep your capabilities and goals current to receive relevant opportunity
              matches.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-[#0F172A]">Skills</h3>
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Filter skills..."
                aria-label="Filter skills"
                className="w-full h-10 pl-10 pr-3.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const selected = skill.id in selectedSkills;
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      'rounded-lg border p-2.5 flex flex-col gap-2',
                      selected
                        ? 'border-[#4F46E5] bg-[#EEF2FF]/40'
                        : 'border-[#E2E8F0] bg-[#FFFFFF]'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className="flex items-center justify-between gap-2 text-left cursor-pointer"
                    >
                      <span className="text-xs font-medium text-[#0F172A]">
                        {skill.name}
                      </span>
                      <span
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                          selected
                            ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                            : 'border-[#CBD5E1]'
                        )}
                      >
                        {selected && <Check className="w-3 h-3" aria-hidden="true" />}
                      </span>
                    </button>
                    {selected && (
                      <div className="flex flex-wrap gap-1">
                        {PROFICIENCY_OPTIONS.map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() =>
                              setSelectedSkills((prev) => ({
                                ...prev,
                                [skill.id]: level,
                              }))
                            }
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer',
                              selectedSkills[skill.id] === level
                                ? 'bg-[#4F46E5] text-white'
                                : 'bg-[#FFFFFF] text-[#64748B] border border-[#E2E8F0]'
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
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-[#F1F5F9]">
            <h3 className="text-sm font-medium text-[#0F172A]">Interests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {interestsCatalog.map((interest) => {
                const selected = selectedInterestIds.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() =>
                      setSelectedInterestIds((prev) =>
                        prev.includes(interest.id)
                          ? prev.filter((id) => id !== interest.id)
                          : [...prev, interest.id]
                      )
                    }
                    className={cn(
                      'p-2.5 rounded-lg border text-left flex items-center justify-between gap-2 cursor-pointer',
                      selected
                        ? 'border-[#4F46E5] bg-[#EEF2FF]/40'
                        : 'border-[#E2E8F0] bg-[#FFFFFF]'
                    )}
                  >
                    <span className="text-xs font-medium text-[#0F172A]">
                      {interest.name}
                    </span>
                    <span
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                        selected
                          ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                          : 'border-[#CBD5E1]'
                      )}
                    >
                      {selected && <Check className="w-3 h-3" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-[#F1F5F9]">
            <h3 className="text-sm font-medium text-[#0F172A]">Goals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GOAL_OPTIONS.map((goal) => {
                const selected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() =>
                      setSelectedGoals((prev) =>
                        prev.includes(goal.id)
                          ? prev.filter((item) => item !== goal.id)
                          : [...prev, goal.id]
                      )
                    }
                    className={cn(
                      'p-3 rounded-lg border text-left flex items-center justify-between gap-2 cursor-pointer',
                      selected
                        ? 'border-[#4F46E5] bg-[#EEF2FF]/40'
                        : 'border-[#E2E8F0] bg-[#FFFFFF]'
                    )}
                  >
                    <span className="text-xs font-medium text-[#0F172A]">
                      {goal.label}
                    </span>
                    <span
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                        selected
                          ? 'bg-[#4F46E5] border-[#4F46E5] text-white'
                          : 'border-[#CBD5E1]'
                      )}
                    >
                      {selected && <Check className="w-3 h-3" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={savingTaxonomies}
              onClick={() => void handleSaveSkillsInterestsGoals()}
            >
              {savingTaxonomies ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Saving Preferences...
                </>
              ) : (
                'Save Skills, Interests & Goals'
              )}
            </Button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
