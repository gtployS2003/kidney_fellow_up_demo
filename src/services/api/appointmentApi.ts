import type { AppointmentCreateDto, AppointmentDto, LabResultDto, PersonKind } from '@/types';
import { addManual, appointmentsInRange, labFor, peopleForPicker, removeManual, updateManual } from '@/mocks/appointments';
import { STATUS_META } from '@/lib/status';
import { recipientsDb } from '@/mocks/recipients';
import { donorsDb } from '@/mocks/donors';
import { USE_MOCK, http, mockDelay, toQuery } from './client';

/** module “Appointments” ฝั่ง backend: /api/appointments (นัด KT clinic จาก iMed + นัดที่สร้างในระบบ) */
export const appointmentApi = {
  async range(from: string, to: string, personId?: string): Promise<AppointmentDto[]> {
    if (!USE_MOCK) return http(`/appointments${toQuery({ from, to, personId })}`);
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demoError') === 'imed') {
      await mockDelay(null, 500);
      throw new Error('IMED-504');
    }
    const rows = appointmentsInRange(from, to);
    return mockDelay(personId ? rows.filter((r) => r.personId === personId) : rows, 300);
  },

  async create(dto: AppointmentCreateDto): Promise<AppointmentDto> {
    if (!USE_MOCK) return http('/appointments', { method: 'POST', body: JSON.stringify(dto) });
    const p = dto.personKind === 'recipient' ? recipientsDb.find((r) => r.id === dto.personId) : donorsDb.find((d) => d.id === dto.personId);
    const a: AppointmentDto = {
      id: `m-${Date.now()}`,
      date: dto.date,
      time: dto.time,
      personKind: dto.personKind,
      personId: dto.personId,
      name: p ? `${p.prefix}${p.firstName} ${p.lastName}` : '—',
      hn: p?.hn ?? '',
      stage: p ? STATUS_META[p.status].label : '',
      type: dto.type,
      room: dto.room,
      doctor: dto.doctor,
      note: dto.note,
      resultStatus: 'none',
      source: 'manual',
    };
    addManual(a);
    return mockDelay(a, 400);
  },

  async update(a: AppointmentDto): Promise<AppointmentDto> {
    if (!USE_MOCK) return http(`/appointments/${a.id}`, { method: 'PUT', body: JSON.stringify(a) });
    updateManual(a);
    return mockDelay(a, 300);
  },

  async remove(id: string): Promise<void> {
    if (!USE_MOCK) return http(`/appointments/${id}`, { method: 'DELETE' });
    removeManual(id);
    return mockDelay(undefined, 300);
  },

  /** ผู้ป่วยที่ลงทะเบียนแล้ว (ผู้รับ + ผู้บริจาคมีชีวิต) สำหรับช่องค้นหาตอนสร้างนัด */
  async people(): Promise<ReturnType<typeof peopleForPicker>> {
    if (!USE_MOCK) return http('/appointments/people');
    return mockDelay(peopleForPicker(), 150);
  },
};

/** ผลแล็บจาก iMed: /api/{recipients|donors}/{id}/labs?date= */
export const labApi = {
  async latest(kind: PersonKind, id: string, date?: string): Promise<LabResultDto> {
    if (!USE_MOCK) return http(`/${kind === 'recipient' ? 'recipients' : 'donors'}/${id}/labs${toQuery({ date })}`);
    return mockDelay(labFor(kind, id, date), 300);
  },
};
