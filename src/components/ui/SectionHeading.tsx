import React from 'react';
import { cn } from '@/src/lib/cn';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  className,
}: SectionHeadingProps) {
  const isCentered = align === 'center';

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        isCentered ? 'items-center text-center mx-auto max-w-2xl' : 'md:flex-row md:items-end md:justify-between gap-6',
        className
      )}
    >
      <div className={cn('flex flex-col gap-2.5', !isCentered && 'max-w-2xl')}>
        {eyebrow && (
          <span className="text-xs font-semibold tracking-wider uppercase text-[#4F46E5]">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-base text-[#64748B] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && !isCentered && <div className="shrink-0">{action}</div>}
    </div>
  );
}
