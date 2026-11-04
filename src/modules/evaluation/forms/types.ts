import type { PersonKind, PersonRef } from '@/types';
import type { FormKey } from './data';

export interface FormProps {
  rec: PersonRef;
  kind: PersonKind;
  done: boolean;
  onSaved: (key: FormKey, completed: boolean) => void;
  /** เปิดฟอร์มในโหมด Preview ทันที (เช่น จากแท็บรายงานฟอร์ม) */
  initialMode?: 'edit' | 'preview';
}

export const KIND_LABEL: Record<PersonKind, string> = { recipient: 'ผู้รับ', donor: 'ผู้บริจาค' };
