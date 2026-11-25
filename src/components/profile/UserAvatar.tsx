import { useState } from 'react';
import { cn } from '@/src/lib/cn';

export interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
};

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'LK';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  className,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const safeUrl =
    avatarUrl &&
    (avatarUrl.startsWith('https://') || avatarUrl.startsWith('http://'))
      ? avatarUrl
      : null;

  if (safeUrl && !imageError) {
    return (
      <img
        src={safeUrl}
        alt={name ? `${name} avatar` : 'User avatar'}
        onError={() => setImageError(true)}
        className={cn(
          'rounded-full object-cover border border-[#E2E8F0] bg-[#F8FAFC] shrink-0',
          SIZE_MAP[size],
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-full bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] font-semibold flex items-center justify-center shrink-0 select-none',
        SIZE_MAP[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
