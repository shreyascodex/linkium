import { ArrowUpRight, MapPin, User } from 'lucide-react';
import { Opportunity } from '@/src/types/opportunity';
import { Badge } from '@/src/components/ui/Badge';

export interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opportunity: Opportunity) => void;
}

export function OpportunityCard({ opportunity, onSelect }: OpportunityCardProps) {
  const statusVariant =
    opportunity.status.includes('Open')
      ? 'success'
      : opportunity.status.includes('Accepting')
      ? 'primary'
      : 'neutral';

  return (
    <article className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between gap-5 transition-all duration-150 hover:border-[#CBD5E1] hover:shadow-sm">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#4F46E5] truncate">
            {opportunity.categoryLabel}
          </span>
          <Badge variant={statusVariant}>{opportunity.status}</Badge>
        </div>

        <h3 className="text-lg font-semibold text-[#0F172A] leading-snug">
          <button
            type="button"
            onClick={() => onSelect(opportunity)}
            className="text-left hover:text-[#4F46E5] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            {opportunity.title}
          </button>
        </h3>

        <p className="text-sm text-[#64748B] leading-relaxed">
          {opportunity.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#64748B]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
            {opportunity.location}
          </span>
          <span aria-hidden="true">·</span>
          <span>{opportunity.workMode}</span>
          <span aria-hidden="true">·</span>
          <span>{opportunity.timeline}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {opportunity.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-[#F1F5F9] flex items-center justify-center text-[#475569] shrink-0">
            <User className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#0F172A] truncate">
              {opportunity.creatorName}
            </p>
            <p className="text-[11px] text-[#64748B] truncate">
              {opportunity.creatorRole}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(opportunity)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] whitespace-nowrap shrink-0 cursor-pointer px-2 py-1.5 rounded-md hover:bg-[#EEF2FF]/60 transition-colors"
        >
          View Details
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
