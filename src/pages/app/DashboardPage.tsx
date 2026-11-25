import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  MapPin,
  Settings,
  Shield,
  Sparkles,
  UserPen,
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { DEMO_OPPORTUNITIES } from '@/src/data/opportunities';
import { OPPORTUNITY_CATEGORIES } from '@/src/data/categories';
import { getGoalLabel } from '@/src/types/profile';
import type { Opportunity } from '@/src/types/opportunity';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { UserAvatar } from '@/src/components/profile/UserAvatar';
import { Button } from '@/src/components/ui/Button';
import { OpportunityCard } from '@/src/components/opportunities/OpportunityCard';
import { OpportunityDetailModal } from '@/src/components/opportunities/OpportunityDetailModal';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  const recommendedOpportunities = useMemo(() => {
    const userSkillTokens = (profile?.skills ?? []).flatMap((s) =>
      s.name.toLowerCase().split(/[\s/]+/)
    );
    const userInterestTokens = (profile?.interests ?? []).flatMap((i) =>
      i.name.toLowerCase().split(/[\s&]+/)
    );
    const userTokens = new Set(
      [...userSkillTokens, ...userInterestTokens].filter((t) => t.length > 2)
    );

    const scored = DEMO_OPPORTUNITIES.map((opp) => {
      const haystack = `${opp.title} ${opp.description} ${opp.categoryLabel} ${opp.requiredSkills.join(' ')}`.toLowerCase();
      let score = opp.isFeatured ? 1 : 0;
      for (const token of userTokens) {
        if (haystack.includes(token)) {
          score += 2;
        }
      }
      return { opp, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.opp);
  }, [profile]);

  const displayName =
    profile?.displayName ?? profile?.username ?? user?.email ?? 'Member';
  const completion = profile?.completionPercentage ?? 0;
  const missingFields = profile?.missingFields ?? [];

  return (
    <DashboardLayout title="Overview">
      <div className="flex flex-col gap-8">
        {/* Welcome & Profile Completion */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <UserAvatar
                  name={displayName}
                  avatarUrl={profile?.avatarUrl}
                  size="lg"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
                      Welcome back, {displayName}
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
                    {profile?.username && <span>@{profile.username}</span>}
                    <span className="inline-flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-[#4F46E5]" aria-hidden="true" />
                      {profile?.identityMode === 'PSEUDONYMOUS'
                        ? 'Pseudonymous Identity'
                        : 'Real Identity'}
                    </span>
                    {profile?.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        {profile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button to="/opportunities" variant="primary" size="sm">
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  Explore Opportunities
                </Button>
                <Button to="/profile" variant="outline" size="sm">
                  <UserPen className="w-4 h-4" aria-hidden="true" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {profile?.bio ? (
              <p className="text-sm text-[#475569] leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-sm text-[#64748B]">
                Add a short bio in your profile so collaborators know what you are excited
                to build next.
              </p>
            )}

            <div className="pt-4 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[#64748B] mb-1.5 font-medium">Skills</p>
                {profile?.skills.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill.skillId}
                        className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A]"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {profile.skills.length > 4 && (
                      <span className="px-2 py-0.5 text-[#64748B] tabular-nums">
                        +{profile.skills.length - 4} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[#94A3B8]">No skills added</span>
                )}
              </div>

              <div>
                <p className="text-[#64748B] mb-1.5 font-medium">Interests</p>
                {profile?.interests.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.slice(0, 3).map((interest) => (
                      <span
                        key={interest.interestId}
                        className="px-2 py-0.5 rounded-md bg-[#EEF2FF]/60 border border-[#C7D2FE] text-[#3730A3]"
                      >
                        {interest.name}
                      </span>
                    ))}
                    {profile.interests.length > 3 && (
                      <span className="px-2 py-0.5 text-[#64748B] tabular-nums">
                        +{profile.interests.length - 3} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[#94A3B8]">No interests added</span>
                )}
              </div>

              <div>
                <p className="text-[#64748B] mb-1.5 font-medium">Goals</p>
                {profile?.goals.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.goals.slice(0, 2).map((goal) => (
                      <span
                        key={goal}
                        className="px-2 py-0.5 rounded-md bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534]"
                      >
                        {getGoalLabel(goal)}
                      </span>
                    ))}
                    {profile.goals.length > 2 && (
                      <span className="px-2 py-0.5 text-[#64748B] tabular-nums">
                        +{profile.goals.length - 2} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[#94A3B8]">No goals set</span>
                )}
              </div>
            </div>
          </div>

          {/* Real Profile Completion Card */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Profile Completion
                </h2>
                <span className="text-lg font-bold text-[#4F46E5] tabular-nums">
                  {completion}%
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>

              {completion >= 100 ? (
                <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2 text-xs text-[#166534]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Your profile is 100% complete and ready for upcoming collaborator
                    discovery.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-[#64748B]">Remaining to complete:</p>
                  <ul className="text-xs text-[#475569] space-y-1">
                    {missingFields.slice(0, 4).map((field) => (
                      <li key={field} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex flex-col gap-2">
              <Link
                to="/profile"
                className="inline-flex items-center justify-between text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]"
              >
                <span>Update Profile & Skills</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center justify-between text-xs font-medium text-[#64748B] hover:text-[#0F172A]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                  Account & Password Settings
                </span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Recommended Opportunities */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4F46E5] mb-1">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Matched to your profile</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">
                Recommended Opportunities
              </h2>
              <p className="text-xs text-[#64748B]">
                Curated demo opportunities aligned with your saved skills and interests.
              </p>
            </div>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA]"
            >
              Browse all listings
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendedOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onSelect={setSelectedOpportunity}
              />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">
            Explore by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OPPORTUNITY_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={`/opportunities?category=${category.id}`}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 hover:border-[#4F46E5]/50 transition-colors flex flex-col justify-between gap-2"
              >
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    {category.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {category.exampleFocus}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#4F46E5] inline-flex items-center gap-1 pt-1">
                  Explore
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </DashboardLayout>
  );
}
