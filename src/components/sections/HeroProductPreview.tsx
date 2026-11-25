import { useState } from 'react';
import { ArrowUpRight, Briefcase, FolderGit2, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/cn';

type PreviewTab = 'opportunities' | 'collaborators' | 'workspace';

const PREVIEW_OPPORTUNITIES = [
  {
    id: 'p1',
    title: 'Himalayan Air Quality Tracker',
    category: 'Projects & Collaborations',
    location: 'Kathmandu · Hybrid',
    skills: ['React', 'TypeScript', 'Data Viz'],
  },
  {
    id: 'p2',
    title: 'Rural FinTech Innovation Challenge',
    category: 'Competitions',
    location: 'Pokhara · Hybrid',
    skills: ['Product Strategy', 'Offline UX'],
  },
  {
    id: 'p3',
    title: 'Junior Product Design Intern',
    category: 'Jobs & Internships',
    location: 'Lalitpur · On-site',
    skills: ['Figma', 'Design Systems'],
  },
];

const PREVIEW_COLLABORATORS = [
  {
    name: 'Aarav Shrestha',
    focus: 'Civic Data & Frontend Systems',
    city: 'Kathmandu',
    seeking: 'UI Designer · Data Engineer',
  },
  {
    name: 'Sita Gurung',
    focus: 'Nepali NLP & Document Parsing',
    city: 'Remote (Nepal)',
    seeking: 'Python Contributors',
  },
  {
    name: 'Rohan Adhikari',
    focus: 'Open Community Library Tools',
    city: 'Chitwan',
    seeking: 'PostgreSQL · API Builder',
  },
];

export function HeroProductPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('opportunities');
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
      {/* Window header */}
      <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-[#E2E8F0]/60 rounded-lg" role="tablist" aria-label="Product workspace preview">
          {(
            [
              { id: 'opportunities', label: 'Opportunities' },
              { id: 'collaborators', label: 'Collaborators' },
              { id: 'workspace', label: 'Build Space' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                activeTab === tab.id
                  ? 'bg-[#FFFFFF] text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-medium text-[#64748B] hidden sm:inline">
          Preview UI
        </span>
      </div>

      {/* Preview body */}
      <div className="p-5 sm:p-6">
        {activeTab === 'opportunities' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <span className="text-xs font-medium text-[#64748B]">
                Sample Nepal Feed (Demo)
              </span>
              <Link
                to="/opportunities"
                className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] inline-flex items-center gap-1"
              >
                Open full explorer
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            {PREVIEW_OPPORTUNITIES.map((item, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer',
                    isSelected
                      ? 'border-[#4F46E5]/40 bg-[#EEF2FF]/35'
                      : 'border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC]'
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-medium text-[#4F46E5]">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-[#64748B] inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      {item.location}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A] mb-2">
                    {item.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E2E8F0] text-[11px] text-[#475569]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'collaborators' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <span className="text-xs font-medium text-[#64748B]">
                People Open to Collaborating (Demo)
              </span>
              <span className="text-xs text-[#64748B]">Matched by skills</span>
            </div>

            {PREVIEW_COLLABORATORS.map((person) => (
              <div
                key={person.name}
                className="p-3.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[#0F172A] inline-flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#4F46E5]" aria-hidden="true" />
                    {person.name}
                  </span>
                  <span className="text-xs text-[#64748B]">{person.city}</span>
                </div>
                <p className="text-xs text-[#475569]">{person.focus}</p>
                <p className="text-[11px] text-[#64748B]">
                  Looking for: <span className="text-[#0F172A] font-medium">{person.seeking}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
              <span className="text-xs font-medium text-[#64748B]">
                Structured Project Brief (Demo)
              </span>
              <span className="text-xs font-medium text-[#16A34A]">
                Clear Scope
              </span>
            </div>

            <div className="p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <FolderGit2 className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
                Himalayan Air Quality Tracker
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Every opportunity outlines clear expectations upfront so contributors can evaluate fit before connecting.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0] text-xs">
                <div>
                  <span className="text-[#64748B] block">Format</span>
                  <span className="font-medium text-[#0F172A]">Hybrid · 8 Weeks</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Weekly Pace</span>
                  <span className="font-medium text-[#0F172A]">6–8 hrs / week</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#64748B] inline-flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                Stage 1 Interactive Mockup
              </span>
              <Link
                to="/how-it-works"
                className="text-xs font-medium text-[#4F46E5] hover:underline"
              >
                See full journey
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
