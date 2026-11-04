import type { PersonKind, PersonRef } from '@/types';
import { USE_MOCK, http, mockDelay } from './client';

// ===== ข้อมูลขั้นตอน ผ่าตัด / ก่อนกลับบ้าน / ติดตาม OPD (ยังรอกำหนดแบบฟอร์มจริง — ใช้ตามดีไซน์ใน Figma) =====

export interface SurgeryRecord {
  date: string;
  donorType: string;
  donorName: string;
  surgeon: string;
  anesthetist: string;
  duration: string;
  side: string;
  cit: string;
  wit: string;
  hlaMm: string;
  induction: string;
  bloodLoss: string;
  djStent: string;
  complication: string;
  abo: string;
  notes: string;
  graft: string;
  /** Creatinine POD 0–7 */
  creat: string[];
  urineD0: string;
  tacD5: string;
  dialysis: string;
}

export interface ChecklistRow {
  label: string;
  done: boolean;
  by: string;
  date: string;
}
export interface DischargeChecklist {
  date: string;
  items: ChecklistRow[];
}
export interface DischargeSummary {
  date: string;
  admitDate: string;
  los: string;
  finalCr: string;
  condition: string;
  diagnosis: string;
  summary: string;
}
export interface MedRow {
  name: string;
  dose: string;
  how: string;
  note: string;
}
export interface DischargeMeds {
  date: string;
  meds: MedRow[];
}
export interface FollowAppt {
  label: string;
  date: string;
  place: string;
}
export interface DischargeFollow {
  date: string;
  appts: FollowAppt[];
}

export interface OpdVisit {
  date: string;
  pod: string;
  doctor: string;
  weight: string;
  bp: string;
  pulse: string;
  urine: string;
  cr: string;
  bun: string;
  k: string;
  tac: string;
  assessment: string;
  plan: string;
  nextDate: string;
  nextLab: string;
}
export interface OpdVisits {
  date: string;
  visits: OpdVisit[];
}
export interface MedAdjust {
  date: string;
  drug: string;
  from: string;
  to: string;
  reason: string;
}
export interface OpdMeds {
  date: string;
  rows: MedAdjust[];
}
export interface Complication {
  date: string;
  type: string;
  detail: string;
  admit: string;
}
export interface OpdComplications {
  date: string;
  rows: Complication[];
}

export type PostopSection = 'surgery' | 'dcChecklist' | 'dcSummary' | 'dcMeds' | 'dcFollow' | 'opdVisits' | 'opdMeds' | 'opdComplications';

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/** ข้อมูลตัวอย่างสำหรับผู้ที่ผ่านขั้นตอนนั้นแล้ว */
function sample(section: PostopSection, p: PersonRef, kind: PersonKind, filled: boolean): unknown {
  const surg = p.stageDates.surgery ?? addDays(p.statusSince, -11);
  const rc = p.caseType === 'redcross';
  switch (section) {
    case 'surgery':
      return filled
        ? ({
            date: surg,
            donorType: kind === 'donor' ? 'Living donor nephrectomy' : rc ? 'Deceased donor (สภากาชาด)' : 'Living donor',
            donorName: kind === 'donor' ? '—' : rc ? 'DD-2569-0142' : 'ผู้บริจาคที่จับคู่',
            surgeon: 'นพ.ประเสริฐ ชัยมงคล',
            anesthetist: 'พญ.กนกวรรณ ใจดี',
            duration: kind === 'donor' ? '3 ชม. 10 นาที' : '4 ชม. 20 นาที',
            side: kind === 'donor' ? 'ไตซ้าย (Laparoscopic)' : 'ไตซ้าย → Right iliac fossa',
            cit: kind === 'donor' ? '—' : rc ? '14 ชม. 30 นาที' : '1 ชม. 45 นาที',
            wit: '32 นาที',
            hlaMm: kind === 'donor' ? '—' : '2 / 6',
            induction: kind === 'donor' ? '—' : 'Basiliximab',
            bloodLoss: '350 ml',
            djStent: kind === 'donor' ? '—' : 'ใส่ (นัดถอด 6 สัปดาห์)',
            complication: 'ไม่มี',
            abo: `${p.bloodGroup} → ${p.bloodGroup} (เข้ากันได้)`,
            notes:
              kind === 'donor'
                ? 'Hand-assisted laparoscopic left nephrectomy. Single renal artery and vein. Uneventful.'
                : 'Single renal artery and vein. End-to-side anastomosis to external iliac vessels. Ureteroneocystostomy (Lich-Gregoir) with DJ stent. Good reperfusion, immediate urine output in OR.',
            graft: kind === 'donor' ? '—' : 'Immediate graft function',
            creat: kind === 'donor' ? ['0.9', '1.4', '1.5', '1.4', '1.3', '1.3', '1.2', '1.2'] : ['8.6', '5.9', '3.4', '2.2', '1.6', '1.4', '1.3', '1.2'],
            urineD0: kind === 'donor' ? '—' : '4,200 ml',
            tacD5: kind === 'donor' ? '—' : '9.6 ng/mL',
            dialysis: kind === 'donor' ? '—' : 'ไม่ต้อง',
          } satisfies SurgeryRecord)
        : ({ date: today(), donorType: '', donorName: '', surgeon: '', anesthetist: '', duration: '', side: '', cit: '', wit: '', hlaMm: '', induction: '', bloodLoss: '', djStent: '', complication: '', abo: '', notes: '', graft: '', creat: Array(8).fill(''), urineD0: '', tacD5: '', dialysis: '' } satisfies SurgeryRecord);
    case 'dcChecklist': {
      const labels =
        kind === 'donor'
          ? ['สอนดูแลแผลผ่าตัด', 'สอนสังเกตอาการผิดปกติหลังบริจาค', 'ถอดสายสวนปัสสาวะ', 'ตรวจ Creatinine ก่อนกลับ', 'นัด OPD ครั้งแรก', 'เชื่อมต่อ LINE LIFF']
          : ['สอนการรับประทานยากดภูมิคุ้มกัน', 'สอนสังเกตอาการ rejection / ติดเชื้อ', 'สอนบันทึกปัสสาวะ น้ำหนัก ความดัน', 'ถอดสายสวนปัสสาวะ', 'ตรวจ Tacrolimus level ก่อนกลับ', 'นัด OPD ครั้งแรก', 'เชื่อมต่อ LINE LIFF', 'นัดถอด DJ stent'];
      return {
        date: addDays(surg, 11),
        items: labels.map((label, i) => ({ label, done: filled && i < labels.length - 1, by: filled && i < labels.length - 1 ? (i % 3 === 2 ? 'พย.สมใจ' : 'พย.วิภา') : '', date: filled && i < labels.length - 1 ? addDays(surg, 8 + Math.min(i, 3)) : '' })),
      } satisfies DischargeChecklist;
    }
    case 'dcSummary':
      return {
        date: addDays(surg, 11),
        admitDate: filled ? addDays(surg, -1) : '',
        los: filled ? '12 วัน' : '',
        finalCr: filled ? (kind === 'donor' ? '1.2' : '1.2') : '',
        condition: filled ? 'ดี · เดินได้เอง · แผลแห้ง' : '',
        diagnosis: filled ? (kind === 'donor' ? 'Living kidney donor, s/p left nephrectomy' : 'ESRD s/p kidney transplantation') : '',
        summary: filled ? 'ไม่มีภาวะแทรกซ้อนระหว่างนอนโรงพยาบาล ไตทำงานดี ปัสสาวะออกดี' : '',
      } satisfies DischargeSummary;
    case 'dcMeds':
      return {
        date: addDays(surg, 11),
        meds:
          filled && kind === 'recipient'
            ? [
                { name: 'Tacrolimus', dose: '3 mg', how: 'วันละ 2 ครั้ง (08:00 / 20:00)', note: 'ตรวจระดับยา' },
                { name: 'Mycophenolate (MMF)', dose: '500 mg', how: 'วันละ 2 ครั้ง', note: '' },
                { name: 'Prednisolone', dose: '20 mg', how: 'วันละ 1 ครั้ง เช้า', note: 'ลดขนาดตามนัด' },
                { name: 'Valganciclovir', dose: '450 mg', how: 'วันละ 1 ครั้ง', note: 'ป้องกัน CMV' },
                { name: 'Co-trimoxazole', dose: '1 tab', how: 'วันละ 1 ครั้ง', note: 'ป้องกัน PCP' },
              ]
            : filled
              ? [{ name: 'Paracetamol', dose: '500 mg', how: 'เวลาปวด ทุก 6 ชม.', note: '' }]
              : [],
      } satisfies DischargeMeds;
    case 'dcFollow':
      return {
        date: addDays(surg, 11),
        appts: filled
          ? [
              { label: 'นัด OPD ครั้งแรก', date: addDays(surg, 15), place: 'OPD อายุรกรรมโรคไต · ห้อง 3' },
              ...(kind === 'recipient' ? [{ label: 'นัดถอด DJ stent', date: addDays(surg, 42), place: 'OPD ศัลยกรรมระบบปัสสาวะ' }] : []),
            ]
          : [],
      } satisfies DischargeFollow;
    case 'opdVisits': {
      const base = addDays(surg, 15);
      const v = (i: number, cr: string, tac: string): OpdVisit => ({
        date: addDays(base, [0, 7, 21, 35][i]),
        pod: String(15 + [0, 7, 21, 35][i]),
        doctor: 'นพ.สมเกียรติ วงศ์ไทย',
        weight: ['58.2', '57.9', '57.6', '57.5'][i],
        bp: ['132/84', '130/82', '128/80', '126/80'][i],
        pulse: '78',
        urine: ['2,600', '2,400', '2,200', '2,100'][i],
        cr,
        bun: ['22', '20', '19', '18'][i],
        k: ['4.6', '4.4', '4.3', '4.2'][i],
        tac,
        assessment: i === 3 ? 'สบายดี ไม่มีไข้ แผลผ่าตัดแห้งดี · Tac level ต่ำกว่าเป้า' : 'สบายดี ไม่มีไข้ แผลแห้งดี',
        plan: i === 3 ? 'เพิ่ม Tacrolimus เป็น 3.5 mg bid · ตรวจ Tac ซ้ำครั้งหน้า' : 'ยาเดิม',
        nextDate: addDays(base, [7, 21, 35, 49][i]),
        nextLab: 'CBC, Cr, Tac level',
      });
      return {
        date: today(),
        visits: filled ? (kind === 'donor' ? [{ ...v(0, '1.2', '—'), tac: '', assessment: 'แผลแห้งดี ไม่มีอาการผิดปกติ', plan: 'นัดติดตาม 3 เดือน' }] : [v(0, '1.3', '9.2'), v(1, '1.1', '8.9'), v(2, '1.0', '8.9'), v(3, '1.0', '7.6')]) : [],
      } satisfies OpdVisits;
    }
    case 'opdMeds':
      return { date: today(), rows: filled && kind === 'recipient' ? [{ date: addDays(surg, 50), drug: 'Tacrolimus', from: '3 mg bid', to: '3.5 mg bid', reason: 'Tac level 7.6 (ต่ำกว่าเป้า 8–10)' }, { date: addDays(surg, 36), drug: 'Prednisolone', from: '20 mg/วัน', to: '10 mg/วัน', reason: 'ลดขนาดตามแผน' }] : [] } satisfies OpdMeds;
    case 'opdComplications':
      return { date: today(), rows: [] } satisfies OpdComplications;
  }
}

const store = new Map<string, { data: unknown; savedAt?: string }>();
const key = (kind: PersonKind, id: string, s: PostopSection) => `${kind}:${id}:${s}`;

/** module “Post-op” ฝั่ง backend: /api/{recipients|donors}/{id}/postop/{section} */
export const postopApi = {
  async get<T>(kind: PersonKind, p: PersonRef, section: PostopSection, filled: boolean): Promise<{ data: T; savedAt?: string }> {
    if (!USE_MOCK) return http(`/${kind === 'recipient' ? 'recipients' : 'donors'}/${p.id}/postop/${section}`);
    const hit = store.get(key(kind, p.id, section));
    return mockDelay((hit ?? { data: sample(section, p, kind, filled), savedAt: filled ? p.statusSince : undefined }) as { data: T; savedAt?: string }, 200);
  },
  async save<T>(kind: PersonKind, id: string, section: PostopSection, data: T): Promise<string> {
    if (!USE_MOCK) return http(`/${kind === 'recipient' ? 'recipients' : 'donors'}/${id}/postop/${section}`, { method: 'PUT', body: JSON.stringify(data) });
    const savedAt = new Date().toISOString();
    store.set(key(kind, id, section), { data, savedAt });
    return mockDelay(savedAt, 350);
  },
};
