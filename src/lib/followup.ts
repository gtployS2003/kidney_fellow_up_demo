import type { PersonKind } from '@/types';

export type RoundStatus = 'done' | 'missed' | 'next' | 'future';
export interface FollowRound {
  label: string;
  date: string;
  status: RoundStatus;
}
export interface FollowPhase {
  label: string;
  every: string;
  fromDay: number;
  toDay: number;
}

/** ตารางรอบติดตามมาตรฐาน (dev ตั้งค่า · รอยืนยันกับทีมแพทย์) */
export const SCHEDULE: Record<PersonKind, FollowPhase[]> = {
  recipient: [
    { label: 'เดือนที่ 1', every: 'ทุกสัปดาห์', fromDay: 0, toDay: 30 },
    { label: 'เดือนที่ 2–3', every: 'ทุก 2 สัปดาห์', fromDay: 31, toDay: 90 },
    { label: 'เดือนที่ 4–12', every: 'ทุกเดือน', fromDay: 91, toDay: 365 },
    { label: 'ปีที่ 2 เป็นต้นไป', every: 'ทุก 3 เดือน', fromDay: 366, toDay: 99999 },
  ],
  donor: [
    { label: 'หลังผ่าตัด', every: '2 สัปดาห์ · 1 เดือน', fromDay: 0, toDay: 30 },
    { label: '6 เดือน', every: 'ครั้งเดียว', fromDay: 31, toDay: 180 },
    { label: 'ปีที่ 1 เป็นต้นไป', every: 'ทุกปี ตลอดชีวิต', fromDay: 181, toDay: 99999 },
  ],
};

function offsets(kind: PersonKind): { day: number; label: string }[] {
  if (kind === 'donor') return [{ day: 14, label: '2 ส.' }, { day: 30, label: '1 ด.' }, { day: 180, label: '6 ด.' }, ...[1, 2, 3, 4, 5].map((y) => ({ day: 365 * y, label: `ปี ${y}` }))];
  const o: { day: number; label: string }[] = [];
  for (let w = 1; w <= 4; w++) o.push({ day: w * 7, label: `ส.${w}` });
  for (let w = 6; w <= 12; w += 2) o.push({ day: w * 7, label: `ส.${w}` });
  for (let m = 4; m <= 12; m++) o.push({ day: m * 30, label: `ด.${m}` });
  for (let m = 15; m <= 36; m += 3) o.push({ day: m * 30, label: `ด.${m}` });
  return o;
}

/** คำนวณรอบติดตามจากวันผ่าตัด · เดโม: รอบที่ผ่านมามาแล้ว ยกเว้นรอบที่ 4 (ขาดนัด) */
export function followRounds(kind: PersonKind, surgery: string, today = new Date()) {
  const s = new Date(surgery);
  const pod = Math.floor((today.getTime() - s.getTime()) / 86400000);
  const all = offsets(kind).map((o, i) => {
    const d = new Date(s);
    d.setDate(d.getDate() + o.day);
    const past = o.day < pod;
    return { label: o.label, date: d.toISOString().slice(0, 10), status: (past ? (i === 3 ? 'missed' : 'done') : 'future') as RoundStatus, day: o.day };
  });
  const ni = all.findIndex((r) => r.status === 'future');
  if (ni >= 0) all[ni].status = 'next';
  // แสดงรอบรอบ ๆ ปัจจุบัน (ย้อน 7 · ล่วงหน้า 4)
  const start = Math.max(0, (ni < 0 ? all.length : ni) - 7);
  const rounds = all.slice(start, start + 12);
  const phase = SCHEDULE[kind].findIndex((p) => pod >= p.fromDay && pod <= p.toDay);
  return { pod, rounds, done: all.filter((r) => r.status === 'done').length, missed: all.filter((r) => r.status === 'missed').length, next: ni >= 0 ? all[ni] : undefined, phase };
}
