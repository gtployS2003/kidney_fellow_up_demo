import type { LineDataDto, NotifySettingsDto, PersonKind } from '@/types';
import { lineDataFor, saveSettings, settingsFor } from '@/mocks/line';
import { USE_MOCK, http, mockDelay } from './client';

const base = (kind: PersonKind) => (kind === 'recipient' ? 'recipients' : 'donors');

/** ข้อมูลจาก LINE OA: /api/{recipients|donors}/{id}/line-data · /notify-settings */
export const lineApi = {
  async data(kind: PersonKind, id: string, days: number): Promise<LineDataDto> {
    if (!USE_MOCK) return http(`/${base(kind)}/${id}/line-data?days=${days}`);
    const all = lineDataFor(kind, id);
    const from = Date.now() - days * 86400000;
    const keep = <T extends { at?: string; date?: string }>(arr: T[]) => arr.filter((x) => new Date((x.at ?? x.date)!).getTime() >= from);
    return mockDelay({ ...all, bp: keep(all.bp), fluid: keep(all.fluid), weight: keep(all.weight), temp: keep(all.temp), abnormal: keep(all.abnormal) }, 250);
  },
  async settings(kind: PersonKind, id: string): Promise<NotifySettingsDto> {
    if (!USE_MOCK) return http(`/${base(kind)}/${id}/notify-settings`);
    return mockDelay(settingsFor(id), 150);
  },
  async saveSettings(kind: PersonKind, id: string, s: { fluidTargetMl: number; medTimes: string[] }): Promise<NotifySettingsDto> {
    if (!USE_MOCK) return http(`/${base(kind)}/${id}/notify-settings`, { method: 'PUT', body: JSON.stringify(s) });
    return mockDelay(saveSettings(id, s), 300);
  },
};

/** สถานะเชื่อม LINE — ภายหลังให้ backend ส่งมากับข้อมูลผู้ป่วย (field lineLinked) */
export { isLineLinked, BP_LIMIT } from '@/mocks/line';

/** เดโม LINE OA: บันทึกข้อมูลจากหน้า LIFF (ภายหลังเป็น POST /api/line/entries) */
export { addLineEntry, entriesToday, type LineEntry } from '@/mocks/line';
