import type {
  ChecklistItemDto,
  HlaQuery,
  HlaTyping,
  MatchCandidateDto,
  MatchHistoryDto,
  MatchResult,
  MatchingDashboardDto,
  MatchingInProgressDto,
  PairChecklistDto,
  SendCandidateDto,
  SendRoundDto,
} from '@/types';
import { recipientsDb } from '@/mocks/recipients';
import { donorsDb } from '@/mocks/donors';
import { DONOR_CHECKLIST, RECIPIENT_CHECKLIST, buildChecklist, matchHistoryDb, matchingMeta, sendRoundsDb } from '@/mocks/matching';
import { aboCompatible } from '@/lib/status';
import { USE_MOCK, http, mockDelay } from './client';

const CURRENT_USER = 'พย.วิภา สุขใจ';
const name = (r: { prefix: string; firstName: string; lastName: string }) => `${r.prefix}${r.firstName} ${r.lastName}`;

/** จำนวน antigen ของผู้บริจาคที่ไม่มีในผู้รับ (ต่อ locus) */
function mm(donor: [string, string] | undefined, rec: [string, string] | undefined): number {
  if (!donor || !rec) return 0;
  const d = [...new Set(donor.map((x) => x.trim()).filter(Boolean))];
  return d.filter((a) => !rec.includes(a)).length;
}

const pairStore = new Map<string, PairChecklistDto>();

/** ภายใน 30 วันล่าสุด */
function inMonth(iso: string, ref = new Date()) {
  return ref.getTime() - new Date(iso).getTime() <= 30 * 86400_000;
}

function livingPairs(): PairChecklistDto[] {
  return donorsDb
    .filter((d) => d.caseType === 'living' && d.recipient.id && ['evaluation', 'passed', 'mrb'].includes(d.status))
    .map((d, i) => {
      const id = `${d.recipient.id}__${d.id}`;
      const hit = pairStore.get(id);
      if (hit) return hit;
      const r = recipientsDb.find((x) => x.id === d.recipient.id)!;
      const ready = d.status === 'evaluation' ? [15, 9, 18, 12, 14][i % 5] : 22;
      const pair: PairChecklistDto = {
        pairId: id,
        recipient: { id: r.id, name: name(r), hn: r.hn, sex: r.sex, age: r.age, bloodGroup: r.bloodGroup, rh: r.rh },
        donor: { id: d.id, name: name(d), hn: d.hn, sex: d.sex, age: d.age, bloodGroup: d.bloodGroup, rh: d.rh, relation: d.relation },
        recipientItems: buildChecklist(RECIPIENT_CHECKLIST, r.sex, ready, i),
        donorItems: buildChecklist(DONOR_CHECKLIST, d.sex, ready - 2, i + 3),
        syncedAt: new Date().toISOString(),
      };
      // ตัวอย่าง “ไม่ผ่าน” 1 ข้อในคู่แรก
      if (i === 0) {
        const dent = pair.recipientItems.find((x) => x.key === 'c-Dentist');
        if (dent) Object.assign(dent, { date: '2026-09-25', comment: 'ฟันผุ 2 ซี่', decision: 'fail', note: 'ให้ถอนฟันก่อน แล้วประเมินซ้ำ' });
      }
      pairStore.set(id, pair);
      return pair;
    });
}

export function checklistSummary(items: ChecklistItemDto[]) {
  const live = items.filter((x) => !x.na);
  return {
    total: live.length,
    pass: live.filter((x) => x.decision === 'pass').length,
    fail: live.filter((x) => x.decision === 'fail').length,
    waiting: live.filter((x) => !x.date).length,
  };
}

/** module “Matching” ฝั่ง backend: /api/matching */
export const matchingApi = {
  async dashboard(): Promise<MatchingDashboardDto> {
    if (!USE_MOCK) return http('/matching/dashboard');
    const last = sendRoundsDb[0];
    return mockDelay({
      waitingRedCross: recipientsDb.filter((r) => r.status === 'waitingRedCross').length,
      inProgress: recipientsDb.filter((r) => r.status === 'matching').length,
      livingPairs: livingPairs().length,
      receivedThisMonth: matchHistoryDb.filter((h) => h.result === 'received' && inMonth(h.startedAt)).length,
      rejectedThisMonth: matchHistoryDb.filter((h) => h.result !== 'received' && inMonth(h.startedAt)).length,
      lastSent: last,
      newSinceLastSent: recipientsDb.filter((r) => (r.status === 'waitingRedCross' || r.status === 'matching') && (!last || !last.recipientIds.includes(r.id))).length,
    });
  },

  /** ค้นหาผู้รับที่เข้าคู่ได้ — ค่า HLA ที่ส่งมาไม่ถูกบันทึก */
  async searchHla(q: HlaQuery): Promise<MatchCandidateDto[]> {
    if (!USE_MOCK) return http('/matching/search', { method: 'POST', body: JSON.stringify(q) });
    const rows = recipientsDb
      .filter((r) => r.status === 'waitingRedCross' && r.hla && (!q.abo || aboCompatible(q.abo, r.bloodGroup)))
      .map((r) => {
        const h = r.hla as HlaTyping;
        const m = { A: mm(q.A, h.A), B: mm(q.B, h.B), DR: mm(q.DR, h.DR), DQ: q.DQ && h.DQ ? mm(q.DQ, h.DQ) : undefined };
        return {
          recipientId: r.id,
          name: name(r),
          hn: r.hn,
          age: r.age,
          sex: r.sex,
          bloodGroup: r.bloodGroup,
          rh: r.rh,
          aboIdentical: !q.abo || q.abo === r.bloodGroup,
          hla: h,
          mismatch: { ...m, total: m.A + m.B + m.DR + (m.DQ ?? 0) },
          pra: r.pra,
          waitingSince: r.redCrossSince ?? r.registeredAt,
          nationalId: r.nationalId,
        };
      })
      .sort((a, b) => a.mismatch.total - b.mismatch.total || (b.pra ?? 0) - (a.pra ?? 0));
    return mockDelay(rows, 500);
  },

  async startMatching(recipientId: string): Promise<void> {
    if (!USE_MOCK) return http(`/matching/${recipientId}/start`, { method: 'POST' });
    const r = recipientsDb.find((x) => x.id === recipientId);
    if (r) {
      r.status = 'matching';
      r.statusSince = new Date().toISOString().slice(0, 10);
      matchingMeta[recipientId] = { startedAt: new Date().toISOString(), confirmedBy: CURRENT_USER };
    }
    return mockDelay(undefined, 500);
  },

  async inProgress(): Promise<MatchingInProgressDto[]> {
    if (!USE_MOCK) return http('/matching/in-progress');
    return mockDelay(
      recipientsDb
        .filter((r) => r.status === 'matching')
        .map((r) => ({
          recipientId: r.id,
          name: name(r),
          hn: r.hn,
          age: r.age,
          sex: r.sex,
          bloodGroup: r.bloodGroup,
          rh: r.rh,
          pra: r.pra,
          waitingSince: r.redCrossSince,
          startedAt: matchingMeta[r.id]?.startedAt ?? `${r.statusSince}T09:00:00`,
          confirmedBy: matchingMeta[r.id]?.confirmedBy ?? '—',
        }))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    );
  },

  /** บันทึกผลที่สภากาชาดแจ้งกลับ (นอกระบบ) */
  async recordResult(recipientId: string, result: MatchResult, reason: string): Promise<void> {
    if (!USE_MOCK) return http(`/matching/${recipientId}/result`, { method: 'POST', body: JSON.stringify({ result, reason }) });
    const r = recipientsDb.find((x) => x.id === recipientId);
    if (!r) return;
    const meta = matchingMeta[recipientId];
    matchHistoryDb.unshift({
      id: `h${Date.now()}`,
      recipientId,
      name: name(r),
      hn: r.hn,
      startedAt: meta?.startedAt ?? new Date().toISOString(),
      result,
      reason,
      confirmedBy: meta?.confirmedBy ?? '—',
      recordedBy: CURRENT_USER,
    });
    r.status = result === 'received' ? 'waitingSurgery' : 'waitingRedCross';
    r.statusSince = new Date().toISOString().slice(0, 10);
    delete matchingMeta[recipientId];
    return mockDelay(undefined, 500);
  },

  async history(): Promise<MatchHistoryDto[]> {
    if (!USE_MOCK) return http('/matching/history');
    return mockDelay([...matchHistoryDb]);
  },

  async sendCandidates(): Promise<SendCandidateDto[]> {
    if (!USE_MOCK) return http('/matching/send-list');
    const last = sendRoundsDb[0];
    return mockDelay(
      recipientsDb
        .filter((r) => r.status === 'waitingRedCross' || r.status === 'matching')
        .map((r) => ({
          recipientId: r.id,
          name: name(r),
          hn: r.hn,
          nationalId: r.nationalId,
          bloodGroup: r.bloodGroup,
          rh: r.rh,
          hla: r.hla,
          pra: r.pra,
          mrbPassedAt: r.statusSince,
          phone: r.phone,
          isNew: !last || !last.recipientIds.includes(r.id),
          matching: r.status === 'matching',
        })),
    );
  },

  async sendRounds(): Promise<SendRoundDto[]> {
    if (!USE_MOCK) return http('/matching/send-rounds');
    return mockDelay([...sendRoundsDb]);
  },

  async markSent(recipientIds: string[], format: 'Excel' | 'PDF'): Promise<SendRoundDto> {
    if (!USE_MOCK) return http('/matching/send-rounds', { method: 'POST', body: JSON.stringify({ recipientIds, format }) });
    const round: SendRoundDto = { id: `s${Date.now()}`, sentAt: new Date().toISOString().slice(0, 10), sentBy: CURRENT_USER, count: recipientIds.length, format, recipientIds };
    sendRoundsDb.unshift(round);
    return mockDelay(round, 400);
  },

  async pairs(): Promise<PairChecklistDto[]> {
    if (!USE_MOCK) return http('/matching/pairs');
    return mockDelay(livingPairs());
  },

  async savePair(pair: PairChecklistDto): Promise<void> {
    if (!USE_MOCK) return http(`/matching/pairs/${pair.pairId}`, { method: 'PUT', body: JSON.stringify(pair) });
    pairStore.set(pair.pairId, structuredClone(pair));
    return mockDelay(undefined, 400);
  },
};
