import React from 'react';
import { cn } from '@/src/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  rightAdornment?: React.ReactNode;
}

export function Input({
  label,
  id,
  error,
  hint,
  rightAdornment,
  className,
  ...props
}: InputProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#0F172A]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full h-11 px-3.5 rounded-lg bg-[#FFFFFF] text-sm text-[#0F172A] placeholder:text-[#94A3B8]',
            'border transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]',
            error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#E2E8F0]',
            rightAdornment ? 'pr-11' : '',
            className
          )}
          {...props}
        />
        {rightAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
            {rightAdornment}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-[#DC2626]" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-[#64748B]">
          {hint}
        </p>
      )}
    </div>
  );
}
