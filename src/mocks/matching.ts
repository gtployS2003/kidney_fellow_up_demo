import type { ChecklistItemDto, MatchHistoryDto, SendRoundDto, Sex } from '@/types';

/** วันที่ย้อนหลังจากวันนี้ (ให้ข้อมูลตัวอย่างดูสดใหม่เสมอ) */
const ago = (days: number, hours = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

/** เมตาของผู้ป่วยที่อยู่ระหว่างจับคู่ (ผู้ยืนยัน + เวลา) — ไม่เก็บ HLA ที่ใช้ค้นหา */
export const matchingMeta: Record<string, { startedAt: string; confirmedBy: string }> = {
  'r-990227': { startedAt: new Date(Date.now() - 19 * 3600_000).toISOString(), confirmedBy: 'พย.สมใจ รักดี' },
};

export const matchHistoryDb: MatchHistoryDto[] = [
  { id: 'h7', recipientId: '', name: 'นายประเสริฐ มั่นคง', hn: '990205', startedAt: ago(3), result: 'received', reason: 'ผ่าตัด 12 ต.ค. 2569', confirmedBy: 'พย.วิภา สุขใจ', recordedBy: 'พย.วิภา สุขใจ' },
  { id: 'h6', recipientId: 'r-990231', name: 'นายบุญมี ใจเย็น', hn: '990231', startedAt: ago(9), result: 'rejected', reason: 'Crossmatch positive', confirmedBy: 'พย.สมใจ รักดี', recordedBy: 'นพ.สมเกียรติ วงศ์ไทย' },
  { id: 'h5', recipientId: 'r-990216', name: 'นางจินตนา รักษ์ไทย', hn: '990216', startedAt: ago(15), result: 'notReceived', reason: 'สภากาชาดยกเลิก — จัดสรรให้ รพ.อื่น', confirmedBy: 'พย.วิภา สุขใจ', recordedBy: 'พย.วิภา สุขใจ' },
  { id: 'h4', recipientId: 'r-990212', name: 'นางสาวรัตนา ทับทิม', hn: '990212', startedAt: ago(32), result: 'rejected', reason: 'ผู้ป่วยไม่พร้อม (ติดเชื้อ / ไม่สบาย)', confirmedBy: 'พย.วิภา สุขใจ', recordedBy: 'นพ.สมเกียรติ วงศ์ไทย' },
  { id: 'h3', recipientId: 'r-990198', name: 'นางสาวสุนิสา บุญมา', hn: '990198', startedAt: ago(45), result: 'received', reason: 'ผ่าตัด 02 ก.ย. 2569', confirmedBy: 'พย.สมใจ รักดี', recordedBy: 'พย.สมใจ รักดี' },
  { id: 'h2', recipientId: 'r-990211', name: 'นายเอกชัย พงษ์พันธ์', hn: '990211', startedAt: ago(60), result: 'rejected', reason: 'ติดต่อผู้ป่วยไม่ได้', confirmedBy: 'พย.วิภา สุขใจ', recordedBy: 'พย.วิภา สุขใจ' },
  { id: 'h1', recipientId: 'r-990218', name: 'นางสาวกาญจนา ศรีทอง', hn: '990218', startedAt: ago(80), result: 'notReceived', reason: 'สภากาชาดยกเลิก', confirmedBy: 'พย.สมใจ รักดี', recordedBy: 'พย.สมใจ รักดี' },
];

export const sendRoundsDb: SendRoundDto[] = [
  { id: 's3', sentAt: ago(25).slice(0, 10), sentBy: 'พย.วิภา สุขใจ', count: 4, format: 'Excel', recipientIds: ['r-990216', 'r-990218', 'r-990239', 'r-990238'] },
  { id: 's2', sentAt: ago(55).slice(0, 10), sentBy: 'พย.วิภา สุขใจ', count: 4, format: 'Excel', recipientIds: ['r-990216', 'r-990218', 'r-990239', 'r-990238'] },
  { id: 's1', sentAt: ago(85).slice(0, 10), sentBy: 'พย.สมใจ รักดี', count: 3, format: 'PDF', recipientIds: ['r-990216', 'r-990218', 'r-990239'] },
];

// ---------- Pre-KT evaluation check lists (ตามแบบฟอร์มที่ใช้จริง) ----------
type Def = { key: string; label: string; group?: 'Consult' | 'Vaccine'; female?: boolean; male?: boolean };
export const RECIPIENT_CHECKLIST: Def[] = [
  { key: 'lab', label: 'Lab' },
  { key: 'cxr', label: 'CXR, EKG' },
  { key: 'usg', label: 'USG whole abdomen' },
  { key: 'colono', label: 'Colonoscopy' },
  { key: 'echo', label: 'Echocardiogram' },
  { key: 'mammo', label: 'Mammogram', female: true },
  { key: 'cta', label: 'CTA femoral/iliac a.' },
  { key: 'pap', label: 'PAP smear', female: true },
  { key: 'psa', label: 'PSA', male: true },
  ...['Cardio', 'GI', 'SUR', 'URO', 'Onco', 'Endocrine', 'Psychiatrist', 'Co-worker', 'Dentist'].map((c) => ({ key: `c-${c}`, label: c, group: 'Consult' as const })),
  { key: 'others', label: 'Others' },
  { key: 'consent', label: 'Consent form' },
  ...['Hepatitis B', 'Influenza', 'PCV'].map((v) => ({ key: `v-${v}`, label: v, group: 'Vaccine' as const })),
];
export const DONOR_CHECKLIST: Def[] = [
  { key: 'lab', label: 'Lab' },
  { key: 'cxr', label: 'CXR, EKG' },
  { key: 'cta', label: 'CTA renal artery + CT whole abd' },
  { key: 'crcl', label: 'Urine 24 hr CrCl (mCLcr)' },
  { key: 'mag3', label: 'Renal scan (MAG3)' },
  { key: 'colono', label: 'Colonoscopy' },
  { key: 'mammo', label: 'Mammogram', female: true },
  { key: 'pap', label: 'PAP smear', female: true },
  { key: 'psa', label: 'PSA', male: true },
  ...['Cardio', 'GI', 'SUR', 'URO', 'Psychiatrist', 'Co-worker', 'Dentist'].map((c) => ({ key: `c-${c}`, label: c, group: 'Consult' as const })),
  { key: 'others', label: 'Others' },
  { key: 'consent', label: 'Consent form' },
  ...['Hepatitis B', 'Influenza', 'PCV'].map((v) => ({ key: `v-${v}`, label: v, group: 'Vaccine' as const })),
];

/** ผลจาก iMed (ตัวอย่าง) — “ready” = จำนวนรายการที่มีผลแล้ว */
const COMMENTS: Record<string, string> = {
  lab: 'CBC, Chem ปกติ',
  cxr: 'ปกติ',
  usg: 'Small kidneys both',
  echo: 'EF 65%',
  mammo: 'BI-RADS 1',
  pap: 'Negative',
  psa: '0.8 ng/mL',
  crcl: '112 mL/min',
  mag3: 'L 49% / R 51%',
  cta: 'Single artery both sides',
  consent: 'ลงนามแล้ว',
  'c-Cardio': 'Low risk',
};

export function buildChecklist(defs: Def[], sex: Sex, ready: number, seed: number): ChecklistItemDto[] {
  let i = 0;
  return defs.map((d) => {
    const na = (d.female && sex !== 'female') || (d.male && sex !== 'male') || d.key === 'others';
    if (na) return { key: d.key, label: d.label, group: d.group, na: true, decision: '' };
    const idx = i++;
    const has = (idx * 7 + seed) % defs.length < ready;
    const day = 2 + ((idx * 3 + seed) % 24);
    return {
      key: d.key,
      label: d.label,
      group: d.group,
      date: has ? `2026-09-${String(day).padStart(2, '0')}` : undefined,
      comment: has ? COMMENTS[d.key] : undefined,
      decision: has ? 'pass' : '',
    };
  });
}
