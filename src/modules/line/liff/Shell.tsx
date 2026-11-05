import type { ReactNode } from 'react';
import { ArrowLeft, MoreHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/format';

/** หน้า LIFF: หัวคลื่นไล่สีฟ้า (ธีมเดียวกับดีไซน์) + เนื้อหาการ์ดซ้อนบนคลื่น */
export function LiffShell({ title, sub, onClose, onBack, children, hero }: { title?: string; sub?: string; onClose: () => void; onBack?: () => void; children: ReactNode; hero?: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-[#f5f7fb]">
      <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-200 to-blue-300 pb-12 text-white">
        <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
        <div className="relative flex items-center gap-2 px-4 pt-3">
          {onBack && (
            <button type="button" onClick={onBack} aria-label="ย้อนกลับ" className="rounded-full p-1 hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <span className="flex-1 text-[12px] font-medium opacity-90">ศูนย์ปลูกถ่ายไต</span>
          <MoreHorizontal className="h-5 w-5" />
          <button type="button" onClick={onClose} aria-label="ปิด" className="rounded-full p-1 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>
        {hero ?? (
          <div className="relative px-5 pt-2">
            <p className="text-[24px] font-bold leading-8">{title}</p>
            {sub && <p className="text-[12.5px] opacity-90">{sub}</p>}
          </div>
        )}
        <svg viewBox="0 0 390 40" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-10 w-full">
          <path d="M0 18 C 70 40 130 6 200 20 C 270 34 330 10 390 22 L390 40 L0 40 Z" fill="#dbeafe" opacity=".7" />
          <path d="M0 28 C 80 44 140 16 210 28 C 280 40 330 22 390 30 L390 40 L0 40 Z" fill="#f5f7fb" />
        </svg>
      </div>
      <div className="-mt-6 flex-1 overflow-y-auto px-4 pb-6">{children}</div>
    </div>
  );
}

export function LCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-[20px] bg-white p-4 shadow-[0_8px_22px_-10px_rgba(15,23,42,.18)]', className)}>{children}</div>;
}

export function LTabs<T extends string>({ items, value, onChange }: { items: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 rounded-full bg-white p-1 shadow-[0_8px_22px_-10px_rgba(15,23,42,.18)]">
      {items.map(([k, l]) => (
        <button key={k} type="button" onClick={() => onChange(k)} className={cn('h-9 flex-1 rounded-full text-[12.5px] transition', value === k ? 'bg-primary font-bold text-white' : 'font-medium text-slate-500')}>
          {l}
        </button>
      ))}
    </div>
  );
}

export function LBtn({ children, onClick, kind = 'primary', disabled, className }: { children: ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost' | 'outline'; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold transition active:scale-[.98] disabled:opacity-40',
        kind === 'primary' && 'bg-primary text-white shadow-[0_8px_18px_-8px_rgba(37,99,235,.6)]',
        kind === 'outline' && 'border-[1.5px] border-blue-200 bg-white text-primary',
        kind === 'ghost' && 'h-9 text-[13.5px] font-medium text-slate-500',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Chip({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'green' | 'amber' | 'orange' | 'slate' }) {
  const t = { blue: 'bg-blue-100 text-blue-700', green: 'bg-green-100 text-green-700', amber: 'bg-yellow-100 text-yellow-800', orange: 'bg-orange-100 text-orange-700', slate: 'bg-slate-100 text-slate-600' }[tone];
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold', t)}>{children}</span>;
}
