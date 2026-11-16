import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Droplet, HeartPulse, Info, Pencil, Pill, Scale, Settings2, Thermometer, X } from 'lucide-react';
import type { NotifySettingsDto, PersonKind, PersonRef } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge, TONES } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { Skeleton } from '@/components/ui/Skeleton';
import { Field, TextInput } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { LineChart } from '@/components/charts/LineChart';
import { useAsync } from '@/hooks/useAsync';
import { lineApi } from '@/services/api/lineApi';
import { BP_LIMIT } from '@/services/api/lineApi';
import { cn, thaiDate } from '@/lib/format';

const shortDate = (iso: string) => thaiDate(iso).slice(0, 6);

/** แท็บ “ข้อมูลจาก LINE” — trend ข้อมูลที่ผู้ป่วยบันทึกเอง + ตั้งค่าการแจ้งเตือนรายผู้ป่วย */
export function LineDataPanel({ person, kind }: { person: PersonRef; kind: PersonKind }) {
  const [days, setDays] = useState<'7' | '30' | '90'>('30');
  const { data } = useAsync(() => lineApi.data(kind, person.id, Number(days)), [kind, person.id, days]);
  const recipient = kind === 'recipient';

  if (!data) return <Skeleton className="h-[600px] rounded-2xl" />;
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
  const over = data.bp.filter((b) => b.sys > BP_LIMIT.sys || b.dia > BP_LIMIT.dia).length;
  const lastW = data.weight[data.weight.length - 1];
  const firstW = data.weight[0];
  const adh = data.adherence.length ? Math.round(avg(data.adherence.map((a) => a.pct))) : null;
  const fluid7 = data.fluid.slice(-7);

  const kpis = [
    { icon: HeartPulse, fg: '#e11d48', bg: '#ffe4e6', k: 'ความดันเฉลี่ย', v: data.bp.length ? `${Math.round(avg(data.bp.map((b) => b.sys)))}/${Math.round(avg(data.bp.map((b) => b.dia)))}` : '—', s: over ? `เกินเกณฑ์ ${over} ครั้ง` : 'ไม่มีค่าเกินเกณฑ์', warn: over > 0 },
    ...(recipient ? [{ icon: Droplet, fg: '#2563eb', bg: '#dbeafe', k: 'น้ำดื่มเฉลี่ย / วัน', v: `${(avg(data.fluid.map((f) => f.intake)) / 1000).toFixed(1)} L`, s: 'เทียบเป้าในตั้งค่าด้านขวา', warn: false }] : []),
    { icon: Scale, fg: '#7c3aed', bg: '#ede9fe', k: 'น้ำหนักล่าสุด', v: lastW ? `${lastW.kg} kg` : '—', s: lastW && firstW ? `${lastW.kg - firstW.kg >= 0 ? '+' : ''}${(lastW.kg - firstW.kg).toFixed(1)} kg ใน ${days} วัน` : '', warn: false },
    ...(recipient && adh != null ? [{ icon: Pill, fg: '#15803d', bg: '#dcfce7', k: 'กินยากดภูมิตรงเวลา', v: `${adh}%`, s: data.missedDoses ? `พลาด ${data.missedDoses} มื้อ` : 'ไม่พลาด', warn: data.missedDoses > 0 }] : []),
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-bold">ข้อมูลที่ผู้ป่วยบันทึกผ่าน LINE</h3>
        {data.lastLoggedAt && <Badge label={`บันทึกล่าสุด ${thaiDate(data.lastLoggedAt)}`} tone={TONES.slate} />}
        <span className="flex-1" />
        <Segmented value={days} onChange={(v) => setDays(v as '7' | '30' | '90')} options={[{ value: '7', label: '7 วัน' }, { value: '30', label: '30 วัน' }, { value: '90', label: '90 วัน' }]} />
      </div>

      <div className={cn('grid gap-4', kpis.length === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2')}>
        {kpis.map((k, i) => (
          <motion.div key={k.k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex items-center gap-2.5 text-[13px] text-slate-500">
              <span className="grid h-9 w-9 place-items-center rounded-[10px]" style={{ background: k.bg, color: k.fg }}>
                <k.icon className="h-[18px] w-[18px]" />
              </span>
              {k.k}
            </span>
            <span className="text-[26px] font-bold">{k.v}</span>
            <span className={cn('text-[12.5px] font-medium', k.warn ? 'text-orange-700' : 'text-slate-500')}>{k.s}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <Card className="flex flex-col gap-3 p-5">
            <CardHeader title="ความดันโลหิต" subtitle={`ค่าที่เกินเกณฑ์ (${BP_LIMIT.sys}/${BP_LIMIT.dia}) แสดงเป็นจุดสีส้ม`} icon={HeartPulse} iconTone={{ fg: '#e11d48', bg: '#ffe4e6' }} />
            {data.bp.length ? (
              <LineChart min={50} max={170} limit={BP_LIMIT.sys} limitLabel={String(BP_LIMIT.sys)} labels={data.bp.map((b) => shortDate(b.at))} series={[{ name: 'ตัวบน', color: '#e11d48', values: data.bp.map((b) => b.sys), limit: BP_LIMIT.sys }, { name: 'ตัวล่าง', color: '#fb7185', values: data.bp.map((b) => b.dia), limit: BP_LIMIT.dia }]} />
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">ยังไม่มีข้อมูลในช่วงนี้</p>
            )}
          </Card>
          <div className="grid gap-5 lg:grid-cols-2">
            {recipient && (
              <Card className="flex flex-col gap-3 p-5">
                <CardHeader title="น้ำเข้า – น้ำออก" subtitle="7 วันล่าสุด" icon={Droplet} />
                <div className="flex h-[150px] items-end gap-3 pt-2">
                  {fluid7.map((f) => (
                    <div key={f.date} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-[120px] items-end gap-1">
                        <motion.span initial={{ height: 0 }} animate={{ height: (f.intake / 3000) * 120 }} className="w-2.5 rounded bg-blue-600" title={`ดื่ม ${f.intake} ml`} />
                        <motion.span initial={{ height: 0 }} animate={{ height: (f.urine / 3000) * 120 }} className="w-2.5 rounded bg-cyan-300" title={`ปัสสาวะ ${f.urine} ml`} />
                      </div>
                      <span className="text-[10.5px] text-slate-400">{shortDate(f.date).split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-3 rounded bg-blue-600" /> ดื่ม
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-3 rounded bg-cyan-300" /> ปัสสาวะ
                  </span>
                </div>
              </Card>
            )}
            <Card className={cn('flex flex-col gap-3 p-5', !recipient && 'lg:col-span-2')}>
              <CardHeader title="น้ำหนัก" subtitle={`${days} วัน`} icon={Scale} iconTone={{ fg: '#7c3aed', bg: '#ede9fe' }} />
              {data.weight.length > 1 ? (
                <LineChart height={150} min={Math.floor(Math.min(...data.weight.map((w) => w.kg)) - 1)} max={Math.ceil(Math.max(...data.weight.map((w) => w.kg)) + 1)} labels={data.weight.map((w) => shortDate(w.date))} series={[{ name: 'น้ำหนัก', color: '#7c3aed', values: data.weight.map((w) => w.kg) }]} />
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">ข้อมูลไม่พอแสดงกราฟ</p>
              )}
            </Card>
          </div>
          {recipient && data.adherence.length > 0 && (
            <Card className="flex flex-col gap-4 p-5">
              <CardHeader title="การกินยา (ยืนยันผ่าน LINE)" subtitle="รายสัปดาห์ · กด “กินแล้ว” ในข้อความเตือน" icon={Pill} iconTone={{ fg: '#15803d', bg: '#dcfce7' }} />
              <div className="grid gap-4 sm:grid-cols-4">
                {data.adherence.map((a) => (
                  <div key={a.label} className="flex flex-col gap-1.5">
                    <span className="flex text-[12.5px] text-slate-500">
                      {a.label}
                      <span className="flex-1" />
                      <b className={a.pct < 100 ? 'text-orange-700' : 'text-green-700'}>{a.pct}%</b>
                    </span>
                    <span className="h-2 overflow-hidden rounded bg-slate-100">
                      <motion.span className={cn('block h-full rounded', a.pct < 100 ? 'bg-amber-500' : 'bg-green-500')} initial={{ width: 0 }} animate={{ width: `${a.pct}%` }} />
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="flex w-full flex-col gap-5 xl:w-[340px]">
          <Card className="flex flex-col gap-2 p-5">
            <CardHeader title="ค่าที่เกินเกณฑ์" subtitle={`${days} วันล่าสุด`} icon={AlertTriangle} iconTone={{ fg: '#ea580c', bg: '#ffedd5' }} right={<Badge label={String(data.abnormal.length)} tone={TONES.orange} />} />
            {data.abnormal.length === 0 && <p className="py-3 text-sm text-slate-400">ไม่มี</p>}
            {data.abnormal.map((a, i) => (
              <div key={i} className={cn('flex items-center gap-2.5 py-2 text-[13.5px]', i > 0 && 'border-t border-slate-100')}>
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-semibold">{a.text}</span>
                <span className="flex-1" />
                <span className="text-xs text-slate-400">{thaiDate(a.at)}</span>
              </div>
            ))}
          </Card>
          {recipient && data.temp.length > 0 && (
            <Card className="p-5">
              <CardHeader title="อุณหภูมิ" subtitle={`ล่าสุด ${data.temp[data.temp.length - 1].c}°C · ${data.temp.some((t) => t.c >= 38) ? 'มีไข้' : 'ไม่มีไข้'}ใน 30 วัน`} icon={Thermometer} iconTone={{ fg: '#0891b2', bg: '#cffafe' }} />
            </Card>
          )}
          <NotifySettingsCard person={person} kind={kind} />
        </div>
      </div>
    </div>
  );
}

/** ตั้งค่าการแจ้งเตือนรายผู้ป่วย: เป้าดื่มน้ำ (เฉพาะผู้รับ) + เวลาเตือนกินยา · มีค่าเริ่มต้น */
function NotifySettingsCard({ person, kind }: { person: PersonRef; kind: PersonKind }) {
  const [s, setS] = useState<NotifySettingsDto | null>(null);
  const [edit, setEdit] = useState(false);
  const [fluid, setFluid] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    lineApi.settings(kind, person.id).then(setS);
  }, [kind, person.id]);
  if (!s) return <Skeleton className="h-40 rounded-2xl" />;
  const open = () => {
    setFluid(String(s.fluidTargetMl));
    setTimes([...s.medTimes]);
    setEdit(true);
  };
  const save = async () => {
    setSaving(true);
    setS(await lineApi.saveSettings(kind, person.id, { fluidTargetMl: Number(fluid) || s.fluidTargetMl, medTimes: times.filter(Boolean) }));
    setSaving(false);
    setEdit(false);
  };
  const Row = ({ icon: I, k, v, def }: { icon: typeof Droplet; k: string; v: string; def: boolean }) => (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3">
      <span className="flex items-center gap-2 text-[13px] font-semibold">
        <I className="h-4 w-4 text-primary" /> {k}
      </span>
      <span className="flex items-center gap-2">
        <b className="text-base">{v}</b>
        {def && <Badge label="ค่าเริ่มต้น" tone={TONES.slate} />}
      </span>
    </div>
  );
  return (
    <Card className="flex flex-col gap-3 p-5">
      <CardHeader title="ตั้งค่าการแจ้งเตือน" subtitle="เฉพาะผู้ป่วยรายนี้" icon={Settings2} iconTone={{ fg: '#475569', bg: '#f1f5f9' }} right={<Button size="sm" variant="ghost" icon={Pencil} onClick={open}>แก้ไข</Button>} />
      {kind === 'recipient' && <Row icon={Droplet} k="เป้าหมายดื่มน้ำต่อวัน" v={`${s.fluidTargetMl.toLocaleString()} ml`} def={s.fluidIsDefault} />}
      <Row icon={Clock} k="เวลาเตือนกินยา" v={s.medTimes.join(' · ')} def={s.medTimesIsDefault} />
      <p className="flex items-start gap-2 text-xs text-slate-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> เกณฑ์ความดัน ({BP_LIMIT.sys}/{BP_LIMIT.dia}) ใช้ค่ากลางของระบบ
      </p>
      <Modal open={edit} onClose={() => setEdit(false)} width={440}>
        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">ตั้งค่าการแจ้งเตือน</p>
          {kind === 'recipient' && (
            <Field label="เป้าหมายดื่มน้ำต่อวัน" hint="(ค่าเริ่มต้น 2,500 ml)">
              <TextInput inputMode="numeric" suffix="ml" value={fluid} onChange={(e) => setFluid(e.target.value.replace(/\D/g, ''))} />
            </Field>
          )}
          <Field label="เวลาเตือนกินยา" hint="(ค่าเริ่มต้น 08:00 · 20:00)">
            <div className="flex flex-col gap-2">
              {times.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput type="time" value={t} onChange={(e) => setTimes(times.map((x, j) => (j === i ? e.target.value : x)))} />
                  <button type="button" onClick={() => setTimes(times.filter((_, j) => j !== i))} className="rounded-lg px-2 text-slate-400 hover:bg-slate-100" aria-label="ลบ">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {times.length < 4 && (
                <button type="button" onClick={() => setTimes([...times, '12:00'])} className="w-fit text-[13px] font-semibold text-primary">
                  + เพิ่มเวลา
                </button>
              )}
            </div>
          </Field>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => { setFluid('2500'); setTimes(['08:00', '20:00']); }}>
              คืนค่าเริ่มต้น
            </Button>
            <span className="flex gap-2">
              <Button variant="secondary" onClick={() => setEdit(false)}>
                ยกเลิก
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'กำลังบันทึก…' : 'บันทึก'}
              </Button>
            </span>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
