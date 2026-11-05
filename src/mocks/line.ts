import type { LineDataDto, NotifySettingsDto, PersonKind } from '@/types';

/** ค่าเริ่มต้นของระบบ (dev ตั้งค่า) */
export const DEFAULT_SETTINGS = { fluidTargetMl: 2500, medTimes: ['08:00', '20:00'] };
export const BP_LIMIT = { sys: 140, dia: 90 };

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
const iso = (d: Date) => d.toISOString();
const day = (back: number, h = 7, m = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - back);
  d.setHours(h, m, 0, 0);
  return d;
};

/** ตัวอย่างการเชื่อม LINE: ผู้ป่วยส่วนใหญ่เชื่อมแล้ว */
export function isLineLinked(id: string, lineId?: string) {
  return !!lineId || seedOf(id) % 4 !== 0;
}

// ===== ข้อมูลที่ผู้ป่วยบันทึกเพิ่มจากหน้า LIFF (เดโม: เก็บในหน่วยความจำ แล้วรวมเข้ากับข้อมูลจำลอง) =====
export type LineEntry = { type: 'water' | 'urine'; ml: number; at: string } | { type: 'weight'; kg: number; at: string } | { type: 'bp'; sys: number; dia: number; pulse: number; temp?: number; at: string };
const extra = new Map<string, LineEntry[]>();
export function addLineEntry(id: string, e: LineEntry) {
  extra.set(id, [...(extra.get(id) ?? []), e]);
}
export function entriesToday(id: string) {
  const today = new Date().toISOString().slice(0, 10);
  return (extra.get(id) ?? []).filter((e) => e.at.slice(0, 10) === today);
}

/** ข้อมูลที่ผู้ป่วยบันทึกผ่าน LINE (ย้อนหลัง 90 วัน) — สร้างแบบคงที่จาก id + รายการที่บันทึกจริงในเดโม */
export function lineDataFor(kind: PersonKind, id: string): LineDataDto {
  const base = baseData(kind, id);
  const today = new Date().toISOString().slice(0, 10);
  for (const e of extra.get(id) ?? []) {
    if (e.type === 'bp') {
      base.bp.push({ at: e.at, sys: e.sys, dia: e.dia, pulse: e.pulse });
      if (e.temp) base.temp.push({ at: e.at, c: e.temp });
      if (e.sys > BP_LIMIT.sys || e.dia > BP_LIMIT.dia) base.abnormal.unshift({ at: e.at, text: `ความดัน ${e.sys}/${e.dia}` });
    } else if (e.type === 'weight') {
      base.weight = base.weight.filter((w) => w.date !== today).concat({ date: today, kg: e.kg });
    } else if (base.fluid.length) {
      const last = base.fluid[base.fluid.length - 1];
      if (last.date !== today) base.fluid.push({ date: today, intake: 0, urine: 0 });
      const t = base.fluid[base.fluid.length - 1];
      if (e.type === 'water') t.intake += e.ml;
      else t.urine += e.ml;
    }
    base.lastLoggedAt = e.at;
  }
  return base;
}

function baseData(kind: PersonKind, id: string): LineDataDto {
  const r = rng(seedOf(id));
  const bp = Array.from({ length: 90 }).map((_, i) => {
    const back = 89 - i;
    const spike = r() > 0.93;
    const sys = Math.round((spike ? 143 : 122) + r() * 8);
    return { at: iso(day(back)), sys, dia: Math.round(sys * 0.63 + r() * 5), pulse: Math.round(70 + r() * 14) };
  }).filter((_, i) => kind === 'recipient' || i % 7 === 6); // ผู้บริจาค: สัปดาห์ละครั้ง
  const fluid = kind === 'recipient' ? Array.from({ length: 90 }).map((_, i) => { const intake = Math.round((1900 + r() * 800) / 50) * 50; return { date: iso(day(89 - i)).slice(0, 10), intake, urine: Math.round((intake * (0.8 + r() * 0.12)) / 50) * 50 }; }) : [];
  let w = kind === 'recipient' ? 58.4 : 72.8;
  const weight = Array.from({ length: 90 }).map((_, i) => { w += (r() - 0.55) * 0.12; return { date: iso(day(89 - i)).slice(0, 10), kg: Math.round(w * 10) / 10 }; }).filter((_, i) => kind === 'recipient' || i % 7 === 6);
  const temp = kind === 'recipient' ? Array.from({ length: 30 }).map((_, i) => ({ at: iso(day(29 - i)), c: Math.round((36.4 + r() * 0.5) * 10) / 10 })) : [];
  const adherence = kind === 'recipient' ? ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4'].map((label) => ({ label, pct: r() > 0.6 ? 93 : 100 })) : [];
  const missed = adherence.filter((a) => a.pct < 100).length;
  const abnormal = bp.filter((b) => b.sys > BP_LIMIT.sys || b.dia > BP_LIMIT.dia).slice(-6).reverse().map((b) => ({ at: b.at, text: `ความดัน ${b.sys}/${b.dia}` }));
  if (missed) abnormal.push({ at: iso(day(10, 20, 0)), text: 'พลาดยากดภูมิ มื้อเย็น' });
  return { lastLoggedAt: bp[bp.length - 1]?.at, bp, fluid, weight, temp, adherence, missedDoses: missed, abnormal };
}

const settingsStore = new Map<string, NotifySettingsDto>();
export function settingsFor(id: string): NotifySettingsDto {
  return settingsStore.get(id) ?? { ...DEFAULT_SETTINGS, medTimes: [...DEFAULT_SETTINGS.medTimes], fluidIsDefault: true, medTimesIsDefault: true };
}
export function saveSettings(id: string, s: { fluidTargetMl: number; medTimes: string[] }) {
  const v: NotifySettingsDto = { ...s, fluidIsDefault: s.fluidTargetMl === DEFAULT_SETTINGS.fluidTargetMl, medTimesIsDefault: s.medTimes.join() === DEFAULT_SETTINGS.medTimes.join() };
  settingsStore.set(id, v);
  return v;
}
