import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '@/src/config/brand';

export interface BrandMarkProps {
  onClick?: () => void;
}

export function BrandMark({ onClick }: BrandMarkProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="inline-flex items-center gap-2.5 text-[#0F172A] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] rounded-md"
      aria-label={`${BRAND_CONFIG.name} home`}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="28" height="28" rx="7" fill="#4F46E5" />
        <path
          d="M8.5 14.5C8.5 11.4624 10.9624 9 14 9H19.5V12H14C12.6193 12 11.5 13.1193 11.5 14.5V19H8.5V14.5Z"
          fill="white"
        />
        <circle cx="17.5" cy="17" r="2.5" fill="#A5B4FC" />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight">
        {BRAND_CONFIG.name}
      </span>
    </Link>
  );
}
