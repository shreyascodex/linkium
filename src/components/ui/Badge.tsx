import React from 'react';
import { cn } from '@/src/lib/cn';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'outline';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  neutral: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
  primary: 'bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]',
  success: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]',
  outline: 'bg-[#FFFFFF] text-[#475569] border border-[#E2E8F0]',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0',
        BADGE_VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
