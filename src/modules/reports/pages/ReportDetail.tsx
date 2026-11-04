import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Download, FileText, Printer } from 'lucide-react';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Bars, HBars } from '@/components/charts/Bars';
import { PrintArea } from '@/components/forms/PrintArea';
import { exportWord, printForm } from '@/components/forms/exporters';
import { A4Page, tableStyle, td, th } from '@/components/paper/Paper';
import { useAsync } from '@/hooks/useAsync';
import { reportApi, type ReportKey } from '@/services/api/reportApi';
import { STATUS_META } from '@/lib/status';
import { thaiDate } from '@/lib/format';
import { RESULT_META } from '@/modules/matching/components/shared';
import { REPORTS } from '../defs';
import { PendingTag } from './ReportsHub';

export default function ReportDetail() {
  const { key = 'status' } = useParams();
  const def = REPORTS.find((r) => r.key === key) ?? REPORTS[0];
  useCrumbs(['รายงาน', def.title]);
  const [months, setMonths] = useState(10);
  const [menu, setMenu] = useState(false);

  const header = (
    <PageHeader
      leading={<Button variant="secondary" icon={ArrowLeft} to="/clinical/reports" className="!w-10 !px-0" />}
      title={
        <span className="flex flex-wrap items-center gap-2.5">
          {REPORTS.indexOf(def) + 1}. {def.title} <PendingTag />
        </span>
      }
      subtitle={def.sample ? 'ตัวอย่างรูปแบบรายงาน — เนื้อหาจริงรอยืนยันกับหน้างาน' : def.desc}
      actions={
        def.sample && (
          <div className="relative">
            <Button variant="secondary" icon={Download} iconRight={ChevronDown} onClick={() => setMenu(!menu)}>
              Export
            </Button>
            {menu && (
              <div className="absolute right-0 z-30 mt-2 w-[180px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop">
                {[
                  ['PDF', FileText, printForm],
                  ['Word (.doc)', FileText, () => exportWord(`KT-report-${def.key}`)],
                  ['พิมพ์', Printer, printForm],
                ].map(([t, I, fn]) => {
                  const Icon = I as typeof FileText;
                  return (
                    <button key={t as string} type="button" onClick={() => { setMenu(false); setTimeout(fn as () => void, 50); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold hover:bg-slate-50">
                      <Icon className="h-4 w-4 text-slate-500" /> {t as string}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )
      }
    />
  );

  if (!def.sample) {
    return (
      <>
        {header}
        <EmptyState icon={def.icon} title="ยังไม่มีตัวอย่างรายงานนี้" description="รอยืนยันเนื้อหา ตัวชี้วัด และผู้ใช้รายงานกับหน้างาน แล้วจะใช้รูปแบบเดียวกับรายงานตัวอย่าง (ตัวกรอง · กราฟ · ตาราง · Export)" action={<Button to="/clinical/reports/status" variant="secondary">ดูรายงานตัวอย่าง</Button>} />
      </>
    );
  }

  return (
    <>
      {header}
      {key === 'status' && <StatusReport months={months} setMonths={setMonths} />}
      {key === 'waiting' && <WaitingReport />}
      {key === 'matching' && <MatchingReport />}
    </>
  );
}

function Kpi({ items }: { items: [string, number][] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([k, v], i) => (
        <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} className="rounded-[14px] border border-slate-200 bg-white p-[18px]">
          <p className="text-[12.5px] text-slate-500">{k}</p>
          <p className="text-[28px] font-bold">
            <AnimatedNumber value={v} />
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-[18px]">
      <p className="text-[15px] font-bold">{title}</p>
      {children}
    </div>
  );
}

function StatusReport({ months, setMonths }: { months: number; setMonths: (n: number) => void }) {
  const { data } = useAsync(() => reportApi.status(months), [months]);
  if (!data) return <Skeleton className="h-[500px] rounded-2xl" />;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <Select className="!h-10 !w-auto" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
          {[3, 6, 10, 12].map((m) => (
            <option key={m} value={m}>
              ช่วงเวลา: {m} เดือนล่าสุด
            </option>
          ))}
        </Select>
      </div>
      <Kpi items={[['ผู้รับทั้งหมด', data.totals.recipients], ['ผู้บริจาคมีชีวิตทั้งหมด', data.totals.donors], ['ลงทะเบียนใหม่ (ช่วงที่เลือก)', data.totals.newInRange], ['ผ่าตัดแล้ว', data.totals.transplanted]]} />
      <div className="flex flex-wrap gap-4">
        <Panel title="ผู้รับแยกตามสถานะ (ปัจจุบัน)">
          <Bars data={data.byStatus.map((s) => ({ label: s.label, value: s.recipients, color: STATUS_META[s.status].tone.dot === '#ffffff' ? '#0f172a' : STATUS_META[s.status].tone.dot }))} />
        </Panel>
        <Panel title="ลงทะเบียนใหม่รายเดือน (ผู้รับ)">
          <Bars data={data.monthly.map((m) => ({ label: m.month, value: m.count }))} />
        </Panel>
      </div>
      <Table head={['สถานะ', 'ผู้รับ', 'ผู้บริจาค', 'รวม', 'เวลาเฉลี่ยในสถานะ']} rows={data.byStatus.map((s) => [s.label, s.recipients, s.donors, s.recipients + s.donors, `${s.avgDays} วัน`])} title="สรุปผู้ป่วยตามสถานะ" />
    </>
  );
}

function WaitingReport() {
  const { data } = useAsync(() => reportApi.waiting(), []);
  if (!data) return <Skeleton className="h-[500px] rounded-2xl" />;
  const avg = data.rows.length ? Math.round(data.rows.reduce((t, r) => t + r.days, 0) / data.rows.length) : 0;
  return (
    <>
      <Kpi items={[['รอไต / กำลังจับคู่', data.total], ['ระยะเวลารอเฉลี่ย (วัน)', avg], ['รอนานที่สุด (วัน)', data.rows[0]?.days ?? 0], ['PRA > 30%', data.byPra.slice(2).reduce((t, b) => t + b.count, 0)]]} />
      <div className="flex flex-wrap gap-4">
        <Panel title="แยกตามกรุ๊ปเลือด">
          <Bars data={data.byBlood.map((b) => ({ label: b.group, value: b.count, color: '#7c3aed' }))} />
        </Panel>
        <Panel title="แยกตาม PRA">
          <Bars data={data.byPra.map((b) => ({ label: b.bucket, value: b.count, color: '#c2410c' }))} />
        </Panel>
      </div>
      <Table head={['ผู้ป่วย', 'HN', 'ABO', 'PRA', 'เริ่มรอ', 'รอมา (วัน)', 'สถานะ']} rows={data.rows.map((r) => [r.name, r.hn, r.bloodGroup, r.pra !== undefined ? `${r.pra}%` : '—', thaiDate(r.since), r.days, r.status])} title="Waiting list (สภากาชาด)" />
    </>
  );
}

function MatchingReport() {
  const { data } = useAsync(() => reportApi.matching(), []);
  if (!data) return <Skeleton className="h-[500px] rounded-2xl" />;
  return (
    <>
      <Kpi items={[['จับคู่ทั้งหมด', data.total], ...data.byResult.map((r) => [RESULT_META[r.result].label, r.count] as [string, number])]} />
      <div className="flex flex-wrap gap-4">
        <Panel title="ผลการจับคู่">
          <Bars data={data.byResult.map((r) => ({ label: RESULT_META[r.result].label, value: r.count, color: RESULT_META[r.result].tone.dot }))} />
        </Panel>
        <Panel title="เหตุผลที่ปฏิเสธ (บ่อยที่สุด)">
          <HBars data={data.reasons.map((r) => ({ label: r.reason, value: r.count, color: '#ef4444' }))} />
        </Panel>
      </div>
      <Table head={['เหตุผลที่ปฏิเสธ', 'จำนวน']} rows={data.reasons.map((r) => [r.reason, r.count])} title="ผลการจับคู่ — เหตุผลที่ปฏิเสธ" />
    </>
  );
}

function Table({ head, rows, title }: { head: string[]; rows: (string | number)[][]; title: string }) {
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              {head.map((h) => (
                <th key={h} className="px-4 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-100">
                {r.map((c, j) => (
                  <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'font-semibold' : ''}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PrintArea>
        <A4Page>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          <div>พิมพ์เมื่อ {thaiDate(new Date().toISOString())} · ระบบติดตามผู้ป่วยปลูกถ่ายไต รพ.ม.นเรศวร</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                {head.map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} style={td}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      </PrintArea>
    </>
  );
}
