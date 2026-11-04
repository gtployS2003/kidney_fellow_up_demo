import type { CaseType, RecipientStatus } from '@/types';
import { CASE_META, STATUS_META, type Tone } from '@/lib/status';
import { cn } from '@/lib/format';

export function Badge({ label, tone, dot, className }: { label: string; tone: Tone; dot?: boolean; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-medium', className)}
      style={{ color: tone.fg, background: tone.bg }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.dot }} />}
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: RecipientStatus }) {
  const m = STATUS_META[status];
  return <Badge label={m.label} tone={m.tone} dot />;
}

export function CaseBadge({ caseType }: { caseType: CaseType }) {
  const m = CASE_META[caseType];
  return <Badge label={m.label} tone={m.tone} />;
}

export const TONES = {
  slate: { fg: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
  blue: { fg: '#1d4ed8', bg: '#dbeafe', dot: '#2563eb' },
  green: { fg: '#15803d', bg: '#dcfce7', dot: '#16a34a' },
  red: { fg: '#b91c1c', bg: '#fee2e2', dot: '#ef4444' },
  amber: { fg: '#a16207', bg: '#fef9c3', dot: '#eab308' },
  orange: { fg: '#c2410c', bg: '#ffedd5', dot: '#f97316' },
  violet: { fg: '#6d28d9', bg: '#ede9fe', dot: '#7c3aed' },
  teal: { fg: '#0f766e', bg: '#ccfbf1', dot: '#14b8a6' },
} satisfies Record<string, Tone>;
