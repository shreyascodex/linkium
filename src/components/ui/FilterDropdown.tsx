import { ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/cn';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function FilterDropdown({
  id,
  label,
  value,
  onChange,
  options,
  className,
}: FilterDropdownProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-medium text-[#64748B]">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full h-11 pl-3.5 pr-9 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#0F172A]',
            'appearance-none cursor-pointer transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]'
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
