import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/format';
import { fadeUp } from './motion';

export function Card({ className, children, animate = true }: { className?: string; children: ReactNode; animate?: boolean }) {
  return (
    <motion.section variants={animate ? fadeUp : undefined} className={cn('rounded-2xl border border-slate-200 bg-white shadow-card', className)}>
      {children}
    </motion.section>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  iconTone = { fg: '#2563eb', bg: '#dbeafe' },
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconTone?: { fg: string; bg: string };
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: iconTone.bg, color: iconTone.fg }}>
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-[12.5px] text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
