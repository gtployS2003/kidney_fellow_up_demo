import { motion } from 'framer-motion';
import { Check, LayoutGrid, Lock, MousePointerClick } from 'lucide-react';
import type { StageKey } from '@/types';
import { STAGES } from '@/lib/status';
import { cn, thaiDate } from '@/lib/format';

export type StepState = 'done' | 'current' | 'todo';

/** แถบขั้นตอนการรักษา — คลิกได้ทุกขั้น (ขั้นที่ยังไม่ถึงจะแสดงหน้าล็อก) */
export function ProcessStepper({
  currentIndex,
  selected,
  onSelect,
  dates,
}: {
  currentIndex: number;
  selected: StageKey | null;
  onSelect: (k: StageKey | null) => void;
  dates: Partial<Record<StageKey, string>>;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold">ขั้นตอนการรักษา</p>
        <p className="flex items-center gap-1 text-xs text-slate-400">
          <MousePointerClick className="h-3.5 w-3.5" /> คลิกแต่ละขั้นตอนเพื่อดูรายละเอียด
        </p>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition', selected === null ? 'bg-primary-soft text-primary' : 'text-slate-500 hover:bg-slate-100')}
        >
          <LayoutGrid className="h-3.5 w-3.5" /> ภาพรวม
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {STAGES.map((s, i) => {
          const state: StepState = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
          const isSel = selected === s.key;
          const color = state === 'done' ? '#16a34a' : state === 'current' ? '#2563eb' : '#e2e8f0';
          return (
            <motion.button
              key={s.key}
              type="button"
              onClick={() => onSelect(isSel ? null : s.key)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex flex-col gap-2 rounded-xl p-2.5 text-left"
            >
              {isSel && <motion.span layoutId="stage-sel" className="absolute inset-0 rounded-xl border-[1.5px] border-primary bg-primary-soft" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative h-1.5 overflow-hidden rounded bg-slate-200">
                <motion.span className="block h-full rounded" style={{ background: color }} initial={{ width: 0 }} animate={{ width: state === 'todo' ? '0%' : '100%' }} transition={{ duration: 0.5, delay: i * 0.08 }} />
              </span>
              <span className="relative flex items-center gap-2">
                <span
                  className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold', state === 'todo' && 'border border-slate-300 bg-white')}
                  style={state !== 'todo' ? { background: color, color: '#fff' } : undefined}
                >
                  {state === 'done' ? <Check className="h-3 w-3" strokeWidth={3} /> : state === 'todo' ? <Lock className="h-3 w-3 text-slate-400" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={cn('block truncate text-sm font-semibold', state === 'todo' ? 'text-slate-400' : isSel ? 'text-primary' : 'text-slate-900')}>{s.label}</span>
                  <span className="block truncate text-[11px] text-slate-400">{state === 'current' ? 'กำลังดำเนินการ' : dates[s.key] ? thaiDate(dates[s.key]) : '—'}</span>
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
