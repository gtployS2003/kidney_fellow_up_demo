import type { AppointmentDto, LabItemDto, LabResultDto, PersonKind, ResultStatus } from '@/types';
import { recipientsDb } from './recipients';
import { donorsDb } from './donors';
import { labHistoryFor } from './labs';
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

// ---------- ผลแล็บ (ตัวอย่าง) — ตารางล่าสุดคำนวณจากข้อมูลย้อนหลังใน mocks/labs ----------
export function labFor(kind: PersonKind, id: string, date?: string): LabResultDto {
  const h = labHistoryFor(kind, id);
  const desc = [...h.dates].reverse();
  const at = date && desc.includes(date) ? desc.indexOf(date) : 0;
  const idx = h.dates.length - 1 - at;
  const fmt = (s: (typeof h.series)[number], v: number | null) => (v === null ? '' : s.ordinal ? s.ordinal[v] : v.toFixed(s.decimals));
  const items: LabItemDto[] = [];
  for (const s of h.series) {
    const v = s.values[idx];
    if (v === null || v === undefined) continue;
    let prevV: number | null = null;
    for (let j = idx - 1; j >= 0; j--) if (s.values[j] !== null) { prevV = s.values[j]; break; }
    const flag: LabItemDto['flag'] = s.ordinal ? (v > 0 ? 'H' : undefined) : v < s.lo ? 'L' : s.hi !== null && v > s.hi ? 'H' : undefined;
    const trend = s.ordinal ? [] : (s.values.slice(0, idx + 1).filter((x) => x !== null) as number[]).slice(-5);
    items.push({ group: s.group, name: s.name, unit: s.unit, ref: s.ref, value: fmt(s, v), flag, previous: fmt(s, prevV), trend });
  }
  return {
    reportedAt: `${h.dates[idx]}T10:15:00`,
    dates: desc.slice(0, 5),
    items,
    pending: at === 0 ? h.pending : [],
  };
}
