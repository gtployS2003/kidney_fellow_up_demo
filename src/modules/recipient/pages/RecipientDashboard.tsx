import { motion } from 'framer-motion';
import { Building2, CalendarCheck, Clock, Link2, List, Plus, Users, type LucideIcon } from 'lucide-react';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Skeleton } from '@/components/ui/Skeleton';
import { fadeUp, stagger } from '@/components/ui/motion';
import { useAsync } from '@/hooks/useAsync';
import { recipientApi } from '@/services/api/recipientApi';
import { thaiDate } from '@/lib/format';
import { Pipeline } from '@/components/pipeline/Pipeline';

interface Stat {
  icon: LucideIcon;
  fg: string;
  bg: string;
  value: number;
  label: string;
  sub: string;
}

export default function RecipientDashboard() {
  useCrumbs(['ผู้รับบริจาคไต (Recipient)', 'Dashboard']);
  const summary = useAsync(() => recipientApi.dashboard(), []);
  const rows = useAsync(() => recipientApi.list(), []);
  const s = summary.data;

  const stats: Stat[] = s
    ? [
        { icon: Users, fg: '#2563eb', bg: '#dbeafe', value: s.total, label: 'ผู้ป่วยลงทะเบียนทั้งหมด', sub: `มีคู่แล้ว ${s.living} · สภากาชาด ${s.redcross}` },
        { icon: Link2, fg: '#0f766e', bg: '#ccfbf1', value: s.living, label: 'จับคู่ผู้บริจาคแล้ว', sub: 'มีผู้บริจาคมีชีวิต (Living donor)' },
        { icon: Building2, fg: '#6d28d9', bg: '#ede9fe', value: s.waitingRedCross, label: 'รอไตจากสภากาชาด', sub: 'ผ่าน MRB แล้ว อยู่ในคิวสภากาชาด' },
        { icon: Clock, fg: '#a16207', bg: '#fef9c3', value: s.mrb, label: 'รอ MRB', sub: 'ผ่านการตรวจแล้ว อยู่ระหว่างรอ MRB' },
        { icon: CalendarCheck, fg: '#0f172a', bg: '#e2e8f0', value: s.waitingSurgery, label: 'รอผ่าตัด', sub: 'มีกำหนดวันผ่าตัดแล้ว' },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="ภาพรวมผู้รับบริจาคไต (Recipient)"
        subtitle={`อัปเดตล่าสุด ${thaiDate(new Date().toISOString())} — สถานะผู้ป่วยเปลี่ยนอัตโนมัติเมื่อขั้นตอนเสร็จ`}
        actions={
          <>
            <Button variant="secondary" icon={List} to="/clinical/recipients/list">
              ดูรายชื่อทั้งหมด
            </Button>
            <Button icon={Plus} to="/clinical/recipients/register">
              ลงทะเบียนผู้ป่วย
            </Button>
          </>
        }
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summary.loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[170px] rounded-2xl" />)
          : stats.map((st) => (
              <motion.div
                key={st.label}
                variants={fadeUp}
                whileHover={{ y: -3, boxShadow: '0 12px 28px -6px rgba(15,23,42,.12)' }}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: st.bg, color: st.fg }}>
                  <st.icon className="h-[22px] w-[22px]" />
                </span>
                <div>
                  <p className="text-[32px] font-bold leading-10">
                    <AnimatedNumber value={st.value} />
                  </p>
                  <p className="text-sm font-semibold">{st.label}</p>
                </div>
                <p className="border-t border-slate-200 pt-2.5 text-xs text-slate-500">{st.sub}</p>
              </motion.div>
            ))}
      </motion.div>

      {rows.loading || !rows.data ? <Skeleton className="h-[520px] rounded-2xl" /> : <Pipeline
          basePath="/clinical/recipients"
          rows={rows.data.map((r) => ({ ...r, linkLine: r.matchedDonor ? `${r.matchedDonor.name} (${r.matchedDonor.relation})` : undefined }))}
        />}
    </>
  );
}
