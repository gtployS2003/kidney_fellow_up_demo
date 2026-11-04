import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { fadeUp } from '@/components/ui/motion';
import type { HlaTyping, MatchResult } from '@/types';
import { Badge, TONES } from '@/components/ui/Badge';
import { cn } from '@/lib/format';

export const RESULT_META: Record<MatchResult, { label: string; tone: (typeof TONES)[keyof typeof TONES] }> = {
  received: { label: 'ได้รับไต', tone: TONES.green },
  notReceived: { label: 'ไม่ได้รับ / ยกเลิก', tone: TONES.slate },
  rejected: { label: 'ปฏิเสธ', tone: TONES.red },
};

export function ResultBadge({ result }: { result: MatchResult }) {
  const m = RESULT_META[result];
  return <Badge label={m.label} tone={m.tone} dot />;
}

export function StatCard({ icon: Icon, fg, bg, value, label, sub }: { icon: LucideIcon; fg: string; bg: string; value: number; label: string; sub: string }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3, boxShadow: '0 12px 28px -6px rgba(15,23,42,.12)' }} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
      <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: bg, color: fg }}>
        <Icon className="h-[22px] w-[22px]" />
      </span>
      <div>
        <p className="text-[32px] font-bold leading-10">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="border-t border-slate-200 pt-2.5 text-xs text-slate-500">{sub}</p>
    </motion.div>
  );
}

/** แสดง HLA ราย locus — allele ที่ตรงกับค่าค้นหาไฮไลต์สีเขียว */
export function HlaChips({ hla, query }: { hla: HlaTyping; query?: { A: string[]; B: string[]; DR: string[] } }) {
  return (
    <div className="flex flex-col gap-1">
      {(['A', 'B', 'DR'] as const).map((k) => (
        <div key={k} className="flex items-center gap-1">
          <span className="w-6 text-[11px] font-semibold text-slate-400">{k}</span>
          {hla[k].map((a, i) => {
            const m = !!query && query[k].includes(a);
            return (
              <span key={i} className={cn('rounded-[5px] px-1.5 py-px text-[11.5px]', m ? 'border border-green-300 bg-green-100 font-bold text-green-700' : 'bg-slate-100 text-slate-500')}>
                {a}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function QTag({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[11.5px] font-semibold text-amber-800">? {children}</span>;
}

export function elapsed(iso: string, now = new Date()): { text: string; hot: boolean } {
  const ms = now.getTime() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 60) return { text: `${min} นาที`, hot: false };
  const h = Math.round(min / 60);
  if (h < 48) return { text: `${h} ชม.`, hot: h >= 12 };
  return { text: `${Math.round(h / 24)} วัน`, hot: true };
}

export function thaiDateTime(iso: string): string {
  const d = new Date(iso);
  const m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][d.getMonth()];
  return `${d.getDate()} ${m} ${d.getFullYear() + 543} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
