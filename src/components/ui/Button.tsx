import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: undefined;
  };

type ButtonAsLink = BaseProps & {
  to: string;
  onClick?: () => void;
  'aria-label'?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#4F46E5] text-white border border-transparent hover:bg-[#4338CA] active:bg-[#3730A3] shadow-xs',
  secondary:
    'bg-[#0F172A] text-white border border-transparent hover:bg-[#1E293B] shadow-xs',
  outline:
    'bg-[#FFFFFF] text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]',
  ghost:
    'bg-transparent text-[#64748B] border border-transparent hover:text-[#0F172A] hover:bg-[#F1F5F9]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-lg',
  md: 'h-10 px-5 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]',
    'disabled:opacity-50 disabled:pointer-events-none',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className
  );

  if ('to' in rest && typeof rest.to === 'string') {
    const { to, onClick, 'aria-label': ariaLabel } = rest;
    return (
      <Link to={to} onClick={onClick} aria-label={ariaLabel} className={baseClasses}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? 'button'} className={baseClasses} {...buttonProps}>
      {children}
    </button>
  );
}
