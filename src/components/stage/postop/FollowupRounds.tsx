import { motion } from 'framer-motion';
import { CalendarCheck, Check, Clock, Info, Route, X } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import { Badge, TONES } from '@/components/ui/Badge';
import { SCHEDULE, followRounds } from '@/lib/followup';
import { cn, thaiDate } from '@/lib/format';

/** วันผ่าตัด (เดโม: ใช้ stageDates.surgery ถ้ามี ไม่งั้นใช้หลักเดียวกับ postopApi) */
export function surgeryDateOf(p: PersonRef) {
  if (p.stageDates.surgery) return p.stageDates.surgery;
  const d = new Date(p.statusSince);
  d.setDate(d.getDate() - 11);
  return d.toISOString().slice(0, 10);
}

/** การ์ด “รอบติดตาม OPD” — ตารางรอบมาตรฐาน · มาแล้ว / ขาดนัด / รอบถัดไป */
export function FollowupRounds({ person, kind }: { person: PersonRef; kind: PersonKind }) {
  const f = followRounds(kind, surgeryDateOf(person));
  const sched = SCHEDULE[kind];
  const stats = [
    { icon: Check, k: 'มาตามนัดแล้ว', v: `${f.done} ครั้ง`, fg: '#15803d', bg: '#f0fdf4' },
    { icon: X, k: 'ขาดนัด', v: `${f.missed} ครั้ง`, fg: f.missed ? '#c2410c' : '#475569', bg: f.missed ? '#fff7ed' : '#f8fafc' },
    { icon: CalendarCheck, k: 'รอบถัดไป', v: f.next ? thaiDate(f.next.date) : '—', fg: '#1d4ed8', bg: '#eff6ff' },
    { icon: Clock, k: 'ช่วงปัจจุบัน', v: f.phase >= 0 ? `${sched[f.phase].label} · ${sched[f.phase].every}` : '—', fg: '#475569', bg: '#f8fafc' },
  ];
  return (
    <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-blue-100 text-blue-600">
          <Route className="h-[18px] w-[18px]" />
        </span>
        <div className="flex-1">
          <p className="text-base font-bold">รอบติดตาม OPD</p>
          <p className="text-[12.5px] text-slate-500">ตารางมาตรฐาน{kind === 'donor' ? 'หลังบริจาคไต' : 'หลังปลูกถ่ายไต'} · คำนวณจากวันผ่าตัด {thaiDate(surgeryDateOf(person))} (POD {f.pod}) · ข้อมูลการมาจาก iMed</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="flex items-center gap-3 rounded-xl p-3.5" style={{ background: s.bg }}>
            <s.icon className="h-5 w-5" style={{ color: s.fg }} />
            <span>
              <span className="block text-xs text-slate-500">{s.k}</span>
              <span className="block text-[14.5px] font-bold" style={{ color: s.fg }}>
                {s.v}
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="flex overflow-x-auto pt-1">
        {f.rounds.map((r, i) => {
          const first = i === 0;
          const last = i === f.rounds.length - 1;
          const doneLine = r.status === 'done' || r.status === 'missed';
          return (
            <motion.div key={r.label + r.date} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} className="flex min-w-[68px] flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <span className={cn('h-[3px] flex-1', first ? 'bg-transparent' : doneLine ? 'bg-blue-300' : 'bg-slate-200')} />
                <span
                  className={cn(
                    'grid h-7 w-7 place-items-center rounded-full',
                    r.status === 'done' && 'bg-green-600',
                    r.status === 'missed' && 'bg-orange-500',
                    r.status === 'next' && 'bg-primary ring-4 ring-blue-200',
                    r.status === 'future' && 'border-[1.5px] border-slate-300 bg-white',
                  )}
                >
                  {r.status === 'done' && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  {r.status === 'missed' && <X className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  {r.status === 'next' && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span className={cn('h-[3px] flex-1', last ? 'bg-transparent' : doneLine && f.rounds[i + 1]?.status !== 'future' && f.rounds[i + 1]?.status !== 'next' ? 'bg-blue-300' : 'bg-slate-200')} />
              </div>
              <span className={cn('text-xs font-semibold', r.status === 'next' ? 'text-primary' : 'text-slate-700')}>{r.label}</span>
              <span className={cn('text-[11px]', r.status === 'missed' ? 'text-orange-700' : 'text-slate-400')}>{thaiDate(r.date).slice(0, 6)}</span>
            </motion.div>
          );
        })}
      </div>
      <div className={cn('grid gap-3', sched.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
        {sched.map((p, i) => (
          <div key={p.label} className={cn('flex flex-col gap-0.5 rounded-xl border p-3', i === f.phase ? 'border-primary bg-blue-50 ring-1 ring-primary/30' : 'border-slate-200')}>
            <span className="flex items-center gap-1.5 text-[13px] font-semibold">
              <span className={i === f.phase ? 'text-blue-700' : ''}>{p.label}</span>
              {i < f.phase && <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={3} />}
              {i === f.phase && <Badge label="ตอนนี้" tone={TONES.blue} />}
            </span>
            <span className="text-[12.5px] text-slate-500">{p.every}</span>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Info className="h-3.5 w-3.5" /> ตารางรอบเป็นค่ามาตรฐานของระบบ (รอยืนยันกับทีมแพทย์) · ขาดนัด = เลยวันนัดแล้วไม่มีข้อมูลการมาจาก iMed → ส่งแจ้งเตือน “ขาดนัด” ทาง LINE อัตโนมัติ
      </p>
    </div>
  );
}
