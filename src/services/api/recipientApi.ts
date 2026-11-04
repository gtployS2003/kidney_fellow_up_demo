import type {
  RecipientCreateDto,
  RecipientDashboardDto,
  RecipientDetailDto,
  RecipientQuery,
  RecipientSummaryDto,
} from '@/types';
import { recipientsDb } from '@/mocks/recipients';
import { ageFrom } from '@/lib/format';
import { USE_MOCK, http, mockDelay, toQuery } from './client';

/** ตรงกับ module “Recipient” ฝั่ง backend: /api/recipients */
export const recipientApi = {
  async dashboard(): Promise<RecipientDashboardDto> {
    if (!USE_MOCK) return http('/recipients/dashboard');
    const all = recipientsDb;
    const by = (s: string) => all.filter((r) => r.status === s).length;
    return mockDelay({
      total: all.length,
      living: all.filter((r) => r.caseType === 'living').length,
      redcross: all.filter((r) => r.caseType === 'redcross').length,
      waitingRedCross: by('waitingRedCross'),
      mrb: by('mrb'),
      waitingSurgery: by('waitingSurgery'),
    });
  },

  async list(query: RecipientQuery = {}): Promise<RecipientSummaryDto[]> {
    if (!USE_MOCK) {
      return http(`/recipients${toQuery({ search: query.search, status: query.status, caseType: query.caseType })}`);
    }
    const s = (query.search ?? '').trim().toLowerCase();
    const rows = recipientsDb.filter((r) => {
      if (query.status && query.status !== 'all' && r.status !== query.status) return false;
      if (query.caseType && query.caseType !== 'all' && r.caseType !== query.caseType) return false;
      if (s && !`${r.firstName} ${r.lastName} ${r.hn}`.toLowerCase().includes(s)) return false;
      return true;
    });
    return mockDelay(rows);
  },

  async get(id: string): Promise<RecipientDetailDto | null> {
    if (!USE_MOCK) return http(`/recipients/${id}`);
    return mockDelay(recipientsDb.find((r) => r.id === id) ?? null);
  },

  async create(dto: RecipientCreateDto): Promise<RecipientDetailDto> {
    if (!USE_MOCK) return http('/recipients', { method: 'POST', body: JSON.stringify(dto) });
    const today = new Date().toISOString().slice(0, 10);
    const hasDonor = dto.hasIntendedDonor === 'yes' && dto.intendedDonors.some((d) => d.firstName);
    const first = dto.intendedDonors[0];
    const rec: RecipientDetailDto = {
      id: `r-${dto.hn || Date.now()}`,
      hn: dto.hn,
      prefix: dto.prefix,
      firstName: dto.firstName,
      lastName: dto.lastName,
      sex: dto.prefix === 'นาย' ? 'male' : 'female',
      age: ageFrom(dto.birthDate) ?? 0,
      bloodGroup: (dto.bloodGroup || 'O') as RecipientDetailDto['bloodGroup'],
      rh: '+',
      // ประเภทผู้ป่วยกำหนดจากข้อ “ผู้ประสงค์จะบริจาคไต” อัตโนมัติ
      caseType: hasDonor ? 'living' : 'redcross',
      // สถานะเริ่มต้นหลังลงทะเบียน = Evaluation (backend เป็นผู้กำหนดจริง)
      status: 'evaluation',
      statusSince: today,
      registeredAt: today,
      evaluation: { done: 0, total: 11 },
      matchedDonor: hasDonor && first ? { name: `${first.firstName} ${first.lastName}`, relation: first.relation } : undefined,
      phone: dto.phone1,
      lineId: dto.lineId || undefined,
      nationalId: dto.nationalId,
      birthDate: dto.birthDate,
      address: dto.address,
      rrt: (dto.rrt || 'none') as RecipientDetailDto['rrt'],
      rrtStart: dto.rrtStart || undefined,
      physician: 'นพ.สมเกียรติ วงศ์ไทย',
      intendedDonors: hasDonor ? dto.intendedDonors.filter((d) => d.firstName) : [],
      stageDates: { register: today },
    };
    recipientsDb.unshift(rec);
    return mockDelay(rec, 600);
  },
};
