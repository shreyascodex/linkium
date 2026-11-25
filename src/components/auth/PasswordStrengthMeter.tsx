import { Check, Circle } from 'lucide-react';
import { evaluatePasswordStrength } from '@/src/lib/validation';
import { cn } from '@/src/lib/cn';

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);

  const barColors = [
    'bg-[#DC2626]',
    'bg-[#EA580C]',
    'bg-[#D97706]',
    'bg-[#2563EB]',
    'bg-[#16A34A]',
  ];

  const activeColor = barColors[Math.max(0, strength.score - 1)] ?? 'bg-[#E2E8F0]';

  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[#64748B]">Password strength</span>
        <span className="font-medium text-[#0F172A]">{strength.label}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={cn(
              'h-1.5 rounded-full transition-colors',
              strength.score >= step ? activeColor : 'bg-[#E2E8F0]'
            )}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#64748B]">
        {strength.checks.map((check) => (
          <li
            key={check.id}
            className={cn(
              'inline-flex items-center gap-1.5',
              check.passed ? 'text-[#16A34A]' : 'text-[#64748B]'
            )}
          >
            {check.passed ? (
              <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="w-2.5 h-2.5 shrink-0 text-[#CBD5E1]" aria-hidden="true" />
            )}
            <span>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
