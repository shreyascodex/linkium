import { Search, X } from 'lucide-react';
import { cn } from '@/src/lib/cn';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search by title, skill, city, or organizer...',
  label = 'Search opportunities',
  id = 'opportunity-search',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-11 pl-10 pr-10 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A] placeholder:text-[#94A3B8]',
          'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]'
        )}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search query"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
