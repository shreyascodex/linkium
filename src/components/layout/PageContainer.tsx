import React from 'react';
import { cn } from '@/src/lib/cn';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'narrow';
}

export function PageContainer({
  children,
  className,
  size = 'default',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        size === 'narrow' ? 'max-w-4xl' : 'max-w-7xl',
        className
      )}
    >
      {children}
    </div>
  );
}
