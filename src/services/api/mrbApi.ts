import type { MrbCaseDto, MrbParty, MrbPartySummary, MrbRow, MrbSummaryDto, PersonKind } from '@/types';
import { recipientsDb } from '@/mocks/recipients';
import { donorsDb } from '@/mocks/donors';
import {
  DONOR_CONSULTS, DONOR_IMAGING, DONOR_LABS, DONOR_SCORING, DONOR_VACCINES,
  RECIPIENT_CONSULTS, RECIPIENT_IMAGING, RECIPIENT_LABS, RECIPIENT_VACCINES, REG_EXTRA,
} from '@/mocks/mrb';
import { bmi, bsa, emptyForm, sampleForm, type AnyForm, type CurrentTxForm, type FormKey, type HistoryForm, type PhysicalForm } from '@/modules/evaluation/forms/data';
import { thaiDate } from '@/lib/format';
import { formsApi, type FormRecord } from './formsApi';
import { USE_MOCK, http, mockDelay } from './client';

/**
 * module “MRB” ฝั่ง backend — เคส MRB ร่วม 1 เคสต่อคู่ผู้รับ–ผู้บริจาค
 * - GET  /api/mrb-cases/by-person/{kind}/{id}      → MrbCaseDto (เคสล่าสุดของบุคคลนี้)
 * - GET  /api/mrb-cases/{caseId}/summary           → MrbSummaryDto (สรุปก่อนเข้า MRB)
 * - GET/PUT /api/mrb-cases/{caseId}/forms/{key}    → ฟอร์ม 2.1 (preMrb) / 2.2 (mrb)
 * เปิดจากหน้าผู้รับหรือผู้บริจาคก็ได้ข้อมูลชุดเดียวกัน
 */

type Row = (typeof recipientsDb)[number];
type DRow = (typeof donorsDb)[number];

const party = (p: Row | DRow, kind: PersonKind): MrbParty => ({
  id: p.id, kind, prefix: p.prefix, firstName: p.firstName, lastName: p.lastName, hn: p.hn, age: p.age, sex: p.sex, bloodGroup: p.bloodGroup, rh: p.rh,
  relation: kind === 'donor' ? (p as DRow).relation : undefined,
});

/** หาเคส (เดโม: จับคู่จาก donorsDb.recipient.id / recipient.matchedDonor) */
function findCase(kind: PersonKind, id: string): MrbCaseDto | null {
  let r: Row | undefined;
  let d: DRow | undefined;
  if (kind === 'recipient') {
    r = recipientsDb.find((x) => x.id === id);
    if (!r) return null;
    d = donorsDb.find((x) => x.caseType === 'living' && x.recipient.id === r!.id) ?? (r.matchedDonor?.donorId ? donorsDb.find((x) => x.id === r!.matchedDonor!.donorId) : undefined);
  } else {
    d = donorsDb.find((x) => x.id === id);
    if (!d) return null;
    r = d.recipient.id ? recipientsDb.find((x) => x.id === d!.recipient.id) : undefined;
  }
  // ผู้บริจาคที่ยังไม่ผูกผู้รับในระบบ → เคสยึดผู้บริจาค (ผู้รับเป็นชื่อจากการลงทะเบียน)
  if (!r && d) {
    const [prefix = '', ...rest] = (d.recipient.name ?? '—').split(/(?<=^(?:นาย|นางสาว|นาง))/);
    const [firstName = '—', lastName = ''] = rest.join('').split(' ');
    return {
      id: `mrb-${d.id}`, no: 1, historyCount: 1, donor: party(d, 'donor'),
      recipient: { id: '', kind: 'recipient', prefix, firstName, lastName, hn: d.recipient.hn ?? '—', age: 0, sex: 'male', bloodGroup: d.recipient.bloodGroup ?? d.bloodGroup, rh: '+' },
    };
  }
  return { id: `mrb-${r!.id}`, no: 1, historyCount: 1, recipient: party(r!, 'recipient'), donor: d ? party(d, 'donor') : undefined };
}

const store = new Map<string, FormRecord>();
const caseOfPerson = new Map<string, string>();

function fmtDate(iso?: string) {
  return iso ? thaiDate(iso) : '';
}

async function formOf<T extends AnyForm>(kind: PersonKind, p: Row | DRow, key: FormKey): Promise<T> {
  // ฟอร์มที่บันทึกในเซสชันนี้มาก่อน · ไม่งั้นใช้ข้อมูลตัวอย่าง (ขั้นตอนประเมินผ่านแล้วจึงเปิด MRB ได้)
  const r = await formsApi.get<T>(kind, p.id, key, { sex: p.sex, done: true });
  return r.data;
}

async function summaryOf(kind: PersonKind, p: Row | DRow): Promise<MrbPartySummary> {
  const ex = REG_EXTRA[kind];
  const pe = await formOf<PhysicalForm>(kind, p, 'physical');
  const sys = (k: string) => {
    const s = pe.systems[k];
    return !s?.result ? '' : s.result === 'normal' ? 'normal' : s.note || 'abnormal';
  };
  const base: MrbPartySummary = {
    party: party(p, kind),
    regDate: p.registeredAt,
    general: { nationalId: p.nationalId, birthDate: p.birthDate, address: p.address, phone: p.phone, ...ex },
    history: [],
    meds: [],
    pe: {
      bw: pe.weight, ht: pe.height, bmi: bmi(pe.weight, pe.height), bsa: bsa(pe.weight, pe.height), bp: pe.bp, pr: pe.pulse,
      heent: sys('HEENT'), chest: sys('Chest examination'), heart: sys('Cardiac and peripheral pulses examination'), abdomen: sys('Abdominal examination'), extremities: sys('Extremities'),
    },
    labs: structuredClone(kind === 'recipient' ? RECIPIENT_LABS : DONOR_LABS),
    imaging: kind === 'recipient' ? RECIPIENT_IMAGING : DONOR_IMAGING,
    consults: kind === 'recipient' ? RECIPIENT_CONSULTS : DONOR_CONSULTS,
    vaccines: kind === 'recipient' ? RECIPIENT_VACCINES : DONOR_VACCINES,
  };
  const bg = base.labs[0].rows.find((x) => x[0] === 'Blood group');
  if (bg) bg[1] = `${p.bloodGroup} Rh${p.rh}`;

  if (kind === 'recipient') {
    const h = await formOf<HistoryForm>(kind, p, 'history');
    const tx = await formOf<CurrentTxForm>(kind, p, 'currentTx');
    const comorb = Object.entries(h.conditions).filter(([, v]) => v.has).map(([k, v]) => (v.detail ? `${k} (${v.detail})` : k));
    base.history = [
      ['Cause of ESKD', [...h.causes, h.otherCause].filter(Boolean).join(', ')],
      ['Kidney biopsy', 'ไม่ได้ทำ'],
      ['Comorbidity', comorb.join(', ')],
    ];
    base.sensitization = [
      ['previous organ transplant', h.causes.includes('Allograft dysfunction') ? 'มี' : 'ไม่มี'],
      ['previous blood transfusion', tx.transfusionDate ? `มี (${fmtDate(tx.transfusionDate)}${tx.transfusionAmount ? `, ${tx.transfusionAmount}` : ''})` : 'ไม่มี'],
      ['pregnancy', p.sex === 'female' ? tx.pregnancy || 'ไม่มี' : 'N/A'],
      ['PRA', (p as Row).pra !== undefined ? `${(p as Row).pra}%` : ''],
    ];
    base.meds = h.meds.map((m) => [m.name, m.dose, m.how].filter(Boolean).join(' '));
    base.rrt = {
      prior: h.causes.includes('Allograft dysfunction') ? 'มี' : 'ไม่มี',
      hd: tx.mode ? `${tx.mode}${tx.frequency ? ` · ${tx.frequency}` : ''}` : '',
      since: fmtDate(tx.initiation),
      access: tx.accessType ? `${tx.accessType}${tx.vessel ? ` ${tx.vessel}` : ''}${tx.side ? ` (${tx.side})` : ''}${tx.accessDate ? ` · ${fmtDate(tx.accessDate)}` : ''}` : '',
      rrf: tx.residual,
    };
  } else {
    const dh = await formOf<AnyForm & { diseases: Record<string, { has: string; detail: string }>; meds: string; chronic: string }>(kind, p, 'donorHistory');
    const dis = Object.entries(dh.diseases).filter(([, v]) => v.has === 'มี').map(([k, v]) => (v.detail ? `${k} (${v.detail})` : k));
    base.history = [
      ['Underlying disease', dh.chronic === 'มี' ? dis.join(', ') : 'ไม่มี'],
      ['Comorbidity', dis.length ? dis.join(', ') : 'ไม่มี'],
    ];
    base.meds = dh.meds && dh.meds !== 'ไม่มี' ? dh.meds.split(/\n|,/).map((s) => s.trim()).filter(Boolean) : ['ไม่มี'];
    base.scoring = DONOR_SCORING;
  }
  return base;
}

export const mrbApi = {
  async caseFor(kind: PersonKind, id: string): Promise<MrbCaseDto | null> {
    if (!USE_MOCK) return http(`/mrb-cases/by-person/${kind}/${id}`);
    const c = findCase(kind, id);
    if (c) {
      caseOfPerson.set(c.recipient.id, c.id);
      if (c.donor) caseOfPerson.set(c.donor.id, c.id);
    }
    return mockDelay(c, 150);
  },

  async summary(c: MrbCaseDto): Promise<MrbSummaryDto> {
    if (!USE_MOCK) return http(`/mrb-cases/${c.id}/summary`);
    const r = recipientsDb.find((x) => x.id === c.recipient.id);
    const d = c.donor ? donorsDb.find((x) => x.id === c.donor!.id) : undefined;
    const out: MrbSummaryDto = { recipient: r ? await summaryOf('recipient', r) : await summaryOf('donor', d!) };
    if (!r && d) out.recipient = { ...out.recipient, party: c.recipient };
    if (d) out.donor = await summaryOf('donor', d);
    // ความสัมพันธ์ของผู้รับกับ donor = ความสัมพันธ์ที่ผู้บริจาคระบุ
    if (d && r) out.recipient.party = { ...out.recipient.party, relation: d.relation };
    return mockDelay(out, 250);
  },

  async getForm<T extends AnyForm>(caseId: string, key: FormKey, done: boolean): Promise<FormRecord<T>> {
    if (!USE_MOCK) return http(`/mrb-cases/${caseId}/forms/${key}`);
    const hit = store.get(`${caseId}:${key}`);
    if (hit) return mockDelay(hit as FormRecord<T>, 200);
    const rec: FormRecord = done ? { data: sampleForm(key, 'male'), completed: true, savedAt: '2025-12-20', savedBy: 'นพ.สมเกียรติ วงศ์ไทย' } : { data: emptyForm(key), completed: false };
    return mockDelay(rec as FormRecord<T>, 200);
  },

  async saveForm<T extends AnyForm>(caseId: string, key: FormKey, data: T, draft: boolean): Promise<FormRecord<T>> {
    if (!USE_MOCK) return http(`/mrb-cases/${caseId}/forms/${key}`, { method: 'PUT', body: JSON.stringify({ data, completed: !draft }) });
    const rec: FormRecord<T> = { data, completed: !draft, savedAt: new Date().toISOString(), savedBy: 'นพ.สมเกียรติ วงศ์ไทย' };
    store.set(`${caseId}:${key}`, rec);
    return mockDelay(rec, 400);
  },

  /** ฟอร์ม MRB ที่บันทึกเสร็จแล้วในเซสชันนี้ — ใช้ได้ทั้งจาก id ผู้รับและผู้บริจาค */
  completedKeys(personId: string): FormKey[] {
    const cid = caseOfPerson.get(personId) ?? `mrb-${personId}`;
    return [...store.entries()].filter(([k, v]) => k.startsWith(`${cid}:`) && v.completed).map(([k]) => k.split(':')[1] as FormKey);
  },
};

/** โหลดฟอร์มของบุคคล — ฟอร์ม 2.1/2.2 มาจากเคส MRB ร่วม ส่วนอื่นมาจากฟอร์มของบุคคล */
export async function personFormRecord<T extends AnyForm>(kind: PersonKind, p: { id: string; sex: 'male' | 'female' }, key: FormKey, done: boolean): Promise<FormRecord<T>> {
  if (key === 'preMrb' || key === 'mrb') {
    const c = await mrbApi.caseFor(kind, p.id);
    if (c) return mrbApi.getForm<T>(c.id, key, done);
  }
  return formsApi.get<T>(kind, p.id, key, { sex: p.sex, done });
}

/** ใช้ในหน้าจอ: ค่าว่าง = รอผลตรวจ */
export const isPending = (r: MrbRow) => !r[1];
