import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '@/lib/format';

/** ตัวเลือกแบบปุ่มติดกัน — แถบไฮไลต์เลื่อนตามตัวที่เลือก */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  size?: 'sm' | 'md';
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('inline-flex gap-1 rounded-[10px] bg-slate-100 p-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'relative rounded-lg font-medium transition-colors',
              size === 'md' ? 'px-3.5 py-1.5 text-[13px]' : 'px-3 py-1 text-xs',
              active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {active && (
              <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <span className={cn('relative', active && 'font-semibold')}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
