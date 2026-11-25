import { cn } from '@/src/lib/cn';

export interface LoadingStateProps {
  count?: number;
  className?: string;
}

export function LoadingState({ count = 4, className }: LoadingStateProps) {
  return (
    <div
      className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}
      role="status"
      aria-label="Loading opportunities"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 flex flex-col gap-4 animate-pulse"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-36 bg-[#E2E8F0] rounded" />
            <div className="h-5 w-24 bg-[#F1F5F9] rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="h-5 w-5/6 bg-[#E2E8F0] rounded" />
            <div className="h-4 w-full bg-[#F1F5F9] rounded" />
            <div className="h-4 w-4/5 bg-[#F1F5F9] rounded" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-6 w-16 bg-[#F1F5F9] rounded-md" />
            <div className="h-6 w-20 bg-[#F1F5F9] rounded-md" />
            <div className="h-6 w-16 bg-[#F1F5F9] rounded-md" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
