import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, FileCheck2, Flag, Link2, Sparkles, UserPlus, type LucideIcon } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { formsApi } from '@/services/api/formsApi';
import { matchingApi } from '@/services/api/matchingApi';
import { appointmentApi } from '@/services/api/appointmentApi';
import { FORM_LIST, baseDone } from '@/modules/evaluation/progress';
import type { AnyForm, MrbForm } from '@/modules/evaluation/forms/data';
import { STATUS_META } from '@/lib/status';
import { cn, isoDate, thaiDate } from '@/lib/format';
import { RESULT_META } from '@/modules/matching/components/shared';

type Cat = 'form' | 'status' | 'appt' | 'match';
interface Ev {
  date: string;
  title: string;
  sub?: string;
  cat: Cat;
  icon: LucideIcon;
  color: string;
}

const CATS: [Cat | 'all', string][] = [
  ['all', 'ทั้งหมด'],
  ['form', 'ฟอร์ม'],
  ['status', 'สถานะ'],
  ['appt', 'นัดหมาย'],
  ['match', 'จับคู่'],
];

/** Timeline ของผู้ป่วย — รวมการลงทะเบียน ฟอร์ม สถานะ นัดหมาย และการจับคู่ เรียงจากล่าสุด */
export function PersonTimeline({ person, kind }: { person: PersonRef; kind: PersonKind }) {
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [cat, setCat] = useState<Cat | 'all'>('all');

  useEffect(() => {
    let alive = true;
    (async () => {
      const ev: Ev[] = [{ date: person.registeredAt, title: kind === 'donor' ? 'ลงทะเบียนผู้บริจาค' : 'ลงทะเบียนผู้รับบริจาคไต', cat: 'status', icon: UserPlus, color: '#64748b' }];
      const list = FORM_LIST[kind];
      const recs = await Promise.all(list.map((f) => formsApi.get<AnyForm>(kind, person.id, f.key, { sex: person.sex, done: baseDone(person, kind, f.key) })));
      recs.forEach((r, i) => {
        if (!r.completed) return;
        const f = list[i];
        const date = (r.data as { date?: string }).date ?? r.savedAt ?? person.registeredAt;
        if (f.key === 'mrb') {
          const res = (r.data as MrbForm).result;
          ev.push({ date, title: `ผล MRB: ${res === 'pass' ? 'ผ่าน' : res === 'fail' ? 'ไม่ผ่าน' : '—'}`, sub: (r.data as MrbForm).note, cat: 'form', icon: Flag, color: res === 'fail' ? '#dc2626' : '#ca8a04' });
        } else {
          ev.push({ date, title: `บันทึกฟอร์ม ${f.num} ${f.title}`, sub: r.savedBy, cat: 'form', icon: FileCheck2, color: '#4f46e5' });
        }
      });
      if (person.status !== 'evaluation') ev.push({ date: person.statusSince, title: `สถานะเปลี่ยนเป็น “${STATUS_META[person.status].label}”`, sub: 'อัตโนมัติ', cat: 'status', icon: Sparkles, color: '#16a34a' });
      else ev.push({ date: person.registeredAt, title: 'เริ่มขั้นตอน Evaluation', sub: 'อัตโนมัติหลังลงทะเบียน', cat: 'status', icon: Sparkles, color: '#dc2626' });
      if (kind === 'recipient') {
        const hist = await matchingApi.history();
        hist.filter((h) => h.recipientId === person.id).forEach((h) => ev.push({ date: h.startedAt, title: `จับคู่กับสภากาชาด: ${RESULT_META[h.result].label}`, sub: h.reason, cat: 'match', icon: Link2, color: RESULT_META[h.result].tone.dot }));
      }
      const from = new Date();
      from.setDate(from.getDate() - 90);
      const appts = await appointmentApi.range(isoDate(from), isoDate(new Date()), person.id);
      appts.forEach((a) => ev.push({ date: a.date, title: `มาตามนัด: ${a.type}`, sub: `${a.time} · ${a.room}${a.resultStatus === 'ok' ? ' · ผลแล็บออกแล้ว' : ''}`, cat: 'appt', icon: CalendarCheck, color: '#2563eb' }));
      ev.sort((a, b) => b.date.localeCompare(a.date));
      if (alive) setEvents(ev);
    })();
    return () => {
      alive = false;
    };
  }, [person, kind]);

  if (!events) return <Skeleton className="h-[400px] rounded-2xl" />;
  const shown = events.filter((e) => cat === 'all' || e.cat === cat);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex-1 text-base font-bold">Timeline</p>
        {CATS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setCat(k)} className={cn('relative rounded-full px-3 py-1 text-xs font-semibold', cat === k ? 'text-white' : 'text-slate-600 hover:bg-slate-100')}>
            {cat === k && <motion.span layoutId="tl-cat" className="absolute inset-0 rounded-full bg-primary" />}
            <span className="relative">
              {l} {k !== 'all' && <span className="opacity-70">{events.filter((e) => e.cat === k).length}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="relative pl-2">
        {shown.map((e, i) => (
          <motion.div key={`${cat}-${i}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }} className="relative flex gap-4 pb-5 last:pb-0">
            {i < shown.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-0.5 bg-slate-200" />}
            <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: `${e.color}1a`, color: e.color }}>
              <e.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <p className="text-[13.5px] font-semibold">{e.title}</p>
                <span className="text-xs text-slate-400">{thaiDate(e.date)}</span>
              </div>
              {e.sub && <p className="text-xs text-slate-500">{e.sub}</p>}
            </div>
          </motion.div>
        ))}
        {shown.length === 0 && <p className="py-6 text-center text-sm text-slate-400">ไม่มีรายการ</p>}
      </div>
    </div>
  );
}
