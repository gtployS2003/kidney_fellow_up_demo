import type { AppointmentDto, LabItemDto, LabResultDto, PersonKind, ResultStatus } from '@/types';
import { recipientsDb } from './recipients';
import { donorsDb } from './donors';
import { STATUS_META } from '@/lib/status';

import { HOLIDAYS, holidayOf } from '@/lib/holidays';
export { HOLIDAYS, holidayOf };
export { isoDate as iso } from '@/lib/format';
import { isoDate as iso } from '@/lib/format';

type Person = { kind: PersonKind; id: string; name: string; hn: string; stage: string; status: string };
const people: Person[] = [
  ...recipientsDb.map((r) => ({ kind: 'recipient' as const, id: r.id, name: `${r.prefix}${r.firstName} ${r.lastName}`, hn: r.hn, stage: STATUS_META[r.status].label, status: r.status })),
  ...donorsDb.filter((d) => d.caseType === 'living').map((d) => ({ kind: 'donor' as const, id: d.id, name: `${d.prefix}${d.firstName} ${d.lastName}`, hn: d.hn, stage: STATUS_META[d.status].label, status: d.status })),
];

function typeFor(p: Person): [string, string] {
  if (p.status === 'opd') return [p.kind === 'donor' ? 'ติดตามหลังบริจาค' : 'ติดตาม OPD', 'OPD อายุรกรรมโรคไต · ห้อง 3'];
  if (p.status === 'evaluation' || p.status === 'passed') return ['Pre-KT evaluation', 'ห้อง 5'];
  if (p.status === 'waitingRedCross' || p.status === 'matching') return ['เจาะเลือดส่ง serum', 'ห้อง Lab'];
  if (p.status === 'waitingSurgery') return ['เตรียมผ่าตัด', 'OPD ศัลยกรรม'];
  return ['ติดตามอาการ', 'OPD อายุรกรรมโรคไต · ห้อง 3'];
}

const TIMES = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00'];
const manual: AppointmentDto[] = [];
const cache = new Map<string, AppointmentDto[]>();

/** นัดจาก iMed ของวันหนึ่ง (สร้างแบบคงที่จากวันที่ เพื่อให้เดโมดูเหมือนจริง) */
function imedFor(day: string, today: string): AppointmentDto[] {
  const hit = cache.get(day);
  if (hit) return hit;
  const d = new Date(day);
  const dow = d.getDay();
  let list: AppointmentDto[] = [];
  if (dow !== 0 && dow !== 6 && !holidayOf(day)) {
    const n = (d.getDate() * 7 + d.getMonth() * 3) % 9; // 0–8 นัด
    list = Array.from({ length: n }).map((_, i) => {
      const p = people[(d.getDate() * 5 + i * 3 + d.getMonth()) % people.length];
      const [type, room] = typeFor(p);
      const status: ResultStatus = day < today ? 'ok' : day > today ? 'none' : (['ok', 'ok', 'wait', 'ok', 'wait', 'none', 'ok', 'wait', 'ok'] as ResultStatus[])[i];
      return { id: `im-${day}-${i}`, date: day, time: TIMES[i % TIMES.length], personKind: p.kind, personId: p.id, name: p.name, hn: p.hn, stage: p.stage, type, room, doctor: 'นพ.สมเกียรติ วงศ์ไทย', resultStatus: status, source: 'imed' as const };
    });
  }
  cache.set(day, list);
  return list;
}

export function appointmentsInRange(from: string, to: string): AppointmentDto[] {
  const today = iso(new Date());
  const out: AppointmentDto[] = [];
  const d = new Date(from);
  while (iso(d) <= to) {
    out.push(...imedFor(iso(d), today));
    d.setDate(d.getDate() + 1);
  }
  out.push(...manual.filter((m) => m.date >= from && m.date <= to));
  return out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function addManual(a: AppointmentDto) {
  manual.push(a);
}
export function updateManual(a: AppointmentDto) {
  const i = manual.findIndex((m) => m.id === a.id);
  if (i >= 0) manual[i] = a;
}
export function removeManual(id: string) {
  const i = manual.findIndex((m) => m.id === id);
  if (i >= 0) manual.splice(i, 1);
}
export function peopleForPicker() {
  return people;
}

// ---------- ผลแล็บ (ตัวอย่าง) ----------
const LAB_DEFS: [string, string, string, string, number, number][] = [
  ['Renal function', 'Creatinine', 'mg/dL', '0.5 – 1.1', 0.5, 1.1],
  ['Renal function', 'BUN', 'mg/dL', '7 – 20', 7, 20],
  ['Renal function', 'eGFR', 'mL/min', '> 60', 60, 200],
  ['Electrolytes', 'Sodium', 'mmol/L', '135 – 145', 135, 145],
  ['Electrolytes', 'Potassium', 'mmol/L', '3.5 – 5.1', 3.5, 5.1],
  ['Electrolytes', 'Magnesium', 'mg/dL', '1.7 – 2.4', 1.7, 2.4],
  ['CBC', 'Hemoglobin', 'g/dL', '12 – 16', 12, 16],
  ['CBC', 'WBC', '×10³/µL', '4.5 – 11', 4.5, 11],
  ['CBC', 'Platelet', '×10³/µL', '150 – 450', 150, 450],
];

export function labFor(kind: PersonKind, id: string, date?: string): LabResultDto {
  const seed = [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  const p = recipientsDb.find((r) => r.id === id);
  const posttx = kind === 'recipient' && p && ['opd', 'discharge', 'postop'].includes(p.status);
  const esrd = kind === 'recipient' && !posttx;
  const today = new Date();
  const dates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7 - (seed % 3));
    return iso(d);
  });
  const at = date && dates.includes(date) ? dates.indexOf(date) : 0;
  const base: Record<string, number> = esrd
    ? { Creatinine: 7.8, BUN: 58, eGFR: 7, Sodium: 137, Potassium: 5.3, Magnesium: 2.1, Hemoglobin: 10.4, WBC: 6.5, Platelet: 210 }
    : { Creatinine: 1.0, BUN: 18, eGFR: 72, Sodium: 139, Potassium: 4.2, Magnesium: 1.6, Hemoglobin: 12.1, WBC: 6.8, Platelet: 245 };
  const items: LabItemDto[] = LAB_DEFS.map(([group, name, unit, ref, lo, hi], k) => {
    const series = Array.from({ length: 5 }).map((_, i) => {
      const narrow = name === 'Sodium' || name === 'Potassium' || name === 'Magnesium';
      const v = base[name] * (1 + (((seed + k * 7 + i * 3) % 9) - 4) / (narrow ? 200 : 60));
      return Number(v.toFixed(name === 'Platelet' || name === 'BUN' || name === 'eGFR' || name === 'Sodium' ? 0 : 1));
    });
    const v = series[at];
    const flag = v > hi ? 'H' : v < lo ? 'L' : undefined;
    return { group, name, unit, ref, value: String(v), flag, previous: String(series[at + 1] ?? ''), trend: [...series].reverse() };
  });
  if (posttx) items.push({ group: 'Drug level', name: 'Tacrolimus (trough)', unit: 'ng/mL', ref: 'เป้า 8 – 10', value: '7.6', flag: 'L', previous: '8.9', trend: [9.8, 10.4, 8.9, 8.9, 7.6] });
  items.push({ group: 'Urine', name: 'UA protein', unit: '', ref: 'Negative', value: esrd ? '2+' : 'Negative', flag: esrd ? 'H' : undefined, previous: esrd ? '2+' : 'Negative', trend: [] });
  return {
    reportedAt: `${dates[at]}T10:15:00`,
    dates,
    items,
    pending: at === 0 ? (posttx ? [{ name: 'CMV PCR', sentAt: dates[0] }, { name: 'Urine culture', sentAt: dates[0] }] : [{ name: 'PRA', sentAt: dates[0] }]) : [],
  };
}
