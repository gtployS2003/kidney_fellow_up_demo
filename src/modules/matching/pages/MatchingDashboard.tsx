import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Building2, Check, ChevronRight, ClipboardCheck, Clock, Dna, History, Link2, Send, X } from 'lucide-react';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { stagger } from '@/components/ui/motion';
import { useAsync } from '@/hooks/useAsync';
import { checklistSummary, matchingApi } from '@/services/api/matchingApi';
import { thaiDate } from '@/lib/format';
import { ResultBadge, StatCard, elapsed, thaiDateTime } from '../components/shared';

export default function MatchingDashboard() {
  useCrumbs(['จับคู่ผู้บริจาค', 'Dashboard']);
  const dash = useAsync(() => matchingApi.dashboard(), []);
  const prog = useAsync(() => matchingApi.inProgress(), []);
  const pairs = useAsync(() => matchingApi.pairs(), []);
  const hist = useAsync(() => matchingApi.history(), []);
  const s = dash.data;

  return (
    <>
      <PageHeader
        title="ภาพรวมการจับคู่ผู้บริจาค"
        subtitle="สภากาชาด + คู่ผู้บริจาคมีชีวิต"
        actions={
          <>
            <Button variant="secondary" icon={Send} to="/clinical/matching/send">
              ส่งรายชื่อให้สภากาชาด
            </Button>
            <Button icon={Dna} to="/clinical/matching/hla">
              ค้นหาด้วย HLA
            </Button>
          </>
        }
      />

      <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {!s
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[170px] rounded-2xl" />)
          : [
              <StatCard key="a" icon={Building2} fg="#6d28d9" bg="#ede9fe" value={s.waitingRedCross} label="รอไตจากสภากาชาด" sub="ผ่าน MRB แล้ว พร้อมรับไต" />,
              <StatCard key="b" icon={Clock} fg="#c2410c" bg="#ffedd5" value={s.inProgress} label="กำลังจับคู่ (สภากาชาด)" sub="รอผลจากสภากาชาด" />,
              <StatCard key="c" icon={Link2} fg="#0f766e" bg="#ccfbf1" value={s.livingPairs} label="คู่ผู้บริจาคมีชีวิต" sub="กำลังตรวจ Pre-KT checklist" />,
              <StatCard key="d" icon={Check} fg="#15803d" bg="#dcfce7" value={s.receivedThisMonth} label="ได้รับไต (30 วัน)" sub="จากสภากาชาด" />,
              <StatCard key="e" icon={X} fg="#b91c1c" bg="#fee2e2" value={s.rejectedThisMonth} label="ไม่ได้รับ / ปฏิเสธ (30 วัน)" sub="ดูเหตุผลในประวัติ" />,
            ]}
      </motion.div>

      <div className="flex items-start gap-5">
        <motion.div variants={stagger(0.08)} initial="hidden" animate="show" className="flex min-w-0 flex-1 flex-col gap-5">
          <Card className="flex flex-col gap-4 p-5">
            <CardHeader
              title="กำลังจับคู่กับสภากาชาด"
              subtitle="สภากาชาดไม่ได้ใช้ระบบ — รอแจ้งผลกลับ แล้วพยาบาลบันทึกผล"
              icon={Clock}
              iconTone={{ fg: '#c2410c', bg: '#ffedd5' }}
              right={<LinkMore to="/clinical/matching/in-progress?tab=redcross">ไปหน้ากำลังจับคู่</LinkMore>}
            />
            {prog.loading ? (
              <Skeleton className="h-24" />
            ) : prog.data!.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">ไม่มีผู้ป่วยที่กำลังจับคู่</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                    <tr>
                      {['ผู้ป่วย', 'HN', 'กรุ๊ปเลือด', 'เริ่มจับคู่', 'ระยะเวลา', 'ผู้ยืนยัน'].map((h) => (
                        <th key={h} className="px-3 py-2.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prog.data!.map((p) => {
                      const e = elapsed(p.startedAt);
                      return (
                        <tr key={p.recipientId} className="border-t border-slate-100">
                          <td className="px-3 py-3 font-semibold text-primary">
                            <Link to={`/clinical/recipients/${p.recipientId}`}>{p.name}</Link>
                          </td>
                          <td className="px-3 py-3">{p.hn}</td>
                          <td className="px-3 py-3">
                            {p.bloodGroup}
                            {p.rh}
                          </td>
                          <td className="px-3 py-3">{thaiDateTime(p.startedAt)}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${e.hot ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{e.text}</span>
                          </td>
                          <td className="px-3 py-3">{p.confirmedBy}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-3 p-5">
            <CardHeader
              title="คู่ผู้บริจาคมีชีวิต — Pre-KT checklist"
              subtitle="ข้อมูลดึงจาก iMed · แพทย์ตัดสินผ่าน/ไม่ผ่านทีละข้อ"
              icon={ClipboardCheck}
              iconTone={{ fg: '#0f766e', bg: '#ccfbf1' }}
              right={<LinkMore to="/clinical/matching/in-progress">ดูทั้งหมด {pairs.data?.length ?? 0} คู่</LinkMore>}
            />
            {(pairs.data ?? []).slice(0, 4).map((p) => {
              const rs = checklistSummary(p.recipientItems);
              const ds = checklistSummary(p.donorItems);
              const fails = rs.fail + ds.fail;
              return (
                <Link key={p.pairId} to={`/clinical/matching/in-progress?pair=${p.pairId}`} className="flex items-center gap-4 rounded-[10px] bg-slate-50 px-3 py-2.5 hover:bg-slate-100">
                  <div className="w-[280px]">
                    <p className="text-[13.5px] font-semibold">{p.recipient.name}</p>
                    <p className="flex items-center gap-1.5 text-xs text-teal-700">
                      <Link2 className="h-3 w-3" /> {p.donor.name} · {p.donor.relation}
                    </p>
                  </div>
                  <Progress label="ผู้รับ" done={rs.pass} total={rs.total} />
                  <Progress label="ผู้บริจาค" done={ds.pass} total={ds.total} />
                  {fails ? <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">ไม่ผ่าน {fails}</span> : <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">ไม่มีข้อไม่ผ่าน</span>}
                </Link>
              );
            })}
          </Card>
        </motion.div>

        <div className="flex w-[380px] shrink-0 flex-col gap-5">
          <Card className="flex flex-col gap-3 p-5">
            <CardHeader title="ส่งรายชื่อให้สภากาชาด" icon={Send} iconTone={{ fg: '#6d28d9', bg: '#ede9fe' }} />
            <Row k="ส่งล่าสุด" v={s?.lastSent ? `${thaiDate(s.lastSent.sentAt)} · ${s.lastSent.sentBy}` : '—'} />
            <Row k="จำนวนในรายชื่อ" v={s?.lastSent ? `${s.lastSent.count} ราย` : '—'} />
            {!!s?.newSinceLastSent && (
              <p className="flex items-center gap-2 rounded-[10px] border border-orange-200 bg-orange-50 px-3 py-2.5 text-[12.5px] font-medium text-orange-800">
                <AlertTriangle className="h-4 w-4" /> มีผู้ป่วยผ่าน MRB ใหม่ {s.newSinceLastSent} ราย ที่ยังไม่อยู่ในรายชื่อที่ส่ง
              </p>
            )}
            <Button icon={Send} to="/clinical/matching/send" className="w-full">
              เตรียมรายชื่อรอบใหม่
            </Button>
          </Card>
          <Card className="flex flex-col gap-1 p-5">
            <CardHeader title="ผลการจับคู่ล่าสุด" icon={History} right={<LinkMore to="/clinical/matching/history">ประวัติ</LinkMore>} />
            {(hist.data ?? []).slice(0, 4).map((h, i) => (
              <div key={h.id} className={`flex flex-col gap-1 py-2.5 ${i ? 'border-t border-slate-100' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-[13.5px] font-semibold">{h.name}</span>
                  <span className="text-xs text-slate-400">{thaiDate(h.startedAt)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ResultBadge result={h.result} />
                  <span className="text-xs text-slate-500">{h.reason}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}

function LinkMore({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-primary hover:underline">
      {children} <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3 text-[13px]">
      <span className="flex-1 text-slate-400">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

function Progress({ label, done, total }: { label: string; done: number; total: number }) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="text-[11.5px] text-slate-400">
        {label} <b className="text-slate-700">ผ่าน {done}/{total}</b>
      </span>
      <span className="h-1.5 overflow-hidden rounded bg-slate-200">
        <motion.span className="block h-full rounded bg-green-600" initial={{ width: 0 }} animate={{ width: `${total ? (done / total) * 100 : 0}%` }} transition={{ duration: 0.6 }} />
      </span>
    </div>
  );
}
