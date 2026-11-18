import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Clock, FlaskConical, HeartPulse, Pill, Stethoscope, type LucideIcon } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import type { OpdVisits } from '@/services/api/postopApi';
import { imedApi, type ImedComplication, type ImedMedAdjust, type OpdCardDto, type OpdLabGroup } from '@/services/api/imedApi';
import { FormShell } from '@/components/forms/FormShell';
import { FormLoading } from '@/components/forms/FormBits';
import { A4Page, LogoBox, Row, tableStyle, td, th } from '@/components/paper/Paper';
import { OpdCardPaper } from '@/components/paper/OpdCardPaper';
import { useAsync } from '@/hooks/useAsync';
import { cn, fullName, thaiDate } from '@/lib/format';
import { SubNav, usePostop } from './common';
import { FollowupRounds } from './FollowupRounds';

/**
 * ติดตาม OPD — ทุกขั้นตอนย่อย “ดูอย่างเดียว” (ข้อมูลดึงจาก iMed · แพทย์/พยาบาลบันทึกใน iMed ตามปกติ)
 * 1 OPD card KT (ผู้รับ) / บันทึกการตรวจ OPD (ผู้บริจาค) · 2 ยากดภูมิ / การปรับยา · 3 ภาวะแทรกซ้อน / Admit ซ้ำ
 */
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

/** แถบแจ้ง “ดึงจาก iMed · ดูอย่างเดียว” */
function ImedNotice({ updatedAt, text }: { updatedAt?: string; text?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-200 bg-cyan-50 px-3.5 py-2.5 text-[12.5px] text-cyan-800">
      <Clock className="h-4 w-4 shrink-0 text-cyan-700" />
      <span>
        {text ?? 'ข้อมูลทั้งหมดดึงจาก iMed อัตโนมัติ (แพทย์/พยาบาลบันทึกใน iMed ตามปกติ) · หน้านี้ดูและพิมพ์ได้อย่างเดียว'}
        {updatedAt && ` · อัปเดตล่าสุด ${thaiDate(updatedAt)} ${updatedAt.slice(11, 16)} น.`}
      </span>
    </div>
  );
}

/** การ์ด + หัวข้อ (ไอคอน · ชื่อ · ป้ายที่มาจาก iMed) */
function VCard({ icon: Icon, tint, fg, title, src, badge, children }: { icon?: LucideIcon; tint?: string; fg?: string; title?: string; src?: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5 rounded-[14px] border border-slate-200 bg-white px-4 py-3.5">
      {title && (
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px]" style={{ background: tint, color: fg }}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
          )}
          <span className="text-[15px] font-bold text-slate-900">{title}</span>
          {badge}
          <span className="flex-1" />
          {src && <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10.5px] font-semibold text-blue-700">{src}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
const Chip = ({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'violet' | 'orange' }) => (
  <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold', { slate: 'bg-slate-100 text-slate-600', green: 'bg-green-100 text-green-700', violet: 'bg-violet-100 text-violet-700', orange: 'bg-orange-100 text-orange-700' }[tone])}>{children}</span>
);
/** แถว ป้าย | ค่า (ค่าว่าง = “—”) */
function KV({ k, v, chipEmpty }: { k: string; v: string; chipEmpty?: string }) {
  return (
    <div className="flex min-h-[34px] items-center gap-2.5 border-b border-slate-100 py-1.5 last:border-b-0">
      <span className="w-[160px] shrink-0 text-[12.5px] text-slate-700">{k}</span>
      <span className="flex flex-1 flex-wrap items-center gap-1.5 text-[13.5px] font-semibold text-slate-900">
        {v === 'ไม่มี' || (!v && chipEmpty) ? <Chip>{v || chipEmpty}</Chip> : v || '—'}
      </span>
    </div>
  );
}
function LabTable({ g }: { g: OpdLabGroup }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-2.5 py-[7px]">
        <span className="text-[12.5px] font-bold text-slate-900">{g.title}</span>
        <span className="flex-1" />
        {g.date && <span className="text-[11px] font-medium text-slate-500">{thaiDate(g.date)}</span>}
      </div>
      {g.rows.map(([l, v, u], i) => (
        <div key={l} className={cn('flex items-center px-2.5 py-[5px]', i > 0 && 'border-t border-slate-100')}>
          <span className="flex-1 text-[12.5px] text-slate-600">{l}</span>
          <span className={cn('text-[12.5px] font-semibold', v ? 'text-slate-900' : 'text-slate-300')}>{v ? `${v}${u ? ` ${u}` : ''}` : '—'}</span>
        </div>
      ))}
    </div>
  );
}

export function OpdPanel({ person, kind, filled }: P) {
  const [sel, setSel] = useState('visits');
  const items = [
    kind === 'recipient'
      ? { key: 'visits', num: '1', title: 'OPD card KT', sub: 'ดูอย่างเดียว · ข้อมูลจาก iMed', icon: Activity, tint: '#dbeafe', fg: '#2563eb', done: filled }
      : { key: 'visits', num: '1', title: 'บันทึกการตรวจ OPD', sub: 'ดูอย่างเดียว · ข้อมูลจาก iMed', icon: Stethoscope, tint: '#dbeafe', fg: '#2563eb', done: filled },
    { key: 'meds', num: '2', title: kind === 'donor' ? 'ยา / การปรับยา' : 'ยากดภูมิ / การปรับยา', sub: 'ประวัติการปรับยา · จาก iMed', icon: Pill, tint: '#fce7f3', fg: '#be185d', done: filled },
    { key: 'comp', num: '3', title: 'ภาวะแทรกซ้อน / Admit ซ้ำ', sub: 'Rejection, ติดเชื้อ · จาก iMed', icon: AlertTriangle, tint: '#ffedd5', fg: '#c2410c', done: filled },
  ];
  return (
    <>
      <FollowupRounds person={person} kind={kind} />
      <SubNav items={items} sel={sel} onSel={setSel}>
        {sel === 'visits' && (kind === 'recipient' ? <OpdCard person={person} /> : <DonorVisits person={person} kind={kind} filled={filled} />)}
        {sel === 'meds' && <MedsAdj person={person} kind={kind} filled={filled} />}
        {sel === 'comp' && <Comps person={person} kind={kind} filled={filled} />}
      </SubNav>
    </>
  );
}

// ================= 1 OPD card KT (ผู้รับ) =================
function OpdCard({ person }: { person: PersonRef }) {
  const { data } = useAsync<OpdCardDto>(() => imedApi.opdCard(person), [person.id]);
  const [idx, setIdx] = useState(0);
  const [all, setAll] = useState(false);
  if (!data) return <FormLoading />;
  const v = data.visits[idx];
  if (!v) return <ImedNotice text="ยังไม่มีข้อมูลการตรวจ OPD ใน iMed" />;
  const { kt, vitals: vs, note, labs, meds, summary } = v;
  const missing = Object.values(labs).reduce((n, g) => n + g.rows.filter((r) => !r[1]).length, 0);
  const shown = all ? data.visits : data.visits.slice(0, 4);
  const tiles: [string, string, string, string][] = [
    ['Status', kt.deceased ? 'Deceased donor KT' : 'Living donor KT', `${kt.donorFrom ? `จาก${kt.donorFrom} · ` : ''}KT date ${thaiDate(kt.ktDate)}`, 'bg-cyan-100 text-cyan-700'],
    ['HLA MM A-B-DR-DQ', kt.hlaMm, `CDC crossmatch · ${kt.xm}`, 'bg-violet-100 text-violet-700'],
    ['PRA / pre KT DSA', kt.pra || '—', kt.preDsa || '—', 'bg-rose-100 text-rose-700'],
    ['CMV IgG D/R', kt.cmv || '—', `ABOi · ${kt.abo ? 'ใช่' : 'ไม่ใช่'} · Previous KT · ${kt.prevKt ? 'มี' : 'ไม่มี'}`, 'bg-amber-100 text-amber-700'],
  ];
  const medRow = ([n, d]: [string, string]) => (
    <div key={n} className="flex items-center gap-2.5 rounded-[10px] bg-violet-50/60 px-2.5 py-2">
      <span className="text-[13.5px] font-bold text-violet-900">{n}</span>
      <span className="text-[12.5px] text-slate-500">{d}</span>
    </div>
  );
  const sub = (t: string) => <p className="pt-1 text-center text-[11px] font-medium text-slate-500">{t}</p>;
  return (
    <FormShell
      readOnly
      title="OPD card KT"
      desc="1 ติดตาม OPD · ดูอย่างเดียว · ข้อมูลจาก iMed"
      icon={Activity}
      gradient={['#3b82f6', '#2563eb']}
      patient={person}
      dateLabel={`วันที่ตรวจ · VN ${v.vn}`}
      date={v.date}
      fileName={`KT-opd-card-${person.hn}-${v.date}`}
      notice={<ImedNotice updatedAt={data.updatedAt} />}
      preview={<OpdCardPaper p={person} v={v} />}
    >
      <VCard>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">ครั้งที่มาตรวจ</span>
          <Chip>{data.visits.length} ครั้ง</Chip>
          <span className="flex-1" />
          {data.visits.length > 4 && (
            <button type="button" onClick={() => setAll(!all)} className="text-xs font-semibold text-brand-indigo">
              {all ? 'ย่อ ▴' : 'ดูทั้งหมด ▾'}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {shown.map((x, i) => (
            <button key={x.vn} type="button" onClick={() => setIdx(i)} className={cn('relative flex flex-col items-start rounded-[10px] border px-3 py-1.5 text-left', i === idx ? 'border-2 border-brand-indigo' : 'border-slate-200 hover:bg-slate-50')}>
              {i === idx && <motion.span layoutId="opd-card-visit" className="absolute inset-0 rounded-[8px] bg-indigo-50" />}
              <span className="relative text-[13px] font-bold text-slate-900">{thaiDate(x.date)}</span>
              <span className="relative text-[11px] text-slate-500">
                VN {x.vn}
                {i === 0 && ' · ล่าสุด'}
              </span>
            </button>
          ))}
        </div>
      </VCard>

      <motion.div key={v.vn} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
        <VCard title="ข้อมูลการปลูกถ่ายไต">
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map(([k, val, s, cls]) => (
              <div key={k} className={cn('flex flex-col gap-0.5 rounded-xl px-3 py-2.5', cls.split(' ')[0])}>
                <span className={cn('text-[11px] font-semibold', cls.split(' ')[1])}>{k}</span>
                <span className="text-sm font-bold text-slate-900">{val}</span>
                <span className="text-[11px] text-slate-500">{s}</span>
              </div>
            ))}
          </div>
        </VCard>

        <VCard icon={HeartPulse} tint="#dcfce7" fg="#15803d" title="Vital sign · Clinical note · Physical examination" src={`iMed · OPD ${v.opd}`}>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
            {(
              [
                ['BT', vs.bt, '°C'],
                ['PR', vs.pr, 'bpm'],
                ['BP', vs.bp, 'mmHg'],
                ['RR', vs.rr, '/min'],
                ['BW', vs.bw, 'kg'],
                ['BMI', vs.bmi, 'kg/m²'],
              ] as const
            ).map(([k, val, u]) => (
              <div key={k} className="rounded-[10px] border border-slate-200 px-2.5 py-2">
                <p className="text-[11px] text-slate-500">{k}</p>
                <p className="text-base font-bold text-slate-900">
                  {val || '—'} <span className="text-[11px] font-medium text-slate-400">{u}</span>
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-x-6 md:grid-cols-2">
            <div>
              <KV k="Clinical note" v={note.clinical} />
              <KV k="Home BP" v={note.homeBp ? 'วัด' : ''} chipEmpty="ไม่ได้วัด" />
            </div>
            <div>
              <KV k="Edema" v={note.edema} />
              <KV k="Tremor / Oral ulcer" v={[note.tremor && 'Tremor', note.oralUlcer && 'Oral ulcer'].filter(Boolean).join(', ')} chipEmpty="ไม่มี" />
            </div>
          </div>
          <KV k="Pharmacist/Dietician" v={note.pharm} />
        </VCard>

        <VCard icon={FlaskConical} tint="#e0e7ff" fg="#4338ca" title="ผลตรวจทางห้องปฏิบัติการ" src="iMed · LIS" badge={missing > 0 ? <Chip>ไม่มีผลใน VN นี้ {missing}</Chip> : undefined}>
          <div className="grid gap-2.5 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <LabTable g={labs.drug} />
              <LabTable g={labs.heme} />
              <LabTable g={labs.lipid} />
            </div>
            <div className="flex flex-col gap-2.5">
              <LabTable g={labs.chem} />
              <LabTable g={{ ...labs.urine, title: 'Urine', rows: [...labs.urine24.rows, ...labs.urine.rows] }} />
            </div>
          </div>
        </VCard>

        <VCard icon={Pill} tint="#ede9fe" fg="#6d28d9" title="ยาที่ใช้ปัจจุบัน" src="iMed · ใบสั่งยา" badge={<Chip tone="violet">{[...meds.immuno, ...meds.prophylaxis, ...meds.misc].filter((m) => m[1]).length + meds.review.length} รายการ</Chip>}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              {sub('ยากดภูมิคุ้มกัน')}
              {meds.immuno.filter((m) => m[1]).map(medRow)}
              {sub('Review medications')}
              {meds.review.map((r) => {
                const m = r.match(/^(\S+)\s+(.*)$/);
                return medRow(m ? [m[1], m[2]] : [r, '']);
              })}
            </div>
            <div className="flex flex-col gap-1.5">
              {sub('ยาป้องกัน / ยาอื่น')}
              {[...meds.prophylaxis, ...meds.misc].filter((m) => m[1]).map(medRow)}
            </div>
          </div>
        </VCard>

        <VCard icon={Activity} tint="#ffe4e6" fg="#be123c" title="Summary · Last investigations" src="iMed · บันทึกแพทย์">
          <div className="flex min-h-[34px] items-center gap-2.5 border-b border-slate-100 py-1.5">
            <span className="w-[160px] shrink-0 text-[12.5px] text-slate-700">Graft function</span>
            <Chip tone={summary.graft === 'Deteriorated' ? 'orange' : 'green'}>{summary.graft}</Chip>
          </div>
          <div className="grid gap-x-6 md:grid-cols-2">
            <div>{summary.left.map(([k, val]) => <KV key={k} k={k} v={val} />)}</div>
            <div>{summary.right.map(([k, val]) => <KV key={k} k={k} v={val} />)}</div>
          </div>
          {sub('Last investigations')}
          {v.last.map(([k, val]) => (
            <KV key={k} k={k} v={val} />
          ))}
        </VCard>

        <VCard>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[13px] text-slate-500">Follow up</p>
              <p className="text-[13px] font-bold text-slate-900">{v.followUp || '—'}</p>
            </div>
            <div>
              <p className="text-[13px] text-slate-500">Physician</p>
              <p className="text-[13px] font-bold text-slate-900">{v.physician || '—'}</p>
            </div>
          </div>
        </VCard>
      </motion.div>
    </FormShell>
  );
}

// ================= 1 บันทึกการตรวจ OPD (ผู้บริจาค · ดูอย่างเดียว) =================
function DonorVisits({ person, kind, filled }: P) {
  const { data: f } = usePostop<OpdVisits>(kind, person, 'opdVisits', filled);
  if (!f) return <FormLoading />;
  const cols = ['ครั้งที่', 'วันที่', 'POD', 'BW', 'BP', 'Urine', 'Cr', 'K', 'การประเมิน / แผน'];
  const row = (x: OpdVisits['visits'][number], i: number) => [String(i + 1), thaiDate(x.date), x.pod, x.weight, x.bp, x.urine, x.cr, x.k, [x.assessment, x.plan].filter(Boolean).join(' · ')];
  return (
    <FormShell
      readOnly
      title="บันทึกการตรวจ OPD"
      desc="1 ติดตาม OPD · ดูอย่างเดียว · ข้อมูลจาก iMed"
      icon={Stethoscope}
      gradient={['#3b82f6', '#2563eb']}
      patient={person}
      dateLabel="ข้อมูล ณ วันที่"
      date={f.date}
      fileName={`KT-opd-visits-${person.hn}`}
      notice={<ImedNotice />}
      preview={
        <A4Page>
          <Head person={person} title="บันทึกการตรวจติดตาม OPD" />
          <table style={{ ...tableStyle, fontSize: 11.5 }}>
            <thead>
              <tr>
                {cols.map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {f.visits.map((x, i) => (
                <tr key={i}>
                  {row(x, i).map((c, j) => (
                    <td key={j} style={{ ...td, textAlign: j === 0 ? 'center' : undefined }}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      }
    >
      <ViewTable title="การตรวจ OPD (จาก iMed)" cols={cols} rows={f.visits.map(row)} empty="ยังไม่มีข้อมูลการตรวจ OPD ใน iMed" />
    </FormShell>
  );
}

/** ตารางดูอย่างเดียว */
function ViewTable({ title, cols, rows, empty }: { title: string; cols: string[]; rows: string[][]; empty: string }) {
  return (
    <VCard>
      <div className="overflow-x-auto rounded-[10px] border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] font-bold text-slate-900">{title}</div>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-slate-400">{empty}</p>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[11.5px] text-slate-500">
                {cols.map((c) => (
                  <th key={c} className="px-3 py-1.5 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  {r.map((c, j) => (
                    <td key={j} className={cn('px-3 py-1.5', j === 0 ? 'text-slate-600' : 'font-semibold text-slate-900')}>
                      {c || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </VCard>
  );
}

function paperTable(person: PersonRef, title: string, cols: string[], rows: string[][]) {
  return (
    <A4Page>
      <Head person={person} title={title} />
      <table style={tableStyle}>
        <thead>
          <tr>
            {cols.map((h) => (
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
  );
}

// ================= 2 ยากดภูมิ / การปรับยา (ดูอย่างเดียว) =================
function MedsAdj({ person, kind, filled }: P) {
  const { data } = useAsync<ImedMedAdjust[]>(() => imedApi.medAdjust(kind, person, filled), [person.id, kind]);
  if (!data) return <FormLoading />;
  const title = kind === 'donor' ? 'ยา / การปรับยา' : 'ยากดภูมิ / การปรับยา';
  const cols = ['วันที่', 'ยา', 'เดิม', 'ใหม่', 'เหตุผล'];
  const rows = data.map((r) => [thaiDate(r.date), r.drug, r.from, r.to, r.reason]);
  return (
    <FormShell readOnly title={title} desc="2 ติดตาม OPD · ดูอย่างเดียว · ประวัติการปรับยาจากใบสั่งยา iMed" icon={Pill} gradient={['#ec4899', '#be185d']} patient={person} dateLabel="ข้อมูล ณ วันที่" date={new Date().toISOString().slice(0, 10)} fileName={`KT-med-adjust-${person.hn}`} notice={<ImedNotice />} preview={paperTable(person, 'ประวัติการปรับยา', cols, rows)}>
      <ViewTable title="ประวัติการปรับยา (จากใบสั่งยา iMed)" cols={cols} rows={rows} empty="ยังไม่มีการปรับยา" />
    </FormShell>
  );
}

// ================= 3 ภาวะแทรกซ้อน / Admit ซ้ำ (ดูอย่างเดียว) =================
function Comps({ person, kind, filled }: P) {
  const { data } = useAsync<ImedComplication[]>(() => imedApi.complications(kind, person, filled), [person.id, kind]);
  if (!data) return <FormLoading />;
  const cols = ['วันที่', 'ประเภท', 'รายละเอียด', 'Admit'];
  const rows = data.map((r) => [thaiDate(r.date), r.type, r.detail, r.admit]);
  return (
    <FormShell readOnly title="ภาวะแทรกซ้อน / Admit ซ้ำ" desc="3 ติดตาม OPD · ดูอย่างเดียว · ข้อมูลจาก iMed" icon={AlertTriangle} gradient={['#f97316', '#c2410c']} patient={person} dateLabel="ข้อมูล ณ วันที่" date={new Date().toISOString().slice(0, 10)} fileName={`KT-complications-${person.hn}`} notice={<ImedNotice />} preview={paperTable(person, 'ภาวะแทรกซ้อน / Admit ซ้ำ', cols, rows)}>
      <ViewTable title="ภาวะแทรกซ้อน / Admit ซ้ำ (จาก iMed)" cols={cols} rows={rows} empty="ไม่มีภาวะแทรกซ้อน" />
    </FormShell>
  );
}
