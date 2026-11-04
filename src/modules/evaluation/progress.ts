import type { PersonKind, PersonRef } from '@/types';
import type { FormKey } from './forms/data';

export interface FormListItem {
  key: FormKey;
  num: string;
  title: string;
}

/** รายการฟอร์มขั้นตอน “ก่อนผ่าตัด” ของแต่ละประเภท (Evaluation + MRB) */
export const FORM_LIST: Record<PersonKind, FormListItem[]> = {
  recipient: [
    { key: 'counseling', num: '1.1', title: 'รายการให้คำปรึกษา' },
    { key: 'currentTx', num: '1.2', title: 'ข้อมูลการรักษาปัจจุบัน' },
    { key: 'history', num: '1.3', title: 'ซักประวัติโดยแพทย์' },
    { key: 'physical', num: '1.4', title: 'ตรวจร่างกายโดยแพทย์' },
    { key: 'plan', num: '1.5', title: 'รายการรอส่งตรวจเพิ่มเติม' },
    { key: 'mrb', num: '2', title: 'รอ MRB' },
  ],
  donor: [
    { key: 'donorCounseling', num: '1.1', title: 'รายการให้คำปรึกษาผู้บริจาค' },
    { key: 'donorHistory', num: '1.2', title: 'ซักประวัติโดยแพทย์' },
    { key: 'physical', num: '1.3', title: 'ตรวจร่างกายโดยแพทย์' },
    { key: 'plan', num: '1.4', title: 'รายการส่งตรวจเพิ่มเติม' },
    { key: 'mrb', num: '2', title: 'รอ MRB' },
  ],
};

/** ฟอร์มที่ “เสร็จแล้ว” ตามสถานะจาก backend (เดโม: คำนวณจากสถานะ + ความคืบหน้า Evaluation) */
export function baseDone(p: PersonRef, kind: PersonKind, key: FormKey): boolean {
  const evalForms = FORM_LIST[kind].filter((f) => f.key !== 'mrb');
  if (key === 'mrb') return !['evaluation', 'passed', 'mrb'].includes(p.status);
  const n = evalForms.length;
  const doneCount = p.status !== 'evaluation' ? n : Math.floor(((p.evaluation?.done ?? 0) / (p.evaluation?.total ?? 11)) * n);
  return evalForms.findIndex((f) => f.key === key) < doneCount;
}
