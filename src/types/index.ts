// ===== DTO ที่ใช้ร่วมกับ ASP.NET Core Web API (ตั้งชื่อให้ตรงกับ C# record ฝั่ง backend) =====

export type CaseType = 'living' | 'redcross';
export type Sex = 'male' | 'female';
export type BloodGroup = 'A' | 'B' | 'O' | 'AB';

/** สถานะผู้รับ — เปลี่ยนอัตโนมัติตามขั้นตอนที่เสร็จ (backend เป็นผู้คำนวณ) */
export type RecipientStatus =
  | 'evaluation'
  | 'passed'
  | 'mrb'
  | 'waitingRedCross'
  | 'matching'
  | 'waitingSurgery'
  | 'postop'
  | 'discharge'
  | 'opd';

/** ขั้นตอนการรักษาหลัก 5 ขั้น */
export type StageKey = 'register' | 'preop' | 'surgery' | 'discharge' | 'opd';

export interface HlaTyping {
  A: [string, string];
  B: [string, string];
  DR: [string, string];
  DQ?: [string, string];
}

export interface IntendedDonor {
  firstName: string;
  lastName: string;
  age?: number | '';
  relation: string;
  /** ลงทะเบียนเป็นผู้บริจาคในระบบแล้ว */
  donorId?: string;
}

export interface RecipientSummaryDto {
  id: string;
  hn: string;
  prefix: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  age: number;
  bloodGroup: BloodGroup;
  rh: '+' | '-';
  caseType: CaseType;
  status: RecipientStatus;
  statusSince: string;
  registeredAt: string;
  pra?: number;
  evaluation?: { done: number; total: number };
  matchedDonor?: { donorId?: string; name: string; relation: string };
  note?: string;
}

export interface RecipientDetailDto extends RecipientSummaryDto {
  phone: string;
  lineId?: string;
  nationalId: string;
  birthDate: string;
  address: string;
  rrt: 'HD' | 'PD' | 'none';
  rrtStart?: string;
  hla?: HlaTyping;
  redCrossQueueNo?: string;
  redCrossSince?: string;
  physician: string;
  intendedDonors: IntendedDonor[];
  stageDates: Partial<Record<StageKey, string>>;
}

export interface RecipientDashboardDto {
  total: number;
  living: number;
  redcross: number;
  waitingRedCross: number;
  mrb: number;
  waitingSurgery: number;
}

export interface RecipientQuery {
  search?: string;
  status?: RecipientStatus | 'all';
  caseType?: CaseType | 'all';
}

/** ฟอร์มลงทะเบียนผู้รับ (ตามแบบฟอร์มกระดาษ + LINE ID) */
export interface RecipientCreateDto {
  filledDate: string;
  prefix: string;
  bloodGroup: string;
  firstName: string;
  lastName: string;
  hn: string;
  nationalId: string;
  birthDate: string;
  ethnicity: string;
  nationality: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  occupationOther: string;
  income: string;
  expense: string;
  savings: string;
  coverage: string;
  address: string;
  phone1: string;
  phone2: string;
  lineId: string;
  siblings: string;
  children: string;
  relativeFirstName: string;
  relativeLastName: string;
  relativeAddress: string;
  relativeSameAddress: boolean;
  relativePhone1: string;
  relativePhone2: string;
  hasIntendedDonor: string; // 'yes' | 'no' | ''
  intendedDonors: IntendedDonor[];
  rrt: string; // 'HD' | 'PD' | 'none' | ''
  rrtStart: string;
  prevTransplant: string; // 'yes' | 'no'
  prevTransplantDate: string;
  prevTransplantHospital: string;
}

// ===== ข้อมูลร่วมของ “บุคคล” (ผู้รับ / ผู้บริจาค) ที่ใช้ในแถบขั้นตอนและฟอร์ม =====
export type PersonKind = 'recipient' | 'donor';

export interface PersonRef {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  hn: string;
  age: number;
  sex: Sex;
  bloodGroup: BloodGroup;
  rh: '+' | '-';
  caseType: CaseType;
  status: RecipientStatus;
  statusSince: string;
  registeredAt: string;
  evaluation?: { done: number; total: number };
  stageDates: Partial<Record<StageKey, string>>;
}

// ===== Module: Donor =====
export interface DonorRecipientRef {
  id?: string;
  name: string;
  hn?: string;
  bloodGroup?: BloodGroup;
  rh?: '+' | '-';
  status?: RecipientStatus;
}

export interface DonorSummaryDto {
  id: string;
  hn: string;
  prefix: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  age: number;
  bloodGroup: BloodGroup;
  rh: '+' | '-';
  /** living = ผู้บริจาคมีชีวิต (มีคู่แล้ว) · redcross = ไตจากสภากาชาด (บันทึกหลังผู้รับผ่าตัด) */
  caseType: CaseType;
  status: RecipientStatus;
  statusSince: string;
  registeredAt: string;
  evaluation?: { done: number; total: number };
  /** ความสัมพันธ์ของผู้บริจาคกับผู้รับ เช่น พี่ชาย */
  relation: string;
  recipient: DonorRecipientRef;
  note?: string;
  /** เฉพาะสภากาชาด */
  redCrossCode?: string;
  sourceHospital?: string;
  recipientSurgeryDate?: string;
}

export interface DonorDetailDto extends DonorSummaryDto {
  phone: string;
  lineId?: string;
  nationalId: string;
  birthDate: string;
  address: string;
  physician: string;
  stageDates: Partial<Record<StageKey, string>>;
}

export interface DonorDashboardDto {
  total: number;
  living: number;
  redcross: number;
  mrb: number;
  waitingSurgery: number;
}

export interface DonorQuery {
  search?: string;
  status?: RecipientStatus | 'all';
  caseType?: CaseType | 'all';
}

/** ฟอร์มลงทะเบียนผู้บริจาค (ตามแบบฟอร์ม Donor Registration) */
export interface DonorCreateDto {
  filledDate: string;
  recipientId: string;
  relation: string;
  prefix: string;
  bloodGroup: string;
  firstName: string;
  lastName: string;
  hn: string;
  nationalId: string;
  birthDate: string;
  ethnicity: string;
  nationality: string;
  maritalStatus: string;
  education: string;
  occupation: string;
  occupationOther: string;
  income: string;
  expense: string;
  savings: string;
  coverage: string;
  address: string;
  sameAddressAsRecipient: boolean;
  phone1: string;
  phone2: string;
  lineId: string;
  siblings: string;
  children: string;
  relativeFirstName: string;
  relativeLastName: string;
  relativePhone1: string;
  relativePhone2: string;
}

// ===== Module: Matching (จับคู่ผู้บริจาค) =====
/** ค่าที่สภากาชาดแจ้ง — ใช้ค้นหาเท่านั้น ไม่บันทึก */
export interface HlaQuery {
  abo: BloodGroup | '';
  A: [string, string];
  B: [string, string];
  DR: [string, string];
  DQ?: [string, string];
}

export interface MatchCandidateDto {
  recipientId: string;
  name: string;
  hn: string;
  age: number;
  sex: Sex;
  bloodGroup: BloodGroup;
  rh: '+' | '-';
  aboIdentical: boolean;
  hla: HlaTyping;
  mismatch: { A: number; B: number; DR: number; DQ?: number; total: number };
  pra?: number;
  waitingSince?: string;
  nationalId: string;
}

export type MatchResult = 'received' | 'notReceived' | 'rejected';

export interface MatchingInProgressDto {
  recipientId: string;
  name: string;
  hn: string;
  age: number;
  sex: Sex;
  bloodGroup: BloodGroup;
  rh: '+' | '-';
  pra?: number;
  waitingSince?: string;
  startedAt: string;
  confirmedBy: string;
}

export interface MatchHistoryDto {
  id: string;
  recipientId: string;
  name: string;
  hn: string;
  startedAt: string;
  result: MatchResult;
  reason: string;
  confirmedBy: string;
  recordedBy: string;
}

export interface SendCandidateDto {
  recipientId: string;
  name: string;
  hn: string;
  nationalId: string;
  bloodGroup: BloodGroup;
  rh: '+' | '-';
  hla?: HlaTyping;
  pra?: number;
  mrbPassedAt: string;
  phone: string;
  isNew: boolean;
  matching: boolean;
}

export interface SendRoundDto {
  id: string;
  sentAt: string;
  sentBy: string;
  count: number;
  format: 'Excel' | 'PDF';
  recipientIds: string[];
}

export type ChecklistDecision = '' | 'pass' | 'fail';
export interface ChecklistItemDto {
  key: string;
  label: string;
  group?: 'Consult' | 'Vaccine';
  /** ข้อมูลจาก iMed */
  date?: string;
  comment?: string;
  /** ไม่เกี่ยวข้อง (ตามเพศ) */
  na?: boolean;
  decision: ChecklistDecision;
  note?: string;
}

export interface PairChecklistDto {
  pairId: string;
  recipient: { id: string; name: string; hn: string; sex: Sex; age: number; bloodGroup: BloodGroup; rh: '+' | '-' };
  donor: { id: string; name: string; hn: string; sex: Sex; age: number; bloodGroup: BloodGroup; rh: '+' | '-'; relation: string };
  recipientItems: ChecklistItemDto[];
  donorItems: ChecklistItemDto[];
  syncedAt: string;
}

export interface MatchingDashboardDto {
  waitingRedCross: number;
  inProgress: number;
  livingPairs: number;
  receivedThisMonth: number;
  rejectedThisMonth: number;
  lastSent?: SendRoundDto;
  newSinceLastSent: number;
}

// ===== Module: Appointments (นัดหมาย) =====
export type ResultStatus = 'ok' | 'wait' | 'none';
export interface AppointmentDto {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  personKind: PersonKind;
  personId: string;
  name: string;
  hn: string;
  stage: string;
  type: string;
  room: string;
  doctor: string;
  resultStatus: ResultStatus;
  /** imed = ดึงจาก iMed (แก้ไม่ได้) · manual = สร้างในระบบ */
  source: 'imed' | 'manual';
  note?: string;
}
export interface AppointmentCreateDto {
  personKind: PersonKind;
  personId: string;
  date: string;
  time: string;
  type: string;
  room: string;
  doctor: string;
  note: string;
  notifyLine: boolean;
}

// ===== ผลตรวจ Lab (จาก iMed) =====
export interface LabItemDto {
  group: string;
  name: string;
  value: string;
  unit: string;
  ref: string;
  flag?: 'H' | 'L';
  previous?: string;
  trend: number[];
}
export interface LabResultDto {
  reportedAt: string;
  dates: string[];
  items: LabItemDto[];
  pending: { name: string; sentAt: string }[];
}
