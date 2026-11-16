import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Download, Pill, Plus, Settings2, X } from 'lucide-react';
import type { DrugLevelDto, PersonKind } from '@/types';
import { Button } from '@/components/ui/Button';
import { DataTag } from '@/components/ui/Form';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendChart, type TrendBand } from '@/components/charts/TrendChart';
import { downloadCsv } from '@/components/forms/exporters';
import { useAsync } from '@/hooks/useAsync';
import { drugApi } from '@/services/api/appointmentApi';
import { cn, thaiDate } from '@/lib/format';
import { dayNum, monthTicks, shortDate } from '@/lib/labTrend';

type Range = '3m' | '6m' | '1y' | 'all';
const TEAL = '#0f766e';
const BLUE = '#2563eb';

/** แท็บ “ระดับยากดภูมิ” (ผู้รับหลังผ่าตัด) — ระดับยาเทียบช่วงเป้าตามระยะ · ขนาดยา · การกินยาจาก LINE */
export function DrugLevelPanel({ id, kind = 'recipient' }: { id: string; kind?: PersonKind }) {
  const { data, loading } = useAsync(() => drugApi.levels(id, kind), [id, kind]);
  const [range, setRange] = useState<Range>('3m');
  if (loading && data === null) return <Skeleton className="h-[640px] rounded-2xl" />;
  if (!data && kind === 'donor')
    return (
      <EmptyState
        icon={Pill}
        title="ผู้บริจาคไม่มียาที่ต้องตรวจระดับยา"
        description="ยากดภูมิใช้เฉพาะผู้รับไต · ถ้าแพทย์สั่งยาที่ต้องตรวจระดับยาให้ผู้บริจาค (เช่น ยาที่มีผลต่อไต) จะแสดงกราฟระดับยาเทียบขนาดยาที่นี่"
      />
    );
  return <DrugView d={data} range={range} setRange={setRange} />;
}

function DrugView({ d, range, setRange }: { d: DrugLevelDto | null | undefined; range: Range; setRange: (r: Range) => void }) {
  if (!d) return <EmptyState icon={Pill} title="ยังไม่มีผลระดับยากดภูมิ" description="ระดับยาจะเริ่มแสดงหลังผ่าตัดปลูกถ่ายไต เมื่อมีผลจาก iMed" />;
  const today = dayNum(new Date().toISOString());
  const s0 = dayNum(d.surgeryDate);
  const from = range === '3m' ? today - 92 : range === '6m' ? today - 184 : range === '1y' ? today - 366 : s0;
  const x0 = Math.max(from, s0);
  const nextChange = d.targets.find((t) => s0 + t.fromDay > today);
  const x1 = Math.max(today + 6, nextChange ? Math.min(s0 + nextChange.fromDay + 10, today + 40) : today + 6);
  const pts = d.points.filter((p) => dayNum(p.date) >= x0);
  const last = d.points[d.points.length - 1];
  const inT = pts.filter((p) => p.trough && p.level >= p.lo && p.level <= p.hi).length;
  const troughs = pts.filter((p) => p.trough);
  const lv = troughs.map((p) => p.level);
  const mean = lv.reduce((a, b) => a + b, 0) / (lv.length || 1);
  const sd = Math.sqrt(lv.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, lv.length - 1));
  const cv = lv.length > 2 ? Math.round((sd / mean) * 100) : null;
  const dose = d.doses[d.doses.length - 1];
  const status = (p: { level: number; lo: number; hi: number }) => (p.level < p.lo ? 'low' : p.level > p.hi ? 'high' : 'in');
  const bands: TrendBand[] = d.targets.map((t) => ({ x0: s0 + t.fromDay, x1: t.toDay === null ? x1 + 30 : s0 + t.toDay, lo: t.lo, hi: t.hi, color: '#ccfbf1' }));
  const missed = d.missed.filter((m) => dayNum(m.date) >= x0);
  const doseX = (dt: string) => dayNum(dt);
  const dosePts = d.doses.flatMap((c, i) => {
    const xs = Math.max(doseX(c.date), x0);
    const next = d.doses[i + 1];
    if (next && doseX(next.date) < x0) return [];
    return [{ x: xs, y: c.mgDay }];
  });
  dosePts.push({ x: x1, y: dose.mgDay });
  const ymax = Math.max(14, ...pts.map((p) => p.level + 1));

  const exportCsv = () =>
    downloadCsv(
      'tacrolimus-levels',
      ['วันที่', 'POD', 'ห่างจากมื้อก่อน (ชม.)', `ระดับยา (${d.unit})`, 'ช่วงเป้า', 'ขนาดยา (mg/วัน)', 'สถานะ', 'หมายเหตุ'],
      [...d.points].reverse().map((p) => [p.date, p.pod, p.hoursSinceDose, p.level, `${p.lo}-${p.hi}`, p.doseMgDay, status(p) === 'in' ? 'ในเป้า' : status(p) === 'low' ? 'ต่ำกว่าเป้า' : 'สูงกว่าเป้า', p.note ?? '']),
    );

  return (
    <div className="flex flex-col items-start gap-5 xl:flex-row">
      <div className="flex w-full min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Pill className="h-[18px] w-[18px] text-teal-700" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">ระดับยากดภูมิ</p>
            <p className="text-[12.5px] text-slate-500">
              ระดับยาในเลือด เทียบกับขนาดยาที่สั่ง · ผ่าตัด {thaiDate(d.surgeryDate)} (POD {today - s0})
            </p>
          </div>
          <DataTag kind="his" />
          <Segmented size="sm" value={range} onChange={setRange} options={[{ value: '3m', label: '3 ด.' }, { value: '6m', label: '6 ด.' }, { value: '1y', label: '1 ปี' }, { value: 'all', label: 'ทั้งหมด' }]} />
        </div>

        <div className="flex flex-wrap gap-2">
          {d.regimen.map((r) => (
            <span key={r.name} className={cn('flex flex-col rounded-[10px] border px-3 py-1.5', r.monitored ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white')}>
              <b className={cn('text-[12.5px]', r.monitored ? 'text-teal-700' : 'text-slate-400')}>{r.monitored ? `${r.name} (trough)` : r.name}</b>
              <span className={cn('text-[10.5px]', r.monitored ? 'text-teal-700' : 'text-slate-400')}>{r.monitored ? `มีผลระดับยา · ${d.points.length} ครั้ง` : 'ไม่ได้ตรวจระดับยา'}</span>
            </span>
          ))}
          <span className="flex flex-col rounded-[10px] border border-dashed border-slate-300 px-3 py-1.5">
            <b className="flex items-center gap-1 text-[12.5px] text-slate-500">
              <Plus className="h-3 w-3" /> Everolimus / Cyclosporine
            </b>
            <span className="text-[10.5px] text-slate-400">แสดงเมื่อมีในใบสั่งยา</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat k={`ผลล่าสุด · ${shortDate(last.date)}`} v={String(last.level)} sub={`${d.unit} · ${status(last) === 'in' ? 'ในเป้า' : status(last) === 'low' ? 'ต่ำกว่าเป้า' : 'สูงกว่าเป้า'} ${last.lo}–${last.hi}`} cls={status(last) === 'in' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'} />
          <Stat k="อยู่ในช่วงเป้า (trough)" v={troughs.length ? `${Math.round((inT / troughs.length) * 100)}%` : '—'} sub={`${inT}/${troughs.length} ครั้งในช่วงที่เลือก`} cls="bg-teal-50 text-teal-700" />
          <Stat k="ความแกว่ง (CV)" v={cv === null ? '—' : `${cv}%`} sub={cv === null ? 'ผลยังไม่พอคำนวณ' : cv > 30 ? 'สูง · ควรติดตามการกินยา' : 'ปานกลาง · เกณฑ์ < 30%'} cls={cv !== null && cv > 30 ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-800'} />
          <Stat k="ขนาดยาปัจจุบัน" v={`${dose.mgDay}`} sub={`mg/วัน · ${dose.perDose} mg เช้า–เย็น`} cls="bg-blue-50 text-blue-700" />
        </div>

        <div className="flex flex-col gap-1">
          <TrendChart
            height={250}
            series={{ points: pts.map((p) => ({ x: dayNum(p.date), y: p.level, flag: status(p) !== 'in', hollow: !p.trough })), color: TEAL, width: 2.4 }}
            xDomain={[x0 - 2, x1]}
            yDomain={[Math.min(4, ...pts.map((p) => p.level - 1)), ymax]}
            yTicks={[4, 6, 8, 10, 12, 14].filter((t) => t <= ymax)}
            yUnit={d.unit}
            bands={bands}
            shades={d.interactions.filter((it) => dayNum(it.to) >= x0).map((it) => ({ x0: Math.max(dayNum(it.from), x0), x1: dayNum(it.to), color: 'rgba(254,243,199,.75)', label: `${it.name} ${shortDate(it.from)}–${shortDate(it.to)}` }))}
            markers={[
              { x: today, color: '#64748b', label: 'วันนี้' },
              ...d.doses.slice(1).filter((c) => doseX(c.date) >= x0).map((c) => ({ x: doseX(c.date), color: BLUE })),
              ...(nextChange ? [{ x: s0 + nextChange.fromDay, color: TEAL, label: `ครบ ${nextChange.label.split(' ')[0]} เดือน → เป้า ${nextChange.lo}–${nextChange.hi}` }] : []),
            ]}
            pad={{ t: 26, l: 40 }}
            tooltip={(k) => {
              const p = pts[k];
              return (
                <>
                  <p className="font-semibold text-slate-300">
                    {thaiDate(p.date)} · POD {p.pod}
                  </p>
                  <p className="text-teal-300">
                    {d.drug} {p.level} {d.unit} (เป้า {p.lo}–{p.hi})
                  </p>
                  <p className="text-slate-300">
                    ห่างจากมื้อก่อน {p.hoursSinceDose} ชม. · ขนาดยา {p.doseMgDay} mg/วัน
                  </p>
                  {p.note && <p className="text-amber-300">{p.note}</p>}
                </>
              );
            }}
          />
          {missed.length > 0 && (
            <div className="relative h-4" style={{ marginLeft: 40, marginRight: 8 }}>
              {missed.map((m, i) => (
                <X key={i} className="absolute h-3.5 w-3.5 -translate-x-1/2 text-rose-600" style={{ left: `${((dayNum(m.date) - (x0 - 2)) / (x1 - (x0 - 2))) * 100}%` }} aria-label={`ลืมยา ${m.date} ${m.slot}`} />
              ))}
            </div>
          )}
          <p className="pl-10 pt-1 text-[11px] font-semibold text-blue-700">ขนาดยา (mg/วัน)</p>
          <TrendChart
            height={96}
            series={{ points: dosePts, color: BLUE, step: true, fill: '#dbeafe', dots: false, width: 2 }}
            xDomain={[x0 - 2, x1]}
            yDomain={[0, 12]}
            yTicks={[0, 4, 8, 12]}
            markers={d.doses.slice(1).filter((c) => doseX(c.date) >= x0).map((c) => ({ x: doseX(c.date), color: BLUE }))}
            xTicks={monthTicks(x0, x1)}
            pad={{ l: 40, t: 6 }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[10px] bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-teal-100" /> ช่วงเป้า (ตามระยะหลังผ่าตัด)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed border-teal-700" /> ไม่ใช่ trough
          </span>
          <span className="flex items-center gap-1.5">
            <X className="h-3.5 w-3.5 text-rose-600" /> ลืมกินยา (จาก LINE)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-sm bg-amber-100" /> ยาที่มีผลต่อระดับยา
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 border-l-[1.5px] border-dashed border-blue-500" /> ปรับขนาดยา
          </span>
        </div>

        <div className="flex items-center gap-2">
          <p className="flex-1 text-sm font-bold">ผลระดับยาทุกครั้ง</p>
          <button type="button" onClick={exportCsv} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto rounded-[10px] border border-slate-200">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                {['วันที่', 'ห่างจากมื้อก่อน', 'ระดับยา', 'ขนาดยา', 'สถานะ', 'หมายเหตุ'].map((h) => (
                  <th key={h} className="px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...d.points].reverse().map((p, i) => {
                const st = status(p);
                return (
                  <motion.tr key={p.date} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }} className={cn('border-t border-slate-100', st !== 'in' && 'bg-orange-50/50')}>
                    <td className="px-3 py-2">
                      {thaiDate(p.date)} <span className="text-[11px] text-slate-400">POD {p.pod}</span>
                    </td>
                    <td className={cn('px-3 py-2', !p.trough && 'font-semibold text-amber-700')}>{p.hoursSinceDose} ชม.</td>
                    <td className={cn('px-3 py-2 font-bold', st !== 'in' ? 'text-orange-700' : 'text-slate-900')}>{p.level}</td>
                    <td className="px-3 py-2">{p.doseMgDay} mg/วัน</td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', st === 'in' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700')}>{st === 'in' ? 'ในเป้า' : st === 'low' ? 'ต่ำกว่าเป้า' : 'สูงกว่าเป้า'}</span>
                    </td>
                    <td className="px-3 py-2 text-[12.5px] text-slate-500">{p.note ?? '—'}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-4 xl:w-[330px]">
        <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold">ยากดภูมิที่ใช้อยู่ (ใบสั่งยา iMed)</p>
          {d.regimen.map((r) => (
            <div key={r.name} className={cn('flex items-center gap-2 rounded-lg px-3 py-2', r.monitored ? 'bg-teal-50' : 'bg-slate-50')}>
              <span className="min-w-0 flex-1">
                <b className={cn('block text-[13px]', r.monitored && 'text-teal-700')}>{r.name}</b>
                <span className="text-[11px] text-slate-500">{r.monitored ? `เริ่ม ${shortDate(r.since ?? '')} · ตรวจระดับยา` : 'ไม่ตรวจระดับยา'}</span>
              </span>
              <span className="text-[12.5px] font-semibold text-slate-700">{r.dose}</span>
            </div>
          ))}
          <Button icon={Settings2} className="w-full">
            ปรับขนาดยา {d.drug}
          </Button>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold">ความสม่ำเสมอในการกินยา</p>
          <p className="flex items-baseline gap-2">
            <b className={cn('text-[22px]', d.adherence30.taken / d.adherence30.total >= 0.95 ? 'text-green-700' : 'text-orange-700')}>{Math.round((d.adherence30.taken / d.adherence30.total) * 100)}%</b>
            <span className="text-xs text-slate-500">
              {d.adherence30.taken}/{d.adherence30.total} มื้อ ใน 30 วัน · จาก LINE
            </span>
          </p>
          {d.missed.slice(-4).reverse().map((m) => (
            <p key={m.date + m.slot} className="flex items-center gap-1.5 text-xs text-rose-700">
              <X className="h-3.5 w-3.5" /> {thaiDate(m.date)} มื้อ{m.slot} — ลืม
            </p>
          ))}
          {d.missed.length === 0 && <p className="text-xs text-slate-400">ไม่มีมื้อที่ลืม</p>}
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold">ช่วงเป้าตามระยะหลังผ่าตัด</p>
          <p className="rounded-lg bg-yellow-50 px-2.5 py-1.5 text-[11.5px] font-medium text-yellow-800">ค่าตัวอย่าง · ตั้งค่าหลังบ้าน (รอยืนยันจากหน่วยไต)</p>
          {d.targets.map((t) => {
            const pod = today - s0;
            const now = pod >= t.fromDay && (t.toDay === null || pod < t.toDay);
            return (
              <div key={t.label} className={cn('flex items-center rounded-lg px-2.5 py-1.5 text-[12.5px]', now && 'bg-teal-50 font-semibold text-teal-700')}>
                <span className="flex-1">
                  {t.label}
                  {now && ' · ตอนนี้'}
                </span>
                <span className="font-semibold">
                  {t.lo} – {t.hi} {d.unit}
                </span>
              </div>
            );
          })}
          {d.nextTest && (
            <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> เจาะระดับยาครั้งถัดไป {thaiDate(d.nextTest)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v, sub, cls }: { k: string; v: string; sub: string; cls: string }) {
  return (
    <div className={cn('rounded-[10px] px-3 py-2.5', cls.split(' ')[0])}>
      <p className="text-[11.5px] font-medium text-slate-500">{k}</p>
      <p className={cn('text-xl font-bold', cls.split(' ')[1])}>{v}</p>
      <p className="truncate text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}
