import { useState } from 'react';
import { Bookmark, Check, Clock, Info, MapPin, User } from 'lucide-react';
import { Opportunity } from '@/src/types/opportunity';
import { Modal } from '@/src/components/ui/Modal';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';

export interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export function OpportunityDetailModal({
  opportunity,
  onClose,
}: OpportunityDetailModalProps) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  if (!opportunity) return null;

  const isSaved = savedIds.includes(opportunity.id);

  const toggleSave = () => {
    setSavedIds((prev) =>
      prev.includes(opportunity.id)
        ? prev.filter((id) => id !== opportunity.id)
        : [...prev, opportunity.id]
    );
  };

  return (
    <Modal isOpen={Boolean(opportunity)} onClose={onClose} title={opportunity.title}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#4F46E5]">
            <span>{opportunity.categoryLabel}</span>
          </div>
          <Badge variant="primary">{opportunity.status}</Badge>
        </div>

        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5 text-xs text-[#64748B] leading-relaxed">
          <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            This is a demonstration listing created for Stage 1 platform evaluation. Live applications and messaging will open in a later stage.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-[#0F172A]">Overview</h3>
          <p className="text-sm text-[#475569] leading-relaxed">
            {opportunity.fullSummary}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-[#E2E8F0]">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#64748B] inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              Location & Mode
            </span>
            <span className="text-sm font-medium text-[#0F172A]">
              {opportunity.location} · {opportunity.workMode}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#64748B] inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Expected Pace
            </span>
            <span className="text-sm font-medium text-[#0F172A]">
              {opportunity.timeline} ({opportunity.commitment})
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#64748B] inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" aria-hidden="true" />
              Initiated By
            </span>
            <span className="text-sm font-medium text-[#0F172A]">
              {opportunity.creatorName}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-[#0F172A]">Relevant Skills</h3>
          <div className="flex flex-wrap gap-2">
            {opportunity.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F172A]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <Button variant="outline" size="md" onClick={toggleSave}>
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                Bookmarked in Preview
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" aria-hidden="true" />
                Save for Later
              </>
            )}
          </Button>
          <Button to="/register" variant="primary" size="md" onClick={onClose}>
            Request Beta Access to Connect
          </Button>
        </div>
      </div>
    </Modal>
  );
}
