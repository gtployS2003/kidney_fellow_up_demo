import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Bandage, Bell, BookOpen, CalendarCheck, Check, ChevronRight, Clock, CupSoda, Droplet, FlaskConical, HeartPulse, Hourglass, Lock, LogOut, Minus, Moon, Phone, Pill, Plus, Scale, Search, SlidersHorizontal, Star, Sunrise, Thermometer, Toilet, X } from 'lucide-react';
import type { ArticleDto } from '@/types';
import { useSim } from '../store';
import { fullName, type Persona } from '../personas';
import { Mascot } from '../Mascot';
import { Chip, LBtn, LCard, LTabs, LiffShell } from './Shell';
import { useAsync } from '@/hooks/useAsync';
import { appointmentApi, labApi } from '@/services/api/appointmentApi';
import { articleApi } from '@/services/api/articleApi';
import { BP_LIMIT, addLineEntry, entriesToday, lineApi } from '@/services/api/lineApi';
import { cn, isoDate, thaiDate } from '@/lib/format';

const CupIcon = CupSoda;

// =============== นัดหมาย ===============
export function AppointmentsPage({ p }: { p: Persona }) {
  const { closeLiff, record } = useSim();
  const [tab, setTab] = useState<'all' | 'tests'>('all');
  const [confirmed, setConfirmed] = useState(false);
  const from = isoDate(new Date());
  const to = isoDate(new Date(Date.now() + 120 * 86400000));
  const { data } = useAsync(() => appointmentApi.range(from, to, p.id), [p.id]);
  const list = data ?? [];
  const next = list[0];
  const tests = [
    ['Echocardiogram', 'นัด 18 พ.ย. · ตึกหัวใจ ชั้น 2', 'next'],
    ['พบทันตแพทย์', 'นัด 26 พ.ย. · คลินิกทันตกรรม', 'next'],
    ['Colonoscopy', 'รอนัดจากเจ้าหน้าที่', 'wait'],
    ['CXR, EKG', 'ไปแล้ว 02 ต.ค.', 'done'],
    ['Lab พื้นฐาน', 'ไปแล้ว 02 ต.ค.', 'done'],
  ];
  return (
    <LiffShell title="นัดหมาย" sub={`${fullName(p)} · ${p.stage}`} onClose={closeLiff}>
      <div className="flex flex-col gap-3">
        {next ? (
          <LCard className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="flex w-14 flex-col items-center rounded-2xl bg-primary py-1.5 text-white">
                <b className="text-[21px] leading-6">{new Date(next.date).getDate()}</b>
                <span className="text-[11px]">{thaiDate(next.date).split(' ')[1]}</span>
              </span>
              <span className="flex-1">
                <Chip>นัดถัดไป</Chip>
                <b className="block text-[15px]">{next.type}</b>
                <span className="text-[12px] text-slate-500">
                  {next.time} น. · {next.room}
                </span>
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-[12px] text-slate-600">
              <b className="text-slate-700">การเตรียมตัว</b>
              <p>✓ งดน้ำ งดอาหาร 8 ชม. ก่อนเจาะเลือด</p>
              <p>✓ นำยาที่ใช้ประจำมาด้วย</p>
            </div>
            <LBtn kind={confirmed ? 'outline' : 'primary'} disabled={confirmed} onClick={() => { setConfirmed(true); record(`ยืนยันมาตามนัด ${thaiDate(next.date)} (จากหน้า LIFF)`); }}>
              <Check className="h-4 w-4" /> {confirmed ? 'ยืนยันแล้ว' : 'ยืนยันมาตามนัด'}
            </LBtn>
          </LCard>
        ) : (
          <LCard className="text-center text-[13px] text-slate-400">ยังไม่มีนัดในช่วงนี้</LCard>
        )}
        {!p.postop && <LTabs items={[['all', 'นัดทั้งหมด'], ['tests', 'ตรวจที่ต้องไป']]} value={tab} onChange={setTab} />}
        {tab === 'all'
          ? list.slice(1, 8).map((a) => (
              <LCard key={a.id} className="flex items-center gap-3 !p-3">
                <span className="flex w-12 flex-col items-center rounded-xl bg-blue-50 py-1 text-primary">
                  <b className="text-[16px] leading-5">{new Date(a.date).getDate()}</b>
                  <span className="text-[10px]">{thaiDate(a.date).split(' ')[1]}</span>
                </span>
                <span className="flex-1">
                  <b className="block text-[13.5px]">{a.type}</b>
                  <span className="text-[11.5px] text-slate-400">
                    {a.room} · {a.time}
                  </span>
                </span>
              </LCard>
            ))
          : (
            <>
              <LCard className="flex flex-col gap-2">
                <div className="flex items-center text-[14px] font-bold">
                  ไปตรวจแล้ว 2 จาก 5 รายการ <span className="flex-1" />
                  <Chip tone="orange">เหลือ 3</Chip>
                </div>
                <div className="h-2 rounded bg-slate-100">
                  <div className="h-2 w-2/5 rounded bg-primary" />
                </div>
              </LCard>
              {tests.map(([t, s, st]) => {
                const I = st === 'done' ? Check : st === 'next' ? CalendarCheck : Hourglass;
                return (
                  <LCard key={t} className="flex items-center gap-3 !p-3">
                    <span className={cn('grid h-9 w-9 place-items-center rounded-xl', st === 'done' ? 'bg-green-100 text-green-700' : st === 'next' ? 'bg-blue-50 text-primary' : 'bg-yellow-100 text-yellow-700')}>
                      <I className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <b className={cn('block text-[13.5px]', st === 'done' && 'text-slate-400')}>{t}</b>
                      <span className="text-[11.5px] text-slate-400">{s}</span>
                    </span>
                    <Chip tone={st === 'done' ? 'green' : st === 'next' ? 'blue' : 'amber'}>{st === 'done' ? 'ไปแล้ว' : st === 'next' ? 'มีนัด' : 'รอนัด'}</Chip>
                  </LCard>
                );
              })}
            </>
          )}
      </div>
    </LiffShell>
  );
}

// =============== การกินยา ===============
type Med = { key: string; name: string; dose: string; how: string; immuno?: boolean; changed?: boolean };
function medsFor(p: Persona): { am: Med[]; pm: Med[] } {
  if (p.kind === 'donor') return { am: [{ key: 'am-0', name: 'Omeprazole 20 mg', dose: '1 เม็ด', how: 'ก่อนอาหารเช้า' }], pm: [{ key: 'pm-0', name: 'Paracetamol 500 mg', dose: '1–2 เม็ด', how: 'เมื่อปวด' }] };
  if (!p.postop) return { am: [{ key: 'am-0', name: 'Amlodipine 5 mg', dose: '1 เม็ด', how: 'หลังอาหารเช้า' }, { key: 'am-1', name: 'Calcium carbonate', dose: '1 เม็ด', how: 'พร้อมอาหาร' }], pm: [{ key: 'pm-0', name: 'Amlodipine 5 mg', dose: '1 เม็ด', how: 'หลังอาหารเย็น' }] };
  return {
    am: [
      { key: 'am-0', name: 'Tacrolimus 3.5 mg', dose: '1 แคปซูล', how: 'ก่อนอาหาร 1 ชม.', immuno: true, changed: true },
      { key: 'am-1', name: 'Mycophenolate 500 mg', dose: '1 เม็ด', how: 'หลังอาหาร', immuno: true },
      { key: 'am-2', name: 'Prednisolone 10 mg', dose: '1 เม็ด', how: 'หลังอาหาร', immuno: true },
    ],
    pm: [
      { key: 'pm-0', name: 'Tacrolimus 3.5 mg', dose: '1 แคปซูล', how: 'ก่อนอาหาร 1 ชม.', immuno: true, changed: true },
      { key: 'pm-1', name: 'Mycophenolate 500 mg', dose: '1 เม็ด', how: 'หลังอาหาร', immuno: true },
    ],
  };
}
export function MedsPage({ p, tab: initial }: { p: Persona; tab?: string }) {
  const { closeLiff, medsTaken, toggleMed, record } = useSim();
  const immunoTab = p.kind === 'recipient' && p.postop;
  const [tab, setTab] = useState<'today' | 'immuno' | 'all'>(initial === 'immuno' && immunoTab ? 'immuno' : 'today');
  const m = medsFor(p);
  const all = [...m.am, ...m.pm];
  const done = all.filter((x) => medsTaken[x.key]).length;
  const row = (x: Med) => (
    <LCard key={x.key} className="flex items-center gap-3 !p-3">
      <span className={cn('grid h-9 w-9 place-items-center rounded-xl', medsTaken[x.key] ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-primary')}>
        <Pill className="h-4 w-4" />
      </span>
      <span className="flex-1">
        <b className="block text-[13.5px]">{x.name}</b>
        <span className="text-[11.5px] text-slate-400">
          {x.dose} · {x.how}
        </span>
      </span>
      <button type="button" onClick={() => { toggleMed(x.key); if (!medsTaken[x.key]) record(`กินยาแล้ว: ${x.name}`); }} className={cn('flex h-8 items-center gap-1 rounded-full px-3 text-[12px] font-bold', medsTaken[x.key] ? 'bg-green-100 text-green-700' : 'bg-primary text-white')}>
        {medsTaken[x.key] && <Check className="h-3.5 w-3.5" strokeWidth={3} />} กินแล้ว
      </button>
    </LCard>
  );
  return (
    <LiffShell title="การกินยา" sub={`${thaiDate(new Date().toISOString())} · ${fullName(p)}`} onClose={closeLiff}>
      <div className="flex flex-col gap-3">
        <LCard className="flex items-center gap-3">
          <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <motion.circle cx="18" cy="18" r="15" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeDasharray="94.2" animate={{ strokeDashoffset: 94.2 * (1 - done / all.length) }} />
          </svg>
          <span>
            <b className="block text-[15px]">
              กินยาวันนี้ {done} จาก {all.length} รายการ
            </b>
            <span className="text-[12px] text-slate-500">มื้อถัดไป 20:00 น.</span>
          </span>
        </LCard>
        <LTabs items={immunoTab ? [['today', 'วันนี้'], ['immuno', 'ยากดภูมิ'], ['all', 'ยาทั้งหมด']] : [['today', 'วันนี้'], ['all', 'ยาทั้งหมด']]} value={tab} onChange={setTab} />
        {tab === 'today' && (
          <>
            <p className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
              <Sunrise className="h-4 w-4" /> เช้า 08:00
            </p>
            {m.am.map(row)}
            <p className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
              <Moon className="h-4 w-4" /> เย็น 20:00
            </p>
            {m.pm.map(row)}
          </>
        )}
        {tab === 'immuno' && (
          <>
            <LCard className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-700">
                <FlaskConical className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="text-[12px] text-slate-500">ระดับ Tacrolimus ล่าสุด</span>
                <b className="block text-[20px] text-orange-700">
                  7.6 <span className="text-[11px] font-normal text-slate-400">ng/mL · เป้า 8–10</span>
                </b>
              </span>
              <Chip>ปรับยาแล้ว</Chip>
            </LCard>
            {m.am.filter((x) => x.immuno).map((x) => (
              <LCard key={x.key} className="flex items-center gap-3 !p-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-primary">
                  <Pill className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <b className="flex items-center gap-1.5 text-[13.5px]">
                    {x.name.split(' ')[0]} {x.changed && <Chip tone="orange">ใหม่</Chip>}
                  </b>
                  <span className="text-[12px] font-semibold text-blue-900">{x.name.split(' ').slice(1).join(' ')}</span>
                  <span className="block text-[11.5px] text-slate-400">เช้า 08:00 · เย็น 20:00 · {x.how}</span>
                </span>
              </LCard>
            ))}
            <LCard className="flex flex-col gap-1.5 text-[12.5px] text-slate-700">
              <b className="text-[13.5px]">ถ้าลืมกินยากดภูมิ</b>
              <p>✓ นึกได้ภายใน 6 ชม. ให้กินทันที</p>
              <p>✓ เกิน 6 ชม. ให้ข้ามมื้อนั้น ห้ามกินเพิ่มเป็น 2 เท่า</p>
              <p>✓ ลืมเกิน 1 มื้อ ให้โทรปรึกษาศูนย์ฯ</p>
            </LCard>
          </>
        )}
        {tab === 'all' &&
          [...new Map(all.map((x) => [x.name, x])).values()].map((x) => (
            <LCard key={x.name} className="flex items-center gap-3 !p-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-primary">
                <Pill className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <b className="block text-[13.5px]">{x.name}</b>
                <span className="text-[11.5px] text-slate-400">{x.how}</span>
              </span>
            </LCard>
          ))}
      </div>
    </LiffShell>
  );
}

// =============== ค่าไต ===============
export function KidneyPage({ p }: { p: Persona }) {
  const { closeLiff } = useSim();
  const { data } = useAsync(() => labApi.latest(p.kind, p.id), [p.id]);
  const pick = (n: string) => data?.items.find((i) => i.name.startsWith(n));
  const cr = pick('Creatinine');
  const egfr = pick('eGFR');
  const tac = pick('Tacrolimus');
  return (
    <LiffShell title="ค่าไต" sub={data ? `ผลล่าสุด ${thaiDate(data.reportedAt)} · จาก iMed` : '…'} onClose={closeLiff}>
      <div className="flex flex-col gap-3">
        <LCard className="grid grid-cols-2 gap-2.5">
          {[cr, egfr].map(
            (x) =>
              x && (
                <div key={x.name} className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-3">
                  <span className="text-[12px] text-slate-500">{x.name}</span>
                  <b className="text-[24px] leading-7 text-blue-900">
                    {x.value} <span className="text-[10.5px] font-normal text-slate-400">{x.unit}</span>
                  </b>
                  <Chip tone={x.flag ? 'orange' : 'green'}>{x.flag ? 'ผิดปกติ' : 'ปกติ'}</Chip>
                </div>
              ),
          )}
          {tac && (
            <div className="col-span-2 flex items-center gap-2.5 rounded-2xl bg-orange-50 p-3">
              <FlaskConical className="h-5 w-5 text-orange-600" />
              <span>
                <b className="block text-[13.5px]">
                  Tacrolimus {tac.value} {tac.unit}
                </b>
                <span className="text-[11.5px] text-orange-800">{tac.ref}</span>
              </span>
            </div>
          )}
        </LCard>
        {cr && (
          <LCard className="flex flex-col gap-3">
            <b className="text-[13.5px]">Creatinine 5 ครั้งล่าสุด</b>
            <div className="flex h-[120px] items-end gap-3 px-2">
              {cr.trend.map((v, i) => {
                const max = Math.max(...cr.trend);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10.5px] font-semibold text-slate-500">{v}</span>
                    <motion.span initial={{ height: 0 }} animate={{ height: (v / max) * 80 }} className={cn('w-6 rounded-lg', i === cr.trend.length - 1 ? 'bg-primary' : 'bg-blue-200')} />
                    <span className="text-[10px] text-slate-400">{data!.dates[cr.trend.length - 1 - i] ? thaiDate(data!.dates[cr.trend.length - 1 - i]).slice(0, 6) : ''}</span>
                  </div>
                );
              })}
            </div>
          </LCard>
        )}
        {p.kind === 'donor' && <LCard className="text-[12.5px] text-green-800 !bg-green-50">หลังบริจาค ค่า Cr สูงขึ้นเล็กน้อยเป็นเรื่องปกติ · อยู่ในเกณฑ์ที่คาดไว้</LCard>}
      </div>
    </LiffShell>
  );
}

// =============== บันทึกสุขภาพ ===============
type Sheet = null | 'water' | 'urine' | 'weight' | 'bp';
export function HealthPage({ p, tab: initial }: { p: Persona; tab?: string }) {
  const { closeLiff, record, sendNotify } = useSim();
  const donor = p.kind === 'donor';
  const [tab, setTab] = useState<'fluid' | 'bp'>(donor || initial === 'bp' ? 'bp' : 'fluid');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [tick, setTick] = useState(0);
  const { data: settings } = useAsync(() => lineApi.settings(p.kind, p.id), [p.id]);
  const entries = useMemo(() => entriesToday(p.id), [p.id, tick]);
  const water = entries.reduce((s, e) => s + (e.type === 'water' ? e.ml : 0), 0);
  const urine = entries.reduce((s, e) => s + (e.type === 'urine' ? e.ml : 0), 0);
  const lastBp = [...entries].reverse().find((e) => e.type === 'bp');
  const target = settings?.fluidTargetMl ?? 2500;

  function save(e: Parameters<typeof addLineEntry>[1], label: string) {
    addLineEntry(p.id, e);
    record(`บันทึก${label} → แสดงในแท็บ “ข้อมูลจาก LINE” ของทีม`);
    setSheet(null);
    setTick((t) => t + 1);
    if (e.type === 'bp' && (e.sys > BP_LIMIT.sys || e.dia > BP_LIMIT.dia)) setTimeout(() => sendNotify(9, { sys: e.sys, dia: e.dia }), 900);
  }
  const fmtT = (iso: string) => new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative h-full">
      <LiffShell title="บันทึกสุขภาพ" sub={`วันนี้ · ${thaiDate(new Date().toISOString())}`} onClose={closeLiff}>
        <div className="flex flex-col gap-3">
          {!donor && <LTabs items={[['fluid', 'น้ำเข้า–น้ำออก'], ['bp', 'ความดัน']]} value={tab} onChange={setTab} />}
          {tab === 'fluid' ? (
            <>
              <LCard className="grid grid-cols-2 gap-2.5">
                {[
                  [CupIcon, 'น้ำดื่ม', water, `/ ${target.toLocaleString()} ml`, water / target, '#2563eb', 'bg-blue-50'],
                  [Toilet, 'ปัสสาวะ', urine, 'ml', urine / target, '#0891b2', 'bg-cyan-50'],
                ].map(([I, k, v, u, pct, col, bg]) => {
                  const Icon = I as typeof Droplet;
                  return (
                    <div key={k as string} className={cn('flex flex-col gap-1.5 rounded-2xl p-3', bg as string)}>
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                        <Icon className="h-4 w-4" style={{ color: col as string }} /> {k as string}
                      </span>
                      <b className="text-[22px]" style={{ color: col as string }}>
                        {(v as number).toLocaleString()} <span className="text-[10.5px] font-normal text-slate-500">{u as string}</span>
                      </b>
                      <span className="h-1.5 rounded bg-white">
                        <motion.span className="block h-full rounded" style={{ background: col as string }} animate={{ width: `${Math.min(100, (pct as number) * 100)}%` }} />
                      </span>
                    </div>
                  );
                })}
                <p className="col-span-2 rounded-xl bg-green-50 px-3 py-2 text-[11.5px] text-green-800">{p.postop ? `หลังผ่าตัด: ดื่มน้ำวันละ ${(target / 1000).toFixed(1)} ลิตร ตามที่แพทย์กำหนด` : 'ก่อนผ่าตัด: ดื่มน้ำตามปริมาณที่แพทย์กำหนด'}</p>
              </LCard>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['water', '+ ดื่มน้ำ', CupIcon],
                  ['urine', '+ ปัสสาวะ', Toilet],
                  ['weight', '+ น้ำหนัก', Scale],
                ].map(([k, l, I]) => {
                  const Icon = I as typeof Droplet;
                  return (
                    <button key={k as string} type="button" onClick={() => setSheet(k as Sheet)} className="flex flex-col items-center gap-1.5 rounded-[18px] bg-white py-3 shadow-[0_8px_22px_-10px_rgba(15,23,42,.18)] active:scale-95">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-primary">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="text-[12.5px] font-semibold text-primary">{l as string}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <LCard className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-600">
                    <HeartPulse className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="text-[12px] text-slate-400">{lastBp ? `ล่าสุด · ${fmtT(lastBp.at)} น.` : 'วันนี้ยังไม่ได้บันทึก'}</span>
                    <b className="block text-[26px] text-blue-900">{lastBp && lastBp.type === 'bp' ? `${lastBp.sys}/${lastBp.dia}` : '—'}</b>
                  </span>
                  {lastBp && lastBp.type === 'bp' && <Chip tone={lastBp.sys > BP_LIMIT.sys || lastBp.dia > BP_LIMIT.dia ? 'orange' : 'green'}>{lastBp.sys > BP_LIMIT.sys || lastBp.dia > BP_LIMIT.dia ? 'สูงกว่าเกณฑ์' : 'ปกติ'}</Chip>}
                </div>
              </LCard>
              <LBtn onClick={() => setSheet('bp')}>
                <Plus className="h-4 w-4" /> บันทึกความดัน
              </LBtn>
              {donor && (
                <LBtn kind="outline" onClick={() => setSheet('weight')}>
                  <Scale className="h-4 w-4" /> บันทึกน้ำหนัก
                </LBtn>
              )}
            </>
          )}
          <p className="pt-1 text-[14px] font-bold">รายการวันนี้</p>
          {entries.length === 0 && <p className="text-center text-[12.5px] text-slate-400">ยังไม่มีรายการ</p>}
          {[...entries].reverse().map((e, i) => (
            <LCard key={i} className="flex items-center gap-3 !py-2.5">
              <span className="text-[13px] font-medium">{e.type === 'water' ? 'ดื่มน้ำ' : e.type === 'urine' ? 'ปัสสาวะ' : e.type === 'weight' ? 'น้ำหนัก' : 'ความดัน'}</span>
              <span className="flex-1" />
              <b className="text-[13px]">{e.type === 'weight' ? `${e.kg} kg` : e.type === 'bp' ? `${e.sys}/${e.dia}` : e.type === 'water' ? `+ ${e.ml} ml` : `${e.ml} ml`}</b>
              <span className="text-[11.5px] text-slate-400">{fmtT(e.at)}</span>
            </LCard>
          ))}
        </div>
      </LiffShell>
      <AnimatePresence>{sheet && <EntrySheet kind={sheet} target={target} water={water} onClose={() => setSheet(null)} onSave={save} />}</AnimatePresence>
    </div>
  );
}

function EntrySheet({ kind, target, water, onClose, onSave }: { kind: Exclude<Sheet, null>; target: number; water: number; onClose: () => void; onSave: (e: Parameters<typeof addLineEntry>[1], label: string) => void }) {
  const [ml, setMl] = useState(250);
  const [kg, setKg] = useState(57.5);
  const [bp, setBp] = useState({ sys: '', dia: '', pulse: '', temp: '' });
  const at = new Date().toISOString();
  const high = Number(bp.sys) > BP_LIMIT.sys || Number(bp.dia) > BP_LIMIT.dia;
  const title = { water: 'บันทึกการดื่มน้ำ', urine: 'บันทึกปัสสาวะ', weight: 'บันทึกน้ำหนัก', bp: 'บันทึกความดัน' }[kind];
  const Step = ({ v, set, step, unit }: { v: number; set: (n: number) => void; step: number; unit: string }) => (
    <div className="flex h-[68px] items-center gap-3 rounded-2xl border-2 border-primary bg-slate-50 px-3">
      <button type="button" onClick={() => set(Math.max(0, +(v - step).toFixed(1)))} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-primary">
        <Minus className="h-4 w-4" />
      </button>
      <b className="flex-1 text-center text-[28px] text-blue-900">
        {v.toLocaleString()} <span className="text-[13px] font-normal text-slate-500">{unit}</span>
      </b>
      <button type="button" onClick={() => set(+(v + step).toFixed(1))} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-20 bg-slate-900/45" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 36 }} className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3.5 rounded-t-[26px] bg-white px-5 pb-7 pt-2.5">
        <span className="mx-auto h-1 w-11 rounded-full bg-slate-200" />
        <div className="flex items-center gap-3">
          <span className="flex-1">
            <b className="block text-[17px]">{title}</b>
            <span className="text-[12px] text-slate-500">{kind === 'water' ? `วันนี้ ${water.toLocaleString()} / ${target.toLocaleString()} ml` : kind === 'weight' ? 'ชั่งตอนเช้า หลังเข้าห้องน้ำ' : kind === 'bp' ? 'นั่งพัก 5 นาทีก่อนวัด' : 'ปริมาณปัสสาวะแต่ละครั้ง'}</span>
          </span>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500" aria-label="ปิด">
            <X className="h-4 w-4" />
          </button>
        </div>
        {(kind === 'water' || kind === 'urine') && (
          <>
            {kind === 'water' && (
              <div className="grid grid-cols-4 gap-2">
                {[150, 250, 500, 1000].map((v) => (
                  <button key={v} type="button" onClick={() => setMl(v)} className={cn('rounded-2xl border py-2 text-[13px] font-bold', ml === v ? 'border-2 border-primary bg-blue-50 text-blue-900' : 'border-slate-200')}>
                    {v.toLocaleString()}
                    <span className="block text-[10px] font-normal text-slate-500">ml</span>
                  </button>
                ))}
              </div>
            )}
            <Step v={ml} set={setMl} step={50} unit="ml" />
          </>
        )}
        {kind === 'weight' && <Step v={kg} set={setKg} step={0.1} unit="kg" />}
        {kind === 'bp' && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['sys', 'ตัวบน', 'mmHg'],
                  ['dia', 'ตัวล่าง', 'mmHg'],
                  ['pulse', 'ชีพจร', '/min'],
                ] as const
              ).map(([k, l, u]) => {
                const warn = (k === 'sys' && Number(bp.sys) > BP_LIMIT.sys) || (k === 'dia' && Number(bp.dia) > BP_LIMIT.dia);
                return (
                  <label key={k} className={cn('flex flex-col items-center rounded-2xl border p-2', warn ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-slate-50')}>
                    <span className="text-[11px] text-slate-500">{l}</span>
                    <input inputMode="numeric" value={bp[k]} onChange={(e) => setBp({ ...bp, [k]: e.target.value.replace(/\D/g, '').slice(0, 3) })} placeholder="—" className={cn('w-full bg-transparent text-center text-[24px] font-bold outline-none', warn ? 'text-orange-700' : 'text-blue-900')} />
                    <span className="text-[10px] text-slate-400">{u}</span>
                  </label>
                );
              })}
            </div>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[13px] text-slate-500">
              <Thermometer className="h-4 w-4" /> อุณหภูมิ (ถ้ามี)
              <input inputMode="decimal" value={bp.temp} onChange={(e) => setBp({ ...bp, temp: e.target.value.slice(0, 4) })} placeholder="36.8" className="flex-1 bg-transparent text-right font-semibold text-slate-900 outline-none" />
              °C
            </label>
            {high && (
              <p className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-[12px] text-orange-800">
                <AlertTriangle className="h-4 w-4" /> สูงกว่าเกณฑ์ ({BP_LIMIT.sys}/{BP_LIMIT.dia}) · นั่งพัก 15 นาที แล้ววัดซ้ำ
              </p>
            )}
          </>
        )}
        <p className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-[13px] text-slate-500">
          <Clock className="h-4 w-4" /> เวลา <span className="flex-1" />
          <b className="text-slate-800">วันนี้ · {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</b>
        </p>
        <LBtn
          disabled={kind === 'bp' && (!bp.sys || !bp.dia)}
          onClick={() =>
            kind === 'bp'
              ? onSave({ type: 'bp', sys: Number(bp.sys), dia: Number(bp.dia), pulse: Number(bp.pulse) || 0, temp: bp.temp ? Number(bp.temp) : undefined, at }, `ความดัน ${bp.sys}/${bp.dia}`)
              : kind === 'weight'
                ? onSave({ type: 'weight', kg, at }, `น้ำหนัก ${kg} kg`)
                : onSave({ type: kind, ml, at }, `${kind === 'water' ? 'ดื่มน้ำ' : 'ปัสสาวะ'} ${ml} ml`)
          }
        >
          <Check className="h-4 w-4" /> บันทึก
        </LBtn>
      </motion.div>
    </>
  );
}

// =============== ติดตามอาการ ===============
export function FollowUpPage({ p }: { p: Persona }) {
  const { closeLiff } = useSim();
  const { data } = useAsync(() => labApi.latest(p.kind, p.id), [p.id]);
  const steps = ['ลงทะเบียน', 'ก่อนผ่าตัด', 'ผ่าตัด', 'ก่อนกลับบ้าน', 'ติดตาม OPD'];
  const cur = p.postop ? 4 : 1;
  return (
    <LiffShell title="ติดตามอาการ" sub={fullName(p)} onClose={closeLiff}>
      <div className="flex flex-col gap-3">
        <LCard className="flex flex-col gap-3">
          <div className="flex items-center">
            <b className="flex-1 text-[14px]">สถานะการรักษา</b>
            <Chip>{p.stage}</Chip>
          </div>
          <div className="flex">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-center">
                  <span className={cn('h-[3px] flex-1', i === 0 ? 'bg-transparent' : i <= cur ? 'bg-primary' : 'bg-slate-200')} />
                  <span className={cn('grid h-6 w-6 place-items-center rounded-full', i < cur ? 'bg-primary' : i === cur ? 'border-[3px] border-primary bg-white' : 'border border-slate-300 bg-white')}>
                    {i < cur && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className={cn('h-[3px] flex-1', i === steps.length - 1 ? 'bg-transparent' : i < cur ? 'bg-primary' : 'bg-slate-200')} />
                </div>
                <span className={cn('text-center text-[9.5px]', i === cur ? 'font-bold text-primary' : 'text-slate-500')}>{s}</span>
              </div>
            ))}
          </div>
        </LCard>
        {data && (
          <div className="grid grid-cols-3 gap-2">
            {data.items.filter((x) => ['Creatinine', 'eGFR', 'Tacrolimus (trough)', 'Hemoglobin'].includes(x.name)).slice(0, 3).map((x) => (
              <LCard key={x.name} className="flex flex-col gap-1 !p-3">
                <span className="text-[11px] text-slate-400">{x.name.split(' ')[0]}</span>
                <b className="text-[18px] text-blue-900">{x.value}</b>
                <Chip tone={x.flag ? 'orange' : 'green'}>{x.flag ? (x.flag === 'H' ? 'สูง' : 'ต่ำ') : 'ปกติ'}</Chip>
              </LCard>
            ))}
          </div>
        )}
        <LCard className="flex flex-col gap-2.5">
          <b className="text-[14px]">อาการที่ต้องรีบมาโรงพยาบาล</b>
          {(p.kind === 'donor' ? ['ปวดแผลมาก แผลบวมแดง มีหนอง', 'มีไข้ ≥ 38°C', 'ปัสสาวะออกน้อยหรือเป็นเลือด', 'ความดันสูงกว่า 140/90 ติดต่อกัน'] : ['มีไข้ ≥ 38°C หรือหนาวสั่น', 'ปัสสาวะออกน้อยลงมาก / ปวดบริเวณไตที่ปลูกถ่าย', 'น้ำหนักขึ้นเร็ว > 1 kg/วัน หรือบวม', 'ลืมกินยากดภูมิเกิน 1 มื้อ']).map((t) => (
            <p key={t} className="flex items-center gap-2 text-[12.5px] text-slate-700">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-100">
                <AlertTriangle className="h-3 w-3 text-red-600" />
              </span>
              {t}
            </p>
          ))}
          <a href="tel:0559600000" className="mt-1 flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 text-[13.5px] font-bold text-red-700">
            <Phone className="h-4 w-4" /> โทรศูนย์ฯ 055-96-xxxx
          </a>
        </LCard>
      </div>
    </LiffShell>
  );
}

// =============== Profile + ตั้งค่า ===============
export function ProfilePage({ p }: { p: Persona }) {
  const { closeLiff, openLiff } = useSim();
  return (
    <LiffShell
      onClose={closeLiff}
      hero={
        <div className="relative flex justify-center pt-3">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-lg">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-blue-50 text-[26px] font-bold text-primary">{p.ini}</span>
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pt-8">
        <div className="text-center">
          <b className="block text-[18px]">{fullName(p)}</b>
          <Chip>
            {p.kind === 'donor' ? 'ผู้บริจาคไต' : 'ผู้รับไต'} · HN {p.hn}
          </Chip>
        </div>
        <LCard className="!p-1">
          {[
            ['อายุ / กรุ๊ปเลือด', `${p.age} ปี · ${p.blood}`],
            ['โทรศัพท์', p.phone],
            ...(p.matched ? [[p.kind === 'donor' ? 'ผู้รับที่จับคู่' : 'ผู้บริจาคที่จับคู่', p.matched]] : []),
            ['สถานะ', p.stage],
          ].map(([k, v], i) => (
            <div key={k} className={cn('flex gap-2 px-3 py-2.5 text-[13px]', i > 0 && 'border-t border-slate-100')}>
              <span className="text-slate-400">{k}</span>
              <b className="flex-1 text-right">{v}</b>
            </div>
          ))}
        </LCard>
        {[
          [Bell, 'ตั้งค่าการแจ้งเตือน', 'นัด · กินยา · บันทึกสุขภาพ', () => openLiff('settings')],
          ...(p.kind === 'recipient' ? [[BookOpen, 'ความรู้สำหรับผู้รับไต', 'การเตรียมตัว · ยากดภูมิ · อาการ rejection', () => openLiff('knowledge')]] : []),
          [LogOut, 'ยกเลิกการเชื่อมต่อ LINE', 'ติดต่อเจ้าหน้าที่', () => undefined],
        ].map(([I, t, s, fn]) => {
          const Icon = I as typeof Bell;
          return (
            <button key={t as string} type="button" onClick={fn as () => void} className="flex items-center gap-3 rounded-[20px] bg-white p-3 text-left shadow-[0_8px_22px_-10px_rgba(15,23,42,.18)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-primary">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1">
                <b className="block text-[13.5px]">{t as string}</b>
                <span className="text-[11.5px] text-slate-400">{s as string}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </button>
          );
        })}
      </div>
    </LiffShell>
  );
}

export function SettingsPage({ p }: { p: Persona }) {
  const { closeLiff, openLiff, record } = useSim();
  const { data } = useAsync(() => lineApi.settings(p.kind, p.id), [p.id]);
  const [health, setHealth] = useState(true);
  const Sw = ({ on, locked, onClick }: { on: boolean; locked?: boolean; onClick?: () => void }) => (
    <button type="button" disabled={locked} onClick={onClick} className={cn('flex h-7 w-12 items-center rounded-full p-0.5 transition-colors', on ? (locked ? 'justify-end bg-blue-300' : 'justify-end bg-primary') : 'justify-start bg-slate-300')}>
      <motion.span layout className="grid h-6 w-6 place-items-center rounded-full bg-white">
        {locked && <Lock className="h-3 w-3 text-blue-300" />}
      </motion.span>
    </button>
  );
  return (
    <LiffShell title="ตั้งค่าการแจ้งเตือน" sub="แจ้งเตือนผ่าน LINE" onClose={closeLiff} onBack={() => openLiff('profile')}>
      <div className="flex flex-col gap-3">
        <LCard className="!p-1.5">
          {[
            [CalendarCheck, 'เตือนนัดหมาย', 'มีนัดใหม่ · เตือนล่วงหน้า 1 วัน · ขาดนัด', true],
            [Pill, 'เตือนกินยา', data?.medTimes.join(' · ') ?? '…', true],
            [AlertTriangle, 'ค่าที่บันทึกผิดปกติ', 'แจ้งทันทีเมื่อค่าเกินเกณฑ์', true],
            [Bell, 'เตือนบันทึกสุขภาพ', p.kind === 'donor' ? 'สัปดาห์ละครั้ง · ส่งเฉพาะเมื่อยังไม่บันทึก' : '19:00 · ส่งเฉพาะวันที่ยังไม่บันทึก', false],
          ].map(([I, t, s, locked], i) => {
            const Icon = I as typeof Bell;
            return (
              <div key={t as string} className={cn('flex items-center gap-3 px-2.5 py-3', i > 0 && 'border-t border-slate-100')}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <b className="block text-[13.5px]">{t as string}</b>
                  <span className="text-[11px] text-slate-400">{s as string}</span>
                </span>
                {locked ? <Sw on locked /> : <Sw on={health} onClick={() => { setHealth(!health); record(`${health ? 'ปิด' : 'เปิด'}การเตือนบันทึกสุขภาพ`); }} />}
              </div>
            );
          })}
        </LCard>
        <LCard className="flex gap-2.5 text-[12px] leading-5 text-slate-600">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          การแจ้งเตือนที่มีรูปกุญแจ ปิดไม่ได้ เพราะจำเป็นต่อการรักษา · เวลาเตือนกินยาและเป้าหมายดื่มน้ำ กำหนดโดยทีมแพทย์/พยาบาล
        </LCard>
        <LCard className="flex flex-col gap-2">
          <b className="text-[14px]">เป้าหมายของฉัน</b>
          {p.kind === 'recipient' && (
            <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[13px]">
              <Droplet className="h-4 w-4 text-slate-400" /> ดื่มน้ำต่อวัน <span className="flex-1" />
              <b>{data ? `${data.fluidTargetMl.toLocaleString()} ml` : '…'}</b>
            </p>
          )}
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[13px]">
            <Clock className="h-4 w-4 text-slate-400" /> เวลากินยา <span className="flex-1" />
            <b>{data?.medTimes.join(' · ') ?? '…'}</b>
          </p>
        </LCard>
      </div>
    </LiffShell>
  );
}

// =============== ความรู้ ===============
const CAT_ICON: Record<string, typeof Bandage> = { หลังผ่าตัด: Bandage, ยา: Pill, อาหาร: Droplet, ออกกำลังกาย: ArrowRight, ความดัน: Thermometer, ทั่วไป: BookOpen };
export function KnowledgePage({ p }: { p: Persona }) {
  const { closeLiff, openLiff } = useSim();
  const { data } = useAsync(() => articleApi.list(), []);
  const [cat, setCat] = useState('ทั้งหมด');
  const [q, setQ] = useState('');
  const [read, setRead] = useState<ArticleDto | null>(null);
  const female = p.id === 'r-990260';
  const list = (data ?? []).filter((a) => a.status === 'published' && a.audience.includes(p.kind) && (a.sex === 'all' || (a.sex === 'female') === female) && (a.phase === 'all' || (a.phase === 'postop') === p.postop));
  const featured = list.find((a) => a.featured);
  const cats = ['ทั้งหมด', ...new Set(list.map((a) => a.category))];
  const shown = list.filter((a) => (cat === 'ทั้งหมด' || a.category === cat) && a.title.includes(q.trim()));
  useEffect(() => setRead(null), [p.id]);

  if (read)
    return (
      <LiffShell title={read.title} sub={`ความรู้ · อ่าน ${read.readMin} นาที`} onClose={closeLiff} onBack={() => setRead(null)}>
        <div className="flex flex-col gap-3">
          <LCard className="flex flex-col gap-3">
            {read.content.split(/\n\s*\n/).map((t, i) => (
              <p key={i} className="text-[13.5px] leading-6 text-slate-700">
                {t}
              </p>
            ))}
            {read.todos.length > 0 && (
              <div className="flex flex-col gap-2 rounded-2xl bg-blue-50 p-3.5">
                <b className="text-[13.5px] text-blue-900">สิ่งที่ต้องทำ</b>
                {read.todos.map((t) => (
                  <p key={t} className="flex gap-2 text-[13px]">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />
                    </span>
                    {t}
                  </p>
                ))}
              </div>
            )}
          </LCard>
          {read.category === 'ความดัน' || read.todos.some((t) => t.includes('ความดัน')) ? (
            <LBtn onClick={() => openLiff('health', 'bp')}>บันทึกความดันตอนนี้</LBtn>
          ) : null}
        </div>
      </LiffShell>
    );

  return (
    <LiffShell title="ความรู้" sub={p.kind === 'donor' ? 'การดูแลตัวเองเมื่อเหลือไตข้างเดียว' : 'สำหรับผู้รับไต'} onClose={closeLiff} onBack={p.kind === 'recipient' ? () => openLiff('profile') : undefined}>
      <div className="flex flex-col gap-3">
        <label className="flex h-12 items-center gap-2 rounded-2xl bg-white pl-4 pr-1.5 shadow-[0_8px_22px_-10px_rgba(15,23,42,.18)]">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาหัวข้อความรู้" className="flex-1 bg-transparent text-[13.5px] outline-none" />
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
        </label>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {cats.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={cn('h-9 shrink-0 rounded-full px-3.5 text-[12.5px]', cat === c ? 'bg-primary font-bold text-white' : 'bg-white font-medium text-slate-600 shadow-sm')}>
              {c}
            </button>
          ))}
        </div>
        {featured && cat === 'ทั้งหมด' && !q && (
          <button type="button" onClick={() => setRead(featured)} className="relative flex items-center overflow-hidden rounded-[22px] bg-white p-4 text-left shadow-[0_8px_22px_-10px_rgba(15,23,42,.18)]">
            <span className="absolute -right-6 -top-4 h-44 w-44 rounded-full bg-blue-50" />
            <span className="relative flex w-[55%] flex-col items-start gap-1.5">
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                <Star className="h-3 w-3" /> แนะนำ
              </span>
              <b className="text-[16px] leading-[22px]">{featured.title}</b>
              <span className="text-[11.5px] text-slate-400">อ่าน {featured.readMin} นาที</span>
              <span className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-bold text-white">อ่านเลย</span>
            </span>
            <span className="relative ml-auto">
              <Mascot size={118} />
            </span>
          </button>
        )}
        <p className="pt-1 text-[14px] font-bold">หัวข้อความรู้</p>
        {shown.length === 0 && <p className="text-center text-[12.5px] text-slate-400">ไม่พบบทความ</p>}
        <div className="grid grid-cols-2 gap-2.5">
          {shown.map((a) => {
            const I = CAT_ICON[a.category] ?? BookOpen;
            return (
              <button key={a.id} type="button" onClick={() => setRead(a)} className="flex flex-col gap-2 rounded-[20px] bg-white p-2 text-left shadow-[0_8px_22px_-10px_rgba(15,23,42,.18)]">
                <span className="relative grid h-24 place-items-center rounded-2xl bg-blue-50">
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    <Clock className="h-2.5 w-2.5" /> {a.readMin} นาที
                  </span>
                  <span className="grid h-12 w-12 -rotate-6 place-items-center rounded-2xl bg-white text-primary">
                    <I className="h-6 w-6" />
                  </span>
                </span>
                <b className="px-1 text-[12.5px] leading-[18px]">{a.title}</b>
                <span className="px-1 pb-1 text-[11px] text-slate-400">{a.category}</span>
              </button>
            );
          })}
        </div>
      </div>
    </LiffShell>
  );
}
