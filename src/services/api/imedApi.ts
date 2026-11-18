import type { PersonRef } from '@/types';
import { USE_MOCK, http, mockDelay } from './client';

// ===== OPD card KT — ดึงจาก iMed (แพทย์/พยาบาลบันทึกใน iMed ตามปกติ · ระบบนี้ดูและพิมพ์ได้อย่างเดียว) =====

/** [ชื่อ, ค่า, หน่วย] — ค่าว่าง = ไม่มีผลใน VN นี้ */
export type OpdLabRow = [string, string, string];
export interface OpdLabGroup {
  title: string;
  date?: string;
  rows: OpdLabRow[];
}
export interface OpdCardVisit {
  vn: string;
  date: string;
  time: string;
  opd: string;
  allergy: string;
  coverage: string;
  kt: {
    deceased: boolean;
    donorFrom: string;
    ktDate: string;
    hlaMm: string;
    pra: string;
    preDsa: string;
    xm: string;
    abo: boolean;
    prevKt: boolean;
    cmv: string;
  };
  vitals: { bt: string; pr: string; bp: string; rr: string; bw: string; bmi: string };
  note: { clinical: string; homeBp: boolean; edema: string; tremor: boolean; oralUlcer: boolean; pharm: string };
  labs: { drug: OpdLabGroup; heme: OpdLabGroup; chem: OpdLabGroup; lipid: OpdLabGroup; urine24: OpdLabGroup; urine: OpdLabGroup };
  meds: { immuno: [string, string][]; prophylaxis: [string, string][]; misc: [string, string][]; review: string[] };
  summary: { graft: 'Stable' | 'Deteriorated' | 'Improved graft function'; left: [string, string][]; right: [string, string][] };
  last: [string, string][];
  followUp: string;
  physician: string;
}
export interface OpdCardDto {
  updatedAt: string;
  visits: OpdCardVisit[];
}

/** ประวัติการปรับยา / ภาวะแทรกซ้อน (ดึงจาก iMed) */
export interface ImedMedAdjust {
  date: string;
  drug: string;
  from: string;
  to: string;
  reason: string;
}
export interface ImedComplication {
  date: string;
  type: string;
  detail: string;
  admit: string;
}

/** 2026-08-23 → 23 Aug 2026 (รูปแบบที่แพทย์เขียนในฟอร์มเดิม) */
const enDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const addDays = (iso: string, n: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

function sampleCard(p: PersonRef): OpdCardDto {
  const kt = p.stageDates.surgery ?? addDays(p.statusSince, -11);
  const deceased = p.caseType === 'redcross';
  const offsets = [15, 22, 36, 50];
  const cr = ['1.3', '1.1', '1.0', '1.0'];
  const tac = ['9.2', '8.9', '8.9', '7.6'];
  const visits = offsets.map((o, i): OpdCardVisit => {
    const date = addDays(kt, o);
    const last = i === offsets.length - 1;
    return {
      vn: `${1000 + i}/${String(64 + i * 17).padStart(6, '0')}`,
      date,
      time: '09:30',
      opd: '99',
      allergy: 'ไม่มี',
      coverage: 'ข้าราชการ',
      kt: { deceased, donorFrom: deceased ? '' : 'ญาติ', ktDate: kt, hlaMm: '2-0-2-2', pra: '70% T cell', preDsa: 'positive DR5 (5,000 MFI)', xm: 'Negative', abo: false, prevKt: false, cmv: '+/-' },
      vitals: { bt: '37', pr: ['88', '84', '80', '101'][i], bp: ['132/84', '130/82', '128/80', '130/80'][i], rr: '18', bw: ['66', '65.5', '65', '65'][i], bmi: '23' },
      note: { clinical: last ? 'สบายดี ไม่มีไข้ · Tac level ต่ำกว่าเป้า' : 'สบายดี ไม่มีไข้ แผลแห้งดี', homeBp: false, edema: '', tremor: false, oralUlcer: false, pharm: '' },
      labs: {
        drug: { title: 'ระดับยากดภูมิ', date, rows: [['TAC C0', tac[i], 'ng/mL'], ['CSA C0/C2', '', 'ng/mL'], ['SRL C0', '', 'ng/mL'], ['EVL C0', '', 'ng/mL'], ['Time', '8.00, 20.00', ''], ['AUC', '', ''], ['%CV', '', '']] },
        heme: {
          title: 'Hematology',
          date,
          rows: [['Hb', '10', 'g/dL'], ['Hct', '30', '%'], ['MCV', '80', 'fl'], ['RDW', '14', '%'], ['WBC', '5,000', '/uL'], ['PMNs', '76', '%'], ['Lymph', '20', '%'], ['Plt', '130,000', '/uL'], ['Ferritin', '', 'ng/ml'], ['TSAT', '', '%'], ['PT/INR', '13/1.1', 'sec'], ['PTT', '', 'sec'], ['Reticulocyte', '', ''], ['CMV VL', last ? '2,000 · log 5.6' : '', '']],
        },
        chem: {
          title: 'Chemistry',
          date,
          rows: [['FBS', '99', 'mg/dL'], ['HbA1C', '6.5', '%'], ['BUN', ['22', '20', '19', '20'][i], 'mg/dL'], ['Cr', cr[i], 'mg/dL'], ['Na', '137', 'mmol/L'], ['K', '4.4', 'mmol/L'], ['Cl', '107', 'mmol/L'], ['HCO3-', '24', 'mmol/L'], ['Ca', '8.2', 'mg/dL'], ['PO4-', '3.5', 'mg/dL'], ['Mg', '2.1', 'mg/dL'], ['Uric', '4.0', 'mg/dL'], ['BK VL (Blood/Urine)', '', 'log']],
        },
        lipid: { title: 'Lipid / LFT', rows: [['Chol', '', 'mg/dL'], ['TG', '', 'mg/dL'], ['HDL', '', 'mg/dL'], ['LDL', '', 'mg/dL'], ['Alb', '', 'g/dL'], ['Glob', '', 'g/dL'], ['TB/DB', '', 'mg/dL'], ['AST/ALT', '', 'u/L'], ['ALP', '', 'u/L'], ['iPTH', '', 'pg/mL'], ['25-OH vitD', '', 'ng/mL'], ['Others', '', '']] },
        urine24: { title: '24 hr urine', date, rows: [['Volume', '3,000', 'mL'], ['Total Cr', '4', 'g'], ['Total urea', '13', 'g'], ['Total protein', '250', 'mg'], ['DPI', '1.4', ''], ['CrCl', '', 'ml/min'], ['Urine Na', '', 'mmol']] },
        urine: { title: 'Urine', date, rows: [['UA sp.gr', '1.030', ''], ['protein', '2+', ''], ['sugar', 'neg', ''], ['WBC/Leu', '3-5/2+', ''], ['RBC/Blood', '1-2/neg', ''], ['UPCI', '0.3', '']] },
      },
      meds: {
        immuno: [['Tacrolimus', last ? '3.5-0-3.5 mg' : '3-0-3 mg'], ['Ciclosporin', ''], ['Sirolimus', ''], ['Everolimus', ''], ['MMF/MPF', 'MMF (250) 3-0-3'], ['Azathioprine', ''], ['Prednisolone', i < 2 ? '4 tab OD' : '2 tab OD']],
        prophylaxis: [['Bactrim (400/80)', '2 tab BID'], ['Acyclovir (200)', '1 tab BID'], ['Lasix', '(40) 1 tab OD'], ['Sodamint', '(650) 1 tab BID'], ['CaCO3', '(835) 1 tab OD'], ['Vit D2 (20,000 iu)', '1/wk'], ['Statin', 'Atorvastatin (40) ½ tab hs']],
        misc: [['PPI', 'Omeprazole (20) 1 tab OD'], ['ESA', 'Espogen 4,000 u 1/wk'], ['อื่น ๆ', 'Chelated Mg 1 tab BID']],
        review: ['Madiplot (20) 1 tab BID', 'Doxazocin (2) 2 tab hs', 'Metoprolol (100) ¼ tab BID', 'Aldactone (25) 1 tab OD', 'Azilsartan (40) 1 tab BID'],
      },
      summary: {
        graft: i === 0 ? 'Improved graft function' : 'Stable',
        left: [['History TCMR', 'ไม่มี'], ['History ABMR', 'ไม่มี'], ['CNI toxicity', 'ไม่มี'], ['CMV DNAemia', last ? 'มี · CMV VL 2,000' : 'ไม่มี'], ['PyV BK viremia/BKVAN', 'ไม่มี'], ['Surgical complication', 'ไม่มี']],
        right: [['PTDM', 'ไม่มี'], ['Malignancy', 'ไม่มี'], ['DM/HT/DLP', 'HT']],
      },
      last: [
        ['USG Doppler allograft', `${enDate(addDays(kt, 3))} · No transplant renal artery stenosis, renal parenchymal disease`],
        ['Allograft biopsy', ''],
        ['DSA/PRA', `${enDate(addDays(kt, 14))} · DR5 (2,000 MFI)`],
      ],
      followUp: last ? '2 week' : '1 week',
      physician: 'นพ.สมเกียรติ วงศ์ไทย',
    };
  });
  return { updatedAt: `${visits[visits.length - 1].date}T10:42:00`, visits: visits.reverse() };
}

function sampleMeds(p: PersonRef): ImedMedAdjust[] {
  const kt = p.stageDates.surgery ?? addDays(p.statusSince, -11);
  return [
    { date: addDays(kt, 50), drug: 'Tacrolimus', from: '3-0-3 mg', to: '3.5-0-3.5 mg', reason: 'TAC C0 7.6 (ต่ำกว่าเป้า 8–10)' },
    { date: addDays(kt, 36), drug: 'Prednisolone', from: '4 tab OD', to: '2 tab OD', reason: 'ลดขนาดตามแผน' },
  ];
}
function sampleComps(p: PersonRef): ImedComplication[] {
  const kt = p.stageDates.surgery ?? addDays(p.statusSince, -11);
  return [{ date: addDays(kt, 50), type: 'CMV / BK virus', detail: 'CMV DNAemia · CMV VL 2,000 · ติดตาม OPD', admit: 'ไม่ admit' }];
}

/** module “iMed” ฝั่ง backend: /api/imed/{recipients|donors}/{id}/... (อ่านอย่างเดียว) */
export const imedApi = {
  async opdCard(p: PersonRef): Promise<OpdCardDto> {
    if (!USE_MOCK) return http(`/imed/recipients/${p.id}/opd-card`);
    return mockDelay(sampleCard(p), 250);
  },
  async medAdjust(kind: 'recipient' | 'donor', p: PersonRef, filled: boolean): Promise<ImedMedAdjust[]> {
    if (!USE_MOCK) return http(`/imed/${kind === 'recipient' ? 'recipients' : 'donors'}/${p.id}/med-adjust`);
    return mockDelay(filled && kind === 'recipient' ? sampleMeds(p) : [], 200);
  },
  async complications(kind: 'recipient' | 'donor', p: PersonRef, filled: boolean): Promise<ImedComplication[]> {
    if (!USE_MOCK) return http(`/imed/${kind === 'recipient' ? 'recipients' : 'donors'}/${p.id}/complications`);
    return mockDelay(filled && kind === 'recipient' ? sampleComps(p) : [], 200);
  },
};
