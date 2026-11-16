import type { DoseLogDayDto, DrugDoseChangeDto, DrugLevelDto, DrugLevelPointDto, LabHistoryDto, LabSeriesDto, PersonKind } from '@/types';
import { recipientsDb } from './recipients';
import { donorsDb } from './donors';

/**
 * ข้อมูลแล็บย้อนหลัง + ระดับยากดภูมิ (เดโม)
 * - สร้างแบบคงที่จาก id ผู้ป่วย + วันผ่าตัด → เปิดกี่ครั้งก็ได้ค่าเดิม
 * - ผู้รับหลังผ่าตัด: ค่าไตสูงก่อนผ่าตัด แล้วลดลงหลังผ่าตัด · ผู้บริจาค: Cr สูงขึ้นเล็กน้อยหลังบริจาค
 * - ภายหลังแทนด้วย GET /api/{recipients|donors}/{id}/labs/history และ /recipients/{id}/drug-levels
 */

const DAY = 86400000;
const seedOf = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
function rng(seed: number) {
  let x = seed || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1000) / 1000;
  };
}
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (iso: string, n: number) => ymd(new Date(new Date(iso + 'T00:00:00').getTime() + n * DAY));
const daysBetween = (a: string, b: string) => Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / DAY);
const today = () => ymd(new Date());

const POST = ['opd', 'discharge', 'postop'];
function personOf(kind: PersonKind, id: string) {
  return kind === 'recipient' ? recipientsDb.find((r) => r.id === id) : donorsDb.find((d) => d.id === id);
}
/** วันผ่าตัด (หลักเดียวกับ surgeryDateOf ในหน้าติดตาม OPD) */
function surgeryOf(kind: PersonKind, id: string): string | undefined {
  const p = personOf(kind, id);
  if (!p || !POST.includes(p.status)) return undefined;
  if (p.stageDates.surgery) return p.stageDates.surgery;
  return addDays(p.statusSince, -11);
}

// ---------- นิยามรายการแล็บ ----------
type Def = Omit<LabSeriesDto, 'values'>;
const ORD = ['Negative', 'Trace', '1+', '2+', '3+'];
export const LAB_DEFS: Def[] = [
  { key: 'cr', group: 'Renal function', name: 'Creatinine', thai: 'ค่าการทำงานของไต', unit: 'mg/dL', ref: '0.5 – 1.1', lo: 0.5, hi: 1.1, decimals: 1 },
  { key: 'bun', group: 'Renal function', name: 'BUN', thai: 'ของเสียในเลือด', unit: 'mg/dL', ref: '7 – 20', lo: 7, hi: 20, decimals: 0 },
  { key: 'egfr', group: 'Renal function', name: 'eGFR', thai: 'อัตราการกรองของไต', unit: 'mL/min', ref: '> 60', lo: 60, hi: null, decimals: 0 },
  { key: 'na', group: 'Electrolytes', name: 'Sodium', thai: 'โซเดียม (เกลือ)', unit: 'mmol/L', ref: '135 – 145', lo: 135, hi: 145, decimals: 0 },
  { key: 'k', group: 'Electrolytes', name: 'Potassium', thai: 'โพแทสเซียม', unit: 'mmol/L', ref: '3.5 – 5.1', lo: 3.5, hi: 5.1, decimals: 1 },
  { key: 'mg', group: 'Electrolytes', name: 'Magnesium', thai: 'แมกนีเซียม', unit: 'mg/dL', ref: '1.7 – 2.4', lo: 1.7, hi: 2.4, decimals: 1 },
  { key: 'hb', group: 'CBC', name: 'Hemoglobin', thai: 'ความเข้มข้นของเลือด', unit: 'g/dL', ref: '12 – 16', lo: 12, hi: 16, decimals: 1 },
  { key: 'wbc', group: 'CBC', name: 'WBC', thai: 'เม็ดเลือดขาว', unit: '×10³/µL', ref: '4.5 – 11', lo: 4.5, hi: 11, decimals: 1 },
  { key: 'plt', group: 'CBC', name: 'Platelet', thai: 'เกล็ดเลือด', unit: '×10³/µL', ref: '150 – 450', lo: 150, hi: 450, decimals: 0 },
  { key: 'tac', group: 'Drug level', name: 'Tacrolimus (trough)', thai: 'ระดับยากดภูมิ', unit: 'ng/mL', ref: 'เป้า 8 – 10', lo: 8, hi: 10, target: true, decimals: 1 },
  { key: 'uprot', group: 'Urine', name: 'UA protein', thai: 'โปรตีนในปัสสาวะ', unit: '', ref: 'Negative', lo: 0, hi: 0, ordinal: ORD, decimals: 0 },
];

/** ค่าในแต่ละสถานการณ์: [ก่อนผ่าตัด/ปัจจุบัน, หลังผ่าตัดคงที่] */
const ESRD: Record<string, number> = { cr: 8.0, bun: 58, egfr: 6, na: 137, k: 5.4, mg: 2.2, hb: 10.2, wbc: 6.3, plt: 205, uprot: 3 };
const RECOVERED: Record<string, number> = { cr: 1.0, bun: 18, egfr: 72, na: 139, k: 4.3, mg: 1.6, hb: 12.4, wbc: 6.8, plt: 245, uprot: 0 };
const NORMAL: Record<string, number> = { cr: 0.8, bun: 12, egfr: 98, na: 140, k: 4.2, mg: 2.0, hb: 14.0, wbc: 6.0, plt: 265, uprot: 0 };
const DONATED: Record<string, number> = { cr: 1.3, bun: 16, egfr: 62, na: 140, k: 4.3, mg: 2.0, hb: 13.4, wbc: 6.1, plt: 262, uprot: 0 };
const NOISE: Record<string, number> = { cr: 0.03, bun: 0.06, egfr: 0.03, na: 0.006, k: 0.03, mg: 0.03, hb: 0.02, wbc: 0.05, plt: 0.04, uprot: 0 };

function recipientPost(key: string, d: number): number {
  const pre = ESRD[key];
  const post = RECOVERED[key];
  if (d < 0) return pre;
  switch (key) {
    case 'hb':
      return post - (post - 9.0) * Math.exp(-d / 25);
    case 'wbc':
      return post + 5 * Math.exp(-d / 6);
    case 'plt':
      return post - 85 * Math.exp(-d / 5);
    case 'uprot':
      return d < 5 ? 2 : d < 12 ? 1 : 0;
    case 'egfr':
      return post - (post - pre) * Math.exp(-d / 10);
    case 'mg':
      return post + (pre - post) * Math.exp(-d / 10);
    default:
      return post + (pre - post) * Math.exp(-d / (key === 'cr' ? 4 : 6));
  }
}
function donorPost(key: string, d: number): number {
  if (d < 0) return NORMAL[key];
  if (key === 'hb') return DONATED.hb - (DONATED.hb - 12.2) * Math.exp(-d / 12);
  if (key === 'wbc') return DONATED.wbc + 4 * Math.exp(-d / 5);
  if (key === 'uprot') return d < 3 ? 1 : 0;
  if (key === 'cr') return DONATED.cr + 0.25 * Math.exp(-d / 6);
  return DONATED[key];
}

// ---------- ระดับยา Tacrolimus (สร้างตามกฎการปรับยาจริง) ----------
export const TAC_TARGETS = [
  { fromDay: 0, toDay: 90, lo: 8, hi: 10, label: '0 – 3 เดือน' },
  { fromDay: 90, toDay: 365, lo: 6, hi: 8, label: '3 – 12 เดือน' },
  { fromDay: 365, toDay: null, lo: 5, hi: 7, label: 'หลัง 1 ปี' },
];
const targetAt = (pod: number) => TAC_TARGETS.find((t) => pod >= t.fromDay && (t.toDay === null || pod < t.toDay)) ?? TAC_TARGETS[0];
/** ระดับยา 9 ครั้งแรกหลังผ่าตัด (ทำให้เดโมเห็นทั้งสูง/ต่ำ/ในเป้า) */
const TAC_EARLY = [6.2, 9.1, 11.8, 10.4, 9.8, 10.4, 8.9, 8.9, 7.6];
const NON_TROUGH_INDEX = 5;
const FLUCONAZOLE = { from: 7, to: 20 };

function tacFor(id: string, surgery: string, postDays: number[]) {
  const r = rng(seedOf(id + 'tac'));
  let dose = 10; // mg/วัน (5 mg เช้า–เย็น)
  const doses: DrugDoseChangeDto[] = [{ date: addDays(surgery, 1), mgDay: dose, perDose: dose / 2, note: 'เริ่มยาหลังผ่าตัด' }];
  const points: DrugLevelPointDto[] = [];
  postDays.forEach((pod, i) => {
    const t = targetAt(pod);
    const level = i < TAC_EARLY.length ? TAC_EARLY[i] : Math.round((dose * 1.08 + (r() - 0.5) * 1.6) * 10) / 10;
    const trough = i !== NON_TROUGH_INDEX;
    const date = addDays(surgery, pod);
    const p: DrugLevelPointDto = { date, pod, level, hoursSinceDose: trough ? 12 + Math.round((r() - 0.5) * 2) / 2 : 2, trough, doseMgDay: dose, lo: t.lo, hi: t.hi };
    if (!trough) p.note = 'ไม่ใช่ trough (เจาะหลังกินยา 2 ชม.)';
    if (pod >= FLUCONAZOLE.from && pod <= FLUCONAZOLE.to) p.note = [p.note, 'ใช้ Fluconazole อยู่'].filter(Boolean).join(' · ');
    points.push(p);
    // ปรับยาวันถัดไป เมื่อเป็น trough และนอกช่วงเป้า (ยกเว้น 3 วันแรก)
    if (trough && pod > 3 && (level > t.hi || level < t.lo)) {
      const next = level > t.hi ? Math.max(4, dose - (level - t.hi > 1.5 ? 2 : 1)) : dose + 1;
      if (next !== dose) {
        const nd = addDays(surgery, pod + 1);
        if (nd <= today()) {
          doses.push({ date: nd, mgDay: next, perDose: next / 2, note: `${next > dose ? 'เพิ่ม' : 'ลด'}ยา ${dose / 2} → ${next / 2} mg (ผล ${level})` });
          p.note = [p.note, `${next > dose ? 'เพิ่ม' : 'ลด'}ยาเป็น ${next / 2} mg เช้า–เย็น`].filter(Boolean).join(' · ');
          dose = next;
        }
      }
    }
  });
  return { points, doses, dose };
}

/** วันที่ตรวจแล็บ: ก่อนผ่าตัด 3 ครั้ง + หลังผ่าตัดตามรอบติดตาม */
const POST_SCHEDULE = [1, 3, 8, 15, 22, 29, 43, 57, 71, 85, 113, 141, 169, 197, 253, 309, 365];

function buildDates(kind: PersonKind, id: string) {
  const surgery = surgeryOf(kind, id);
  const t = today();
  if (surgery) {
    const pod = daysBetween(surgery, t);
    const pre = [-70, -40, -5].map((d) => addDays(surgery, d));
    const postDays = POST_SCHEDULE.filter((d) => d <= pod);
    return { surgery, pre, postDays, dates: [...pre, ...postDays.map((d) => addDays(surgery, d))] };
  }
  const dates = Array.from({ length: 8 }).map((_, i) => addDays(t, -2 - (7 - i) * 21));
  return { surgery: undefined, pre: dates, postDays: [] as number[], dates };
}

export function labHistoryFor(kind: PersonKind, id: string): LabHistoryDto {
  const { surgery, dates, postDays } = buildDates(kind, id);
  const r = rng(seedOf(id));
  const tac = surgery && kind === 'recipient' ? tacFor(id, surgery, postDays) : null;
  const series: LabSeriesDto[] = [];
  for (const def of LAB_DEFS) {
    if (def.key === 'tac') {
      if (!tac || !surgery) continue;
      const map = new Map(tac.points.map((p) => [p.date, p.level]));
      series.push({ ...def, values: dates.map((d) => map.get(d) ?? null) });
      continue;
    }
    const values = dates.map((d) => {
      const pod = surgery ? daysBetween(surgery, d) : -1;
      let v: number;
      if (kind === 'recipient') v = surgery ? recipientPost(def.key, pod) : ESRD[def.key];
      else v = surgery ? donorPost(def.key, pod) : NORMAL[def.key];
      if (def.ordinal) return Math.round(v);
      const n = 1 + (r() - 0.5) * 2 * NOISE[def.key];
      const f = 10 ** def.decimals;
      return Math.round(v * n * f) / f;
    });
    series.push({ ...def, values });
  }
  const last = dates[dates.length - 1];
  const pending = kind === 'recipient' && surgery ? [{ name: 'CMV PCR', sentAt: last }, { name: 'Urine culture', sentAt: last }] : kind === 'recipient' ? [{ name: 'PRA', sentAt: last }] : [];
  return { dates, surgeryDate: surgery, series, pending };
}

/** ผลการกินยาจากการบันทึกใน LINE (ย้อนหลัง n วัน) */
export function doseLogFor(id: string, days: number): DoseLogDayDto[] {
  const r = rng(seedOf(id + 'dose'));
  const all = Array.from({ length: 120 }).map((_, i) => {
    const back = 119 - i;
    const d = addDays(today(), -back);
    const am = r() > 0.012;
    const pm = r() > 0.04;
    return { date: d, am, pm: back === 4 ? false : pm }; // ให้เห็นมื้อที่ลืมใน 7 วันล่าสุดเสมอ
  });
  return all.slice(-days);
}

export function drugLevelFor(id: string): DrugLevelDto | null {
  const surgery = surgeryOf('recipient', id);
  if (!surgery) return null;
  const { postDays } = buildDates('recipient', id);
  const tac = tacFor(id, surgery, postDays);
  const log = doseLogFor(id, 120).filter((d) => d.date > surgery);
  const missed = log.flatMap((d) => [...(d.am ? [] : [{ date: d.date, slot: 'เช้า' as const }]), ...(d.pm ? [] : [{ date: d.date, slot: 'เย็น' as const }])]);
  const last30 = log.slice(-30);
  const taken = last30.reduce((s, d) => s + (d.am ? 1 : 0) + (d.pm ? 1 : 0), 0);
  const lastDose = tac.doses[tac.doses.length - 1];
  const pod = daysBetween(surgery, today());
  const nextPod = POST_SCHEDULE.find((d) => d > pod);
  return {
    drug: 'Tacrolimus',
    unit: 'ng/mL',
    surgeryDate: surgery,
    points: tac.points,
    doses: tac.doses,
    regimen: [
      { name: 'Tacrolimus', dose: `${lastDose.perDose} mg เช้า–เย็น`, monitored: true, since: lastDose.date },
      { name: 'Mycophenolate', dose: '720 mg เช้า–เย็น', monitored: false },
      { name: 'Prednisolone', dose: pod > 60 ? '5 mg เช้า' : '10 mg เช้า', monitored: false },
    ],
    targets: TAC_TARGETS,
    interactions: [{ name: 'Fluconazole', from: addDays(surgery, FLUCONAZOLE.from), to: addDays(surgery, FLUCONAZOLE.to), effect: 'เพิ่มระดับยา Tacrolimus' }],
    missed,
    adherence30: { taken, total: last30.length * 2 },
    nextTest: nextPod ? addDays(surgery, nextPod) : undefined,
  };
}
