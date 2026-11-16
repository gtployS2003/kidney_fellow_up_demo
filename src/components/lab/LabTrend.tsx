import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Clock, Download, FlaskConical, Layers, X } from 'lucide-react';
import type { LabHistoryDto, LabSeriesDto, PersonKind } from '@/types';
import { DataTag, Select } from '@/components/ui/Form';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sparkline, TrendChart, type TrendPoint } from '@/components/charts/TrendChart';
import { downloadCsv } from '@/components/forms/exporters';
import { useAsync } from '@/hooks/useAsync';
import { labApi } from '@/services/api/appointmentApi';
import { cn, thaiDate } from '@/lib/format';
import { GROUP_TH, PERIODS, dayNum, flagOf, fmtVal, lastTwo, monthTicks, periodIndexes, shortDate, type Period } from '@/lib/labTrend';

const BAND_NORMAL = '#dcfce7';
const BAND_TARGET = '#dbeafe';
const SURGERY = '#7c3aed';
/** ผู้บริจาค: ค่าเหล่านี้เปลี่ยนเล็กน้อยหลังบริจาคเป็นเรื่องปกติ → แสดงสีเขียวอมฟ้า “คาดไว้หลังบริจาค” แทนสีส้ม */
const DONOR_EXPECTED = ['cr', 'bun', 'egfr'];
const expectedOf = (donor: boolean, s: LabSeriesDto, v: number | null) => donor && DONOR_EXPECTED.includes(s.key) && !!flagOf(s, v);

/** แท็บ “ผลตรวจ Lab” โหมดแนวโน้ม — ภาพรวมทุกรายการ + รายละเอียดรายการ (ซ้อนเทียบได้ 2 ค่า) */
export function LabTrend({ kind, id, toggle, onOpenDrug }: { kind: PersonKind; id: string; toggle: ReactNode; onOpenDrug?: () => void }) {
  const { data } = useAsync(() => labApi.history(kind, id), [kind, id]);
  const [period, setPeriod] = useState<Period>('6m');
  const [group, setGroup] = useState<string>('all');
  const [detail, setDetail] = useState<string | null>(null);

  if (!data) return <Skeleton className="h-[640px] rounded-2xl" />;
  if (!data.dates.length) return <EmptyState icon={FlaskConical} title="ยังไม่มีผลแล็บย้อนหลัง" description="เมื่อมีผลจาก iMed จะแสดงกราฟแนวโน้มที่นี่" />;

  const periods = PERIODS.filter((p) => p.value !== 'post' || data.surgeryDate);
  const idx = periodIndexes(data, period);
  const open = (s: LabSeriesDto) => (s.key === 'tac' && onOpenDrug ? onOpenDrug() : setDetail(s.key));

  if (detail) {
    const s = data.series.find((x) => x.key === detail);
    if (s) return <LabTrendDetail donor={kind === 'donor'} h={data} s={s} period={period} setPeriod={setPeriod} periods={periods} onBack={() => setDetail(null)} onPick={(k) => setDetail(k)} toggle={toggle} />;
  }

  const groups = [...new Set(data.series.map((s) => s.group))];
  const shown = data.series.filter((s) => group === 'all' || s.group === group);
  const x0 = idx.length ? dayNum(data.dates[idx[0]]) : 0;
  const x1 = idx.length ? dayNum(data.dates[idx[idx.length - 1]]) : 1;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <FlaskConical className="h-[18px] w-[18px] text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold">ผลตรวจ Lab · แนวโน้ม</p>
          <p className="text-[12.5px] text-slate-500">
            {idx.length ? `${thaiDate(data.dates[idx[0]])} – ${thaiDate(data.dates[idx[idx.length - 1]])} · ${idx.length} ครั้ง` : 'ไม่มีผลในช่วงนี้'}
            {data.surgeryDate && ` · ผ่าตัด ${thaiDate(data.surgeryDate)}`}
          </p>
        </div>
        <DataTag kind="his" />
        {toggle}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[['all', `ทั้งหมด`, data.series.length] as const, ...groups.map((g) => [g, GROUP_TH[g] ?? g, data.series.filter((s) => s.group === g).length] as const)].map(([k, l, n]) => (
          <button key={k} type="button" onClick={() => setGroup(k)} className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition', group === k ? 'border-blue-300 bg-blue-50 font-semibold text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
            {l} <span className={cn('text-[11px]', group === k ? 'text-blue-600' : 'text-slate-400')}>{n}</span>
          </button>
        ))}
        <span className="flex-1" />
        <Segmented size="sm" value={period} onChange={setPeriod} options={periods.map((p) => ({ value: p.value, label: p.label }))} />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[10px] bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
        <Legend swatch={<span className="h-2.5 w-4 rounded-sm" style={{ background: BAND_NORMAL }} />}>ช่วงค่าปกติ</Legend>
        <Legend swatch={<span className="h-2.5 w-4 rounded-sm" style={{ background: BAND_TARGET }} />}>ช่วงเป้าหมายยา</Legend>
        <Legend swatch={<span className="h-2.5 w-2.5 rounded-full bg-orange-600" />}>ค่านอกช่วง (H/L)</Legend>
        {data.surgeryDate && <Legend swatch={<span className="h-3 border-l-[1.5px] border-dashed" style={{ borderColor: SURGERY }} />}>วันผ่าตัด {shortDate(data.surgeryDate)}</Legend>}
        <span className="flex-1" />
        {data.pending.length > 0 && (
          <span className="flex items-center gap-1.5 font-medium text-amber-700">
            <Clock className="h-3.5 w-3.5" /> ผลที่ยังรอ: {data.pending.map((p) => p.name).join(' · ')} (ส่ง {shortDate(data.pending[0].sentAt)})
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((s, k) => (
          <motion.button
            key={s.key}
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: k * 0.03 } }}
            onClick={() => open(s)}
            className="text-left"
          >
            <TrendCard donor={kind === 'donor'} h={data} s={s} idx={idx} x0={x0} x1={x1} drugLink={s.key === 'tac' && !!onOpenDrug} />
          </motion.button>
        ))}
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <AlertTriangle className="h-3.5 w-3.5 text-orange-600" /> คลิกการ์ดเพื่อดูรายละเอียดและซ้อนเทียบ · ช่วงเป้ายาตั้งค่าหลังบ้าน
      </p>
    </div>
  );
}

function Legend({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      {children}
    </span>
  );
}

function StatusChip({ s, v, expected }: { s: LabSeriesDto; v: number | null; expected?: boolean }) {
  const f = flagOf(s, v);
  if (expected) return <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-700">{f} · คาดไว้หลังบริจาค</span>;
  if (v === null) return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">ไม่มีผล</span>;
  if (!f) return <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">{s.target ? 'ในเป้า' : 'ปกติ'}</span>;
  return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">{s.ordinal ? 'พบ' : f === 'L' ? 'L · ต่ำ' : 'H · สูง'}</span>;
}

function pointsOf(h: LabHistoryDto, s: LabSeriesDto, idx: number[], donor = false): TrendPoint[] {
  return idx.map((i) => ({ x: dayNum(h.dates[i]), y: s.values[i], flag: !!flagOf(s, s.values[i]) && !expectedOf(donor, s, s.values[i]) }));
}

function deltaText(s: LabSeriesDto, last?: { v: number; i: number }, prev?: { v: number; i: number }, dates?: string[]) {
  if (!last || !prev) return 'ครั้งแรกในช่วงนี้';
  const when = dates ? ` จากครั้งก่อน (${shortDate(dates[prev.i])})` : '';
  if (s.ordinal) return last.v === prev.v ? `คงที่${when}` : `เปลี่ยนจาก ${s.ordinal[prev.v]}`;
  const d = +(last.v - prev.v).toFixed(s.decimals);
  if (d === 0) return `= คงที่${when}`;
  return `${d > 0 ? '▲ +' : '▼ '}${Math.abs(d).toFixed(s.decimals)}${when}`;
}

function TrendCard({ h, s, idx, x0, x1, drugLink, donor }: { h: LabHistoryDto; s: LabSeriesDto; idx: number[]; x0: number; x1: number; drugLink: boolean; donor: boolean }) {
  const { last, prev } = lastTwo(s, idx);
  const exp = expectedOf(donor, s, last?.v ?? null);
  const f = exp ? undefined : flagOf(s, last?.v ?? null);
  const pts = pointsOf(h, s, idx, donor);
  const has = pts.some((p) => p.y !== null);
  return (
    <div className={cn('flex h-full flex-col gap-1.5 rounded-xl border p-3.5 transition hover:shadow-md', exp ? 'border-teal-200 bg-teal-50/40' : f ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-white hover:border-blue-200')}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold">{s.name}</p>
          <p className="text-[11px] text-slate-500">
            {GROUP_TH[s.group] ?? s.group} · {s.target ? '' : 'ปกติ '}
            {s.ref}
          </p>
        </div>
        <StatusChip s={s} v={last?.v ?? null} expected={exp} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('text-[22px] font-bold leading-7', exp ? 'text-teal-700' : f ? 'text-orange-700' : 'text-slate-900')}>{fmtVal(s, last?.v ?? null)}</span>
        {s.unit && <span className="text-[11.5px] text-slate-400">{s.unit}</span>}
        <span className="ml-1.5 text-[11.5px] font-medium text-slate-500">{deltaText(s, last, prev, h.dates)}</span>
      </div>
      {has ? (
        <TrendChart
          height={132}
          series={{ points: pts, color: '#2563eb', step: !!s.ordinal }}
          xDomain={[x0 - 2, x1 + 2]}
          yDomain={s.ordinal ? [-0.5, s.ordinal.length - 0.5] : undefined}
          bands={[s.ordinal ? { lo: -0.4, hi: 0.4, color: BAND_NORMAL } : { lo: s.lo, hi: s.hi, color: s.target ? BAND_TARGET : BAND_NORMAL, opacity: 0.85 }]}
          markers={h.surgeryDate && dayNum(h.surgeryDate) >= x0 ? [{ x: dayNum(h.surgeryDate), color: SURGERY }] : []}
          xTicks={monthTicks(x0, x1)}
        />
      ) : (
        <p className="grid h-[132px] place-items-center text-xs text-slate-400">ไม่มีผลในช่วงนี้</p>
      )}
      {drugLink && <p className="text-[11.5px] font-semibold text-primary">ดูเทียบขนาดยาในแท็บ “ระดับยากดภูมิ” →</p>}
    </div>
  );
}

function LabTrendDetail({ donor, h, s, period, setPeriod, periods, onBack, onPick, toggle }: { donor: boolean; h: LabHistoryDto; s: LabSeriesDto; period: Period; setPeriod: (p: Period) => void; periods: typeof PERIODS; onBack: () => void; onPick: (k: string) => void; toggle: ReactNode }) {
  const [cmpKey, setCmpKey] = useState<string>(s.key === 'cr' ? (h.series.some((x) => x.key === 'tac') ? 'tac' : donor ? 'egfr' : '') : '');
  const [events, setEvents] = useState(true);
  const idx = periodIndexes(h, period);
  const cmp = h.series.find((x) => x.key === cmpKey && x.key !== s.key && !x.ordinal);
  const { last, prev } = lastTwo(s, idx);
  const vals = idx.map((i) => s.values[i]).filter((v): v is number => v !== null);
  const x0 = idx.length ? dayNum(h.dates[idx[0]]) : 0;
  const x1 = idx.length ? dayNum(h.dates[idx[idx.length - 1]]) : 1;
  const pts = pointsOf(h, s, idx, donor);
  const exp = expectedOf(donor, s, last?.v ?? null);
  const minI = vals.length ? idx.find((i) => s.values[i] === Math.min(...vals)) : undefined;
  const maxI = vals.length ? idx.find((i) => s.values[i] === Math.max(...vals)) : undefined;
  const first = vals[0];
  const change = first && last && !s.ordinal ? Math.round(((last.v - first) / first) * 100) : null;
  const pod = (d: string) => (h.surgeryDate ? dayNum(d) - dayNum(h.surgeryDate) : null);
  const cmpDomain = useMemo<[number, number]>(() => {
    if (!cmp) return [0, 1];
    const v = idx.map((i) => cmp.values[i]).filter((x): x is number => x !== null);
    const mn = Math.min(...v, cmp.lo);
    const mx = Math.max(...v, cmp.hi ?? cmp.lo);
    const pad = (mx - mn) * 0.15 || 1;
    return [Math.max(0, mn - pad), mx + pad];
  }, [cmp, idx]);
  const ticks = (d: [number, number]) => [0, 1, 2, 3].map((k) => +(d[0] + ((d[1] - d[0]) * k) / 3).toFixed(1));
  const yd: [number, number] = s.ordinal ? [-0.5, s.ordinal.length - 0.5] : autoTicksDomain(vals, s);
  const fl = flagOf(s, last?.v ?? null);

  const exportCsv = () =>
    downloadCsv(
      `lab-${s.key}`,
      ['วันที่', 'POD', `${s.name} (${s.unit})`, ...(cmp ? [`${cmp.name} (${cmp.unit})`] : [])],
      [...idx].reverse().map((i) => [h.dates[i], pod(h.dates[i]) ?? '', fmtVal(s, s.values[i]), ...(cmp ? [fmtVal(cmp, cmp.values[i])] : [])]),
    );

  return (
    <div className="flex flex-col items-start gap-5 xl:flex-row">
      <div className="flex w-full min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 self-start text-[12.5px] font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> กลับภาพรวมแนวโน้ม ({h.series.length} รายการ)
        </button>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xl font-bold">
              {s.name} <StatusChip s={s} v={last?.v ?? null} expected={exp} />
            </p>
            <p className="text-[12.5px] text-slate-500">
              {GROUP_TH[s.group] ?? s.group} · {s.target ? '' : 'ปกติ '}
              {s.ref} {s.unit} · {vals.length} ครั้ง
            </p>
          </div>
          <DataTag kind="his" />
          {toggle}
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-slate-50 px-3 py-2.5">
          <Layers className="h-4 w-4 text-slate-500" />
          <span className="text-[12.5px] font-medium text-slate-600">ซ้อนเทียบกับ</span>
          {cmp ? (
            <span className="flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-50 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-teal-700">
              ◆ {cmp.name}
              <button type="button" aria-label="เลิกซ้อนเทียบ" onClick={() => setCmpKey('')} className="rounded-full p-0.5 hover:bg-teal-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            <Select className="!h-8 !w-[200px] !text-[12.5px]" value="" onChange={(e) => setCmpKey(e.target.value)}>
              <option value="">+ เลือกรายการ</option>
              {h.series
                .filter((x) => x.key !== s.key && !x.ordinal)
                .map((x) => (
                  <option key={x.key} value={x.key}>
                    {x.name}
                  </option>
                ))}
            </Select>
          )}
          <span className="flex-1" />
          {h.surgeryDate && (
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
              <input type="checkbox" checked={events} onChange={(e) => setEvents(e.target.checked)} className="accent-primary" /> แสดงวันผ่าตัด
            </label>
          )}
          <Segmented size="sm" value={period} onChange={setPeriod} options={periods.map((p) => ({ value: p.value, label: p.short }))} />
        </div>

        {pts.some((p) => p.y !== null) ? (
          <TrendChart
            height={300}
            series={{ points: pts, color: '#2563eb', step: !!s.ordinal, width: 2.6 }}
            secondary={
              cmp
                ? { points: idx.map((i) => ({ x: dayNum(h.dates[i]), y: cmp.values[i], flag: !!flagOf(cmp, cmp.values[i]) })), color: '#0d9488', dashed: true, shape: 'diamond', domain: cmpDomain, ticks: ticks(cmpDomain), unit: cmp.unit }
                : undefined
            }
            xDomain={[x0 - 2, x1 + 2]}
            yDomain={yd}
            ordinal={s.ordinal}
            yTicks={s.ordinal ? undefined : ticks(yd)}
            yUnit={s.unit}
            bands={[s.ordinal ? { lo: -0.4, hi: 0.4, color: BAND_NORMAL } : { lo: s.lo, hi: s.hi, color: s.target ? BAND_TARGET : BAND_NORMAL, opacity: 0.85 }]}
            markers={events && h.surgeryDate && dayNum(h.surgeryDate) >= x0 ? [{ x: dayNum(h.surgeryDate), color: SURGERY, label: `ผ่าตัด ${shortDate(h.surgeryDate)}` }] : []}
            xTicks={monthTicks(x0, x1)}
            pad={{ t: 26 }}
            tooltip={(k) => {
              const i = idx[k];
              const p = pod(h.dates[i]);
              return (
                <>
                  <p className="font-semibold text-slate-300">
                    {thaiDate(h.dates[i])}
                    {p !== null && p >= 0 ? ` · POD ${p}` : ''}
                  </p>
                  <p className="text-blue-300">
                    ● {s.name} {fmtVal(s, s.values[i])} {s.unit}
                  </p>
                  {cmp && (
                    <p className="text-teal-300">
                      ◆ {cmp.name} {fmtVal(cmp, cmp.values[i])} {cmp.unit}
                    </p>
                  )}
                </>
              );
            }}
          />
        ) : (
          <p className="grid h-[200px] place-items-center text-sm text-slate-400">ไม่มีผลในช่วงนี้</p>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat k="ล่าสุด" v={fmtVal(s, last?.v ?? null)} sub={last ? `${shortDate(h.dates[last.i])} · ${deltaText(s, last, prev)}` : '—'} tone={exp ? 'text-teal-700' : fl ? 'text-orange-700' : 'text-slate-900'} />
          <Stat k="ต่ำสุดในช่วง" v={minI !== undefined ? fmtVal(s, s.values[minI]) : '—'} sub={minI !== undefined ? shortDate(h.dates[minI]) : ''} tone="text-green-700" />
          <Stat k="สูงสุดในช่วง" v={maxI !== undefined ? fmtVal(s, s.values[maxI]) : '—'} sub={maxI !== undefined ? shortDate(h.dates[maxI]) : ''} tone="text-orange-700" />
          <Stat k="เปลี่ยนจากครั้งแรก" v={change === null ? '—' : `${change > 0 ? '+' : change < 0 ? '−' : ''}${Math.abs(change)}%`} sub={first !== undefined && last ? `${fmtVal(s, first)} → ${fmtVal(s, last.v)}` : ''} tone="text-primary" />
        </div>

        <div className="flex items-center gap-2">
          <p className="flex-1 text-sm font-bold">ค่าทุกครั้ง</p>
          <button type="button" onClick={exportCsv} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto rounded-[10px] border border-slate-200">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-3 py-2">วันที่</th>
                {h.surgeryDate && <th className="px-3 py-2">POD</th>}
                <th className="px-3 py-2">{s.name}</th>
                {cmp && <th className="px-3 py-2">{cmp.name}</th>}
              </tr>
            </thead>
            <tbody>
              {[...idx].reverse().map((i) => {
                const f1 = flagOf(s, s.values[i]);
                const f2 = cmp ? flagOf(cmp, cmp.values[i]) : undefined;
                const p = pod(h.dates[i]);
                return (
                  <tr key={i} className={cn('border-t border-slate-100', (f1 || f2) && 'bg-orange-50/50')}>
                    <td className="px-3 py-2">{thaiDate(h.dates[i])}</td>
                    {h.surgeryDate && <td className="px-3 py-2 text-slate-500">{p === null ? '' : p < 0 ? 'ก่อนผ่าตัด' : `POD ${p}`}</td>}
                    <td className="px-3 py-2">
                      <Val s={s} v={s.values[i]} f={f1} />
                    </td>
                    {cmp && (
                      <td className="px-3 py-2">
                        <Val s={cmp} v={cmp.values[i]} f={f2} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 xl:w-[320px]">
        <p className="px-1 pb-2 text-sm font-bold">รายการทั้งหมด ({h.series.length})</p>
        {[...new Set(h.series.map((x) => x.group))].map((g) => (
          <div key={g} className="flex flex-col gap-0.5">
            <p className="px-1 pt-2 text-[11px] font-semibold text-slate-400">{GROUP_TH[g] ?? g}</p>
            {h.series
              .filter((x) => x.group === g)
              .map((x) => {
                const { last: l } = lastTwo(x, idx);
                const f = flagOf(x, l?.v ?? null);
                const vs = idx.map((i) => x.values[i]).filter((v): v is number => v !== null);
                const sel = x.key === s.key;
                return (
                  <button key={x.key} type="button" onClick={() => onPick(x.key)} className={cn('flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition', sel ? 'bg-blue-50 ring-1 ring-blue-300' : x.key === cmp?.key ? 'bg-teal-50' : 'hover:bg-slate-50')}>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-[13px]', sel ? 'font-semibold text-blue-700' : 'font-medium')}>{x.name}</span>
                      {x.key === cmp?.key && <span className="text-[10.5px] font-semibold text-teal-700">◆ ซ้อนเทียบอยู่</span>}
                    </span>
                    <Sparkline values={vs} color={f ? '#ea580c' : sel ? '#2563eb' : '#94a3b8'} />
                    <span className={cn('w-12 text-right text-[13px] font-bold', f ? 'text-orange-700' : 'text-slate-900')}>{fmtVal(x, l?.v ?? null)}</span>
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

function autoTicksDomain(vals: number[], s: LabSeriesDto): [number, number] {
  const mn = Math.min(...vals, s.lo);
  const mx = Math.max(...vals, s.hi ?? s.lo * 1.3);
  const pad = (mx - mn) * 0.12 || 1;
  return [Math.max(0, mn - pad), mx + pad];
}

function Stat({ k, v, sub, tone }: { k: string; v: string; sub: string; tone: string }) {
  return (
    <div className="rounded-[10px] border border-slate-200 px-3 py-2.5">
      <p className="text-[11.5px] font-medium text-slate-500">{k}</p>
      <p className={cn('text-lg font-bold', tone)}>{v}</p>
      <p className="truncate text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

function Val({ s, v, f }: { s: LabSeriesDto; v: number | null; f?: 'H' | 'L' }) {
  return (
    <span className="flex items-center gap-1.5">
      <b className={f ? 'text-orange-700' : 'text-slate-900'}>{fmtVal(s, v)}</b>
      {f && <span className="rounded-full bg-orange-100 px-1.5 text-[10.5px] font-semibold text-orange-700">{f}</span>}
    </span>
  );
}
