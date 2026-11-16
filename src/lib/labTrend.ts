import type { LabHistoryDto, LabSeriesDto } from '@/types';

const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const DAY = 86400000;

/** YYYY-MM-DD → เลขวัน (ใช้เป็นแกน x) */
export const dayNum = (iso: string) => Math.round(new Date(iso.slice(0, 10) + 'T00:00:00').getTime() / DAY);
export const shortDate = (iso: string) => {
  const d = new Date(iso.slice(0, 10) + 'T00:00:00');
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]}`;
};

export type Period = '3m' | '6m' | '1y' | 'post' | 'all';
export const PERIODS: { value: Period; label: string; short: string }[] = [
  { value: '3m', label: '3 เดือน', short: '3 ด.' },
  { value: '6m', label: '6 เดือน', short: '6 ด.' },
  { value: '1y', label: '1 ปี', short: '1 ปี' },
  { value: 'post', label: 'ตั้งแต่ผ่าตัด', short: 'หลังผ่าตัด' },
  { value: 'all', label: 'ทั้งหมด', short: 'ทั้งหมด' },
];

/** index ของวันที่ที่อยู่ในช่วงเวลาที่เลือก */
export function periodIndexes(h: LabHistoryDto, p: Period): number[] {
  const last = dayNum(h.dates[h.dates.length - 1] ?? new Date().toISOString());
  const from = p === '3m' ? last - 92 : p === '6m' ? last - 184 : p === '1y' ? last - 366 : p === 'post' && h.surgeryDate ? dayNum(h.surgeryDate) : -Infinity;
  return h.dates.map((d, i) => [dayNum(d), i] as const).filter(([n]) => n >= from).map(([, i]) => i);
}

/** ป้ายเดือนบนแกน x (กลางเดือน) */
export function monthTicks(x0: number, x1: number) {
  const out: { x: number; label: string }[] = [];
  const d = new Date(x0 * DAY);
  d.setDate(15);
  while (d.getTime() / DAY <= x1 + 15) {
    const x = Math.round(d.getTime() / DAY);
    if (x >= x0 - 3 && x <= x1 + 3) out.push({ x, label: TH_MONTHS[d.getMonth()] });
    d.setMonth(d.getMonth() + 1);
  }
  const step = Math.ceil(out.length / 6);
  return out.filter((_, i) => i % step === 0);
}

export function flagOf(s: LabSeriesDto, v: number | null): 'H' | 'L' | undefined {
  if (v === null) return undefined;
  if (s.ordinal) return v > 0 ? 'H' : undefined;
  if (v < s.lo) return 'L';
  if (s.hi !== null && v > s.hi) return 'H';
  return undefined;
}
export const fmtVal = (s: LabSeriesDto, v: number | null) => (v === null ? '—' : s.ordinal ? s.ordinal[v] : v.toFixed(s.decimals));

/** ค่าล่าสุด / ครั้งก่อน ภายในชุด index */
export function lastTwo(s: LabSeriesDto, idx: number[]) {
  const vals = idx.map((i) => ({ i, v: s.values[i] })).filter((x) => x.v !== null) as { i: number; v: number }[];
  return { last: vals[vals.length - 1], prev: vals[vals.length - 2] };
}

export const GROUP_TH: Record<string, string> = {
  'Renal function': 'การทำงานของไต',
  Electrolytes: 'เกลือแร่',
  CBC: 'เม็ดเลือด (CBC)',
  'Drug level': 'ระดับยากดภูมิ',
  Urine: 'ปัสสาวะ',
};

/** คำอธิบายสำหรับผู้ป่วย (LINE OA) */
export const LAB_EXPLAIN: Record<string, { what: string; high?: string; low?: string }> = {
  cr: { what: 'ของเสียจากกล้ามเนื้อที่ไตกรองออก ถ้าไตทำงานดี ค่านี้จะต่ำและคงที่', high: 'ดื่มน้ำให้ถึงเป้า · กินยากดภูมิตรงเวลา · ถ้าปัสสาวะน้อยลง ตัวบวม หรือมีไข้ ให้แจ้งทีมทันที' },
  bun: { what: 'ของเสียจากโปรตีนในอาหาร ใช้ดูการทำงานของไตร่วมกับ Creatinine', high: 'ดื่มน้ำให้พอ · ไม่กินโปรตีนมากเกินไป' },
  egfr: { what: 'ความสามารถในการกรองของไต ยิ่งสูงยิ่งดี (คำนวณจาก Creatinine)', low: 'ดื่มน้ำให้พอ · กินยาตรงเวลา · มาตามนัดตรวจ' },
  na: { what: 'เกลือแร่ที่ช่วยควบคุมน้ำในร่างกาย', high: 'ลดอาหารเค็ม', low: 'แจ้งทีมถ้าอ่อนเพลีย สับสน' },
  k: { what: 'เกลือแร่ที่สำคัญต่อหัวใจและกล้ามเนื้อ', high: 'ลดผลไม้ที่โพแทสเซียมสูง เช่น กล้วย ส้ม ทุเรียน', low: 'แจ้งทีมถ้าเป็นตะคริว ใจสั่น' },
  mg: { what: 'เกลือแร่ที่มักต่ำลงจากยากดภูมิ', low: 'กินแมกนีเซียมเสริมตามที่แพทย์สั่ง' },
  hb: { what: 'ความเข้มข้นของเลือด ถ้าต่ำจะเหนื่อยง่าย', low: 'กินอาหารที่มีธาตุเหล็ก · ถ้าเหนื่อยมาก ใจสั่น ให้แจ้งทีม' },
  wbc: { what: 'เม็ดเลือดขาว ช่วยต่อสู้เชื้อโรค', high: 'ถ้ามีไข้ ไอ ปัสสาวะแสบ ให้แจ้งทีมทันที', low: 'ล้างมือบ่อย ๆ · หลีกเลี่ยงที่แออัด' },
  plt: { what: 'เกล็ดเลือด ช่วยให้เลือดหยุดไหล', low: 'ระวังการกระแทก · ถ้ามีจ้ำเลือดให้แจ้งทีม' },
  uprot: { what: 'โปรตีนที่รั่วออกมาทางปัสสาวะ ปกติควรตรวจไม่พบ', high: 'ควบคุมความดัน · ลดเค็ม · มาตามนัดตรวจ' },
};
