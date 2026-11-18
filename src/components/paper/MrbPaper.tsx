import type { ReactNode } from 'react';
import type { MrbCaseDto, MrbLabGroup, MrbPartySummary, MrbRow } from '@/types';
import { COVERAGES, type MrbForm, type PreMrbForm } from '@/modules/evaluation/forms/data';
import { fullName, thaiDate } from '@/lib/format';
import { Brand, Fld, Line, MUTE, Opt, Page, R, RULE, SectionHead, VALUE, headBg } from './Sheet';

/**
 * ฟอร์มกระดาษของขั้นตอน 2 MRB (ตรงกับ Figma · เนื้อหาครบตามต้นฉบับ)
 * - 2.1 Potential LRKT recipient (3 หน้า) / Potential LRKT donor (2 หน้า)
 * - 2.2 ใบสรุปผลการเข้าประชุม (Post MRB conclusion) + Pre-living KT evaluation form
 */
const B = `1px solid ${RULE}`;

/** ป้าย + เส้นประยืดเต็ม (+ หน่วย) */
function KV({ label, value, unit, lw = 146 }: { label: ReactNode; value?: string; unit?: string; lw?: number }) {
  return (
    <R gap={5}>
      {lw > 0 && <span style={{ width: lw, flexShrink: 0 }}>{label}</span>}
      <Line value={value} grow />
      {unit && <span>{unit}</span>}
    </R>
  );
}
const Col = ({ children, gap = 6 }: { children: ReactNode; gap?: number }) => <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap }}>{children}</div>;
const Cols = ({ children, gap = 22 }: { children: ReactNode; gap?: number }) => <div style={{ display: 'flex', gap, alignItems: 'flex-start', width: '100%' }}>{children}</div>;

/** ตารางผล Lab ย่อ: หัว (ชื่อกลุ่ม + date) + แถว ป้าย | ค่า | หน่วย */
function MiniTable({ g, labelW = 114 }: { g: MrbLabGroup; labelW?: number }) {
  return (
    <div style={{ border: B, display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <div style={{ background: headBg, borderBottom: B, padding: '3px 7px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', fontWeight: 600 }}>
        <span>{g.title}</span>
        <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 4, fontWeight: 400, fontSize: 11.5, color: MUTE }}>
          date <Line value={g.date ? thaiShort(g.date) : ''} w={86} />
        </span>
      </div>
      {g.rows.map((r, i) => (
        <div key={r[0]} style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '1px 7px', minHeight: 18, borderTop: i ? '1px solid #e2e8f0' : undefined }}>
          <span style={{ width: labelW, flexShrink: 0 }}>{r[0]}</span>
          <span style={{ flex: 1, color: VALUE, fontWeight: 500 }}>{r[1] || ' '}</span>
          {r[2] && <span style={{ fontSize: 11.5, color: '#6b7280' }}>{r[2]}</span>}
        </div>
      ))}
    </div>
  );
}
const rowsTable = (title: string, rows: MrbRow[], labelW?: number) => <MiniTable g={{ title, rows }} labelW={labelW} />;
/** 2025-07-02 → 02/07/68 */
function thaiShort(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${String((d.getFullYear() + 543) % 100).padStart(2, '0')}`;
}
const group = (s: MrbPartySummary, t: string) => s.labs.find((g) => g.title === t) ?? { title: t, rows: [] };

function ContHead({ title, s }: { title: string; s: MrbPartySummary }) {
  return (
    <R style={{ justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 600 }}>{title} (ต่อ)</span>
      <span style={{ color: MUTE }}>
        ชื่อ {fullName(s.party)} · HN {s.party.hn}
      </span>
    </R>
  );
}

function Head({ title, date, reg }: { title: string; date: string; reg: string }) {
  return (
    <>
      <Brand />
      <div style={{ textAlign: 'center', lineHeight: 1.35 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: MUTE }}>สรุป case ก่อนเข้า MRB</div>
      </div>
      <R gap={30} style={{ justifyContent: 'center' }}>
        <Fld label="MRB" value={date ? thaiDate(date) : ''} w={186} />
        <Fld label="date on registration" value={thaiDate(reg)} w={186} />
      </R>
    </>
  );
}

function General({ s, relLabel }: { s: MrbPartySummary; relLabel: string }) {
  const g = s.general;
  return (
    <>
      <SectionHead>ข้อมูลทั่วไป</SectionHead>
      <Cols>
        <Col>
          <KV label="ชื่อ" value={fullName(s.party)} />
          <KV label="HN" value={s.party.hn} />
          <KV label="ID No." value={g.nationalId} />
          <KV label="เกิด" value={thaiDate(g.birthDate)} />
          <KV label="อายุ" value={s.party.age ? String(s.party.age) : ''} unit="ปี" />
          <KV label={relLabel} value={s.party.relation ?? (relLabel.includes('donor') ? '' : '')} />
          <KV label="การศึกษา" value={g.education} />
          <KV label="อาชีพ" value={g.occupation} />
        </Col>
        <Col>
          <KV label="สิทธิการรักษา" value={g.coverage} lw={106} />
          <KV label="ที่อยู่" value={g.address} lw={106} />
          <KV label="เบอร์ติดต่อ" value={g.phone} lw={106} />
          <KV label="รายได้" value={g.income} unit="/เดือน" lw={106} />
          <KV label="รายจ่าย" value={g.expense} unit="/เดือน" lw={106} />
          <R gap={5}>
            <span style={{ width: 106, flexShrink: 0 }}>ประวัติครอบครัว</span>
            <span>สถานภาพ</span>
            <Line value={g.marital} grow />
          </R>
          <R gap={5} style={{ paddingLeft: 111 }}>
            บุตร <Line value={g.children} w={38} /> คน <span style={{ width: 8 }} /> พี่น้อง <Line value={g.siblings} w={38} /> คน
          </R>
        </Col>
      </Cols>
    </>
  );
}

function PE({ s }: { s: MrbPartySummary }) {
  const p = s.pe;
  return (
    <>
      <SectionHead>Physical examination</SectionHead>
      <Cols>
        <Col>
          <KV label="BW" value={p.bw} unit="kg" lw={74} />
          <KV label="HT" value={p.ht} unit="cm" lw={74} />
          <KV label="BMI" value={p.bmi} unit="kg/m²" lw={74} />
          <KV label="BSA" value={p.bsa} unit="m²" lw={74} />
        </Col>
        <Col>
          <KV label="BP" value={p.bp} unit="mmHg" lw={74} />
          <KV label="PR" value={p.pr} unit="/min" lw={74} />
        </Col>
      </Cols>
      {(
        [
          ['HEENT', p.heent],
          ['Chest', p.chest],
          ['Heart', p.heart],
          ['Abdomen', p.abdomen],
          ['Extremities', p.extremities],
        ] as const
      ).map(([k, v]) => (
        <KV key={k} label={k} value={v} lw={86} />
      ))}
    </>
  );
}

const Comment = ({ value, lines = 2 }: { value?: string; lines?: number }) => (
  <>
    <SectionHead>Comment</SectionHead>
    {Array.from({ length: lines }).map((_, i) => (
      <R key={i}>
        <Line value={i === 0 ? value : ''} grow />
      </R>
    ))}
  </>
);

/** 2.1 Potential LRKT recipient — 3 หน้า */
export function PreMrbRecipientPaper({ s, f }: { s: MrbPartySummary; f: PreMrbForm }) {
  const T = 'Potential LRKT recipient';
  return (
    <>
      <Page gap={7}>
        <Head title={T} date={f.date} reg={s.regDate} />
        <General s={s} relLabel="ความสัมพันธ์กับ donor" />
        <SectionHead>ประวัติการเจ็บป่วย</SectionHead>
        {s.history.map(([k, v]) => (
          <KV key={k} label={k} value={v} />
        ))}
        <KV label="" value="" />
        <div>Sensitization</div>
        <div style={{ paddingLeft: 30, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {s.sensitization?.map(([k, v]) => (
            <KV key={k} label={k} value={v} lw={186} />
          ))}
        </div>
        <SectionHead>Current medication</SectionHead>
        {(s.meds.length ? s.meds : ['']).map((m, i) => (
          <KV key={i} label={`${i + 1}.`} value={m} lw={18} />
        ))}
        {s.rrt && (
          <>
            <SectionHead>Renal replacement therapy</SectionHead>
            <Cols>
              <Col>
                <KV label="Prior transplant kidney" value={s.rrt.prior} lw={160} />
                <KV label="Hemodialysis" value={s.rrt.hd} lw={160} />
              </Col>
              <Col>
                <KV label="since" value={s.rrt.since} lw={50} />
                <KV label="RRF" value={s.rrt.rrf} lw={50} />
              </Col>
            </Cols>
            <KV label="vascular access" value={s.rrt.access} lw={160} />
          </>
        )}
      </Page>
      <Page gap={7}>
        <ContHead title={T} s={s} />
        <PE s={s} />
        <SectionHead>Lab</SectionHead>
        <Cols gap={10}>
          <MiniTable g={group(s, 'Chem')} />
          <Col gap={10}>
            <MiniTable g={group(s, 'Hematology')} />
            <MiniTable g={group(s, 'Iron study')} />
            <MiniTable g={group(s, 'Serology')} />
          </Col>
        </Cols>
      </Page>
      <Page gap={9}>
        <ContHead title={T} s={s} />
        <Cols gap={10}>
          <MiniTable g={group(s, 'Urine')} />
          <MiniTable g={group(s, 'Urine 24 hr')} />
        </Cols>
        <Cols gap={10}>
          {rowsTable('Imaging (date)', s.imaging)}
          {rowsTable('Consultation (date)', s.consults)}
        </Cols>
        <Cols gap={10}>
          {rowsTable('Vaccination (date)', s.vaccines, 140)}
          <Col>
            <KV label="EPTS" value={f.epts ? `${f.epts}%` : ''} lw={60} />
          </Col>
        </Cols>
        <Comment value={f.commentRecipient} />
        <div style={{ marginTop: 8, background: '#fef08a', padding: '4px 10px', display: 'flex', gap: 18, alignItems: 'center', fontWeight: 600 }}>
          Go on HLA typing?
          <Opt on={f.goHla === 'yes'} label="Yes" />
          <Opt on={f.goHla === 'no'} label="No" />
          <Opt on={f.goHla === 'consult'} label="หลัง consult" />
        </div>
      </Page>
    </>
  );
}

/** 2.1 Potential LRKT donor — 2 หน้า */
export function PreMrbDonorPaper({ s, f }: { s: MrbPartySummary; f: PreMrbForm }) {
  const T = 'Potential LRKT donor';
  return (
    <>
      <Page gap={7}>
        <Head title={T} date={f.date} reg={s.regDate} />
        <General s={s} relLabel="ความสัมพันธ์กับ recipient" />
        <SectionHead>ประวัติการเจ็บป่วย</SectionHead>
        {s.history.map(([k, v]) => (
          <KV key={k} label={k} value={v} />
        ))}
        <SectionHead>Current medication</SectionHead>
        {[0, 1, 2].map((i) => (
          <KV key={i} label={`${i + 1}.`} value={s.meds[i]} lw={18} />
        ))}
        <PE s={s} />
      </Page>
      <Page gap={7}>
        <ContHead title={T} s={s} />
        <SectionHead>Lab</SectionHead>
        <Cols gap={10}>
          <MiniTable g={group(s, 'Chem')} />
          <Col gap={10}>
            <MiniTable g={group(s, 'Hematology')} />
            <MiniTable g={group(s, 'Serology')} />
          </Col>
        </Cols>
        <Cols gap={10}>
          <MiniTable g={group(s, 'Urine')} />
          <MiniTable g={group(s, 'Urine 24 hr')} />
        </Cols>
        <Cols gap={10}>
          {rowsTable('Imaging (date)', s.imaging)}
          {rowsTable('Consultation (date)', s.consults)}
        </Cols>
        <Cols gap={10}>
          {rowsTable('Vaccination (date)', s.vaccines)}
          {s.scoring && rowsTable('Scoring', s.scoring, 150)}
        </Cols>
        <Comment value={f.commentDonor} lines={1} />
      </Page>
    </>
  );
}

// ---------------- 2.2 ----------------
const Sig = ({ name, date }: { name: string; date: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, paddingTop: 10 }}>
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 5 }}>
      <Line value={name} w={220} center /> M.D.
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 5 }}>
      Date <Line value={date ? thaiDate(date) : ''} w={186} center />
    </span>
  </div>
);
const Lbl = ({ children, w = 96, bold }: { children?: ReactNode; w?: number; bold?: boolean }) => <span style={{ width: w, flexShrink: 0, fontWeight: bold ? 600 : 400 }}>{children}</span>;
const OptLine = ({ on, label, value, w = 100 }: { on: boolean; label: string; value?: string; w?: number }) => (
  <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 5 }}>
    <Opt on={on} label={label} />
    <Line value={value} w={w} />
  </span>
);

/** 2.2 หน้า 1: ใบสรุปผลการเข้าประชุมปลูกถ่ายไต (Post MRB conclusion) */
export function PostMrbPaper({ c, f }: { c: MrbCaseDto; f: MrbForm }) {
  const plans = (title: string, list: string[]) => (
    <>
      <SectionHead>{title}</SectionHead>
      {[0, 1, 2, 3, 4].map((i) => (
        <R key={i} gap={5}>
          <span style={{ width: 16 }}>{i + 1}.</span>
          <Line value={list[i]} grow />
        </R>
      ))}
    </>
  );
  return (
    <Page gap={8}>
      <Brand />
      <div style={{ textAlign: 'center', fontSize: 16.5, fontWeight: 600, padding: '8px 0 6px' }}>ใบสรุปผลการเข้าประชุมปลูกถ่ายไต (Post MRB conclusion)</div>
      <R gap={20}>
        <Fld label="ชื่อ Recipient" value={fullName(c.recipient)} grow />
        <Fld label="HN" value={c.recipient.hn} w={150} />
      </R>
      <R gap={20}>
        <Fld label="ชื่อ Donor (for LRKT)" value={c.donor ? fullName(c.donor) : ''} grow />
        <Fld label="HN" value={c.donor?.hn} w={150} />
      </R>
      <R gap={22} style={{ alignItems: 'center' }}>
        <Lbl bold>สิทธิการรักษา</Lbl>
        {COVERAGES.map((k) => (
          <Opt key={k} on={f.coverage === k} label={k} />
        ))}
      </R>
      {plans('Plan (Recipient)', f.planRecipient)}
      {plans('Plan (Donor)', f.planDonor)}
      <R gap={22} style={{ alignItems: 'flex-end', paddingTop: 8 }}>
        <Lbl bold>Typing</Lbl>
        <Opt on={f.typing === 'yes'} label="Typing ได้" />
        <OptLine on={f.typing === 'consult'} label="Typing หลังจาก consult" value={f.typingConsult} w={136} />
        <Opt on={f.typing === 'no'} label="ไม่ Typing" />
      </R>
      <SectionHead>Remark</SectionHead>
      {[0, 1, 2].map((i) => (
        <R key={i}>
          <Line value={i === 0 ? f.remark : ''} grow />
        </R>
      ))}
      <Sig name={f.physician} date={f.signDate} />
    </Page>
  );
}

/** 2.2 หน้า 2: Pre-living KT evaluation form */
export function PreLivingPaper({ c, f }: { c: MrbCaseDto; f: MrbForm }) {
  const p = f.pre;
  const d = (iso: string) => (iso ? thaiShort(iso) : '');
  const meds = p.meds.split('\n');
  return (
    <Page gap={7}>
      <Brand />
      <div style={{ textAlign: 'center', fontSize: 16.5, fontWeight: 600, textDecoration: 'underline', padding: '8px 0 4px' }}>Pre-living KT evaluation form</div>
      <SectionHead>1. Recipient</SectionHead>
      <R gap={14}>
        <Fld label="Name" value={fullName(c.recipient)} grow />
        <Fld label="HN" value={c.recipient.hn} w={110} />
        <Fld label="Age" value={c.recipient.age ? String(c.recipient.age) : ''} w={50} />
      </R>
      <R gap={12}>
        <Fld label="Date of evaluation" value={d(p.evalDate)} grow />
        <Fld label="Date of admission" value={d(p.admitDate)} grow />
        <Fld label="Date of operation" value={d(p.opDate)} grow />
      </R>
      <R gap={5}>
        Medications: <Line value={meds[0]} grow />
      </R>
      <R>
        <Line value={meds[1]} grow />
      </R>
      <R>
        <Line value={meds[2]} grow />
      </R>
      <R gap={18}>
        <OptLine on={p.antiPlatelet.on} label="Anti-platelet" value={p.antiPlatelet.name} />
        <OptLine on={p.antiCoagulant.on} label="Anti-coagulant" value={p.antiCoagulant.name} />
        <OptLine on={p.stop.on} label="Stop date" value={d(p.stop.date)} w={110} />
      </R>
      <SectionHead>2. Donor</SectionHead>
      <R gap={14}>
        <Fld label="Name" value={c.donor ? fullName(c.donor) : ''} grow />
        <Fld label="HN" value={c.donor?.hn} w={110} />
        <Fld label="Age" value={c.donor ? String(c.donor.age) : ''} w={50} />
      </R>
      <R gap={28}>
        <Fld label="Creatinine" value={p.donorCr} w={86} after="mg/dL" />
        <Fld label="eGFR/mCLcr" value={p.donorEgfr} w={86} after="ml/min/1.73 m²" />
      </R>
      <SectionHead>3. Risk</SectionHead>
      <R gap={22} style={{ alignItems: 'center' }}>
        <Lbl>General</Lbl>
        <Opt on={p.prevKt} label="Previous-KT" />
        <Opt on={p.pregnancy} label="Pregnancy" />
        <Opt on={p.transfusion} label="Blood transfusion" />
      </R>
      <R gap={16}>
        <Lbl>ABO</Lbl>
        <Opt on={p.abo === 'compatible'} label="Compatibility" />
        <Opt on={p.abo === 'incompatible'} label="Incompatibility" />
        <Fld label="(D)" value={p.aboD} w={50} />
        <Fld label="to (R)" value={p.aboR} w={50} />
      </R>
      <R gap={14}>
        HLA mismatch:
        {(['A', 'B', 'DR', 'DQ'] as const).map((k) => (
          <Fld key={k} label={k} value={p.hla[k]} w={34} />
        ))}
      </R>
      <R gap={14}>
        <Fld label="Screening PRA" value={p.pra.screening} grow />
        <Fld label="Peak PRA" value={p.pra.peak} grow />
        <Fld label="Current PRA" value={p.pra.current} grow />
      </R>
      {[0, 1].map((i) => (
        <R key={i} gap={12}>
          <Lbl>{i === 0 ? 'Anti-HLA DSA' : ''}</Lbl>
          {i === 0 ? (
            <>
              <Opt on={p.dsa === 'negative'} label="Negative" w={90} />
              <Opt on={p.dsa === 'positive'} label="Positive, class" />
            </>
          ) : (
            <span style={{ width: 196, flexShrink: 0, textAlign: 'right' }}>class</span>
          )}
          <Line value={p.dsaRows[i].cls} w={50} />
          <Fld label="Ag" value={p.dsaRows[i].ag} w={60} />
          <Fld label="MFI" value={p.dsaRows[i].mfi} w={86} />
        </R>
      ))}
      <R gap={12}>
        <Lbl>Crossmatch</Lbl>
        <Opt on={p.xm === 'negative'} label="Negative" w={90} />
        <Opt on={p.xm === 'positive'} label="Positive, class" />
        <Line value={p.xmClass} w={50} />
        <Opt on={p.xmIgG} label="IgG" />
        <Opt on={p.xmIgM} label="IgM" />
        <Line value={p.xmNote} w={86} />
      </R>
      <SectionHead>4. Problems from MRB</SectionHead>
      <R gap={30} style={{ alignItems: 'center' }}>
        <Opt on={p.problems === 'none'} label="No problem" />
        <Opt on={p.problems === 'resolved'} label="Problems resolved" />
      </R>
      <SectionHead>5. Plan</SectionHead>
      <R gap={10}>
        <Lbl w={150} bold>
          - Desensitization
        </Lbl>
        <Opt on={p.plasmapheresis.on} label="Plasmapheresis" />
        <Line value={p.plasmapheresis.sessions} w={40} />
        <Fld label="sessions Date" value={d(p.plasmapheresis.date)} w={110} />
      </R>
      <R gap={10}>
        <Lbl w={150} />
        <Opt on={p.ivig.on} label="IVIg" />
        <Line value={p.ivig.dose} w={50} />
        <Fld label="Date" value={d(p.ivig.date)} w={86} />
        <Opt on={p.rituximab.on} label="Rituximab" />
        <Fld label="Date" value={d(p.rituximab.date)} w={86} />
      </R>
      <R gap={26} style={{ alignItems: 'center' }}>
        <Lbl w={150} bold>
          - Induction
        </Lbl>
        <Opt on={p.basiliximab} label="Basiliximab" />
        <Opt on={p.atg} label="ATG" />
        <Opt on={p.ivmp} label="IVMP" />
      </R>
      <R gap={10} style={{ alignItems: 'center' }}>
        <Lbl w={150} bold>
          - Maintenance
        </Lbl>
        <Opt on={p.maintenanceStd} label="Tacrolimus/Mycophenolate mofetil/Prednisolone" />
      </R>
      <R gap={10}>
        <Lbl w={150} />
        <Opt on={p.maintenanceOther.on} label="Others" />
        <Line value={p.maintenanceOther.text} grow />
      </R>
      <R gap={26} style={{ alignItems: 'center' }}>
        <Lbl w={150} bold>
          - Infectious prophylaxis
        </Lbl>
        <Opt on={p.cotrimoxazole} label="Cotrimoxazole" />
        <Opt on={p.acyclovir} label="Acyclovir" />
      </R>
      <R gap={16} style={{ alignItems: 'center' }}>
        <Lbl w={150} />
        CMV
        <Opt on={p.cmv === 'prophylaxis'} label="prophylaxis" />
        <Opt on={p.cmv === 'preemptive'} label="pre-emptive" />
      </R>
      <Sig name={f.physician} date={f.signDate} />
    </Page>
  );
}
