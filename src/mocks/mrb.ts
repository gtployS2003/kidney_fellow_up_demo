import type { MrbLabGroup, MrbRow } from '@/types';

/**
 * ผล Lab / Imaging / Consult ก่อนเข้า MRB (เดโม) — ระบบจริงดึงจาก LIS / iMed
 * ค่าว่าง = “รอผลตรวจ”
 */
export const RECIPIENT_LABS: MrbLabGroup[] = [
  {
    title: 'Chem',
    date: '2025-07-02',
    rows: [
      ['Blood group', ''], ['FPG/HbA1c', '96 / 5.4'], ['Uric acid', '6.8'], ['BUN / Cr', '48 / 8.9'], ['Na / K', '138 / 4.9'], ['Cl / HCO3', '101 / 21'],
      ['Ca / P / Mg', '9.1 / 5.2 / 2.3'], ['TP / Alb', '7.0 / 3.9'], ['TB / DB', '0.5 / 0.1'], ['AST / ALT', '22 / 18'], ['ALP', '96'], ['CHOL / TG', '182 / 140'],
      ['HDL / LDL', '42 / 110'], ['iPTH', '320'], ['stool exam/OB', 'neg'], ['CEA', '1.8'], ['CA 19-9', '12'], ['AFP', '2.1'],
    ],
  },
  { title: 'Hematology', date: '2025-07-02', rows: [['Hb/Hct', '10.8 / 32.6'], ['WBC', '6,800'], ['PMN/L/E', '64/28/3'], ['Plt', '240,000'], ['PT / PTT/INR', '12.1/28/1.02']] },
  { title: 'Iron study', date: '2025-07-02', rows: [['Serum iron', '68'], ['Ferritin', '420'], ['TIBC', '240'], ['Tsat%', '28']] },
  {
    title: 'Serology',
    date: '2025-07-02',
    rows: [['VDRL(CMIA)', 'NR'], ['HBsAg', 'neg'], ['Anti HBc', 'neg'], ['Anti HBs', 'pos'], ['Anti HIV', 'neg'], ['Anti HCV', 'neg'], ['CMV IgG', 'pos'], ['VZV.IgG', 'pos'], ['EBV.IgG', 'pos'], ['AntiHAV', 'neg']],
  },
  { title: 'Urine', date: '2025-07-02', rows: [['Spgr/pH', '1.010 / 6.0'], ['RBC/WBC', '0-1 / 0-1'], ['Prot/sugar', '2+ / neg'], ['Epith', '0-1'], ['Urine c/s', 'no growth']] },
  { title: 'Urine 24 hr', rows: [['Prot', ''], ['Ccr', ''], ['Volume', ''], ['total Cr.', ''], ['Urea nitrogen', '']] },
];

export const DONOR_LABS: MrbLabGroup[] = [
  {
    title: 'Chem',
    date: '2025-09-05',
    rows: [
      ['Blood group', ''], ['FPG/HbA1c', '92 / 5.5'], ['75 g OGTT', 'normal'], ['Uric acid', '5.2'], ['BUN / Cr', '12 / 0.7'], ['Na / K', '140 / 4.1'], ['Cl / HCO3', '103 / 25'],
      ['Ca / P / Mg', '9.4 / 3.6 / 2.1'], ['TP / Alb', '7.4 / 4.3'], ['TB / DB', '0.6 / 0.1'], ['AST / ALT', '19 / 15'], ['ALP', '72'], ['CHOL / TG', '196 / 110'], ['HDL / LDL', '55 / 118'],
      ['PSA', ''], ['stool exam/OB', 'neg'],
    ],
  },
  { title: 'Hematology', date: '2025-09-05', rows: [['Hb/Hct', '12.9 / 38.5'], ['WBC', '6,200'], ['PMN/L/E', '58/34/2'], ['Plt', '268,000'], ['PT / PTT/INR', '11.8/27/0.98']] },
  { title: 'Serology', date: '2025-09-05', rows: [['VDRL(CMIA)', 'NR'], ['HBsAg', 'neg'], ['Anti HBc', 'neg'], ['Anti HBs', 'pos'], ['Anti HIV', 'neg'], ['Anti HCV', 'neg'], ['CMV IgG', 'pos'], ['EBV.IgG', 'pos']] },
  { title: 'Urine', date: '2025-09-05', rows: [['Spgr/pH', '1.015 / 6.0'], ['RBC/WBC', '0-1 / 0-1'], ['Prot/sugar', 'neg / neg'], ['Epith', '0-1'], ['Urine c/s', 'no growth']] },
  {
    title: 'Urine 24 hr',
    date: '2025-09-05',
    rows: [['Prot', '80', 'mg/dL'], ['Ccr', '98', 'ml/min'], ['correct', '106', 'ml/min/1.73m²'], ['Volume', '1,800', 'ml'], ['total Cr.', '1.1', 'g'], ['Urea nitrogen', '8.2', 'g'], ['microalbumin', '12', 'mg/24hr']],
  },
];

export const RECIPIENT_IMAGING: MrbRow[] = [['CXR', '02/07/68 · normal'], ['EKG', '02/07/68 · LVH'], ['Echo', '15/07/68 · EF 62%'], ['CAG', ''], ['CTWA', '20/10/69'], ['EGD', ''], ['Colonoscope', '']];
export const DONOR_IMAGING: MrbRow[] = [['CXR', '05/09/68 · normal'], ['EKG', '05/09/68 · normal'], ['CTA', '18/09/68 · single artery'], ['Renal scan', '22/09/68 · L 49% R 51%']];
export const RECIPIENT_CONSULTS: MrbRow[] = [['สังคมสงเคราะห์', '04/08/68'], ['Psychiatrist', '04/08/68'], ['Dentist', '20/08/68'], ['Surg', '14/10/69'], ['Cardio', '10/08/68'], ['Endocrine', '']];
export const DONOR_CONSULTS: MrbRow[] = [['สังคมสงเคราะห์', '12/09/68'], ['Psychiatrist', '12/09/68'], ['Surg', '25/09/68'], ['Urosx', '25/09/68']];
export const RECIPIENT_VACCINES: MrbRow[] = [['Influenza', '05/2568'], ['PCV15/ PPSV23/ PCV20', ''], ['COVID-19', 'เข็ม 3 · 2566']];
export const DONOR_VACCINES: MrbRow[] = [['Influenzae', '05/2568']];
export const DONOR_SCORING: MrbRow[] = [['LKDPI', '18'], ['pre-donation lifetime ESRD risk', '0.4%'], ['post-donation lifetime ESRD risk', '0.9%']];

/** ข้อมูลลงทะเบียนส่วนที่ยังไม่อยู่ใน DTO (เดโม) */
export const REG_EXTRA = {
  recipient: { education: 'ปริญญาตรี', occupation: 'พนักงานเอกชน', coverage: 'ประกันสังคม', income: '25,000', expense: '18,000', marital: 'โสด', children: '0', siblings: '2' },
  donor: { education: 'มัธยมศึกษา', occupation: 'ธุรกิจส่วนตัว/ค้าขาย', coverage: 'หลักประกันสุขภาพ (30 บาท)', income: '30,000', expense: '20,000', marital: 'สมรส', children: '2', siblings: '3' },
};
