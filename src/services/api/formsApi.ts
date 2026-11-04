import { emptyForm, sampleForm, type AnyForm, type FormKey } from '@/modules/evaluation/forms/data';
import type { PersonKind } from '@/types';
import { USE_MOCK, http, mockDelay } from './client';

export interface FormRecord<T = AnyForm> {
  data: T;
  /** true = บันทึกแล้ว (ไม่ใช่ร่าง) → นับว่าขั้นตอนย่อยเสร็จ */
  completed: boolean;
  savedAt?: string;
  savedBy?: string;
}

const store = new Map<string, FormRecord>();
const id = (rid: string, key: FormKey) => `${rid}:${key}`;

const base = (kind: PersonKind) => (kind === 'recipient' ? 'recipients' : 'donors');

/** module “Evaluation” ฝั่ง backend: /api/recipients/{id}/forms/{key} และ /api/donors/{id}/forms/{key} */
export const formsApi = {
  async get<T extends AnyForm>(kind: PersonKind, rid: string, key: FormKey, opts: { sex: 'male' | 'female'; done: boolean }): Promise<FormRecord<T>> {
    if (!USE_MOCK) return http(`/${base(kind)}/${rid}/forms/${key}`);
    const hit = store.get(id(rid, key));
    if (hit) return mockDelay(hit as FormRecord<T>, 200);
    // เดโม: ขั้นตอนที่เสร็จแล้วแสดงข้อมูลตัวอย่าง ที่ยังไม่ทำแสดงฟอร์มเปล่า
    const rec: FormRecord = opts.done
      ? { data: sampleForm(key, opts.sex, kind), completed: true, savedAt: '2025-06-24', savedBy: 'นพ.สมเกียรติ วงศ์ไทย' }
      : { data: emptyForm(key), completed: false };
    return mockDelay(rec as FormRecord<T>, 200);
  },

  async save<T extends AnyForm>(kind: PersonKind, rid: string, key: FormKey, data: T, draft: boolean): Promise<FormRecord<T>> {
    const body = { data, completed: !draft };
    if (!USE_MOCK) return http(`/${base(kind)}/${rid}/forms/${key}`, { method: 'PUT', body: JSON.stringify(body) });
    const rec: FormRecord<T> = { data, completed: !draft, savedAt: new Date().toISOString(), savedBy: 'นพ.สมเกียรติ วงศ์ไทย' };
    store.set(id(rid, key), rec);
    return mockDelay(rec, 400);
  },

  /** ขั้นตอนย่อยที่บันทึกเสร็จแล้วในเซสชันนี้ (ใช้ร่วมกับสถานะจาก backend) */
  completedKeys(rid: string): FormKey[] {
    return [...store.entries()].filter(([k, v]) => k.startsWith(`${rid}:`) && v.completed).map(([k]) => k.split(':')[1] as FormKey);
  },
};
