/** โครงข้อมูลฟอร์ม Evaluation (ผู้รับ) 1.1–1.5 และ MRB — ตรงกับ DTO ฝั่ง .NET ในอนาคต */

export type FormKey = 'counseling' | 'currentTx' | 'history' | 'physical' | 'plan' | 'mrb' | 'donorCounseling' | 'donorHistory';

export interface FormMeta {
  key: FormKey;
  num: string;
  title: string;
  fileName: string;
}

export const FORM_META: Record<FormKey, FormMeta> = {
  counseling: { key: 'counseling', num: '1.1', title: 'รายการให้คำปรึกษา', fileName: 'KT-1.1-counseling' },
  currentTx: { key: 'currentTx', num: '1.2', title: 'ข้อมูลการรักษาปัจจุบัน', fileName: 'KT-1.2-dialysis-information' },
  history: { key: 'history', num: '1.3', title: 'ซักประวัติโดยแพทย์', fileName: 'KT-1.3-history' },
  physical: { key: 'physical', num: '1.4', title: 'ตรวจร่างกายโดยแพทย์', fileName: 'KT-1.4-physical-exam' },
  plan: { key: 'plan', num: '1.5', title: 'รายการรอส่งตรวจเพิ่มเติม', fileName: 'KT-1.5-summary-plan' },
  mrb: { key: 'mrb', num: '2', title: 'รอ MRB', fileName: 'KT-2-MRB' },
  donorCounseling: { key: 'donorCounseling', num: '1.1', title: 'รายการให้คำปรึกษาผู้บริจาค', fileName: 'KT-D1.1-donor-counseling' },
  donorHistory: { key: 'donorHistory', num: '1.2', title: 'ซักประวัติโดยแพทย์', fileName: 'KT-D1.2-donor-history' },
};

export const EVAL_KEYS: FormKey[] = ['counseling', 'currentTx', 'history', 'physical', 'plan'];
export const DONOR_EVAL_KEYS: FormKey[] = ['donorCounseling', 'donorHistory', 'physical', 'plan'];

// ---------- ผู้บริจาค 1.1 รายการให้คำปรึกษาผู้บริจาค ----------
/** ข้อ 3.4 ใช้กับผู้บริจาคหญิงเท่านั้น */
export const DONOR_COUNSELING_TOPICS: { title: string; items: string[] }[] = [
  { title: 'การปลูกถ่ายไตและชนิดการปลูกถ่ายไต', items: ['การปลูกถ่ายไตจากผู้บริจาคมีชีวิต', 'การปลูกถ่ายไตจากผู้บริจาคสมองตาย', 'ข้อห้ามของการปลูกถ่ายไต'] },
  { title: 'การเตรียมความพร้อมก่อนการปลูกถ่ายไต', items: ['การประเมินความพร้อมด้านร่างกาย', 'การประเมินความพร้อมด้านจิตใจ'] },
  {
    title: 'ภาวะแทรกซ้อนและความเสี่ยงที่อาจเกิดขึ้นได้',
    items: ['ภาวะแทรกซ้อนจากการผ่าตัด เช่น เลือดออก ติดเชื้อ แพ้ยาดมสลบ', 'ความเสี่ยงเรื่องไตเสื่อมเรื้อรังหลังบริจาคไต', 'ความเสี่ยงเรื่องความดันโลหิตสูงหลังบริจาคไต', 'ความเสี่ยงเรื่องครรภ์เป็นพิษและความดันโลหิตสูงขณะตั้งครรภ์ (ในกรณีที่ผู้บริจาคต้องการตั้งครรภ์หลังบริจาคไต)'],
  },
  { title: 'การปฏิบัติตนหลังปลูกถ่ายไต', items: ['การปฏิบัติตัวในระยะยาวหลังปลูกถ่ายไต', 'การมาตรวจตามนัดหลังบริจาคไต'] },
  { title: 'สิทธิการรักษา', items: ['สิทธิเบิกราชการ', 'สิทธิประกันสังคม', 'สิทธิหลักประกันสุขภาพถ้วนหน้า', 'เงินสด', 'ค่าใช้จ่ายส่วนเกินสิทธิ'] },
];
export const isFemaleOnly = (c: number, s: number) => c === 2 && s === 3;
export interface DonorCounselingForm {
  date: string;
  counselor: string;
  understood: Record<string, boolean>;
  signedFile?: string;
}

// ---------- ผู้บริจาค 1.2 ซักประวัติ ----------
export const DONOR_DISEASES: { name: string; spec: boolean }[] = [
  { name: 'ความดันโลหิตสูง', spec: true },
  { name: 'เบาหวาน', spec: false },
  { name: 'นิ่วในไต', spec: true },
  { name: 'มะเร็ง', spec: true },
  { name: 'ไวรัสตับอักเสบ', spec: false },
  { name: 'โรคติดเชื้อ อื่นๆ', spec: true },
];
export const DONOR_HABITS = ['สูบบุหรี่', 'เหล้า/สุรา', 'สารเสพติด'];
export const DONOR_FAMILY = ['เบาหวานในครอบครัว', 'ประวัติ GN ในครอบครัว', 'ประวัติ PKD ในครอบครัว', 'ประวัติมะเร็งในครอบครัว', 'ประวัติ Renal cell carcinoma'];
export interface YesNo {
  has: '' | 'มี' | 'ไม่มี';
  detail: string;
}
export interface DonorHistoryForm {
  date: string;
  rhGroup: string;
  chronic: '' | 'มี' | 'ไม่มี';
  diseases: Record<string, YesNo>;
  habits: Record<string, YesNo>;
  meds: string;
  family: Record<string, YesNo>;
  otherHistory: string;
}

// ---------- 1.1 รายการให้คำปรึกษา ----------
export const COUNSELING_TOPICS: { title: string; items: string[] }[] = [
  { title: 'การปลูกถ่ายไตและชนิดการปลูกถ่ายไต', items: ['การปลูกถ่ายไตจากผู้บริจาคมีชีวิต', 'การปลูกถ่ายไตจากผู้บริจาคสมองตาย', 'ข้อห้ามของการปลูกถ่ายไต'] },
  { title: 'การเตรียมความพร้อมก่อนการปลูกถ่ายไต', items: ['การประเมินความพร้อมด้านร่างกาย', 'การประเมินความพร้อมด้านจิตใจ'] },
  { title: 'ภาวะแทรกซ้อนและความเสี่ยงที่อาจเกิดขึ้นได้จากการปลูกถ่ายไต', items: ['การปฏิเสธไต', 'การติดเชื้อ', 'ผลข้างเคียงจากยากดภูมิ'] },
  { title: 'การปฏิบัติตนหลังการปลูกถ่ายไต', items: ['การปฏิบัติตนของผู้ป่วยในระยะ 48 ชั่วโมงแรกหลังการปลูกถ่ายไต', 'การปฏิบัติในระยะยาวหลังการปลูกถ่ายไต'] },
  { title: 'สิทธิการรักษา', items: ['สิทธิเบิกราชการ', 'สิทธิประกันสังคม', 'สิทธิหลักประกันสุขภาพถ้วนหน้า', 'เงินสด', 'ค่าใช้จ่ายส่วนเกินสิทธิ'] },
  { title: 'ขั้นตอนการเตรียมตัวให้พร้อมก่อนการเปลี่ยนไต', items: [] },
  { title: 'ข้อควรปฏิบัติช่วงรอรับไต', items: ['เจาะเลือดตรวจ PRA ทุก 3 เดือน', 'เจาะเลือดทุกเดือนภายในวันที่ …', 'ติดต่อได้ตลอดเวลาเมื่อมีไตบริจาค'] },
];
/** key ของแต่ละหัวข้อ: "c-s" (หมวดที่ไม่มีหัวข้อย่อยใช้ "c-0") */
export const counselingKeys = (): string[] => COUNSELING_TOPICS.flatMap((t, c) => (t.items.length ? t.items.map((_, s) => `${c}-${s}`) : [`${c}-0`]));

export interface CounselingForm {
  date: string;
  counselor: string;
  understood: Record<string, boolean>;
  bloodDrawDay: string;
  signedFile?: string;
}

// ---------- 1.2 ข้อมูลการรักษาปัจจุบัน ----------
export const SEROLOGY = ['HBsAg', 'Anti-HBs', 'Anti-HBc', 'Anti-HCV', 'Anti-HIV'] as const;
export interface CurrentTxForm {
  date: string;
  mode: '' | 'Preemptive KT' | 'Hemodialysis' | 'Peritoneal dialysis';
  frequency: string;
  initiation: string;
  unit: string;
  residual: string;
  dryWeight: string;
  accessDate: string;
  accessType: '' | 'AVF' | 'AVG' | 'Permanent catheter' | 'Temporary catheter' | 'Tenckhoff catheter';
  vessel: string;
  side: string;
  infection: string;
  serology: Record<string, { result: '' | 'Positive' | 'Negative'; titer: string; date: string }>;
  transfusionDate: string;
  transfusionAmount: string;
  pregnancy: string;
  herpes: string;
  allergy: string;
  chickenpox: string;
}

// ---------- 1.3 ซักประวัติ ----------
export const ESRD_CAUSES: string[][] = [
  ['Diabetic nephropathy', 'IgA nephropathy', 'Membranous nephropathy', 'FSGS', 'Lupus nephritis', 'ANCA-associated GN', 'Anti-GMB disease'],
  ['Obstructive uropathy', 'Polycystic kidney disease', 'Chronic pyelonephritis', 'Analgesic nephropathy', 'Chronic tubulointerstitial nephritis', 'Hypertensive nephropathy', 'Dysplastic/aplastic kidney'],
  ['Allograft dysfunction', 'Alport syndrome', 'Renal cell carcinoma', 'Trauma', 'Other', 'Unknown'],
];
export const CONDITIONS = [
  'Diabetic mellitus', 'Cardiac disease', 'Peripheral vascular disease', 'Cerebrovascular disease', 'HBV/HCV infection', 'HIV infection', 'Tuberculosis', 'Other chronic infection', 'Chronic lung disease', 'History of cancer', 'Hypertension', 'Dyslipidemia', 'Smoking', 'Alcohol consumption', 'Bleeding tendency', 'Previous surgery', 'Other',
];
export interface Med {
  name: string;
  dose: string;
  how: string;
}
export interface HistoryForm {
  date: string;
  causes: string[];
  allograftDueTo: string;
  otherCause: string;
  conditions: Record<string, { has: boolean; detail: string }>;
  meds: Med[];
}

// ---------- 1.4 ตรวจร่างกาย ----------
export const SYSTEMS = ['HEENT', 'Chest examination', 'Cardiac and peripheral pulses examination', 'Abdominal examination', 'Neurological examination', 'Extremities'];
export interface PhysicalForm {
  date: string;
  weight: string;
  height: string;
  bp: string;
  pulse: string;
  temp: string;
  rr: string;
  systems: Record<string, { result: '' | 'normal' | 'abnormal'; note: string }>;
  other: string;
}
export function bmi(w: string, h: string): string {
  const W = parseFloat(w), H = parseFloat(h) / 100;
  return W > 0 && H > 0 ? (W / (H * H)).toFixed(1) : '';
}
/** Mosteller */
export function bsa(w: string, h: string): string {
  const W = parseFloat(w), H = parseFloat(h);
  return W > 0 && H > 0 ? Math.sqrt((W * H) / 3600).toFixed(2) : '';
}

// ---------- 1.5 Summary & plan ----------
export type TrackStatus = 'sent' | 'waiting' | 'pass' | 'fail';
export interface TrackItem {
  selected: boolean;
  reason?: string;
  status: TrackStatus;
  date: string;
  fromHis?: boolean;
  fail?: { what: string; where: string; why: string; followStatus: TrackStatus };
}
export const PLAN_ITEMS = [
  ['Complete Lab and serology', 'CT angiography of aorta'],
  ['CXR and ECG 12 lead', 'CT angiography/ MRA of cerebral arteries'],
  ['USG whole abdomen', 'Doppler study of lower extremities'],
  ['DTPA renal scan', 'VCUG'],
  ['Mammography', 'Anti-A / B tier'],
];
export const CONSULTS: { key: string; label: string; forField: boolean }[] = [
  { key: 'gastro', label: 'Consult gastroenterologist', forField: true },
  { key: 'cardio', label: 'Consult cardiologist', forField: true },
  { key: 'id', label: 'Consult infectious disease specialist', forField: true },
  { key: 'surgeon', label: 'Consult surgeon', forField: true },
  { key: 'uro', label: 'Consult urologist', forField: true },
  { key: 'gyn', label: 'Consult gynecologist', forField: true },
  { key: 'psych', label: 'Consult psychiatrist', forField: false },
  { key: 'dentist', label: 'Consult dentist', forField: false },
  { key: 'social', label: 'Consult social worker', forField: false },
];
export const VACCINES = ['Influenza vaccine', 'COVID vaccine', 'HBV vaccines', 'PREVNAR13 → PNEUMOVAX 23', 'Zostavax'];
export interface PlanForm {
  date: string;
  medicalProblems: string;
  plan: Record<string, TrackItem>;
  consults: Record<string, TrackItem>;
  vaccines: Record<string, { selected: boolean; detail: string }>;
  requestOf: string;
  requestFrom: string;
  other: string;
  physician: string;
}

// ---------- MRB ----------
export interface MrbForm {
  date: string;
  result: '' | 'pass' | 'fail';
  note: string;
}

export type AnyForm = CounselingForm | CurrentTxForm | HistoryForm | PhysicalForm | PlanForm | MrbForm | DonorCounselingForm | DonorHistoryForm;

const today = () => new Date().toISOString().slice(0, 10);
const allPlan = () => Object.fromEntries(PLAN_ITEMS.flat().map((k) => [k, { selected: false, status: 'sent' as TrackStatus, date: '' }]));
const allConsults = () => Object.fromEntries(CONSULTS.map((c) => [c.key, { selected: false, status: 'sent' as TrackStatus, date: '', reason: '' }]));

/** ฟอร์มเปล่า */
export function emptyForm(key: FormKey): AnyForm {
  switch (key) {
    case 'counseling':
      return { date: today(), counselor: '', understood: {}, bloodDrawDay: '' } satisfies CounselingForm;
    case 'currentTx':
      return {
        date: today(), mode: '', frequency: '', initiation: '', unit: '', residual: '', dryWeight: '', accessDate: '', accessType: '', vessel: '', side: '', infection: '',
        serology: Object.fromEntries(SEROLOGY.map((s) => [s, { result: '', titer: '', date: '' }])) as CurrentTxForm['serology'],
        transfusionDate: '', transfusionAmount: '', pregnancy: '', herpes: '', allergy: '', chickenpox: '',
      } satisfies CurrentTxForm;
    case 'history':
      return { date: today(), causes: [], allograftDueTo: '', otherCause: '', conditions: Object.fromEntries(CONDITIONS.map((c) => [c, { has: false, detail: '' }])), meds: [] } satisfies HistoryForm;
    case 'physical':
      return { date: today(), weight: '', height: '', bp: '', pulse: '', temp: '', rr: '', systems: Object.fromEntries(SYSTEMS.map((s) => [s, { result: '', note: '' }])) as PhysicalForm['systems'], other: '' } satisfies PhysicalForm;
    case 'plan':
      return { date: today(), medicalProblems: '', plan: allPlan(), consults: allConsults(), vaccines: Object.fromEntries(VACCINES.map((v) => [v, { selected: false, detail: '' }])), requestOf: '', requestFrom: '', other: '', physician: 'นพ.สมเกียรติ วงศ์ไทย' } satisfies PlanForm;
    case 'mrb':
      return { date: today(), result: '', note: '' } satisfies MrbForm;
    case 'donorCounseling':
      return { date: today(), counselor: '', understood: {} } satisfies DonorCounselingForm;
    case 'donorHistory': {
      const yn = (names: string[]) => Object.fromEntries(names.map((n) => [n, { has: '' as const, detail: '' }]));
      return { date: today(), rhGroup: '', chronic: '', diseases: yn(DONOR_DISEASES.map((d) => d.name)), habits: yn(DONOR_HABITS), meds: '', family: yn(DONOR_FAMILY), otherHistory: '' } satisfies DonorHistoryForm;
    }
  }
}

/** ข้อมูลตัวอย่างสำหรับขั้นตอนที่ “เสร็จแล้ว” ในเดโม (ค่าที่ดึงจาก iMed จะมาจาก backend จริง) */
export function sampleForm(key: FormKey, sex: 'male' | 'female', kind: 'recipient' | 'donor' = 'recipient'): AnyForm {
  const base = emptyForm(key);
  switch (key) {
    case 'counseling': {
      const f = base as CounselingForm;
      counselingKeys().forEach((k) => (f.understood[k] = true));
      return { ...f, date: '2025-06-20', counselor: 'พย.วิภา สุขใจ', bloodDrawDay: '5' };
    }
    case 'currentTx': {
      const f = base as CurrentTxForm;
      SEROLOGY.forEach((s) => (f.serology[s] = { result: s === 'Anti-HBs' ? 'Positive' : 'Negative', titer: s === 'Anti-HBs' ? '45 mIU/mL' : '', date: '2025-05-12' }));
      return { ...f, date: '2025-06-22', mode: 'Hemodialysis', frequency: '3 ครั้ง/สัปดาห์ · ครั้งละ 4 ชม.', initiation: '2024-03-15', unit: 'ศูนย์ไตเทียม รพ.ม.นเรศวร', residual: 'Urine ~200 ml/วัน', dryWeight: '62.5', accessDate: '2024-01-10', accessType: 'AVF', vessel: 'Brachiocephalic', side: 'Left', infection: 'ไม่มี', herpes: 'No', allergy: 'ไม่มีประวัติแพ้ยา', chickenpox: 'Yes' };
    }
    case 'history': {
      const f = base as HistoryForm;
      f.conditions['Hypertension'] = { has: true, detail: 'ตั้งแต่ปี 2560 · คุมด้วย Amlodipine' };
      f.conditions['Dyslipidemia'] = { has: true, detail: 'Atorvastatin 20 mg' };
      f.conditions['Previous surgery'] = { has: true, detail: 'สร้าง AVF แขนซ้าย ม.ค. 2567' };
      return {
        ...f, date: '2025-06-24', causes: ['Hypertensive nephropathy'],
        meds: [
          { name: 'Amlodipine', dose: '10 mg', how: 'วันละ 1 ครั้ง เช้า' },
          { name: 'Atorvastatin', dose: '20 mg', how: 'วันละ 1 ครั้ง ก่อนนอน' },
          { name: 'Calcium carbonate', dose: '1,500 mg', how: 'วันละ 3 ครั้ง พร้อมอาหาร' },
          { name: 'Erythropoietin', dose: '4,000 U SC', how: 'สัปดาห์ละ 2 ครั้ง' },
        ],
      };
    }
    case 'physical': {
      const f = base as PhysicalForm;
      SYSTEMS.forEach((s) => (f.systems[s] = { result: 'normal', note: '' }));
      f.systems['Extremities'] = { result: 'abnormal', note: 'AVF แขนซ้าย คลำ thrill ได้ ฟัง bruit ชัด · ไม่บวม' };
      return { ...f, date: '2025-06-24', weight: '64', height: '170', bp: '138/84', pulse: '78', temp: '36.8', rr: '18' };
    }
    case 'plan': {
      const f = base as PlanForm;
      const sel = (rec: Record<string, TrackItem>, k: string, s: TrackStatus, d: string, extra: Partial<TrackItem> = {}) => (rec[k] = { ...rec[k], selected: true, status: s, date: d, ...extra });
      sel(f.plan, 'Complete Lab and serology', 'pass', '2025-07-02', { fromHis: true });
      sel(f.plan, 'CXR and ECG 12 lead', 'pass', '2025-07-02', { fromHis: true });
      sel(f.plan, 'USG whole abdomen', 'pass', '2025-07-15');
      sel(f.plan, 'CT angiography of aorta', 'waiting', '2026-10-20');
      sel(f.plan, 'Doppler study of lower extremities', 'sent', '2026-10-28');
      if (sex === 'female') sel(f.plan, 'Mammography', 'pass', '2025-07-20');
      sel(f.consults, 'cardio', 'pass', '2025-08-10', { reason: 'ประเมินก่อนผ่าตัด' });
      sel(f.consults, 'surgeon', 'waiting', '2026-10-14', { reason: 'ประเมินหลอดเลือด' });
      sel(f.consults, 'psych', 'pass', '2025-08-04');
      sel(f.consults, 'dentist', 'fail', '2025-08-20', { reason: 'ตรวจสุขภาพช่องปาก', fail: { what: 'ถอนฟันผุ 2 ซี่ และอุดฟัน 1 ซี่', where: 'ทันตกรรม รพ.ม.นเรศวร', why: 'ฟันผุลึก เสี่ยงติดเชื้อหลังได้รับยากดภูมิ', followStatus: 'sent' } });
      sel(f.consults, 'social', 'pass', '2025-08-04');
      f.vaccines['Influenza vaccine'] = { selected: true, detail: 'ได้รับแล้ว 05/2568' };
      f.vaccines['COVID vaccine'] = { selected: true, detail: 'เข็ม 3 · 2566' };
      f.vaccines['HBV vaccines'] = { selected: true, detail: 'กำลังฉีด เข็ม 2/4' };
      if (kind === 'donor') return { ...f, date: '2026-09-18', medicalProblems: 'ผู้บริจาคมีชีวิต · ไม่มีโรคประจำตัว · เคยสูบบุหรี่ เลิกแล้ว 5 ปี', requestOf: 'ผลตรวจสุขภาพประจำปีล่าสุด', requestFrom: 'รพ.พุทธชินราช' };
      return { ...f, date: '2025-06-26', medicalProblems: 'ESRD จาก hypertensive nephropathy · HD 3 ครั้ง/สัปดาห์ ตั้งแต่ มี.ค. 2567 · HT, Dyslipidemia', requestOf: 'ประวัติการผ่าตัดสร้าง AVF', requestFrom: 'รพ.พุทธชินราช' };
    }
    case 'mrb':
      return { date: '2025-12-20', result: 'pass', note: kind === 'donor' ? 'สุขภาพร่างกายและจิตใจแข็งแรง ผ่านเกณฑ์ทุกด้าน เหมาะสมเป็นผู้บริจาค' : 'ผลประเมินครบถ้วน เหมาะสมสำหรับการปลูกถ่ายไต' } satisfies MrbForm;
    case 'donorCounseling': {
      const f = base as DonorCounselingForm;
      DONOR_COUNSELING_TOPICS.forEach((t, c) => t.items.forEach((_, i) => (f.understood[`${c}-${i}`] = !isFemaleOnly(c, i) || sex === 'female')));
      return { ...f, date: '2026-09-12', counselor: 'พย.วิภา สุขใจ' };
    }
    case 'donorHistory': {
      const f = base as DonorHistoryForm;
      DONOR_DISEASES.forEach((d) => (f.diseases[d.name] = { has: 'ไม่มี', detail: '' }));
      f.habits['สูบบุหรี่'] = { has: 'มี', detail: 'เลิกแล้ว 5 ปี (เคยสูบ 10 มวน/วัน)' };
      f.habits['เหล้า/สุรา'] = { has: 'มี', detail: 'ดื่มเป็นครั้งคราว สัปดาห์ละ 1–2 ครั้ง' };
      f.habits['สารเสพติด'] = { has: 'ไม่มี', detail: '' };
      DONOR_FAMILY.forEach((d) => (f.family[d] = { has: 'ไม่มี', detail: '' }));
      f.family['เบาหวานในครอบครัว'] = { has: 'มี', detail: 'บิดา' };
      return { ...f, date: '2026-09-14', rhGroup: '+', chronic: 'ไม่มี', meds: 'ไม่มี', otherHistory: 'ผู้รับเป็นโรคไตเรื้อรัง' };
    }
  }
}

/** สรุปสถานะการติดตามของฟอร์ม 1.5 */
export function planSummary(f: PlanForm) {
  const items = [...Object.values(f.plan), ...Object.values(f.consults)].filter((i) => i.selected);
  return {
    total: items.length,
    pass: items.filter((i) => i.status === 'pass').length,
    fail: items.filter((i) => i.status === 'fail').length,
    waiting: items.filter((i) => i.status === 'sent' || i.status === 'waiting').length,
  };
}
