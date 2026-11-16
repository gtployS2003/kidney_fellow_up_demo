import { ErrorState } from '@/components/brand/BuddyStates';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Database, FlaskConical, Info, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import type { AppointmentDto, PersonKind } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, TONES } from '@/components/ui/Badge';
import { Checkbox, DataTag, Field, Select, TextInput, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { appointmentApi } from '@/services/api/appointmentApi';
import { holidayOf } from '@/lib/holidays';
import { cn, isoDate } from '@/lib/format';

const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const TH_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const RS = {
  ok: { label: 'ผลออกแล้ว', tone: TONES.green },
  wait: { label: 'รอผล', tone: TONES.amber },
  none: { label: 'ยังไม่ส่งตรวจ', tone: TONES.slate },
};

export default function AppointmentCalendar() {
  useCrumbs(['นัดหมาย']);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const today = isoDate(new Date());
  const [sel, setSel] = useState(params.get('date') ?? today);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(sel);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [kind, setKind] = useState<'all' | PersonKind>('all');
  const [stage, setStage] = useState('all');
  const [syncedAt, setSyncedAt] = useState(new Date());
  const [modal, setModal] = useState<{ open: boolean; edit?: AppointmentDto }>({ open: false });

  // ช่วงวันที่ของตารางเดือน (เริ่มวันอาทิตย์)
  const grid = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(1 - start.getDay());
    const weeks = Math.ceil((cursor.getDay() + new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()) / 7);
    return Array.from({ length: weeks * 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return isoDate(d);
    });
  }, [cursor]);

  const { data, loading, error, reload } = useAsync(() => appointmentApi.range(grid[0], grid[grid.length - 1]), [grid[0]]);
  const all = data ?? [];
  const stages = [...new Set(all.map((a) => a.stage))];
  const rows = all.filter((a) => (kind === 'all' || a.personKind === kind) && (stage === 'all' || a.stage === stage));
  const byDay = useMemo(() => {
    const m = new Map<string, AppointmentDto[]>();
    rows.forEach((a) => m.set(a.date, [...(m.get(a.date) ?? []), a]));
    return m;
  }, [rows]);
  const dayRows = byDay.get(sel) ?? [];

  useEffect(() => {
    setParams({ date: sel }, { replace: true });
  }, [sel, setParams]);

  const move = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  const goToday = () => {
    setSel(today);
    setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  };
  const selDate = new Date(sel);
  const counts = { ok: dayRows.filter((a) => a.resultStatus === 'ok').length, wait: dayRows.filter((a) => a.resultStatus === 'wait').length, none: dayRows.filter((a) => a.resultStatus === 'none').length };

  return (
    <>
      <PageHeader
        title="นัดหมาย KT clinic"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <DataTag kind="his" /> เฉพาะผู้ป่วยที่ลงทะเบียนในระบบ · sync ล่าสุด {syncedAt.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={() => { setSyncedAt(new Date()); reload(); }}>
              sync iMed
            </Button>
            <Button icon={Plus} onClick={() => setModal({ open: true })}>
              สร้างนัดหมายใหม่
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <ErrorState title="โหลดนัดหมายจาก iMed ไม่สำเร็จ" desc="ระบบ iMed ไม่ตอบสนองในขณะนี้ · ข้อมูลที่บันทึกในระบบยังปลอดภัย" onRetry={reload} code={error} />
        </div>
      )}
      <div className="flex items-start gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-[18px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <NavBtn onClick={() => move(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </NavBtn>
            <>
              <motion.h2 key={cursor.toISOString()} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="min-w-[150px] text-center text-lg font-bold">
                {TH_MONTHS[cursor.getMonth()]} {cursor.getFullYear() + 543}
              </motion.h2>
            </>
            <NavBtn onClick={() => move(1)}>
              <ChevronRight className="h-4 w-4" />
            </NavBtn>
            <Button variant="secondary" size="sm" onClick={goToday}>
              วันนี้
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select className="!h-9 !w-auto !text-[13px]" value={kind} onChange={(e) => setKind(e.target.value as 'all' | PersonKind)}>
              <option value="all">ประเภท: ทั้งหมด</option>
              <option value="recipient">ผู้รับ</option>
              <option value="donor">ผู้บริจาค</option>
            </Select>
            <Select className="!h-9 !w-auto !text-[13px]" value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="all">ขั้นตอน: ทั้งหมด</option>
              {stages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <span className="flex-1" />
            {[
              ['#2563eb', 'ผู้รับ (R)'],
              ['#0f766e', 'ผู้บริจาค (D)'],
              ['#7c3aed', 'นัดที่สร้างในระบบ'],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ background: c }} /> {l}
              </span>
            ))}
          </div>

          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            <div className="grid grid-cols-7 bg-slate-50">
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d, i) => (
                <span key={d} className={cn('py-2 text-center text-xs font-semibold', i === 0 || i === 6 ? 'text-red-600' : 'text-slate-500')}>
                  {d}
                </span>
              ))}
            </div>
            <>
              <motion.div key={grid[0]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="grid grid-cols-7">
                {grid.map((day, i) => {
                  const d = new Date(day);
                  const other = d.getMonth() !== cursor.getMonth();
                  const we = d.getDay() === 0 || d.getDay() === 6;
                  const hol = holidayOf(day);
                  const list = other ? [] : byDay.get(day) ?? [];
                  const r = list.filter((a) => a.personKind === 'recipient' && a.source === 'imed').length;
                  const dn = list.filter((a) => a.personKind === 'donor' && a.source === 'imed').length;
                  const m = list.filter((a) => a.source === 'manual').length;
                  const isSel = day === sel;
                  const isToday = day === today;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={other}
                      onClick={() => setSel(day)}
                      className={cn(
                        'relative flex h-[104px] flex-col gap-1 border-t border-slate-200 p-2 text-left transition-colors',
                        i % 7 !== 6 && 'border-r',
                        other || we || hol ? 'bg-slate-50/70' : 'bg-white hover:bg-blue-50/50',
                      )}
                    >
                      {isSel && <motion.span layoutId="cal-sel" className="absolute inset-0 border-2 border-primary bg-blue-50/60" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                      <span className="relative flex items-center gap-1">
                        <span className={cn('grid h-[26px] min-w-[26px] place-items-center rounded-full text-[13px] font-semibold', isToday ? 'bg-primary text-white' : other ? 'text-slate-300' : we || hol ? 'text-red-600' : 'text-slate-900')}>{d.getDate()}</span>
                        {isToday && <span className="ml-auto text-[10.5px] font-semibold text-primary">วันนี้</span>}
                      </span>
                      {!other && hol && <span className="relative text-[10.5px] leading-tight text-red-600">{hol}</span>}
                      {list.length > 0 && (
                        <>
                          <span className="relative text-[13px] font-bold">{list.length} นัด</span>
                          <span className="relative flex flex-wrap gap-1">
                            {r > 0 && <Chip c="bg-blue-100 text-blue-700">R {r}</Chip>}
                            {dn > 0 && <Chip c="bg-teal-100 text-teal-700">D {dn}</Chip>}
                            {m > 0 && <Chip c="bg-violet-100 text-violet-700">เพิ่ม {m}</Chip>}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </>
          </div>
        </div>

        {/* นัดของวันที่เลือก */}
        <div className="sticky top-24 flex w-[420px] shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-[18px]">
          <div>
            <p className="text-[17px] font-bold">
              {TH_DAYS[selDate.getDay()]} {selDate.getDate()} {TH_MONTHS[selDate.getMonth()]} {selDate.getFullYear() + 543}
            </p>
            <p className="text-[12.5px] text-slate-500">{holidayOf(sel) ? `วันหยุด · ${holidayOf(sel)}` : `นัดทั้งหมด ${dayRows.length} ราย`}</p>
          </div>
          {dayRows.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Badge label={`ผลออกแล้ว ${counts.ok}`} tone={TONES.green} dot />
              <Badge label={`รอผล ${counts.wait}`} tone={TONES.amber} dot />
              <Badge label={`ยังไม่ส่งตรวจ ${counts.none}`} tone={TONES.slate} dot />
            </div>
          )}
          <div className="flex max-h-[calc(100vh-280px)] flex-col gap-2 overflow-y-auto pr-1">
            {loading && <Skeleton className="h-24" />}
            <AnimatePresence mode="popLayout">
              {dayRows.map((a, i) => (
                <motion.div
                  layout
                  key={a.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}
                  exit={{ opacity: 0 }}
                  className={cn('flex gap-2.5 rounded-xl border p-2.5', a.source === 'manual' ? 'border-violet-300 bg-violet-50/60' : 'border-slate-200')}
                >
                  <div className="flex w-11 flex-col gap-1">
                    <span className="text-[13px] font-bold">{a.time}</span>
                    <span className={cn('w-fit rounded px-1.5 text-[10.5px] font-bold', a.personKind === 'recipient' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700')}>{a.personKind === 'recipient' ? 'R' : 'D'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="flex-1 truncate text-[13.5px] font-semibold">{a.name}</span>
                      {a.source === 'manual' && (
                        <>
                          <button type="button" onClick={() => setModal({ open: true, edit: a })} className="rounded p-1 text-violet-600 hover:bg-violet-100" aria-label="แก้ไข">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={async () => { await appointmentApi.remove(a.id); reload(); }} className="rounded p-1 text-red-500 hover:bg-red-50" aria-label="ลบ">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-[11.5px] text-slate-500">
                      HN {a.hn} · {a.stage}
                    </p>
                    <p className="text-[11.5px] text-slate-400">
                      {a.type} · {a.room}
                    </p>
                    {a.note && <p className="text-[11.5px] text-violet-700">{a.note}</p>}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {a.source === 'manual' && <Badge label="สร้างในระบบ" tone={TONES.violet} dot />}
                      <Badge label={RS[a.resultStatus].label} tone={RS[a.resultStatus].tone} dot />
                      <button
                        type="button"
                        disabled={a.resultStatus === 'none'}
                        onClick={() => navigate(`/clinical/${a.personKind === 'recipient' ? 'recipients' : 'donors'}/${a.personId}?tab=lab&from=appt&date=${a.date}`)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:text-slate-300 disabled:no-underline"
                      >
                        <FlaskConical className="h-3.5 w-3.5" /> ดูผลแล็บล่าสุด
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {!loading && dayRows.length === 0 && <p className="py-8 text-center text-sm text-slate-400">ไม่มีนัดในวันนี้</p>}
          </div>
          <p className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
            <Info className="h-3.5 w-3.5" /> นัดจาก iMed แก้ไขไม่ได้ · นัดที่สร้างในระบบ (สีม่วง) แก้ไข/ลบได้
          </p>
        </div>
      </div>

      <AppointmentModal
        open={modal.open}
        edit={modal.edit}
        defaultDate={sel}
        onClose={() => setModal({ open: false })}
        onSaved={(a) => {
          setModal({ open: false });
          setSel(a.date);
          const d = new Date(a.date);
          setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
          reload();
        }}
      />
    </>
  );
}

function NavBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="grid h-[34px] w-[34px] place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
      {children}
    </button>
  );
}

function Chip({ c, children }: { c: string; children: ReactNode }) {
  return <span className={cn('rounded-[5px] px-1.5 py-px text-[10.5px] font-semibold', c)}>{children}</span>;
}

const TYPES = ['ติดตาม OPD', 'Pre-KT evaluation', 'ตรวจเพิ่มเติม (crossmatch)', 'เจาะเลือดส่ง serum', 'อื่นๆ'];

function AppointmentModal({ open, edit, defaultDate, onClose, onSaved }: { open: boolean; edit?: AppointmentDto; defaultDate: string; onClose: () => void; onSaved: (a: AppointmentDto) => void }) {
  const people = useAsync(() => appointmentApi.people(), []);
  const [q, setQ] = useState('');
  const [person, setPerson] = useState<{ kind: PersonKind; id: string; name: string; hn: string } | null>(null);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState(TYPES[0]);
  const [room, setRoom] = useState('');
  const [doctor, setDoctor] = useState('นพ.สมเกียรติ วงศ์ไทย');
  const [note, setNote] = useState('');
  const [notify, setNotify] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setPerson(edit ? { kind: edit.personKind, id: edit.personId, name: edit.name, hn: edit.hn } : null);
    setDate(edit?.date ?? defaultDate);
    setTime(edit?.time ?? '09:00');
    setType(edit?.type ?? TYPES[0]);
    setRoom(edit?.room ?? '');
    setDoctor(edit?.doctor ?? 'นพ.สมเกียรติ วงศ์ไทย');
    setNote(edit?.note ?? '');
  }, [open, edit, defaultDate]);

  const matches = q.trim().length >= 1 ? (people.data ?? []).filter((p) => `${p.name} ${p.hn}`.includes(q.trim())).slice(0, 6) : [];

  async function save() {
    if (!person) return;
    setSaving(true);
    const a = edit
      ? await appointmentApi.update({ ...edit, date, time, type, room, doctor, note })
      : await appointmentApi.create({ personKind: person.kind, personId: person.id, date, time, type, room, doctor, note, notifyLine: notify });
    setSaving(false);
    onSaved(a);
  }

  return (
    <Modal open={open} onClose={onClose} width={560}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-lg font-bold">{edit ? 'แก้ไขนัดหมาย' : 'สร้างนัดหมายใหม่'}</p>
          <p className="text-[12.5px] text-slate-500">สำหรับนัดนอกเหนือจากที่ดึงจาก iMed</p>
        </div>
        <Field label="ผู้ป่วย" required hint="(เฉพาะผู้ที่ลงทะเบียนในระบบ)">
          {person ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
              <span className={cn('rounded px-1.5 text-[10.5px] font-bold', person.kind === 'recipient' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700')}>{person.kind === 'recipient' ? 'R' : 'D'}</span>
              <span className="flex-1 text-sm font-semibold">
                {person.name} · HN {person.hn}
              </span>
              {!edit && (
                <button type="button" onClick={() => setPerson(null)} className="text-xs font-semibold text-primary">
                  เปลี่ยน
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <label className="flex h-[42px] items-center gap-2 rounded-lg border border-slate-300 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อ / HN" className="w-full bg-transparent text-sm outline-none" />
              </label>
              {matches.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop">
                  {matches.map((p) => (
                    <button key={p.id} type="button" onClick={() => setPerson(p)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50">
                      <span className={cn('rounded px-1.5 text-[10.5px] font-bold', p.kind === 'recipient' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700')}>{p.kind === 'recipient' ? 'R' : 'D'}</span>
                      <span className="flex-1">{p.name}</span>
                      <span className="text-xs text-slate-400">HN {p.hn}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="วันที่" required>
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="เวลา" required>
            <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="ประเภทนัด" required>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="สถานที่ / ห้อง">
            <TextInput value={room} onChange={(e) => setRoom(e.target.value)} placeholder="เช่น ห้อง Lab" />
          </Field>
        </div>
        <Field label="แพทย์ / ผู้รับผิดชอบ">
          <Select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
            <option>นพ.สมเกียรติ วงศ์ไทย</option>
            <option>พญ.อรุณี ใจดี</option>
            <option>พย.วิภา สุขใจ</option>
          </Select>
        </Field>
        <Field label="หมายเหตุ">
          <Textarea className="!min-h-[64px]" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        {!edit && (
          <div className="flex items-center gap-2">
            <Checkbox checked={notify} onChange={setNotify} label="แจ้งเตือนผู้ป่วยผ่าน LINE" />
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10.5px] font-semibold text-amber-800">? รอถามหน้างาน</span>
          </div>
        )}
        <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <Database className="h-3.5 w-3.5" /> นัดนี้บันทึกในระบบ KT เท่านั้น (ไม่ส่งเข้า iMed) — รอถามหน้างาน
        </p>
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button icon={Plus} disabled={!person || !date || !time || saving} onClick={save}>
            {saving ? 'กำลังบันทึก…' : edit ? 'บันทึกการแก้ไข' : 'บันทึกนัดหมาย'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
