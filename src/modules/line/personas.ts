import type { PersonKind } from '@/types';

export type PersonaKey = 'guest' | 'r-pre' | 'r-post' | 'd-post';
export interface Persona {
  key: PersonaKey;
  kind: PersonKind;
  id: string;
  nationalId: string;
  prefix: string;
  name: string;
  ini: string;
  hn: string;
  age: number;
  blood: string;
  phone: string;
  stage: string;
  postop: boolean;
  matched?: string;
}

/** ผู้ใช้ตัวอย่างในเดโม (ข้อมูลไม่จริง) — เลขบัตรใช้ทดลองลงทะเบียน */
export const PERSONAS: Record<Exclude<PersonaKey, 'guest'>, Persona> = {
  'r-pre': { key: 'r-pre', kind: 'recipient', id: 'r-990213', nationalId: '1659900123451', prefix: 'นาย', name: 'มงคล ศักดิ์สิทธิ์', ini: 'มศ', hn: '990213', age: 29, blood: 'A+', phone: '08x-xxx-0213', stage: 'ตรวจประเมิน (Evaluation)', postop: false },
  'r-post': { key: 'r-post', kind: 'recipient', id: 'r-990260', nationalId: '1659900260002', prefix: 'นางสาว', name: 'วิไลวรรณ ศรีสุข', ini: 'วศ', hn: '990260', age: 36, blood: 'O+', phone: '08x-xxx-0260', stage: 'ติดตาม OPD', postop: true, matched: 'นายสมชาย ศรีสุข · พี่ชาย' },
  'd-post': { key: 'd-post', kind: 'donor', id: 'd-990290', nationalId: '3659900290003', prefix: 'นาย', name: 'สมชาย ศรีสุข', ini: 'สศ', hn: '990290', age: 45, blood: 'O+', phone: '08x-xxx-0290', stage: 'ติดตามหลังบริจาค', postop: true, matched: 'นางสาววิไลวรรณ ศรีสุข · น้องสาว' },
};

export const fullName = (p: Persona) => `${p.prefix}${p.name}`;
export const findByNationalId = (id: string) => Object.values(PERSONAS).find((p) => p.nationalId === id.replace(/\D/g, ''));
