import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Pill, Plus, Stethoscope, X } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import type { Complication, MedAdjust, OpdComplications, OpdMeds, OpdVisit, OpdVisits } from '@/services/api/postopApi';
import { FormShell } from '@/components/forms/FormShell';
import { FSection, FormLoading } from '@/components/forms/FormBits';
import { Field, Select, TextInput, Textarea } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { A4Page, LogoBox, Row, tableStyle, td, th } from '@/components/paper/Paper';
import { cn, fullName, thaiDate } from '@/lib/format';
import { SubNav, usePostop } from './common';

interface P {
  person: PersonRef;
  kind: PersonKind;
  filled: boolean;
}
const TAC_TARGET: [number, number] = [8, 10];

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

export function OpdPanel({ person, kind, filled }: P) {
  const [sel, setSel] = useState('visits');
  const items = [
    { key: 'visits', num: '1', title: 'บันทึกการตรวจ OPD', sub: 'บันทึกผลการตรวจแต่ละครั้ง', icon: Stethoscope, tint: '#dbeafe', fg: '#2563eb', done: filled },
    { key: 'meds', num: '2', title: kind === 'donor' ? 'ยา / การปรับยา' : 'ยากดภูมิ / การปรับยา', sub: 'ประวัติการปรับขนาดยา', icon: Pill, tint: '#fce7f3', fg: '#be185d' },
    { key: 'comp', num: '3', title: 'ภาวะแทรกซ้อน / Admit ซ้ำ', sub: 'Rejection, ติดเชื้อ, อื่นๆ', icon: AlertTriangle, tint: '#ffedd5', fg: '#c2410c' },
  ];
  return (
    <SubNav items={items} sel={sel} onSel={setSel}>
      {sel === 'visits' && <Visits person={person} kind={kind} filled={filled} />}
      {sel === 'meds' && <MedsAdj person={person} kind={kind} filled={filled} />}
      {sel === 'comp' && <Comps person={person} kind={kind} filled={filled} />}
    </SubNav>
  );
}

const emptyVisit = (): OpdVisit => ({ date: new Date().toISOString().slice(0, 10), pod: '', doctor: 'นพ.สมเกียรติ วงศ์ไทย', weight: '', bp: '', pulse: '', urine: '', cr: '', bun: '', k: '', tac: '', assessment: '', plan: '', nextDate: '', nextLab: '' });

function Visits({ person, kind, filled }: P) {
  const { data: f, patch, save, info } = usePostop<OpdVisits>(kind, person, 'opdVisits', filled);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (f) setIdx(Math.max(0, f.visits.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f === null]);
  if (!f) return <FormLoading />;
  const v = f.visits[idx];
  const setV = (p: Partial<OpdVisit>) => patch({ visits: f.visits.map((x, j) => (j === idx ? { ...x, ...p } : x)) });
  const tacN = parseFloat(v?.tac ?? '');
  const tacOff = kind === 'recipient' && !Number.isNaN(tacN) && (tacN < TAC_TARGET[0] || tacN > TAC_TARGET[1]);
  const addVisit = () => {
    patch({ visits: [...f.visits, emptyVisit()] });
    setIdx(f.visits.length);
  };

  const unitField = (label: string, k: keyof OpdVisit, unit: string, warn = false) => (
    <Field label={label}>
      <TextInput suffix={unit} className={cn(warn && '!border-orange-300 !bg-orange-50')} value={v[k]} onChange={(e) => setV({ [k]: e.target.value } as Partial<OpdVisit>)} />
    </Field>
  );

  return (
    <FormShell
      title="บันทึกการตรวจ OPD"
      desc={`1 ติดตาม OPD · บันทึกผลการตรวจแต่ละครั้งหลัง${kind === 'donor' ? 'บริจาคไต' : 'ปลูกถ่ายไต'}`}
      icon={Stethoscope}
      gradient={['#3b82f6', '#2563eb']}
      patient={person}
      dateLabel="วันที่ตรวจ"
      date={v?.date ?? f.date}
      onDate={(date) => (v ? setV({ date }) : patch({ date }))}
      onSave={() => save()}
      savedInfo={info}
      fileName={`KT-opd-visits-${person.hn}`}
      preview={
        <A4Page>
          <Head person={person} title="บันทึกการตรวจติดตาม OPD" />
          <table style={{ ...tableStyle, fontSize: 11.5 }}>
            <thead>
              <tr>
                {['ครั้งที่', 'วันที่', 'POD', 'BW', 'BP', 'Urine', 'Cr', 'K', 'Tac', 'การประเมิน / แผน'].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.visits.map((x, i) => (
                <tr key={i}>
                  <td style={{ ...td, textAlign: 'center' }}>{i + 1}</td>
                  <td style={td}>{thaiDate(x.date)}</td>
                  <td style={td}>{x.pod}</td>
                  <td style={td}>{x.weight}</td>
                  <td style={td}>{x.bp}</td>
                  <td style={td}>{x.urine}</td>
                  <td style={td}>{x.cr}</td>
                  <td style={td}>{x.k}</td>
                  <td style={td}>{x.tac}</td>
                  <td style={td}>
                    {x.assessment}
                    {x.plan ? ` · ${x.plan}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      }
    >
      <section className="flex flex-col gap-4 rounded-[14px] border border-slate-200 bg-white p-[18px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-600">ครั้งที่</span>
          {f.visits.map((x, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)} className={cn('relative rounded-[10px] border px-3 py-2 text-[13px]', i === idx ? 'border-indigo-300 font-bold text-indigo-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
              {i === idx && <motion.span layoutId="opd-visit" className="absolute inset-0 rounded-[10px] bg-indigo-50" />}
              <span className="relative">
                {i + 1} <span className="ml-1 text-xs font-normal text-slate-400">{thaiDate(x.date).slice(0, 6)}</span>
              </span>
            </button>
          ))}
          <span className="flex-1" />
          <Button variant="secondary" size="sm" icon={Plus} onClick={addVisit}>
            เพิ่มครั้งใหม่
          </Button>
        </div>
        {!v ? (
          <p className="py-8 text-center text-sm text-slate-400">ยังไม่มีบันทึกการตรวจ — กด “เพิ่มครั้งใหม่”</p>
        ) : (
          <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.2fr]">
              <Field label="วันที่ตรวจ">
                <TextInput type="date" value={v.date} onChange={(e) => setV({ date: e.target.value })} />
              </Field>
              {unitField('POD', 'pod', 'วัน')}
              <Field label="แพทย์ผู้ตรวจ">
                <Select value={v.doctor} onChange={(e) => setV({ doctor: e.target.value })}>
                  <option>นพ.สมเกียรติ วงศ์ไทย</option>
                  <option>พญ.อรุณี ใจดี</option>
                </Select>
              </Field>
            </div>
            <p className="text-[13px] font-bold text-slate-600">สัญญาณชีพ</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {unitField('น้ำหนัก', 'weight', 'kg')}
              {unitField('ความดัน', 'bp', 'mmHg')}
              {unitField('ชีพจร', 'pulse', '/min')}
              {unitField('ปัสสาวะ / วัน', 'urine', 'ml')}
            </div>
            <p className="text-[13px] font-bold text-slate-600">ผลตรวจทางห้องปฏิบัติการ</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {unitField('Creatinine', 'cr', 'mg/dL')}
              {unitField('BUN', 'bun', 'mg/dL')}
              {unitField('Potassium', 'k', 'mmol/L')}
              {kind === 'recipient' && unitField('Tacrolimus level', 'tac', 'ng/mL', tacOff)}
            </div>
            {tacOff && <p className="-mt-2 text-xs font-medium text-orange-700">Tacrolimus อยู่นอกเป้า {TAC_TARGET[0]}–{TAC_TARGET[1]} ng/mL</p>}
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="อาการ / การประเมิน">
                <Textarea className="!min-h-[72px]" value={v.assessment} onChange={(e) => setV({ assessment: e.target.value })} />
              </Field>
              <Field label="แผนการรักษา">
                <Textarea className="!min-h-[72px]" value={v.plan} onChange={(e) => setV({ plan: e.target.value })} />
              </Field>
              <Field label="นัดครั้งถัดไป">
                <TextInput type="date" value={v.nextDate} onChange={(e) => setV({ nextDate: e.target.value })} />
              </Field>
              <Field label="ส่งตรวจครั้งถัดไป">
                <TextInput value={v.nextLab} onChange={(e) => setV({ nextLab: e.target.value })} />
              </Field>
            </div>
          </motion.div>
        )}
      </section>
    </FormShell>
  );
}

function MedsAdj({ person, kind, filled }: P) {
  const { data: f, patch, save, info } = usePostop<OpdMeds>(kind, person, 'opdMeds', filled);
  if (!f) return <FormLoading />;
  const set = (i: number, p: Partial<MedAdjust>) => patch({ rows: f.rows.map((r, j) => (j === i ? { ...r, ...p } : r)) });
  return (
    <FormShell title={kind === 'donor' ? 'ยา / การปรับยา' : 'ยากดภูมิ / การปรับยา'} desc="2 ติดตาม OPD · ประวัติการปรับขนาดยา" icon={Pill} gradient={['#ec4899', '#be185d']} patient={person} date={f.date} onDate={(date) => patch({ date })} onSave={() => save()} savedInfo={info} fileName={`KT-med-adjust-${person.hn}`}
      preview={
        <A4Page>
          <Head person={person} title="ประวัติการปรับยา" />
          <table style={tableStyle}>
            <thead>
              <tr>
                {['วันที่', 'ยา', 'เดิม', 'ใหม่', 'เหตุผล'].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}>{thaiDate(r.date)}</td>
                  <td style={td}>{r.drug}</td>
                  <td style={td}>{r.from}</td>
                  <td style={td}>{r.to}</td>
                  <td style={td}>{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      }
    >
      <FSection title="ประวัติการปรับยา" right={<Button variant="secondary" size="sm" icon={Plus} onClick={() => patch({ rows: [{ date: new Date().toISOString().slice(0, 10), drug: '', from: '', to: '', reason: '' }, ...f.rows] })}>เพิ่มการปรับยา</Button>}>
        {f.rows.length === 0 && <p className="text-[13px] text-slate-400">ยังไม่มีการปรับยา</p>}
        {f.rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[150px_1fr_110px_110px_1.4fr_28px] items-center gap-2 rounded-[10px] bg-slate-50 px-3 py-2">
            <TextInput type="date" className="!h-8" value={r.date} onChange={(e) => set(i, { date: e.target.value })} />
            <TextInput className="!h-8" placeholder="ยา" value={r.drug} onChange={(e) => set(i, { drug: e.target.value })} />
            <TextInput className="!h-8" placeholder="เดิม" value={r.from} onChange={(e) => set(i, { from: e.target.value })} />
            <TextInput className="!h-8" placeholder="ใหม่" value={r.to} onChange={(e) => set(i, { to: e.target.value })} />
            <TextInput className="!h-8" placeholder="เหตุผล" value={r.reason} onChange={(e) => set(i, { reason: e.target.value })} />
            <button type="button" onClick={() => patch({ rows: f.rows.filter((_, j) => j !== i) })} className="rounded p-1 text-slate-400 hover:bg-slate-200" aria-label="ลบ">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </FSection>
    </FormShell>
  );
}

const COMP_TYPES = ['Acute rejection', 'ติดเชื้อ', 'CMV / BK virus', 'Delayed graft function', 'ภาวะแทรกซ้อนทางศัลยกรรม', 'อื่นๆ'];

function Comps({ person, kind, filled }: P) {
  const { data: f, patch, save, info } = usePostop<OpdComplications>(kind, person, 'opdComplications', filled);
  if (!f) return <FormLoading />;
  const set = (i: number, p: Partial<Complication>) => patch({ rows: f.rows.map((r, j) => (j === i ? { ...r, ...p } : r)) });
  return (
    <FormShell title="ภาวะแทรกซ้อน / Admit ซ้ำ" desc="3 ติดตาม OPD · Rejection, ติดเชื้อ, อื่นๆ" icon={AlertTriangle} gradient={['#f97316', '#c2410c']} patient={person} date={f.date} onDate={(date) => patch({ date })} onSave={() => save()} savedInfo={info} fileName={`KT-complications-${person.hn}`}
      preview={
        <A4Page>
          <Head person={person} title="ภาวะแทรกซ้อน / Admit ซ้ำ" />
          <table style={tableStyle}>
            <thead>
              <tr>
                {['วันที่', 'ประเภท', 'รายละเอียด', 'Admit'].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.rows.map((r, i) => (
                <tr key={i}>
                  <td style={td}>{thaiDate(r.date)}</td>
                  <td style={td}>{r.type}</td>
                  <td style={td}>{r.detail}</td>
                  <td style={td}>{r.admit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      }
    >
      <FSection title="รายการภาวะแทรกซ้อน" right={<Button variant="secondary" size="sm" icon={Plus} onClick={() => patch({ rows: [{ date: new Date().toISOString().slice(0, 10), type: COMP_TYPES[0], detail: '', admit: 'ไม่ admit' }, ...f.rows] })}>เพิ่มรายการ</Button>}>
        {f.rows.length === 0 && <p className="py-4 text-center text-[13px] text-slate-400">ไม่มีภาวะแทรกซ้อน</p>}
        {f.rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[150px_200px_1fr_130px_28px] items-center gap-2 rounded-[10px] bg-orange-50 px-3 py-2">
            <TextInput type="date" className="!h-8" value={r.date} onChange={(e) => set(i, { date: e.target.value })} />
            <Select className="!h-8 !text-[13px]" value={r.type} onChange={(e) => set(i, { type: e.target.value })}>
              {COMP_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <TextInput className="!h-8" placeholder="รายละเอียด" value={r.detail} onChange={(e) => set(i, { detail: e.target.value })} />
            <Select className="!h-8 !text-[13px]" value={r.admit} onChange={(e) => set(i, { admit: e.target.value })}>
              <option>ไม่ admit</option>
              <option>Admit</option>
            </Select>
            <button type="button" onClick={() => patch({ rows: f.rows.filter((_, j) => j !== i) })} className="rounded p-1 text-slate-400 hover:bg-orange-100" aria-label="ลบ">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </FSection>
    </FormShell>
  );
}
