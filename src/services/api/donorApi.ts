import type { DonorCreateDto, DonorDashboardDto, DonorDetailDto, DonorQuery, DonorSummaryDto } from '@/types';
import { donorsDb } from '@/mocks/donors';
import { recipientsDb } from '@/mocks/recipients';
import { ageFrom } from '@/lib/format';
import { USE_MOCK, http, mockDelay, toQuery } from './client';

/** ตรงกับ module “Donor” ฝั่ง backend: /api/donors */
export const donorApi = {
  async dashboard(): Promise<DonorDashboardDto> {
    if (!USE_MOCK) return http('/donors/dashboard');
    const by = (s: string) => donorsDb.filter((d) => d.caseType === 'living' && d.status === s).length;
    return mockDelay({
      total: donorsDb.length,
      living: donorsDb.filter((d) => d.caseType === 'living').length,
      redcross: donorsDb.filter((d) => d.caseType === 'redcross').length,
      mrb: by('mrb'),
      waitingSurgery: by('waitingSurgery'),
    });
  },

  async list(query: DonorQuery = {}): Promise<DonorSummaryDto[]> {
    if (!USE_MOCK) return http(`/donors${toQuery({ search: query.search, status: query.status, caseType: query.caseType })}`);
    const s = (query.search ?? '').trim().toLowerCase();
    return mockDelay(
      donorsDb.filter((d) => {
        if (query.status && query.status !== 'all' && d.status !== query.status) return false;
        if (query.caseType && query.caseType !== 'all' && d.caseType !== query.caseType) return false;
        if (s && !`${d.firstName} ${d.lastName} ${d.hn} ${d.recipient.name} ${d.redCrossCode ?? ''}`.toLowerCase().includes(s)) return false;
        return true;
      }),
    );
  },

  async get(id: string): Promise<DonorDetailDto | null> {
    if (!USE_MOCK) return http(`/donors/${id}`);
    return mockDelay(donorsDb.find((d) => d.id === id) ?? null);
  },

  /** ลงทะเบียนผู้บริจาคมีชีวิต — ผูกกับผู้รับ (backend ทำในธุรกรรมเดียว) */
  async create(dto: DonorCreateDto): Promise<DonorDetailDto> {
    if (!USE_MOCK) return http('/donors', { method: 'POST', body: JSON.stringify(dto) });
    const today = new Date().toISOString().slice(0, 10);
    const r = recipientsDb.find((x) => x.id === dto.recipientId);
    const id = `d-${dto.hn || Date.now()}`;
    const name = `${dto.prefix}${dto.firstName} ${dto.lastName}`;
    const donor: DonorDetailDto = {
      id,
      hn: dto.hn,
      prefix: dto.prefix,
      firstName: dto.firstName,
      lastName: dto.lastName,
      sex: dto.prefix === 'นาย' ? 'male' : 'female',
      age: ageFrom(dto.birthDate) ?? 0,
      bloodGroup: (dto.bloodGroup || 'O') as DonorDetailDto['bloodGroup'],
      rh: '+',
      caseType: 'living',
      status: 'evaluation',
      statusSince: today,
      registeredAt: today,
      evaluation: { done: 0, total: 11 },
      relation: dto.relation,
      recipient: r ? { id: r.id, name: `${r.prefix}${r.firstName} ${r.lastName}`, hn: r.hn, bloodGroup: r.bloodGroup, rh: r.rh, status: r.status } : { name: '—' },
      phone: dto.phone1,
      lineId: dto.lineId || undefined,
      nationalId: dto.nationalId,
      birthDate: dto.birthDate,
      address: dto.sameAddressAsRecipient && r ? r.address : dto.address,
      physician: 'นพ.สมเกียรติ วงศ์ไทย',
      stageDates: { register: today },
    };
    donorsDb.unshift(donor);
    if (r) {
      r.caseType = 'living';
      if (!r.matchedDonor) r.matchedDonor = { donorId: id, name, relation: dto.relation };
      const intended = r.intendedDonors.find((d) => !d.donorId && d.firstName === dto.firstName);
      if (intended) intended.donorId = id;
      else r.intendedDonors.push({ firstName: dto.firstName, lastName: dto.lastName, relation: dto.relation, donorId: id });
    }
    return mockDelay(donor, 600);
  },
};
