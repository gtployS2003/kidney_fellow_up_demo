import type { BloodGroup, MatchResult, RecipientStatus } from '@/types';
import { recipientsDb } from '@/mocks/recipients';
import { donorsDb } from '@/mocks/donors';
import { matchHistoryDb } from '@/mocks/matching';
import { STATUS_META } from '@/lib/status';
import { USE_MOCK, http, mockDelay } from './client';

export type ReportKey = 'status' | 'surgery' | 'duration' | 'waiting' | 'matching' | 'pending' | 'outcome' | 'donorFollow';

export interface StatusReportDto {
  totals: { recipients: number; donors: number; newInRange: number; transplanted: number };
  byStatus: { status: RecipientStatus; label: string; recipients: number; donors: number; avgDays: number }[];
  monthly: { month: string; count: number }[];
}
export interface WaitingReportDto {
  total: number;
  byBlood: { group: BloodGroup; count: number }[];
  byPra: { bucket: string; count: number }[];
  rows: { name: string; hn: string; bloodGroup: string; pra?: number; since: string; days: number; status: string }[];
}
export interface MatchingReportDto {
  total: number;
  byResult: { result: MatchResult; count: number }[];
  reasons: { reason: string; count: number }[];
}

const days = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
const TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

/** module “Reports” ฝั่ง backend: /api/reports/{key} — ทุกรายงาน “รอยืนยัน” เนื้อหากับหน้างาน */
export const reportApi = {
  async status(months = 10): Promise<StatusReportDto> {
    if (!USE_MOCK) return http(`/reports/status?months=${months}`);
    const from = new Date();
    from.setMonth(from.getMonth() - months + 1, 1);
    const statuses: RecipientStatus[] = ['evaluation', 'passed', 'mrb', 'waitingRedCross', 'matching', 'waitingSurgery', 'opd'];
    const byStatus = statuses.map((s) => {
      const rs = recipientsDb.filter((r) => r.status === s);
      const ds = donorsDb.filter((d) => d.caseType === 'living' && d.status === s);
      const all = [...rs, ...ds];
      return { status: s, label: STATUS_META[s].label, recipients: rs.length, donors: ds.length, avgDays: all.length ? Math.round(all.reduce((t, x) => t + days(x.statusSince), 0) / all.length) : 0 };
    });
    const monthly = Array.from({ length: months }).map((_, i) => {
      const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
      const count = recipientsDb.filter((r) => {
        const x = new Date(r.registeredAt);
        return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth();
      }).length;
      return { month: `${TH_M[d.getMonth()]} ${String(d.getFullYear() + 543).slice(2)}`, count };
    });
    return mockDelay({
      totals: {
        recipients: recipientsDb.length,
        donors: donorsDb.filter((d) => d.caseType === 'living').length,
        newInRange: recipientsDb.filter((r) => new Date(r.registeredAt) >= from).length,
        transplanted: recipientsDb.filter((r) => ['postop', 'discharge', 'opd'].includes(r.status)).length,
      },
      byStatus,
      monthly,
    });
  },

  async waiting(): Promise<WaitingReportDto> {
    if (!USE_MOCK) return http('/reports/waiting');
    const rows = recipientsDb
      .filter((r) => r.status === 'waitingRedCross' || r.status === 'matching')
      .map((r) => ({ name: `${r.prefix}${r.firstName} ${r.lastName}`, hn: r.hn, bloodGroup: `${r.bloodGroup}${r.rh}`, pra: r.pra, since: r.redCrossSince ?? r.registeredAt, days: days(r.redCrossSince ?? r.registeredAt), status: STATUS_META[r.status].label }))
      .sort((a, b) => b.days - a.days);
    const groups: BloodGroup[] = ['A', 'B', 'O', 'AB'];
    const pra = (lo: number, hi: number) => rows.filter((r) => (r.pra ?? 0) >= lo && (r.pra ?? 0) <= hi).length;
    return mockDelay({
      total: rows.length,
      byBlood: groups.map((g) => ({ group: g, count: rows.filter((r) => r.bloodGroup.startsWith(g) && (g !== 'A' || !r.bloodGroup.startsWith('AB'))).length })),
      byPra: [
        { bucket: '0–10%', count: pra(0, 10) },
        { bucket: '11–30%', count: pra(11, 30) },
        { bucket: '31–80%', count: pra(31, 80) },
        { bucket: '> 80%', count: pra(81, 100) },
      ],
      rows,
    });
  },

  async matching(): Promise<MatchingReportDto> {
    if (!USE_MOCK) return http('/reports/matching');
    const results: MatchResult[] = ['received', 'notReceived', 'rejected'];
    const reasons = new Map<string, number>();
    matchHistoryDb.filter((h) => h.result === 'rejected').forEach((h) => {
      const k = h.reason.split(' — ')[0];
      reasons.set(k, (reasons.get(k) ?? 0) + 1);
    });
    return mockDelay({
      total: matchHistoryDb.length,
      byResult: results.map((r) => ({ result: r, count: matchHistoryDb.filter((h) => h.result === r).length })),
      reasons: [...reasons.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
    });
  },
};
