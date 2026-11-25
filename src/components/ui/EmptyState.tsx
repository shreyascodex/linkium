import { SearchX } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-6 py-14 text-center flex flex-col items-center justify-center">
      <div className="w-11 h-11 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] mb-4">
        <SearchX className="w-5 h-5" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-[#0F172A] mb-1.5">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
