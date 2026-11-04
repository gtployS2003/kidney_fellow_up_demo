import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ClipboardCheck, Home, Pill, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PersonKind, PersonRef } from '@/types';
import type { DischargeChecklist, DischargeFollow, DischargeMeds, DischargeSummary } from '@/services/api/postopApi';
import { FormShell } from '@/components/forms/FormShell';
import { Box, FSection, FormLoading } from '@/components/forms/FormBits';
import { Field, TextInput, Textarea } from '@/components/ui/Form';
import { Badge, TONES } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { A4Page, LogoBox, Row, tableStyle, td, th } from '@/components/paper/Paper';
import { cn, fullName, thaiDate } from '@/lib/format';
import { SubNav, usePostop } from './common';

interface P {
  person: PersonRef;
  kind: PersonKind;
  filled: boolean;
}

function Head({ person, title }: { person: PersonRef; title: string }) {
  return (
    <>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
      </Row>
      <div>
        {fullName(person)} · HN {person.hn} · อายุ {person.age} ปี
      </div>
    </>
  );
}

export function DischargePanel({ person, kind, filled }: P) {
  const [sel, setSel] = useState('checklist');
  const items = [
    { key: 'checklist', num: '1', title: 'Checklist', sub: 'รายการที่ต้องทำก่อนจำหน่าย', icon: ClipboardCheck, tint: '#dcfce7', fg: '#16a34a', badge: filled ? 1 : undefined },
    { key: 'summary', num: '2', title: 'สรุปการจำหน่าย', sub: 'Discharge summary', icon: Home, tint: '#e0f2fe', fg: '#0369a1', done: filled },
    { key: 'meds', num: '3', title: 'ยากลับบ้าน', sub: 'รายการยาและวิธีใช้', icon: Pill, tint: '#fce7f3', fg: '#be185d', done: filled },
    { key: 'follow', num: '4', title: 'นัดหมายติดตาม', sub: 'นัด OPD ครั้งแรก / ถอด DJ stent', icon: CalendarDays, tint: '#fef9c3', fg: '#a16207', done: filled },
  ];
  return (
    <SubNav items={items} sel={sel} onSel={setSel}>
      {sel === 'checklist' && <Checklist person={person} kind={kind} filled={filled} />}
      {sel === 'summary' && <Summary person={person} kind={kind} filled={filled} />}
      {sel === 'meds' && <Meds person={person} kind={kind} filled={filled} />}
      {sel === 'follow' && <Follow person={person} kind={kind} filled={filled} />}
    </SubNav>
  );
}

function Checklist({ person, kind, filled }: P) {
  const { data: f, patch, save, info } = usePostop<DischargeChecklist>(kind, person, 'dcChecklist', filled);
  if (!f) return <FormLoading />;
  const done = f.items.filter((i) => i.done).length;
  const set = (i: number, p: Partial<DischargeChecklist['items'][number]>) => patch({ items: f.items.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <FormShell
      title="Discharge checklist"
      desc="1 ก่อนกลับบ้าน · รายการที่ต้องทำให้ครบก่อนจำหน่ายผู้ป่วย"
      icon={ClipboardCheck}
      gradient={['#22c55e', '#16a34a']}
      patient={person}
      dateLabel="วันที่จำหน่าย"
      date={f.date}
      onDate={(date) => patch({ date })}
      onSave={() => save()}
      savedInfo={info}
      fileName={`KT-discharge-checklist-${person.hn}`}
      preview={
        <A4Page>
          <Head person={person} title="Discharge checklist" />
          <table style={tableStyle}>
            <thead>
              <tr>
                {['#', 'รายการ', 'ทำแล้ว', 'ผู้ดำเนินการ', 'วันที่'].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.items.map((it, i) => (
                <tr key={i}>
                  <td style={{ ...td, textAlign: 'center' }}>{i + 1}</td>
                  <td style={td}>{it.label}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{it.done ? '✓' : ''}</td>
                  <td style={td}>{it.by}</td>
                  <td style={td}>{it.date ? thaiDate(it.date) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      }
    >
      <FSection title={`ทำแล้ว ${done} จาก ${f.items.length} รายการ`} right={done < f.items.length ? <Badge label={`ค้าง ${f.items.length - done}`} tone={TONES.red} dot /> : <Badge label="ครบแล้ว" tone={TONES.green} dot />}>
        <AnimatePresence initial={false}>
          {f.items.map((it, i) => (
            <motion.div key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={cn('flex flex-wrap items-center gap-3 rounded-[10px] px-3 py-2', it.done ? 'border-t border-slate-100' : 'bg-orange-50')}>
              <Box checked={it.done} onChange={(v) => set(i, { done: v, date: v && !it.date ? new Date().toISOString().slice(0, 10) : it.date })} />
              <TextInput className={cn('!h-9 min-w-[220px] flex-1 !border-transparent !bg-transparent !px-1 !text-sm', it.done ? '' : '!text-orange-800')} value={it.label} onChange={(e) => set(i, { label: e.target.value })} />
              <TextInput className="!h-9 !w-[150px]" placeholder="ผู้ดำเนินการ" value={it.by} onChange={(e) => set(i, { by: e.target.value })} />
              <TextInput type="date" className="!h-9 !w-[150px]" value={it.date} onChange={(e) => set(i, { date: e.target.value })} />
              <button type="button" onClick={() => patch({ items: f.items.filter((_, j) => j !== i) })} className="rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500" aria-label="ลบ">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="secondary" size="sm" icon={Plus} className="w-fit" onClick={() => patch({ items: [...f.items, { label: 'รายการใหม่', done: false, by: '', date: '' }] })}>
          เพิ่มรายการ
        </Button>
      </FSection>
    </FormShell>
  );
}

function Summary({ person, kind, filled }: P) {
  const { data: f, patch, save, info } = usePostop<DischargeSummary>(kind, person, 'dcSummary', filled);
  if (!f) return <FormLoading />;
  const rows: [string, keyof DischargeSummary][] = [
    ['วันที่ admit', 'admitDate'],
    ['จำนวนวันนอน (LOS)', 'los'],
    ['Creatinine ก่อนกลับ (mg/dL)', 'finalCr'],
    ['สภาพผู้ป่วยวันจำหน่าย', 'condition'],
  ];
  return (
    <FormShell title="สรุปการจำหน่าย" desc="2 ก่อนกลับบ้าน · Discharge summary" icon={Home} gradient={['#0ea5e9', '#0369a1']} patient={person} dateLabel="วันที่จำหน่าย" date={f.date} onDate={(date) => patch({ date })} onSave={() => save()} savedInfo={info} fileName={`KT-discharge-summary-${person.hn}`}
      preview={
        <A4Page>
          <Head person={person} title="Discharge summary" />
          <table style={tableStyle}>
            <tbody>
              {[...rows, ['Diagnosis', 'diagnosis'] as [string, keyof DischargeSummary]].map(([l, k]) => (
                <tr key={k}>
                  <td style={{ ...td, width: 220, background: '#f8fafc' }}>{l}</td>
                  <td style={td}>{k === 'admitDate' ? thaiDate(f[k]) : f[k]}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...td, background: '#f8fafc' }}>สรุปการรักษา</td>
                <td style={{ ...td, height: 90 }}>{f.summary}</td>
              </tr>
            </tbody>
          </table>
        </A4Page>
      }
    >
      <FSection title="Discharge summary" tags={['his']}>
        <div className="grid gap-3.5 md:grid-cols-2">
          {rows.map(([l, k]) => (
            <Field key={k} label={l}>
              <TextInput type={k === 'admitDate' ? 'date' : 'text'} value={f[k]} onChange={(e) => patch({ [k]: e.target.value } as Partial<DischargeSummary>)} />
            </Field>
          ))}
        </div>
        <Field label="Diagnosis">
          <TextInput value={f.diagnosis} onChange={(e) => patch({ diagnosis: e.target.value })} />
        </Field>
        <Field label="สรุปการรักษา">
          <Textarea value={f.summary} onChange={(e) => patch({ summary: e.target.value })} />
        </Field>
      </FSection>
    </FormShell>
  );
}

function Meds({ person, kind, filled }: P) {
  const { data: f, patch, save, info } = usePostop<DischargeMeds>(kind, person, 'dcMeds', filled);
  if (!f) return <FormLoading />;
  const set = (i: number, p: Partial<DischargeMeds['meds'][number]>) => patch({ meds: f.meds.map((m, j) => (j === i ? { ...m, ...p } : m)) });
  return (
    <FormShell title="ยากลับบ้าน" desc="3 ก่อนกลับบ้าน · รายการยาและวิธีใช้ (ส่งต่อให้ LINE OA เตือนกินยา)" icon={Pill} gradient={['#ec4899', '#be185d']} patient={person} dateLabel="วันที่จำหน่าย" date={f.date} onDate={(date) => patch({ date })} onSave={() => save()} savedInfo={info} fileName={`KT-home-meds-${person.hn}`}
      preview={
        <A4Page>
          <Head person={person} title="รายการยากลับบ้าน" />
          <table style={tableStyle}>
            <thead>
              <tr>
                {['ชื่อยา', 'ขนาด', 'วิธีใช้', 'หมายเหตุ'].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.meds.map((m, i) => (
                <tr key={i}>
                  <td style={td}>{m.name}</td>
                  <td style={td}>{m.dose}</td>
                  <td style={td}>{m.how}</td>
                  <td style={td}>{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      }
    >
      <FSection title="รายการยา" tags={['his']} right={<Button variant="secondary" size="sm" icon={Plus} onClick={() => patch({ meds: [...f.meds, { name: '', dose: '', how: '', note: '' }] })}>เพิ่มยา</Button>}>
        {f.meds.length === 0 && <p className="text-[13px] text-slate-400">ยังไม่มีรายการยา</p>}
        {f.meds.map((m, i) => (
          <div key={i} className="grid grid-cols-[18px_1.2fr_110px_1.4fr_1fr_28px] items-center gap-2.5 rounded-[10px] bg-slate-50 px-3 py-2">
            <Pill className="h-4 w-4 text-pink-700" />
            <TextInput className="!h-8" placeholder="ชื่อยา" value={m.name} onChange={(e) => set(i, { name: e.target.value })} />
            <TextInput className="!h-8" placeholder="ขนาด" value={m.dose} onChange={(e) => set(i, { dose: e.target.value })} />
            <TextInput className="!h-8" placeholder="วิธีใช้" value={m.how} onChange={(e) => set(i, { how: e.target.value })} />
            <TextInput className="!h-8" placeholder="หมายเหตุ" value={m.note} onChange={(e) => set(i, { note: e.target.value })} />
            <button type="button" onClick={() => patch({ meds: f.meds.filter((_, j) => j !== i) })} className="rounded p-1 text-slate-400 hover:bg-slate-200" aria-label="ลบ">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </FSection>
    </FormShell>
  );
}

function Follow({ person, kind, filled }: P) {
  const { data: f, patch, save, info } = usePostop<DischargeFollow>(kind, person, 'dcFollow', filled);
  if (!f) return <FormLoading />;
  const set = (i: number, p: Partial<DischargeFollow['appts'][number]>) => patch({ appts: f.appts.map((a, j) => (j === i ? { ...a, ...p } : a)) });
  return (
    <FormShell title="นัดหมายติดตาม" desc="4 ก่อนกลับบ้าน · นัดที่บันทึกที่นี่จะแสดงในปฏิทินนัดหมาย" icon={CalendarDays} gradient={['#facc15', '#ca8a04']} patient={person} dateLabel="วันที่จำหน่าย" date={f.date} onDate={(date) => patch({ date })} onSave={() => save()} savedInfo={info} fileName={`KT-follow-up-${person.hn}`}
      preview={
        <A4Page>
          <Head person={person} title="นัดหมายติดตามหลังจำหน่าย" />
          <table style={tableStyle}>
            <thead>
              <tr>
                {['นัด', 'วันที่', 'สถานที่'].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.appts.map((a, i) => (
                <tr key={i}>
                  <td style={td}>{a.label}</td>
                  <td style={td}>{thaiDate(a.date)}</td>
                  <td style={td}>{a.place}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      }
    >
      <FSection title="นัดหลังจำหน่าย" right={<Button variant="secondary" size="sm" icon={Plus} onClick={() => patch({ appts: [...f.appts, { label: '', date: '', place: '' }] })}>เพิ่มนัด</Button>}>
        {f.appts.map((a, i) => (
          <div key={i} className="grid grid-cols-[1.2fr_170px_1.4fr_28px] items-center gap-2.5 rounded-[10px] bg-slate-50 px-3 py-2">
            <TextInput className="!h-9" placeholder="นัดอะไร" value={a.label} onChange={(e) => set(i, { label: e.target.value })} />
            <TextInput type="date" className="!h-9" value={a.date} onChange={(e) => set(i, { date: e.target.value })} />
            <TextInput className="!h-9" placeholder="สถานที่" value={a.place} onChange={(e) => set(i, { place: e.target.value })} />
            <button type="button" onClick={() => patch({ appts: f.appts.filter((_, j) => j !== i) })} className="rounded p-1 text-slate-400 hover:bg-slate-200" aria-label="ลบ">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Link to="/clinical/appointments" className="w-fit text-[13px] font-semibold text-primary hover:underline">
          ไปปฏิทินนัดหมาย →
        </Link>
      </FSection>
    </FormShell>
  );
}
