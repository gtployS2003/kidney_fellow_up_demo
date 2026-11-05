import { AlertTriangle, Calendar, CalendarCheck, CalendarPlus, CalendarX, Check, HeartPulse, ListChecks, Pill, Scissors } from 'lucide-react';
import type { FlexData } from './notify';
import { cn } from '@/lib/format';

const ICON = { calPlus: CalendarPlus, calendar: CalendarCheck, calX: CalendarX, calAlert: Calendar, scissors: Scissors, pill: Pill, list: ListChecks, heart: HeartPulse, alert: AlertTriangle };

/** Flex Message ตามธีม: หัวไล่สีฟ้า · การ์ดขาว · ปุ่มแคปซูล */
export function FlexCard({ d, answered, onPress }: { d: FlexData; answered?: string; onPress: (i: number) => void }) {
  const Icon = ICON[d.icon];
  return (
    <div className="w-[262px] overflow-hidden rounded-[20px] bg-white shadow-[0_8px_22px_-8px_rgba(15,23,42,.25)]">
      <div className="relative flex items-center gap-2.5 overflow-hidden bg-gradient-to-br from-blue-200 to-blue-300 px-3.5 py-3.5">
        <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/30" />
        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white">
          <Icon className={cn('h-5 w-5', d.warn ? 'text-orange-600' : 'text-primary')} />
        </span>
        <span className="relative min-w-0">
          <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-blue-900/80">
            {d.kicker}
            {d.warn && <span className="rounded-full bg-orange-100 px-1.5 text-[9.5px] font-bold text-orange-700">ต้องใส่ใจ</span>}
          </span>
          <span className="block text-[14px] font-bold leading-5 text-blue-900">{d.title}</span>
        </span>
      </div>
      <div className="flex flex-col gap-2 px-3.5 pb-1 pt-3">
        {d.rows && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-slate-50 p-2.5">
            {d.rows.map(([k, v, c]) => (
              <div key={k} className="flex gap-2 text-[12px]">
                <span className="text-slate-400">{k}</span>
                <span className="flex-1 text-right font-semibold" style={{ color: c ?? '#0f172a' }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}
        {d.text && <p className="text-[12.5px] leading-[18px] text-slate-700">{d.text}</p>}
        {d.list && (
          <div className="flex flex-col gap-1.5">
            {d.list.map((t) => (
              <p key={t} className="flex gap-2 text-[12px] leading-[17px] text-slate-700">
                <span className={cn('mt-px grid h-4 w-4 shrink-0 place-items-center rounded-full', d.warn ? 'bg-orange-100' : 'bg-blue-50')}>
                  <Check className={cn('h-2.5 w-2.5', d.warn ? 'text-orange-600' : 'text-primary')} strokeWidth={3} />
                </span>
                {t}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 px-3.5 pb-3.5 pt-2">
        {d.buttons.map((b, i) => (
          <button
            key={b.label}
            type="button"
            disabled={!!answered && b.action.type !== 'open'}
            onClick={() => onPress(i)}
            className={cn(
              'h-10 rounded-full text-[13px] font-bold transition active:scale-[.98] disabled:opacity-45',
              b.primary ? 'bg-primary text-white shadow-[0_6px_14px_-6px_rgba(37,99,235,.6)]' : 'border-[1.5px] border-blue-200 bg-white text-primary',
            )}
          >
            {b.label}
          </button>
        ))}
        {answered && <p className="text-center text-[11px] text-slate-400">ตอบแล้ว: {answered}</p>}
      </div>
    </div>
  );
}
