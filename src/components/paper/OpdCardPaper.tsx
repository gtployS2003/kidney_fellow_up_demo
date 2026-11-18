import type { CSSProperties, ReactNode } from 'react';
import type { PersonRef } from '@/types';
import type { OpdCardVisit, OpdLabGroup } from '@/services/api/imedApi';
import { fullName, thaiDate } from '@/lib/format';
import { Brand, Fld, Line, MUTE, Opt, Page, R, RULE, SectionHead, VALUE } from './Sheet';

/**
 * OPD card · Kidney transplantation (Nephro) — 2 หน้า A4 (ตรงกับ Figma · เนื้อหาครบตามต้นฉบับ)
 * ข้อมูลทั้งหมดมาจาก iMed — ใช้สำหรับ Preview / พิมพ์ / Export
 */
const B = `1px solid ${RULE}`;
const LIGHT = '1px solid #cbd5e1';
const SM: CSSProperties = { fontSize: 11.8, lineHeight: 1.35 };

const Box = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div style={{ border: B, padding: '7px 10px', display: 'flex', flexDirection: 'column', gap: 6, ...style }}>{children}</div>;
/** แถวคอลัมน์ในกรอบ (เส้นแบ่งแนวตั้งระหว่างคอลัมน์) */
function Grid({ children, top }: { children: ReactNode[]; top?: boolean }) {
  return (
    <div style={{ display: 'flex', border: B, borderTop: top ? 'none' : B, padding: '7px 10px' }}>
      {children.map((c, i) => (
        <div key={i} style={{ flex: 1, minWidth: 0, padding: i ? '0 0 0 8px' : '0 8px 0 0', borderLeft: i ? LIGHT : undefined, display: 'flex', flexDirection: 'column' }}>
          {c}
        </div>
      ))}
    </div>
  );
}
const ColTitle = ({ children }: { children: ReactNode }) => <div style={{ fontSize: 12.4, fontWeight: 600, color: '#374151', borderBottom: LIGHT, paddingBottom: 2, marginBottom: 3 }}>{children}</div>;
/** ป้าย | ค่า (เส้นประ) | หน่วย */
function M({ label, value, unit, lw, chk }: { label: string; value?: string; unit?: string; lw: number; chk?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, minHeight: 16, ...SM }}>
      {chk !== undefined && <Opt on={chk} label="" style={{ gap: 0 }} />}
      <span style={{ width: lw, flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 1, minWidth: 0, borderBottom: '1px dotted #9ca3af', padding: '0 2px', color: VALUE, fontWeight: 500, minHeight: 15 }}>{value || ' '}</span>
      {unit !== undefined && <span style={{ fontSize: 10.5, color: '#6b7280', minWidth: 26 }}>{unit}</span>}
    </div>
  );
}
const NoteLine = ({ children }: { children?: ReactNode }) => <div style={{ borderBottom: '1px solid #cbd5e1', minHeight: 18, color: VALUE, fontWeight: 500, ...SM }}>{children ?? ' '}</div>;
const labCol = (g: OpdLabGroup, lw: number, chk: string[] = []) => (
  <>
    <ColTitle>{g.title}</ColTitle>
    {g.rows.map(([l, v, u]) => (
      <M key={l} label={l} value={v} unit={u} lw={lw} chk={chk.includes(l) ? !!v : undefined} />
    ))}
  </>
);

function Head({ p, v }: { p: PersonRef; v: OpdCardVisit }) {
  return (
    <>
      <Brand />
      <R style={{ justifyContent: 'space-between' }}>
        <span>
          <span style={{ fontSize: 17, fontWeight: 600 }}>OPD card </span>
          <span style={{ color: MUTE }}>Kidney transplantation (Nephro)</span>
        </span>
        <Fld label="Date" value={`${thaiDate(v.date)} , ${v.time} น.`} w={175} />
      </R>
      <R gap={12}>
        <Fld label="HN" value={p.hn} w={88} />
        <Fld label="VN" value={v.vn} w={100} />
        <Fld label="ชื่อ" value={fullName(p)} grow />
        <Fld label="เพศ" value={p.sex === 'male' ? 'ชาย' : 'หญิง'} w={50} />
        <Fld label="อายุ" value={String(p.age)} w={38} after="ปี" />
      </R>
      <R gap={12}>
        <Opt on={!!v.allergy} label="แพ้ยา" />
        <Line value={v.allergy} w={150} />
        <Opt on={!!v.coverage} label="สิทธิการรักษา" />
        <Line value={v.coverage} w={150} />
        <Fld label="OPD" value={v.opd} w={50} />
      </R>
    </>
  );
}

export function OpdCardPaper({ p, v }: { p: PersonRef; v: OpdCardVisit }) {
  const { kt, vitals: vs, note, labs, meds, summary } = v;
  return (
    <div className="paper-stack">
      {/* ---------- หน้า 1 ---------- */}
      <Page gap={7}>
        <Head p={p} v={v} />
        <SectionHead>ข้อมูลการปลูกถ่ายไต</SectionHead>
        <Box>
          <R gap={14}>
            <span style={{ fontWeight: 600 }}>Status</span>
            <Opt on={kt.deceased} label="Deceased donor KT" />
            <Opt on={!kt.deceased} label="Living donor KT from" />
            <Line value={kt.donorFrom} w={110} />
            <Fld label="KT date" value={thaiDate(kt.ktDate)} w={120} />
          </R>
          <R gap={10}>
            <Fld label="HLA MM A-B-DR-DQ" value={kt.hlaMm} w={86} />
            <Opt on={!!kt.pra} label="PRA" />
            <Line value={kt.pra} w={100} />
            <Opt on={!!kt.preDsa} label="pre KT DSA" />
            <Line value={kt.preDsa} grow />
          </R>
          <R gap={10}>
            <Fld label="CDC crossmatch" value={kt.xm} w={86} />
            <Opt on={kt.abo} label="ABOi" />
            <Line w={74} />
            <Opt on={kt.prevKt} label="Previous KT" />
            <Opt on={!!kt.cmv} label="CMV IgG D/R" />
            <Line value={kt.cmv} w={62} />
          </R>
        </Box>
        <Grid>
          {[
            <>
              <ColTitle>Vital sign</ColTitle>
              {(
                [
                  ['BT', vs.bt, '°C'],
                  ['PR', vs.pr, 'bpm'],
                  ['BP', vs.bp, 'mmHg'],
                  ['RR', vs.rr, '/min'],
                  ['BW', vs.bw, 'kg'],
                  ['BMI', vs.bmi, 'kg/m²'],
                ] as const
              ).map(([l, val, u]) => (
                <M key={l} label={l} value={val} unit={u} lw={30} />
              ))}
            </>,
            <>
              <ColTitle>Clinical note</ColTitle>
              <div style={SM}>
                <Opt on={note.homeBp} label="Home BP" />
              </div>
              <NoteLine>{note.clinical}</NoteLine>
              <NoteLine />
              <NoteLine />
              <NoteLine />
            </>,
            <>
              <ColTitle>Physical examination</ColTitle>
              <M label="Edema" value={note.edema} lw={42} />
              <div style={{ display: 'flex', gap: 10, ...SM, marginTop: 3 }}>
                <Opt on={note.tremor} label="Tremor" />
                <Opt on={note.oralUlcer} label="Oral ulcer" />
              </div>
              <NoteLine />
              <NoteLine />
              <NoteLine />
            </>,
            <>
              <ColTitle>Pharmacist/Dietician note</ColTitle>
              <NoteLine>{note.pharm}</NoteLine>
              <NoteLine />
              <NoteLine />
              <NoteLine />
              <NoteLine />
            </>,
          ]}
        </Grid>
        <SectionHead>ผลตรวจทางห้องปฏิบัติการ</SectionHead>
        <Grid>{[labCol(labs.drug, 66, ['TAC C0', 'CSA C0/C2', 'SRL C0', 'EVL C0']), labCol(labs.heme, 72), labCol(labs.chem, 80)]}</Grid>
        <Grid top>{[labCol(labs.lipid, 72), labCol(labs.urine24, 92), labCol(labs.urine, 72, ['UA sp.gr', 'UPCI'])]}</Grid>
      </Page>

      {/* ---------- หน้า 2 ---------- */}
      <Page gap={7}>
        <R style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>OPD card (ต่อ)</span>
          <span style={{ color: MUTE }}>
            HN {p.hn} · {fullName(p)} · {thaiDate(v.date)}
          </span>
        </R>
        <SectionHead>ยาที่ใช้ปัจจุบัน</SectionHead>
        <Grid>
          {[
            <>
              <ColTitle>ยากดภูมิคุ้มกัน</ColTitle>
              {meds.immuno.map(([l, val]) => (
                <M key={l} label={l} value={val} lw={88} />
              ))}
            </>,
            <>
              <ColTitle>ยาป้องกัน / ยาอื่น</ColTitle>
              {meds.prophylaxis.map(([l, val]) => (
                <M key={l} label={l} value={val} lw={118} />
              ))}
            </>,
          ]}
        </Grid>
        <Grid top>
          {[
            <>
              <ColTitle>ยาอื่น ๆ</ColTitle>
              {meds.misc.map(([l, val]) => (
                <M key={l} label={l} value={val} lw={50} />
              ))}
            </>,
            <>
              <ColTitle>Review medications</ColTitle>
              {[...meds.review, '', ''].slice(0, Math.max(7, meds.review.length)).map((r, i) => (
                <NoteLine key={i}>{r || undefined}</NoteLine>
              ))}
            </>,
          ]}
        </Grid>
        <SectionHead>Summary</SectionHead>
        <Box>
          <R gap={20} style={{ alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Summary</span>
            {(['Stable', 'Deteriorated', 'Improved graft function'] as const).map((g) => (
              <Opt key={g} on={summary.graft === g} label={g} />
            ))}
          </R>
          <div style={{ display: 'flex', gap: 18 }}>
            {[summary.left, summary.right].map((col, ci) => (
              <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {col.map(([l, val]) => (
                  <R key={l} gap={0}>
                    <Fld label={l} labelW={ci ? 100 : 140} value={val === 'ไม่มี' ? '' : val} grow />
                  </R>
                ))}
              </div>
            ))}
          </div>
        </Box>
        <SectionHead>Last investigations</SectionHead>
        <Box>
          {v.last.map(([l, val]) => (
            <R key={l} gap={0}>
              <Fld label={l} labelW={150} value={val} grow />
            </R>
          ))}
        </Box>
        <NoteLine />
        <NoteLine />
        <div style={{ height: 12 }} />
        <R gap={14}>
          <Fld label="Follow up" value={v.followUp} w={200} />
          <span style={{ flex: 1 }} />
          <Fld label="Physician" value={v.physician} w={220} after="M.D." />
        </R>
      </Page>
    </div>
  );
}
