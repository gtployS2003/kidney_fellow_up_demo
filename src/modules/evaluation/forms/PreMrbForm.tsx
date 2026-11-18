import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Activity, ClipboardList, Clock, Droplet, FlaskConical, HeartPulse, Image as ImageIcon, Info, Pill, UserRound, type LucideIcon } from 'lucide-react';
import type { MrbCaseDto, MrbPartySummary, MrbRow, MrbSummaryDto } from '@/types';
import { FormShell } from '@/components/forms/FormShell';
import { FSection, FormLoading } from '@/components/forms/FormBits';
import { Field, TextInput, Textarea } from '@/components/ui/Form';
import { PreMrbDonorPaper, PreMrbRecipientPaper } from '@/components/paper/MrbPaper';
import { useAsync } from '@/hooks/useAsync';
import { mrbApi } from '@/services/api/mrbApi';
import { cn, fullName, thaiDate } from '@/lib/format';
import { MrbCaseBanner, useMrbCase, useMrbRecord } from '@/modules/mrb/MrbCaseBits';
import { FORM_META, type GoHla, type PreMrbForm as F } from './data';
import type { FormProps } from './types';

type Tone = 'blue' | 'rose' | 'violet' | 'cyan' | 'green' | 'indigo' | 'slate' | 'amber';
const TONE: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: '#dbeafe', fg: '#1d4ed8' },
  rose: { bg: '#ffe4e6', fg: '#be123c' },
  violet: { bg: '#ede9fe', fg: '#6d28d9' },
  cyan: { bg: '#cffafe', fg: '#0e7490' },
  green: { bg: '#dcfce7', fg: '#15803d' },
  indigo: { bg: '#e0e7ff', fg: '#4338ca' },
  slate: { bg: '#f1f5f9', fg: '#475569' },
  amber: { bg: '#fef3c7', fg: '#b45309' },
};
function Chip({ children, tone = 'slate', faded }: { children: ReactNode; tone?: Tone; faded?: boolean }) {
  return (
    <span className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold" style={{ background: TONE[tone].bg, color: TONE[tone].fg, opacity: faded ? 0.55 : 1 }}>
      {children}
    </span>
  );
}
/** ค่าแบบ มี/ไม่มี → ชิป · ค่าอื่นแสดงเป็นข้อความ */
function Val({ v }: { v?: string }) {
  if (!v) return <span className="text-slate-400">—</span>;
  if (/^(ไม่มี|ไม่ได้ทำ)$/.test(v)) return <Chip>{v}</Chip>;
  if (v === 'N/A') return <Chip faded>N/A</Chip>;
  if (v.startsWith('มี')) return <Chip tone="amber">{v}</Chip>;
  if (v === 'normal') return <Chip tone="green">normal</Chip>;
  return <span>{v}</span>;
}
/** แถว ป้ายซ้าย · ค่าขวา */
function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[34px] items-center gap-2.5 border-b border-slate-100 py-1.5">
      <span className="w-[130px] shrink-0 text-[12.5px] text-slate-500">{k}</span>
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-[13.5px] font-semibold text-slate-900">{children}</span>
    </div>
  );
}
const KV = ({ k, v }: { k: string; v?: string }) => (
  <Row k={k}>
    <Val v={v} />
  </Row>
);
const Cols = ({ children }: { children: ReactNode }) => <div className="grid gap-x-6 sm:grid-cols-2">{children}</div>;
const Col = ({ children }: { children: ReactNode }) => <div className="flex min-w-0 flex-col">{children}</div>;

function Card({ title, icon: Icon, tone, src, badge, children }: { title: string; icon: LucideIcon; tone: Tone; src: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5 rounded-[14px] border border-slate-200 bg-white px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-[9px]" style={{ background: TONE[tone].bg, color: TONE[tone].fg }}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <h3 className="text-[15px] font-bold">{title}</h3>
        {badge}
        <span className="flex-1" />
        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10.5px] font-semibold text-blue-700">{src}</span>
      </div>
      {children}
    </section>
  );
}

const pendingOf = (rows: MrbRow[]) => rows.filter((r) => !r[1]).length;
const Wait = ({ n }: { n: number }) => (n ? <Chip tone="amber">รอผล {n}</Chip> : null);

/** ตารางย่อ: ค่าชิดขวา · แถวที่รอผลพื้นเหลือง */
function MiniTable({ title, rows, date }: { title: string; rows: MrbRow[]; date?: string }) {
  const n = pendingOf(rows);
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12.5px] font-bold">
        {title}
        <span className="flex-1" />
        {n ? <Wait n={n} /> : date && <span className="text-[11px] font-medium text-slate-500">{thaiDate(date)}</span>}
      </div>
      {rows.map((r, i) => (
        <div key={r[0]} className={cn('flex items-center gap-2 px-2.5 py-1 text-[12.5px]', i > 0 && 'border-t border-slate-100', !r[1] && 'bg-amber-50')}>
          <span className="flex-1 text-slate-600">{r[0]}</span>
          {r[1] ? (
            <span className="text-right font-semibold text-slate-900">
              {r[1]}
              {r[2] && <span className="ml-1 text-[11px] font-medium text-slate-400">{r[2]}</span>}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
              <Clock className="h-3.5 w-3.5" /> รอผลตรวจ
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
/** แบ่งตารางเป็น 2 คอลัมน์ (ยาวเรียงก่อน) */
function TableCols({ groups }: { groups: { title: string; rows: MrbRow[]; date?: string }[] }) {
  const a: typeof groups = [];
  const b: typeof groups = [];
  let ha = 0;
  let hb = 0;
  for (const g of groups) {
    if (ha <= hb) {
      a.push(g);
      ha += g.rows.length + 2;
    } else {
      b.push(g);
      hb += g.rows.length + 2;
    }
  }
  return (
    <div className="grid items-start gap-2.5 sm:grid-cols-2">
      {[a, b].map((col, i) => (
        <div key={i} className="flex flex-col gap-2.5">
          {col.map((g) => (
            <MiniTable key={g.title} {...g} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Tile({ tone, label, value, sub }: { tone: Tone; label: string; value: string; sub: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-xl px-3 py-2.5" style={{ background: TONE[tone].bg }}>
      <span className="text-[11px] font-semibold" style={{ color: TONE[tone].fg }}>
        {label}
      </span>
      <span className="text-[14px] font-bold leading-snug text-slate-900">{value || '—'}</span>
      <span className="truncate text-[11px] text-slate-500">{sub}</span>
    </div>
  );
}

function PartyView({ s, recipient }: { s: MrbPartySummary; recipient: boolean }) {
  const g = s.general;
  const allRows = [...s.labs.flatMap((x) => x.rows), ...s.imaging, ...s.consults, ...s.vaccines];
  const waiting = allRows.filter((r) => !r[1]);
  const labWait = pendingOf(s.labs.flatMap((x) => x.rows));
  const otherWait = pendingOf([...s.imaging, ...s.consults, ...s.vaccines]);
  const h: Record<string, string> = Object.fromEntries(s.history.map((r) => [r[0], r[1]]));
  const sens: Record<string, string> = Object.fromEntries((s.sensitization ?? []).map((r) => [r[0], r[1]]));
  const comorb: string[] = (h['Comorbidity'] ?? '').split(/,\s*(?![^()]*\))/).filter(Boolean);
  const pe = s.pe;
  const tiles: [Tone, string, string, string][] = recipient
    ? [
        ['rose', 'Cause of ESKD', h['Cause of ESKD'] ?? '', `Kidney biopsy · ${h['Kidney biopsy'] ?? '—'}`],
        ['cyan', 'การบำบัดทดแทนไต', s.rrt?.hd.split(' · ')[0] ?? '', s.rrt ? `ตั้งแต่ ${s.rrt.since || '—'}` : ''],
        ['violet', 'PRA', sens['PRA'] ?? '', `ปลูกถ่ายมาก่อน · ${sens['previous organ transplant'] ?? '—'}`],
        ['amber', 'ผลตรวจที่รอ', waiting.length ? `${waiting.length} รายการ` : 'ครบแล้ว', waiting.map((r) => r[0]).slice(0, 3).join(', ') + (waiting.length > 3 ? ' …' : '')],
      ]
    : [
        ['rose', 'Underlying disease', h['Underlying disease'] ?? '', `Comorbidity · ${h['Comorbidity'] ?? '—'}`],
        ['cyan', 'ความสัมพันธ์กับผู้รับ', s.party.relation ?? '', `${s.party.age} ปี · ${s.party.bloodGroup}`],
        ['violet', 'LKDPI', s.scoring?.[0]?.[1] ?? '', s.scoring?.[2] ? `post-donation ESRD ${s.scoring[2][1]}` : ''],
        ['amber', 'ผลตรวจที่รอ', waiting.length ? `${waiting.length} รายการ` : 'ครบแล้ว', waiting.map((r) => r[0]).slice(0, 3).join(', ') + (waiting.length > 3 ? ' …' : '')],
      ];
  return (
    <>
      <section className="flex flex-col gap-2.5 rounded-[14px] border border-slate-200 bg-white px-4 py-3.5">
        <h3 className="text-sm font-bold">ภาพรวมก่อนเข้า MRB</h3>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {tiles.map(([t, l, v, sub]) => (
            <Tile key={l} tone={t} label={l} value={v} sub={sub} />
          ))}
        </div>
      </section>

      <Card title="ข้อมูลทั่วไป" icon={UserRound} tone="blue" src="จากการลงทะเบียน">
        <Cols>
          <Col>
            <KV k="ชื่อ" v={fullName(s.party)} />
            <KV k="HN" v={s.party.hn} />
            <KV k="ID No." v={g.nationalId} />
            <KV k="เกิด / อายุ" v={`${thaiDate(g.birthDate)}${s.party.age ? ` · ${s.party.age} ปี` : ''}`} />
            <KV k={recipient ? 'ความสัมพันธ์กับ donor' : 'ความสัมพันธ์กับ recipient'} v={s.party.relation} />
            <KV k="การศึกษา" v={g.education} />
            <KV k="อาชีพ" v={g.occupation} />
          </Col>
          <Col>
            <Row k="สิทธิการรักษา">{g.coverage ? <Chip tone="blue">{g.coverage}</Chip> : '—'}</Row>
            <KV k="เบอร์ติดต่อ" v={g.phone} />
            <KV k="รายได้ / เดือน" v={g.income && `${g.income} บาท`} />
            <KV k="รายจ่าย / เดือน" v={g.expense && `${g.expense} บาท`} />
            <KV k="สถานภาพ" v={g.marital} />
            <KV k="บุตร · พี่น้อง" v={`${g.children} คน · ${g.siblings} คน`} />
            <KV k="ที่อยู่" v={g.address} />
          </Col>
        </Cols>
      </Card>

      <Card title={recipient ? 'ประวัติการเจ็บป่วย · Sensitization' : 'ประวัติการเจ็บป่วย'} icon={Activity} tone="rose" src={recipient ? 'จาก 1.3 Cause of ESRD · 1.2' : 'จาก 1.2 Living donor checklist'}>
        <Cols>
          {s.history
            .filter(([k]) => k !== 'Comorbidity')
            .map(([k, v]) => (
              <Col key={k}>
                <KV k={k} v={v} />
              </Col>
            ))}
        </Cols>
        <Row k="Comorbidity">
          {comorb.length > 0 && h['Comorbidity'] !== 'ไม่มี' ? comorb.map((c: string) => <Chip key={c} tone={/surgery/i.test(c) ? 'slate' : 'rose'}>{c}</Chip>) : <Val v="ไม่มี" />}
        </Row>
        {s.sensitization && (
          <>
            <p className="pt-1 text-xs font-bold text-slate-600">Sensitization</p>
            <Cols>
              <Col>
                {s.sensitization.slice(0, 2).map(([k, v]) => (
                  <KV key={k} k={k} v={v} />
                ))}
              </Col>
              <Col>
                {s.sensitization.slice(2).map(([k, v]) => (
                  <KV key={k} k={k} v={v} />
                ))}
              </Col>
            </Cols>
          </>
        )}
      </Card>

      <Card title="Current medication" icon={Pill} tone="violet" src={recipient ? 'จาก 1.3' : 'จาก 1.2'} badge={<Chip tone="violet">{s.meds.filter((m) => m !== 'ไม่มี').length} รายการ</Chip>}>
        <div className="flex flex-col gap-1.5">
          {s.meds.map((m, i) => {
            const [name, ...rest] = m.split(' ');
            return (
              <div key={i} className="flex items-center gap-2.5 rounded-[10px] bg-violet-50/70 px-2.5 py-2">
                <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">{i + 1}</span>
                <span className="text-[13.5px] font-bold text-violet-950">{name}</span>
                <span className="text-[12.5px] text-slate-500">{rest.join(' ')}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {s.rrt && (
        <Card title="Renal replacement therapy" icon={Droplet} tone="cyan" src="จาก 1.2 Dialysis information">
          <Cols>
            <Col>
              <KV k="Prior transplant kidney" v={s.rrt.prior} />
              <KV k="Hemodialysis" v={s.rrt.hd} />
            </Col>
            <Col>
              <KV k="since" v={s.rrt.since} />
              <KV k="RRF" v={s.rrt.rrf} />
            </Col>
          </Cols>
          <KV k="vascular access" v={s.rrt.access} />
        </Card>
      )}

      <Card title="Physical examination" icon={HeartPulse} tone="green" src={recipient ? 'จาก 1.4' : 'จาก 1.3'}>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {(
            [
              ['BW', pe.bw, 'kg'],
              ['HT', pe.ht, 'cm'],
              ['BMI', pe.bmi, ''],
              ['BSA', pe.bsa, 'm²'],
              ['BP', pe.bp, 'mmHg'],
              ['PR', pe.pr, '/min'],
            ] as const
          ).map(([k, v, u]) => (
            <div key={k} className="flex flex-col rounded-[10px] border border-slate-200 px-2.5 py-2">
              <span className="text-[11px] text-slate-500">{k}</span>
              <span className="text-base font-bold">
                {v || '—'} {v && u && <span className="text-[11px] font-medium text-slate-400">{u}</span>}
              </span>
            </div>
          ))}
        </div>
        <Cols>
          <Col>
            <KV k="HEENT" v={pe.heent} />
            <KV k="Chest" v={pe.chest} />
            <KV k="Heart" v={pe.heart} />
          </Col>
          <Col>
            <KV k="Abdomen" v={pe.abdomen} />
            <KV k="Extremities" v={pe.extremities} />
          </Col>
        </Cols>
      </Card>

      <Card title="Lab" icon={FlaskConical} tone="indigo" src="จากผลตรวจ Lab" badge={<Wait n={labWait} />}>
        <TableCols groups={s.labs} />
      </Card>

      <Card title={s.scoring ? 'Imaging · Consultation · Vaccination · Scoring' : 'Imaging · Consultation · Vaccination'} icon={ImageIcon} tone="slate" src={recipient ? 'จาก 1.5' : 'จาก 1.4'} badge={<Wait n={otherWait} />}>
        <TableCols
          groups={[
            { title: 'Imaging', rows: s.imaging },
            { title: 'Consultation', rows: s.consults },
            { title: 'Vaccination', rows: s.vaccines },
            ...(s.scoring ? [{ title: 'Scoring', rows: s.scoring }] : []),
          ]}
        />
      </Card>
    </>
  );
}

const GO: [GoHla, string][] = [
  ['yes', 'ใช่'],
  ['no', 'ไม่'],
  ['consult', 'หลัง consult'],
];

function Papers({ sum, f }: { sum: MrbSummaryDto; f: F }) {
  return (
    <div className="paper-stack">
      <PreMrbRecipientPaper s={sum.recipient} f={f} />
      {sum.donor && <PreMrbDonorPaper s={sum.donor} f={f} />}
    </div>
  );
}

/** 2.1 สรุป case ก่อนเข้า MRB — เคสร่วมผู้รับ + ผู้บริจาค */
export function PreMrbForm({ rec, kind, done, onSaved, initialMode }: FormProps) {
  const c = useMrbCase(kind, rec.id);
  if (c === undefined) return <FormLoading />;
  if (c === null) return <p className="rounded-xl bg-white p-6 text-sm text-slate-500">ไม่พบเคส MRB</p>;
  return <Inner c={c} rec={rec} kind={kind} done={done} onSaved={onSaved} initialMode={initialMode} />;
}

function Inner({ c, rec, kind, done, onSaved, initialMode }: FormProps & { c: MrbCaseDto }) {
  const { form: f, patch, save, info } = useMrbRecord<F>(c.id, 'preMrb', done, onSaved);
  const { data: sum } = useAsync(() => mrbApi.summary(c), [c.id]);
  const [tab, setTab] = useState<'recipient' | 'donor'>(kind === 'donor' && c.donor ? 'donor' : 'recipient');
  if (!f || !sum) return <FormLoading />;
  const s = tab === 'donor' && sum.donor ? sum.donor : sum.recipient;

  return (
    <FormShell
      initialMode={initialMode}
      title={FORM_META.preMrb.title}
      desc="2.1 MRB · เคสร่วมผู้รับ + ผู้บริจาค · ดึงข้อมูลอัตโนมัติจากลงทะเบียน, 1.1–1.5 และผล Lab"
      icon={ClipboardList}
      gradient={['#14b8a6', '#0f766e']}
      patient={rec}
      dateLabel="วันที่เข้า MRB"
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={<Papers sum={sum} f={f} />}
      onSave={save}
      savedInfo={info}
      fileName={`${FORM_META.preMrb.fileName}-${c.recipient.hn}`}
    >
      <MrbCaseBanner c={c} here={kind} date={f.date} sub="preMrb" />
      {c.donor && (
        <div className="flex gap-2">
          {(
            [
              ['recipient', 'Potential LRKT recipient', `${fullName(c.recipient)} · HN ${c.recipient.hn}`],
              ['donor', 'Potential LRKT donor', `${fullName(c.donor)} · ${c.donor.relation ?? ''} · HN ${c.donor.hn}`],
            ] as const
          ).map(([k, t, d]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={cn('relative flex flex-1 flex-col rounded-xl border px-3.5 py-2.5 text-left', tab === k ? 'border-brand-indigo bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
              {tab === k && <motion.span layoutId="premrb-tab" className="absolute inset-0 rounded-xl border-2 border-brand-indigo" />}
              <span className="text-[13px] font-bold">{t}</span>
              <span className="text-[11.5px] text-slate-500">{d}</span>
            </button>
          ))}
        </div>
      )}
      <PartyView s={s} recipient={tab === 'recipient'} />
      <FSection title="ความเห็นก่อนเข้า MRB">
        {tab === 'recipient' && (
          <Field label="EPTS (%)">
            <TextInput className="w-[160px]" inputMode="decimal" value={f.epts} onChange={(e) => patch({ epts: e.target.value })} />
          </Field>
        )}
        <Field label={`Comment (${tab === 'recipient' ? 'ผู้รับ' : 'ผู้บริจาค'})`}>
          <Textarea className="!min-h-[64px]" value={tab === 'recipient' ? f.commentRecipient : f.commentDonor} onChange={(e) => patch(tab === 'recipient' ? { commentRecipient: e.target.value } : { commentDonor: e.target.value })} />
        </Field>
        {tab === 'recipient' && (
          <div className="flex flex-wrap items-center gap-3.5 rounded-[10px] bg-yellow-100 px-3.5 py-2.5">
            <b className="text-[13px]">Go on HLA typing?</b>
            <div className="flex overflow-hidden rounded-[10px] border border-slate-300 bg-white">
              {GO.map(([k, l], i) => (
                <button key={k} type="button" onClick={() => patch({ goHla: f.goHla === k ? '' : k })} className={cn('px-3.5 py-1.5 text-[12.5px] font-semibold', i > 0 && 'border-l border-slate-300', f.goHla === k ? 'bg-brand-indigo text-white' : 'text-slate-600')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </FSection>
      <p className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800">
        <Info className="h-4 w-4 shrink-0" /> ข้อมูลในหน้านี้แก้ไขไม่ได้ — ถ้าต้องแก้ ให้แก้ที่ฟอร์มต้นทาง (ลงทะเบียน / 1.1–1.5 / Lab) แล้วหน้านี้จะอัปเดตตาม · กรอกได้เฉพาะ วันที่เข้า MRB, EPTS, Comment, Go on HLA typing?
      </p>
    </FormShell>
  );
}
