import type { CaseType, RecipientStatus, StageKey } from '@/types';

export interface Tone {
  fg: string;
  bg: string;
  dot: string;
}

export const STATUS_META: Record<RecipientStatus, { label: string; tone: Tone; stage: StageKey }> = {
  evaluation: { label: 'Evaluation', stage: 'preop', tone: { fg: '#b91c1c', bg: '#fee2e2', dot: '#dc2626' } },
  passed: { label: 'ตรวจผ่าน', stage: 'preop', tone: { fg: '#15803d', bg: '#dcfce7', dot: '#16a34a' } },
  mrb: { label: 'รอ MRB', stage: 'preop', tone: { fg: '#854d0e', bg: '#fef9c3', dot: '#eab308' } },
  waitingRedCross: { label: 'รอไตจากสภากาชาด', stage: 'preop', tone: { fg: '#6d28d9', bg: '#ede9fe', dot: '#7c3aed' } },
  matching: { label: 'กำลังจับคู่ (สภากาชาด)', stage: 'preop', tone: { fg: '#c2410c', bg: '#ffedd5', dot: '#f97316' } },
  waitingSurgery: { label: 'รอผ่าตัด', stage: 'preop', tone: { fg: '#ffffff', bg: '#0f172a', dot: '#ffffff' } },
  postop: { label: 'ผ่าตัดแล้ว', stage: 'surgery', tone: { fg: '#0369a1', bg: '#e0f2fe', dot: '#0284c7' } },
  discharge: { label: 'ก่อนกลับบ้าน', stage: 'discharge', tone: { fg: '#0f766e', bg: '#ccfbf1', dot: '#14b8a6' } },
  opd: { label: 'ติดตาม OPD', stage: 'opd', tone: { fg: '#1d4ed8', bg: '#dbeafe', dot: '#2563eb' } },
};

export const CASE_META: Record<CaseType, { label: string; tone: Tone }> = {
  living: { label: 'มีคู่แล้ว', tone: { fg: '#0f766e', bg: '#ccfbf1', dot: '#14b8a6' } },
  redcross: { label: 'สภากาชาด', tone: { fg: '#6d28d9', bg: '#ede9fe', dot: '#7c3aed' } },
};

export const STAGES: { key: StageKey; label: string }[] = [
  { key: 'register', label: 'ลงทะเบียน' },
  { key: 'preop', label: 'ก่อนผ่าตัด' },
  { key: 'surgery', label: 'ผ่าตัด' },
  { key: 'discharge', label: 'ก่อนกลับบ้าน' },
  { key: 'opd', label: 'ติดตาม OPD' },
];

/** 4 คอลัมน์ของ Waiting Status Pipeline */
export const PIPELINE: {
  status: RecipientStatus;
  title: string;
  subtitle: string;
  head: string;
  headText: string;
  accent: string;
  tint: string;
  edge: string;
}[] = [
  { status: 'evaluation', title: 'Evaluation', subtitle: 'ตรวจประเมิน (Work-up)', head: '#dc2626', headText: '#ffffff', accent: '#dc2626', tint: '#fef2f2', edge: '#fca5a5' },
  { status: 'passed', title: 'ตรวจผ่าน', subtitle: 'ผลตรวจผ่านเกณฑ์', head: '#16a34a', headText: '#ffffff', accent: '#16a34a', tint: '#f0fdf4', edge: '#86efac' },
  { status: 'mrb', title: 'รอ MRB', subtitle: 'อยู่ระหว่างรอ MRB', head: '#facc15', headText: '#422006', accent: '#eab308', tint: '#fefce8', edge: '#fde047' },
  { status: 'waitingSurgery', title: 'รอผ่าตัด', subtitle: 'มีกำหนดวันผ่าตัดแล้ว', head: '#0f172a', headText: '#ffffff', accent: '#0f172a', tint: '#f8fafc', edge: '#94a3b8' },
];

export function stageOf(status: RecipientStatus): StageKey {
  return STATUS_META[status].stage;
}

export function stageIndex(key: StageKey): number {
  return STAGES.findIndex((s) => s.key === key);
}

/** ABO: ผู้บริจาค → ผู้รับ เข้ากันได้หรือไม่ */
export function aboCompatible(donor: string, recipient: string): boolean {
  if (donor === 'O') return true;
  if (recipient === 'AB') return true;
  return donor === recipient;
}
