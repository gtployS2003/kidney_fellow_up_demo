import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CalendarCheck, ChevronRight, Clock, Link2, List, Plus, Users, type LucideIcon } from 'lucide-react';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, TONES } from '@/components/ui/Badge';
import { fadeUp, stagger } from '@/components/ui/motion';
import { Pipeline } from '@/components/pipeline/Pipeline';
import { useAsync } from '@/hooks/useAsync';
import { donorApi } from '@/services/api/donorApi';
import { thaiDate } from '@/lib/format';

interface Stat {
  icon: LucideIcon;
  fg: string;
  bg: string;
  value: number;
  label: string;
  sub: string;
}

export default function DonorDashboard() {
  useCrumbs(['ผู้บริจาคไต (Donor)', 'Dashboard']);
  const summary = useAsync(() => donorApi.dashboard(), []);
  const rows = useAsync(() => donorApi.list(), []);
  const s = summary.data;
  const living = (rows.data ?? []).filter((d) => d.caseType === 'living');
  const redcross = (rows.data ?? []).filter((d) => d.caseType === 'redcross');

  const stats: Stat[] = s
    ? [
        { icon: Users, fg: '#2563eb', bg: '#dbeafe', value: s.total, label: 'ผู้บริจาคลงทะเบียนทั้งหมด', sub: `มีชีวิต (มีคู่แล้ว) ${s.living} · สภากาชาด ${s.redcross}` },
        { icon: Link2, fg: '#0f766e', bg: '#ccfbf1', value: s.living, label: 'จับคู่ผู้รับแล้ว', sub: 'ผู้บริจาคมีชีวิต ลงทะเบียนพร้อมผู้รับ' },
        { icon: Building2, fg: '#6d28d9', bg: '#ede9fe', value: s.redcross, label: 'ไตจากสภากาชาด', sub: 'บันทึกหลังผู้รับ (กรณีไม่มีผู้บริจาค) ผ่าตัดเสร็จ' },
        { icon: Clock, fg: '#a16207', bg: '#fef9c3', value: s.mrb, label: 'รอ MRB', sub: 'ผ่านการตรวจแล้ว อยู่ระหว่างรอ MRB' },
        { icon: CalendarCheck, fg: '#0f172a', bg: '#e2e8f0', value: s.waitingSurgery, label: 'รอผ่าตัด', sub: 'มีกำหนดวันผ่าตัดแล้ว' },
      ]
    : [];

  return (
    <>
      <PageHeader
        title="ภาพรวมผู้บริจาคไต (Donor)"
        subtitle={`อัปเดตล่าสุด ${thaiDate(new Date().toISOString())} — สถานะเปลี่ยนอัตโนมัติเมื่อขั้นตอนเสร็จ`}
        actions={
          <>
            <Button variant="secondary" icon={List} to="/clinical/donors/list">
              ดูรายชื่อทั้งหมด
            </Button>
            <Button icon={Plus} to="/clinical/donors/register">
              ลงทะเบียนผู้บริจาค
            </Button>
          </>
        }
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summary.loading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[170px] rounded-2xl" />)
          : stats.map((st) => (
              <motion.div key={st.label} variants={fadeUp} whileHover={{ y: -3, boxShadow: '0 12px 28px -6px rgba(15,23,42,.12)' }} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
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

      {rows.loading ? (
        <Skeleton className="h-[520px] rounded-2xl" />
      ) : (
        <Pipeline
          basePath="/clinical/donors"
          subtitle="เฉพาะผู้บริจาคมีชีวิต (มีคู่แล้ว) · แสดงผู้รับที่จับคู่ในแต่ละการ์ด"
          showCaseFilter={false}
          showCaseBadge={false}
          rows={living.map((d) => ({ ...d, linkLine: `ผู้รับ: ${d.recipient.name} · ${d.relation}` }))}
        />
      )}

      <Card className="flex flex-col gap-4 p-6">
        <CardHeader
          title="ไตจากสภากาชาดล่าสุด"
          subtitle="ผู้บริจาคสมองตาย — บันทึกในขั้นตอน “ผ่าตัด” ของผู้รับหลังผ่าตัดเสร็จ · ไม่ผ่าน Pipeline · field รอกำหนด"
          icon={Building2}
          iconTone={{ fg: '#6d28d9', bg: '#ede9fe' }}
          right={
            <Link to="/clinical/donors/list?caseType=redcross" className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
              ดูทั้งหมด {redcross.length} ราย <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                {['รหัสผู้บริจาค (สภากาชาด)', 'กรุ๊ปเลือด', 'อายุ', 'โรงพยาบาลต้นทาง', 'ผู้รับที่ได้รับการจัดสรร', 'วันที่ผ่าตัดผู้รับ'].map((h) => (
                  <th key={h} className="px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {redcross.map((d) => (
                <tr key={d.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">
                    <Link to={`/clinical/donors/${d.id}`} className="text-primary hover:underline">
                      {d.redCrossCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {d.bloodGroup}
                    {d.rh}
                  </td>
                  <td className="px-4 py-3">{d.age} ปี</td>
                  <td className="px-4 py-3">{d.sourceHospital}</td>
                  <td className="px-4 py-3">
                    {d.recipient.id ? (
                      <Link to={`/clinical/recipients/${d.recipient.id}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                        <Link2 className="h-3.5 w-3.5" /> {d.recipient.name}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                        <Link2 className="h-3.5 w-3.5" /> {d.recipient.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{thaiDate(d.recipientSurgeryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Badge label="คอลัมน์เป็นตัวอย่าง — field จริงรอถามหน้างาน" tone={TONES.amber} className="w-fit" />
      </Card>
    </>
  );
}
