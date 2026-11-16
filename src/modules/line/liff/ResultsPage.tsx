import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Droplet, HeartPulse, Info, Lock, Pill, Scale, Syringe, X } from 'lucide-react';
import type { DrugLevelDto, LabHistoryDto, LabSeriesDto, LineDataDto } from '@/types';
import { useSim } from '../store';
import type { Persona } from '../personas';
import { KidneyBuddy } from '@/components/brand/KidneyBuddy';
import { Sparkline, TrendChart, useElementWidth } from '@/components/charts/TrendChart';
import { Chip, LCard, LTabs, LiffLoading, LiffShell } from './Shell';
import { useAsync } from '@/hooks/useAsync';
import { drugApi, labApi } from '@/services/api/appointmentApi';
import { BP_LIMIT, lineApi } from '@/services/api/lineApi';
import { cn, thaiDate } from '@/lib/format';
import { GROUP_TH, LAB_EXPLAIN, dayNum, flagOf, fmtVal, monthTicks, shortDate } from '@/lib/labTrend';

type Tab = 'lab' | 'drug' | 'mine';
type Tone = 'green' | 'orange' | 'teal' | 'slate';

/** หลังบริจาคไต ค่าเหล่านี้เปลี่ยนเล็กน้อยเป็นเรื่องปกติ */
const DONOR_EXPECTED = ['cr', 'bun', 'egfr'];

/** เมนู “ผลตรวจของฉัน” (เดิม “ค่าไต”) — ผลแล็บ · ระดับยา (ผู้รับหลังผ่าตัด, ไม่แสดงตัวเลข) · ที่ฉันบันทึก */
export function MyResultsPage({ p, tab: initial }: { p: Persona; tab?: string }) {
  const { closeLiff } = useSim();
  const hasDrug = p.kind === 'recipient' && p.postop;
  const [tab, setTab] = useState<Tab>(initial === 'drug' && hasDrug ? 'drug' : initial === 'mine' ? 'mine' : 'lab');
  const [detail, setDetail] = useState<string | null>(null);
  const { data: h } = useAsync(() => labApi.history(p.kind, p.id), [p.id]);
  const lastDate = h?.dates[h.dates.length - 1];

  const sel = detail && h ? h.series.find((s) => s.key === detail) : undefined;
  if (sel && h) return <LabDetail h={h} s={sel} donor={p.kind === 'donor'} onBack={() => setDetail(null)} onClose={closeLiff} />;

  const tabs: [Tab, string][] = [['lab', 'ผลแล็บ'], ...(hasDrug ? ([['drug', 'ระดับยา']] as [Tab, string][]) : []), ['mine', 'ที่ฉันบันทึก']];
  const sub = tab === 'lab' ? (lastDate ? `ผลแล็บล่าสุด ${thaiDate(lastDate)} · จาก iMed` : '…') : tab === 'drug' ? 'ระดับยากดภูมิ · ทีมแพทย์ดูผลให้' : 'สิ่งที่ฉันบันทึกผ่าน LINE';

  return (
    <LiffShell title="ผลตรวจของฉัน" sub={sub} onClose={closeLiff}>
      <div className="flex flex-col gap-3">
        <LTabs items={tabs} value={tab} onChange={setTab} />
        {tab === 'lab' && (h ? <LabTab h={h} donor={p.kind === 'donor'} postop={p.postop} onOpen={(k) => (k === 'tac' && hasDrug ? setTab('drug') : setDetail(k))} /> : <LiffLoading />)}
        {tab === 'drug' && <DrugTab id={p.id} onAdherence={() => setTab('mine')} />}
        {tab === 'mine' && <MineTab p={p} />}
      </div>
    </LiffShell>
  );
}

// ================= ผลแล็บ =================
function statusOf(s: LabSeriesDto, v: number | null, donor: boolean): { tone: Tone; label: string } {
  const f = flagOf(s, v);
  if (v === null) return { tone: 'slate', label: 'ไม่มีผล' };
  if (!f) return { tone: 'green', label: s.key === 'egfr' ? 'ดี' : s.target ? 'ในเป้า' : 'ปกติ' };
  if (donor && DONOR_EXPECTED.includes(s.key)) return { tone: 'teal', label: 'ตามที่คาดไว้' };
  if (s.target) return { tone: 'orange', label: f === 'L' ? 'ต่ำกว่าเป้า' : 'สูงกว่าเป้า' };
  if (s.ordinal) return { tone: 'orange', label: 'พบ' };
  return { tone: 'orange', label: f === 'L' ? 'ต่ำกว่าปกติ' : 'สูงกว่าปกติ' };
}
const lastVal = (s: LabSeriesDto) => {
  for (let i = s.values.length - 1; i >= 0; i--) if (s.values[i] !== null) return s.values[i];
  return null;
};
const TONE_TEXT: Record<Tone, string> = { green: 'text-slate-900', orange: 'text-orange-700', teal: 'text-teal-700', slate: 'text-slate-400' };
const TONE_LINE: Record<Tone, string> = { green: '#2563eb', orange: '#ea580c', teal: '#0d9488', slate: '#94a3b8' };

function ToneChip({ tone, children }: { tone: Tone; children: string }) {
  if (tone === 'teal') return <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">{children}</span>;
  return <Chip tone={tone}>{children}</Chip>;
}

function LabTab({ h, donor, postop, onOpen }: { h: LabHistoryDto; donor: boolean; postop: boolean; onOpen: (k: string) => void }) {
  const st = h.series.map((s) => statusOf(s, lastVal(s), donor));
  const normal = st.filter((x) => x.tone === 'green').length;
  const care = st.filter((x) => x.tone === 'orange').length;
  const expected = st.filter((x) => x.tone === 'teal').length;
  const cr = h.series.find((s) => s.key === 'cr');
  const crFirst = cr?.values.find((v) => v !== null);
  const crLast = cr ? lastVal(cr) : null;
  const msg = donor
    ? '💚 หลังบริจาคไต ค่า Creatinine สูงขึ้นเล็กน้อยเป็นเรื่องปกติ · อยู่ในเกณฑ์ที่ทีมแพทย์คาดไว้'
    : postop && crFirst && crLast && crLast < crFirst
      ? '🎉 ค่าการทำงานของไตดีขึ้นมากตั้งแต่ผ่าตัด · แตะแต่ละค่าเพื่อดูกราฟ'
      : 'แตะแต่ละค่าเพื่อดูกราฟย้อนหลังและคำแนะนำ';
  const groups = [...new Set(h.series.map((s) => s.group))];
  // ระดับยาไว้ต่อจากกลุ่มไต
  const order = ['Renal function', 'Drug level', 'Electrolytes', 'CBC', 'Urine'].filter((g) => groups.includes(g));

  return (
    <>
      <LCard className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <SumBox v={normal} k="ปกติ" cls="bg-green-50 text-green-700" />
          {donor ? <SumBox v={expected} k="ตามที่คาดไว้" cls="bg-teal-50 text-teal-700" /> : <SumBox v={care} k="ต้องดูแล" cls="bg-orange-50 text-orange-700" />}
          <SumBox v={h.pending.length} k="รอผล" cls="bg-yellow-50 text-yellow-700" />
        </div>
        <p className={cn('rounded-xl px-3 py-2 text-[12.5px] font-medium', donor ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800')}>{msg}</p>
      </LCard>
      {order.map((g) => (
        <div key={g} className="flex flex-col gap-2">
          <p className="pl-1 pt-1 text-[13px] font-bold text-slate-700">{GROUP_TH[g] ?? g}</p>
          <LCard className="!px-4 !py-1">
            {h.series
              .filter((s) => s.group === g)
              .map((s, i) => {
                const v = lastVal(s);
                const t = statusOf(s, v, donor);
                const hideNumber = s.key === 'tac';
                const vals = s.values.filter((x): x is number => x !== null).slice(-6);
                return (
                  <motion.button key={s.key} whileTap={{ scale: 0.98 }} type="button" onClick={() => onOpen(s.key)} className={cn('flex w-full items-center gap-2.5 py-3 text-left', i > 0 && 'border-t border-slate-100')}>
                    <span className="min-w-0 flex-1">
                      <b className="block text-[14px]">{s.thai}</b>
                      <span className="text-[11px] text-slate-500">{hideNumber ? `${s.name.split(' ')[0]} · แตะเพื่อดูในแท็บ “ระดับยา”` : `${s.name} · ${s.target ? '' : 'ปกติ '}${s.ref}`}</span>
                    </span>
                    {!hideNumber && <Sparkline values={vals} color={TONE_LINE[t.tone]} width={52} />}
                    <span className="flex flex-col items-end gap-1">
                      {!hideNumber && (
                        <span className="flex items-baseline gap-0.5">
                          <b className={cn('text-[16px]', TONE_TEXT[t.tone])}>{s.ordinal ? (v ? s.ordinal[v] : 'ไม่พบ') : fmtVal(s, v)}</b>
                          {s.unit && <span className="text-[9.5px] text-slate-400">{s.unit}</span>}
                        </span>
                      )}
                      <ToneChip tone={t.tone}>{t.label}</ToneChip>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </motion.button>
                );
              })}
          </LCard>
        </div>
      ))}
      {h.pending.length > 0 && (
        <p className="rounded-2xl bg-yellow-50 px-4 py-2.5 text-[12px] font-medium text-yellow-800">
          ⏳ รอผล: {h.pending.map((x) => x.name).join(' · ')} (ส่งตรวจ {shortDate(h.pending[0].sentAt)}) — แจ้งเตือนทาง LINE เมื่อผลออก
        </p>
      )}
    </>
  );
}

function SumBox({ v, k, cls }: { v: number; k: string; cls: string }) {
  return (
    <span className={cn('flex flex-col rounded-2xl px-3 py-2.5', cls.split(' ')[0])}>
      <b className={cn('text-[22px] leading-7', cls.split(' ')[1])}>{v}</b>
      <span className="text-[11.5px] font-medium text-slate-600">{k}</span>
    </span>
  );
}

// ================= รายละเอียดรายการ =================
function LabDetail({ h, s, donor, onBack, onClose }: { h: LabHistoryDto; s: LabSeriesDto; donor: boolean; onBack: () => void; onClose: () => void }) {
  const [range, setRange] = useState<'3m' | '6m' | '1y'>('6m');
  const [all, setAll] = useState(false);
  const lastD = dayNum(h.dates[h.dates.length - 1]);
  const from = lastD - (range === '3m' ? 92 : range === '6m' ? 184 : 366);
  const idx = h.dates.map((d, i) => [dayNum(d), i] as const).filter(([n]) => n >= from).map(([, i]) => i);
  const v = lastVal(s);
  const t = statusOf(s, v, donor);
  const vals = s.values.filter((x): x is number => x !== null);
  const first = vals[0];
  const improved = !s.ordinal && first !== undefined && v !== null && t.tone === 'green' && Math.abs(v - first) / (first || 1) > 0.3;
  const ex = LAB_EXPLAIN[s.key];
  const advice = flagOf(s, v) === 'L' ? ex?.low : flagOf(s, v) === 'H' ? ex?.high : ex?.high ?? ex?.low;
  const hist = h.dates.map((d, i) => ({ d, v: s.values[i] })).filter((x) => x.v !== null).reverse();
  const x0 = idx.length ? dayNum(h.dates[idx[0]]) : lastD - 1;
  const show = (x: number | null) => (s.ordinal ? (x ? s.ordinal[x] : 'ไม่พบ') : fmtVal(s, x));

  return (
    <LiffShell title={s.thai} sub={`${s.name} · ผลล่าสุด ${thaiDate(h.dates[h.dates.length - 1])}`} onClose={onClose} onBack={onBack}>
      <div className="flex flex-col gap-3">
        <LCard className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex-1">
              <span className="flex items-baseline gap-1">
                <b className={cn('text-[34px] leading-10', t.tone === 'orange' ? 'text-orange-700' : 'text-blue-900')}>{show(v)}</b>
                {s.unit && <span className="text-[12px] text-slate-400">{s.unit}</span>}
              </span>
              <span className="mt-1 flex items-center gap-2">
                <ToneChip tone={t.tone}>{t.label}</ToneChip>
                <span className="text-[11.5px] text-slate-500">ช่วงปกติ {s.ref}</span>
              </span>
            </span>
            {improved && <KidneyBuddy pose="success" size={86} />}
          </div>
          {improved && first !== undefined && v !== null && (
            <p className="rounded-xl bg-green-50 px-3 py-2 text-[12.5px] font-medium text-green-800">
              เก่งมาก! ค่าเปลี่ยนจาก {show(first)} เป็น {show(v)} และอยู่ในเกณฑ์ปกติแล้ว
            </p>
          )}
          {donor && DONOR_EXPECTED.includes(s.key) && flagOf(s, v) && <p className="rounded-xl bg-teal-50 px-3 py-2 text-[12.5px] font-medium text-teal-800">หลังบริจาคไต ค่านี้เปลี่ยนเล็กน้อยเป็นเรื่องปกติ · ทีมแพทย์ติดตามให้ทุกรอบ</p>}
        </LCard>
        <LTabs items={[['3m', '3 เดือน'], ['6m', '6 เดือน'], ['1y', '1 ปี']]} value={range} onChange={setRange} />
        <LCard className="flex flex-col gap-2">
          <p className="flex items-center text-[13.5px] font-bold">
            <span className="flex-1">แนวโน้ม {range === '3m' ? '3 เดือน' : range === '6m' ? '6 เดือน' : '1 ปี'}</span>
            <span className="text-[11.5px] font-medium text-slate-500">{idx.filter((i) => s.values[i] !== null).length} ครั้ง</span>
          </p>
          <TrendChart
            height={200}
            series={{ points: idx.map((i) => ({ x: dayNum(h.dates[i]), y: s.values[i], flag: !!flagOf(s, s.values[i]) && !(donor && DONOR_EXPECTED.includes(s.key)) })), color: '#2563eb', step: !!s.ordinal, width: 2.5 }}
            xDomain={[x0 - 2, lastD + 2]}
            ordinal={s.ordinal ? ['ไม่พบ', ...s.ordinal.slice(1)] : undefined}
            yDomain={s.ordinal ? [-0.5, s.ordinal.length - 0.5] : undefined}
            yTicks={s.ordinal ? undefined : niceTicks(idx.map((i) => s.values[i]), s)}
            bands={[s.ordinal ? { lo: -0.4, hi: 0.4, color: '#dcfce7' } : { lo: s.lo, hi: s.hi, color: '#dcfce7' }]}
            markers={h.surgeryDate && dayNum(h.surgeryDate) >= x0 ? [{ x: dayNum(h.surgeryDate), color: '#7c3aed', label: donor ? 'วันบริจาค' : 'วันผ่าตัด' }] : []}
            xTicks={monthTicks(x0, lastD)}
            lastLabel={s.ordinal ? undefined : fmtVal(s, v)}
            pad={{ t: 28, l: 30 }}
          />
          <div className="flex gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-3.5 rounded-sm bg-green-100" /> ช่วงปกติ
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-orange-600 bg-white" /> นอกช่วงปกติ
            </span>
          </div>
        </LCard>
        {ex && (
          <LCard className="flex flex-col gap-1.5 !bg-blue-50 !shadow-none">
            <b className="flex items-center gap-1.5 text-[13.5px] text-blue-900">
              <Info className="h-4 w-4" /> ค่านี้คืออะไร?
            </b>
            <p className="text-[12.5px] leading-5 text-blue-900">{ex.what}</p>
            {advice && <p className="text-[12.5px] leading-5 text-blue-900">💡 {advice}</p>}
          </LCard>
        )}
        <LCard className="!py-2">
          <p className="py-1.5 text-[13.5px] font-bold">ประวัติผลตรวจ</p>
          {hist.slice(0, all ? hist.length : 6).map((x, i) => {
            const f = flagOf(s, x.v);
            const pre = h.surgeryDate && x.d < h.surgeryDate;
            return (
              <div key={x.d} className="flex items-center gap-2 border-t border-slate-100 py-2 text-[13px]">
                <span className="flex-1 text-slate-600">{thaiDate(x.d)}</span>
                {i === 0 && <span className="text-[11px] text-slate-400">ล่าสุด</span>}
                {pre && <span className="text-[11px] text-slate-400">{donor ? 'ก่อนบริจาค' : 'ก่อนผ่าตัด'}</span>}
                <b className={f && !(donor && DONOR_EXPECTED.includes(s.key)) ? 'text-orange-700' : 'text-slate-900'}>{show(x.v)}</b>
                <ToneChip tone={statusOf(s, x.v, donor).tone}>{f ? (s.ordinal ? 'พบ' : f === 'H' ? 'สูง' : 'ต่ำ') : 'ปกติ'}</ToneChip>
              </div>
            );
          })}
          {hist.length > 6 && (
            <button type="button" onClick={() => setAll(!all)} className="flex items-center gap-1 py-2 text-[13px] font-semibold text-primary">
              {all ? 'ย่อ' : `ดูทั้งหมด ${hist.length} ครั้ง`} <ChevronRight className={cn('h-4 w-4 transition', all && '-rotate-90')} />
            </button>
          )}
        </LCard>
      </div>
    </LiffShell>
  );
}

function niceTicks(values: (number | null)[], s: LabSeriesDto): number[] | undefined {
  const v = values.filter((x): x is number => x !== null);
  if (!v.length) return undefined;
  const mn = Math.min(...v, s.lo);
  const mx = Math.max(...v, s.hi ?? s.lo);
  const span = mx - mn || 1;
  const pad = span * 0.12;
  const step = span / 3;
  return [0, 1, 2, 3].map((k) => +(mn - pad + k * ((span + 2 * pad) / 3)).toFixed(step < 1 ? 1 : 0));
}

// ================= ระดับยา (ไม่แสดงตัวเลขระดับยา) =================
function DrugTab({ id, onAdherence }: { id: string; onAdherence: () => void }) {
  const { data, loading } = useAsync(() => drugApi.levels(id), [id]);
  const { data: settings } = useAsync(() => lineApi.settings('recipient', id), [id]);
  if (loading && !data) return <LiffLoading />;
  if (!data) return <LCard className="text-center text-[13px] text-slate-500">ยังไม่มีผลระดับยา · จะเริ่มตรวจหลังผ่าตัด</LCard>;
  return <DrugBody d={data} times={settings?.medTimes ?? ['08:00', '20:00']} onAdherence={onAdherence} />;
}

const LANES = ['ต่ำกว่าเป้า', 'ในเป้า', 'สูงกว่าเป้า'];
function DrugBody({ d, times, onAdherence }: { d: DrugLevelDto; times: string[]; onAdherence: () => void }) {
  const troughs = d.points.filter((p) => p.trough);
  const last = troughs[troughs.length - 1];
  const lane = (p: { level: number; lo: number; hi: number }) => (p.level < p.lo ? 0 : p.level > p.hi ? 2 : 1);
  const st = lane(last);
  const pos = st === 1 ? 33.4 + ((last.level - last.lo) / (last.hi - last.lo || 1)) * 33.2 : st === 0 ? Math.max(4, 33 - Math.min(1, (last.lo - last.level) / last.lo / 0.3) * 28) : Math.min(96, 67 + Math.min(1, (last.level - last.hi) / last.hi / 0.3) * 28);
  const dose = d.doses[d.doses.length - 1];
  const adjusted = dose.date > last.date;
  const recent = troughs.slice(-9);
  const inCount = recent.filter((p) => lane(p) === 1).length;
  const last7 = d.missed.filter((m) => dayNum(m.date) > dayNum(new Date().toISOString()) - 7);
  const msg = st === 1 ? 'ดีมาก! กินยาตรงเวลาแบบนี้ต่อไป' : adjusted ? 'แพทย์ดูผลแล้ว และปรับขนาดยาให้เรียบร้อย ไม่ต้องกังวล · กินยาตามขนาดใหม่ด้านล่าง' : 'ทีมแพทย์กำลังพิจารณาผล อาจโทรแจ้งเพื่อปรับยา · กินยาตามเดิมไปก่อน';

  return (
    <>
      <LCard className="flex flex-col gap-3">
        <p className="flex items-center text-[13.5px] font-bold">
          <span className="flex-1">ระดับยา {d.drug} ครั้งล่าสุด</span>
          <Chip tone="slate">{shortDate(last.date)}</Chip>
        </p>
        <div className="relative pt-3">
          <div className="flex gap-1">
            <span className="h-3.5 flex-1 rounded-full bg-orange-300" />
            <span className="h-3.5 flex-1 rounded-full bg-teal-300" />
            <span className="h-3.5 flex-1 rounded-full bg-orange-300" />
          </div>
          <motion.span initial={{ left: '50%' }} animate={{ left: `${pos}%` }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" aria-label={`ระดับยา: ${LANES[st]}`}>
            <span className="h-0 w-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-slate-900" />
            <span className={cn('-mt-0.5 h-5 w-5 rounded-full border-[3px] bg-white', st === 1 ? 'border-teal-600' : 'border-orange-600')} />
          </motion.span>
          <div className="mt-2 grid grid-cols-3 text-center text-[11.5px] font-medium">
            {LANES.map((l, i) => (
              <span key={l} className={i === 1 ? 'text-teal-700' : 'text-orange-700'}>
                {l}
              </span>
            ))}
          </div>
        </div>
        <b className={cn('text-[22px]', st === 1 ? 'text-teal-700' : 'text-orange-700')}>{st === 1 ? 'อยู่ในเป้า 👍' : st === 0 ? 'ต่ำกว่าเป้าเล็กน้อย' : 'สูงกว่าเป้าเล็กน้อย'}</b>
        <p className={cn('rounded-xl px-3 py-2 text-[12.5px] font-medium', st === 1 ? 'bg-teal-50 text-teal-800' : 'bg-blue-50 text-blue-800')}>{msg}</p>
      </LCard>

      <LCard className="flex flex-col gap-2">
        <p className="flex items-center text-[13.5px] font-bold">
          <span className="flex-1">ผลระดับยา {recent.length} ครั้งล่าสุด</span>
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">ในเป้า {inCount} ครั้ง</span>
        </p>
        <TrendChart
          height={150}
          series={{ points: recent.map((p, i) => ({ x: i, y: lane(p), flag: lane(p) !== 1 })), color: '#94a3b8', dashed: true, width: 1.5 }}
          xDomain={[-0.4, recent.length - 0.6]}
          yDomain={[-0.5, 2.5]}
          ordinal={LANES}
          bands={[
            { lo: -0.5, hi: 0.5, color: '#fff7ed' },
            { lo: 0.5, hi: 1.5, color: '#f0fdfa' },
            { lo: 1.5, hi: 2.5, color: '#fff7ed' },
          ]}
          xTicks={recent.map((p, i) => ({ x: i, label: shortDate(p.date).replace(/ .*/, '') + '/' + (new Date(p.date).getMonth() + 1) })).filter((_, i) => i % 2 === 0 || i === recent.length - 1)}
          pad={{ l: 66, t: 8 }}
        />
        <p className="text-[11px] text-slate-400">แสดงเฉพาะสถานะ · ค่าตัวเลขทีมแพทย์เป็นผู้ดูและปรับยาให้</p>
      </LCard>

      <LCard className="flex flex-col gap-2">
        <b className="flex items-center gap-1.5 text-[13.5px]">
          <Pill className="h-4 w-4 text-teal-600" /> ขนาดยาตอนนี้
        </b>
        <div className="flex items-center gap-2 rounded-2xl bg-teal-50 px-3 py-3">
          <span className="flex-1">
            <b className="block text-[17px] text-teal-700">
              {d.drug} {dose.perDose} mg
            </b>
            <span className="text-[12px] text-teal-800">
              เช้า {times[0]} และ เย็น {times[1] ?? '20:00'} · เริ่ม {thaiDate(dose.date)}
            </span>
          </span>
          {d.doses.length > 1 && <Chip tone="blue">{dose.mgDay > d.doses[d.doses.length - 2].mgDay ? 'ปรับเพิ่ม' : 'ปรับลด'}</Chip>}
        </div>
        <p className="pt-1 text-[12px] font-semibold text-slate-500">ประวัติการปรับยา</p>
        {[...d.doses].reverse().map((c, i, arr) => {
          const prev = arr[i + 1];
          const txt = !prev ? `เริ่มยา ${c.perDose} mg หลังผ่าตัด` : `${c.mgDay > prev.mgDay ? 'เพิ่ม' : 'ลด'}เป็น ${c.perDose} mg (จาก ${prev.perDose} mg)`;
          return (
            <div key={c.date} className="flex gap-3 border-t border-slate-100 py-1.5 text-[12.5px]">
              <span className="w-14 shrink-0 text-slate-400">{shortDate(c.date)}</span>
              <span className={i === 0 ? 'font-semibold text-blue-700' : 'text-slate-600'}>{txt}</span>
            </div>
          );
        })}
      </LCard>

      <LCard className="flex flex-col gap-2 !bg-amber-50 !shadow-none">
        <b className="flex items-center gap-1.5 text-[13.5px] text-amber-900">
          <Syringe className="h-4 w-4" /> ก่อนเจาะเลือดดูระดับยา
        </b>
        <ul className="list-disc pl-5 text-[12.5px] leading-5 text-amber-900">
          <li>เช้าวันเจาะ งดกินยากดภูมิ จนกว่าจะเจาะเลือดเสร็จ แล้วค่อยกินทันที</li>
          <li>กินยามื้อเย็นก่อนหน้าตรงเวลา</li>
          <li>ห้ามเพิ่ม–ลดยาเอง</li>
        </ul>
        {d.nextTest && <p className="rounded-xl bg-white px-3 py-2 text-[12.5px] font-semibold">นัดเจาะครั้งถัดไป {thaiDate(d.nextTest)} · 07:30</p>}
      </LCard>

      <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={onAdherence} className="text-left">
        <LCard className="flex items-center gap-2">
          <span className="flex-1">
            <b className="block text-[13.5px]">กินยาครบ {Math.max(0, 14 - last7.length)}/14 มื้อ ใน 7 วัน</b>
            <span className="text-[11.5px] text-slate-500">{last7.length ? `ลืม ${last7.length} มื้อ (${last7.map((m) => `${shortDate(m.date)} ${m.slot}`).join(', ')})` : 'ไม่ลืมเลย เยี่ยมมาก!'} · ดูในแท็บ “ที่ฉันบันทึก”</span>
          </span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </LCard>
      </motion.button>
      <p className="rounded-2xl bg-slate-100 px-4 py-2.5 text-[12px] font-medium text-slate-600">ℹ️ ทีมแพทย์ดูค่าตัวเลขและปรับยาให้ · ถ้ามือสั่น ปวดหัวมาก มีไข้ หรือปัสสาวะน้อยลง แจ้งทีมทันที</p>
    </>
  );
}

// ================= ที่ฉันบันทึก =================
function MineTab({ p }: { p: Persona }) {
  const [days, setDays] = useState<'7' | '30' | '90'>('7');
  const n = Number(days);
  const { data } = useAsync(() => lineApi.data(p.kind, p.id, n), [p.id, n]);
  const { data: log } = useAsync(() => drugApi.doseLog(p.kind, p.id, n), [p.id, n]);
  const { data: settings } = useAsync(() => lineApi.settings(p.kind, p.id), [p.id]);
  const recipient = p.kind === 'recipient';
  return (
    <>
      <LTabs items={[['7', '7 วัน'], ['30', '30 วัน'], ['90', '3 เดือน']]} value={days} onChange={setDays} />
      {!data ? (
        <LiffLoading />
      ) : (
        <>
          {recipient && <FluidCard d={data} target={settings?.fluidTargetMl ?? 2500} days={n} />}
          <WeightCard d={data} />
          <BpCard d={data} />
          {recipient && log && <MedCard log={log} days={n} />}
          {!recipient && <p className="rounded-2xl bg-teal-50 px-4 py-2.5 text-[12px] font-medium text-teal-800">ผู้บริจาค: บันทึกความดันและน้ำหนักสัปดาห์ละครั้งก็เพียงพอ</p>}
          <p className="flex items-start gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-[12px] font-medium text-slate-600">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> ข้อมูลที่คุณบันทึกจะแสดงให้ทีมแพทย์และพยาบาลเห็นในแท็บ “ข้อมูลจาก LINE”
          </p>
        </>
      )}
    </>
  );
}

const dLabel = (iso: string, days: number) => {
  const d = new Date(iso.slice(0, 10) + 'T00:00:00');
  return days <= 7 ? String(d.getDate()) : `${d.getDate()}/${d.getMonth() + 1}`;
};
function xTicksOf(dates: string[], days: number) {
  if (days <= 7) return dates.map((d) => ({ x: dayNum(d), label: dLabel(d, days) }));
  const step = days <= 30 ? 7 : 21;
  const last = dayNum(dates[dates.length - 1] ?? new Date().toISOString());
  return dates.filter((d) => (last - dayNum(d)) % step === 0).map((d) => ({ x: dayNum(d), label: dLabel(d, days) }));
}

function CardHead({ icon, title, right }: { icon: ReactNode; title: string; right?: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[13.5px] font-bold">
      {icon}
      <span className="flex-1">{title}</span>
      {right}
    </p>
  );
}

function FluidCard({ d, target, days }: { d: LineDataDto; target: number; days: number }) {
  const [ref, w] = useElementWidth<HTMLDivElement>();
  // 90 วัน → รวมเป็นค่าเฉลี่ยรายสัปดาห์
  const rows = days > 30 ? weekly(d.fluid.map((f) => ({ date: f.date, a: f.intake, b: f.urine }))) : d.fluid.map((f) => ({ date: f.date, a: f.intake, b: f.urine }));
  if (!rows.length) return null;
  const avgA = Math.round(rows.reduce((s, r) => s + r.a, 0) / rows.length / 10) * 10;
  const avgB = Math.round(rows.reduce((s, r) => s + r.b, 0) / rows.length / 10) * 10;
  const hit = d.fluid.filter((f) => f.intake >= target).length;
  const H = 130;
  const mx = Math.max(target * 1.15, ...rows.map((r) => Math.max(r.a, r.b)));
  const Y = (v: number) => 6 + (1 - v / mx) * (H - 12);
  const gw = (w || 300) / rows.length;
  const bw = Math.max(2, Math.min(12, gw / 2 - 2));
  return (
    <LCard className="flex flex-col gap-2">
      <CardHead icon={<Droplet className="h-4 w-4 text-blue-500" />} title="น้ำดื่ม – ปัสสาวะ" right={<Chip tone="blue">{`ถึงเป้า ${hit}/${d.fluid.length} วัน`}</Chip>} />
      <p className="text-[12px] text-slate-500">
        เฉลี่ยดื่ม {avgA.toLocaleString()} ml · ปัสสาวะ {avgB.toLocaleString()} ml ต่อวัน{days > 30 ? ' (รวมรายสัปดาห์)' : ''}
      </p>
      <div ref={ref} style={{ height: H }}>
        {w > 0 && (
          <svg width={w} height={H}>
            {[0, 0.5, 1].map((k) => (
              <line key={k} x1={0} x2={w} y1={Y(mx * k)} y2={Y(mx * k)} stroke="#eef2f7" />
            ))}
            {rows.map((r, i) => {
              const cx = i * gw + gw / 2;
              return (
                <g key={r.date}>
                  <rect x={cx - bw - 1} y={Y(r.a)} width={bw} height={Y(0) - Y(r.a)} rx={Math.min(4, bw / 2)} fill={r.a >= target ? '#2563eb' : '#93c5fd'} />
                  <rect x={cx + 1} y={Y(r.b)} width={bw} height={Y(0) - Y(r.b)} rx={Math.min(4, bw / 2)} fill="#22d3ee" />
                </g>
              );
            })}
            <line x1={0} x2={w} y1={Y(target)} y2={Y(target)} stroke="#1d4ed8" strokeWidth={1.2} strokeDasharray="5 4" />
          </svg>
        )}
      </div>
      <div className="flex justify-between px-1 text-[10.5px] text-slate-400">
        {rows.filter((_, i) => rows.length <= 7 || i % Math.ceil(rows.length / 6) === 0 || i === rows.length - 1).map((r) => (
          <span key={r.date}>{dLabel(r.date, rows.length <= 7 ? 7 : 30)}</span>
        ))}
      </div>
      <div className="flex gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> ดื่มน้ำ
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-cyan-400" /> ปัสสาวะ
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 border-t-[1.5px] border-dashed border-blue-700" /> เป้า {target.toLocaleString()} ml
        </span>
      </div>
    </LCard>
  );
}

function weekly(rows: { date: string; a: number; b: number }[]) {
  const out: { date: string; a: number; b: number }[] = [];
  for (let i = rows.length; i > 0; i -= 7) {
    const chunk = rows.slice(Math.max(0, i - 7), i);
    out.unshift({ date: chunk[chunk.length - 1].date, a: chunk.reduce((s, r) => s + r.a, 0) / chunk.length, b: chunk.reduce((s, r) => s + r.b, 0) / chunk.length });
  }
  return out;
}

function WeightCard({ d }: { d: LineDataDto }) {
  const w = d.weight;
  if (w.length < 2) return null;
  const last = w[w.length - 1];
  const diff = +(last.kg - w[0].kg).toFixed(1);
  const days = Math.round(dayNum(last.date) - dayNum(w[0].date)) + 1;
  return (
    <LCard className="flex flex-col gap-2">
      <CardHead
        icon={<Scale className="h-4 w-4 text-violet-500" />}
        title="น้ำหนัก"
        right={
          <span>
            <b className="text-[16px]">{last.kg}</b> <span className="text-[11px] text-slate-400">kg</span>
          </span>
        }
      />
      <p className="text-[12px] text-slate-500">
        {diff === 0 ? 'คงที่' : `${diff > 0 ? '+' : '−'}${Math.abs(diff)} kg`} ใน {days} วัน · ถ้าเพิ่มเกิน 1 kg ใน 2 วัน ควรแจ้งทีม
      </p>
      <TrendChart height={100} series={{ points: w.map((x) => ({ x: dayNum(x.date), y: x.kg })), color: '#7c3aed', dots: w.length <= 31 }} xDomain={[dayNum(w[0].date) - 0.5, dayNum(last.date) + 0.5]} xTicks={xTicksOf(w.map((x) => x.date), days)} pad={{ t: 10 }} />
    </LCard>
  );
}

function BpCard({ d }: { d: LineDataDto }) {
  const bp = d.bp;
  if (!bp.length) return null;
  const last = bp[bp.length - 1];
  const over = bp.filter((b) => b.sys > BP_LIMIT.sys || b.dia > BP_LIMIT.dia);
  const lastOver = over[over.length - 1];
  const x0 = dayNum(bp[0].at);
  const x1 = dayNum(last.at);
  const days = x1 - x0 + 1;
  return (
    <LCard className="flex flex-col gap-2">
      <CardHead
        icon={<HeartPulse className="h-4 w-4 text-rose-500" />}
        title="ความดันโลหิต"
        right={
          <span>
            <b className="text-[16px]">
              {last.sys}/{last.dia}
            </b>{' '}
            <span className="text-[11px] text-slate-400">mmHg</span>
          </span>
        }
      />
      <TrendChart
        height={140}
        series={{ points: bp.map((b) => ({ x: dayNum(b.at), y: b.sys, flag: b.sys > BP_LIMIT.sys })), color: '#e11d48', dots: bp.length <= 31 }}
        secondary={{ points: bp.map((b) => ({ x: dayNum(b.at), y: b.dia, flag: b.dia > BP_LIMIT.dia })), color: '#fb7185', domain: [50, 170], dots: bp.length <= 31 }}
        xDomain={[x0 - 0.5, x1 + 0.5]}
        yDomain={[50, 170]}
        bands={[
          { lo: BP_LIMIT.sys, hi: BP_LIMIT.sys + 0.8, color: '#f97316' },
          { lo: BP_LIMIT.dia, hi: BP_LIMIT.dia + 0.8, color: '#fdba74' },
        ]}
        xTicks={xTicksOf(bp.map((b) => b.at.slice(0, 10)), days)}
        pad={{ t: 8, r: 8 }}
      />
      <div className="flex gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3.5 bg-rose-600" /> ตัวบน
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3.5 bg-rose-300" /> ตัวล่าง
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3.5 border-t-2 border-orange-500" /> เกณฑ์ {BP_LIMIT.sys}/{BP_LIMIT.dia}
        </span>
      </div>
      {lastOver ? (
        <p className="rounded-xl bg-orange-50 px-3 py-2 text-[12px] font-medium text-orange-800">
          ⚠️ {shortDate(lastOver.at)} {lastOver.sys}/{lastOver.dia} สูงกว่าเกณฑ์ · ระบบแจ้งทีมพยาบาลแล้ว{over.length > 1 ? ` (${over.length} ครั้งในช่วงนี้)` : ''}
        </p>
      ) : (
        <p className="rounded-xl bg-green-50 px-3 py-2 text-[12px] font-medium text-green-800">ความดันอยู่ในเกณฑ์ตลอดช่วงนี้ 👍</p>
      )}
    </LCard>
  );
}

function MedCard({ log, days }: { log: { date: string; am: boolean; pm: boolean }[]; days: number }) {
  const taken = log.reduce((s, d) => s + (d.am ? 1 : 0) + (d.pm ? 1 : 0), 0);
  const total = log.length * 2;
  const missed = log.flatMap((d) => [...(d.am ? [] : [`${shortDate(d.date)} เช้า`]), ...(d.pm ? [] : [`${shortDate(d.date)} เย็น`])]);
  const weeks = weekly(log.map((d) => ({ date: d.date, a: (d.am ? 1 : 0) + (d.pm ? 1 : 0), b: 0 })));
  return (
    <LCard className="flex flex-col gap-2">
      <CardHead icon={<Pill className="h-4 w-4 text-teal-600" />} title="การกินยากดภูมิ" right={<Chip tone={taken / total >= 0.95 ? 'green' : 'orange'}>{`${taken}/${total} มื้อ · ${Math.round((taken / total) * 100)}%`}</Chip>} />
      {days <= 7 ? (
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `52px repeat(${log.length}, 1fr)` }}>
          <span />
          {log.map((d) => (
            <span key={d.date} className="text-center text-[10.5px] text-slate-400">
              {dLabel(d.date, 7)}
            </span>
          ))}
          {(['am', 'pm'] as const).map((slot) => (
            <Row key={slot} label={slot === 'am' ? 'เช้า' : 'เย็น'} cells={log.map((d) => d[slot])} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {weeks.map((w) => (
            <div key={w.date} className="flex items-center gap-2 text-[11.5px]">
              <span className="w-16 text-slate-500">ถึง {dLabel(w.date, 30)}</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span className={cn('block h-full rounded-full', w.a >= 1.9 ? 'bg-green-500' : 'bg-orange-400')} style={{ width: `${(w.a / 2) * 100}%` }} />
              </span>
              <span className="w-10 text-right font-semibold">{Math.round((w.a / 2) * 100)}%</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-[12px] text-slate-500">{missed.length ? `ลืม ${missed.length} มื้อ (${missed.slice(-3).join(', ')}) · ตั้งเตือนเพิ่มได้ที่ “ตั้งค่าการแจ้งเตือน”` : 'ไม่ลืมเลย เยี่ยมมาก!'}</p>
    </LCard>
  );
}

function Row({ label, cells }: { label: string; cells: boolean[] }) {
  return (
    <>
      <span className="text-[11px] font-medium text-slate-600">{label}</span>
      {cells.map((ok, i) => (
        <span key={i} className={cn('mx-auto grid h-6 w-6 place-items-center rounded-full', ok ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600')}>
          {ok ? '✓' : <X className="h-3.5 w-3.5" />}
        </span>
      ))}
    </>
  );
}
