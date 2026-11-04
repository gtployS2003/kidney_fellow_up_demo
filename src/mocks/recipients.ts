import type { RecipientDetailDto, RecipientStatus, CaseType, BloodGroup, Sex } from '@/types';

/** ข้อมูลตัวอย่าง — ไม่ใช่ข้อมูลผู้ป่วยจริง */
type Seed = [
  id: string,
  hn: string,
  prefix: string,
  first: string,
  last: string,
  sex: Sex,
  age: number,
  bg: BloodGroup,
  rh: '+' | '-',
  caseType: CaseType,
  status: RecipientStatus,
  statusSince: string,
  registeredAt: string,
  extra?: Partial<RecipientDetailDto>,
];

const seeds: Seed[] = [
  ['r-990213', '990213', 'นาย', 'มงคล', 'ศักดิ์สิทธิ์', 'male', 29, 'A', '+', 'redcross', 'evaluation', '2025-06-14', '2025-06-14', { evaluation: { done: 7, total: 11 }, pra: 8 }],
  ['r-990221', '990221', 'นางสาว', 'พิมพ์ชนก', 'ใจงาม', 'female', 38, 'B', '+', 'living', 'evaluation', '2026-09-02', '2026-09-02', { evaluation: { done: 4, total: 11 }, matchedDonor: { donorId: 'd-990301', name: 'นายพิชัย ใจงาม', relation: 'พี่ชาย' } }],
  ['r-990224', '990224', 'นาย', 'วีระ', 'ทองดี', 'male', 55, 'O', '+', 'redcross', 'evaluation', '2026-03-10', '2026-03-10', { evaluation: { done: 9, total: 11 } }],
  ['r-990232', '990232', 'นาง', 'มาลี', 'สายบุญ', 'female', 49, 'O', '+', 'living', 'evaluation', '2026-09-28', '2026-09-28', { evaluation: { done: 3, total: 11 }, matchedDonor: { donorId: 'd-990305', name: 'นายวิชัย สายบุญ', relation: 'สามี' } }],
  ['r-990214', '990214', 'นางสาว', 'ปาริชาติ', 'วงศ์งาม', 'female', 41, 'O', '-', 'redcross', 'passed', '2026-10-14', '2024-08-30', { note: 'ผ่านเมื่อ 14 ต.ค. 2569 · รอส่งเรื่อง MRB' }],
  ['r-990226', '990226', 'นาย', 'สุทธิพงษ์', 'แก้วใส', 'male', 46, 'A', '+', 'living', 'passed', '2026-10-18', '2026-07-11', { note: 'ผ่านเมื่อ 18 ต.ค. 2569', matchedDonor: { donorId: 'd-990302', name: 'นางวันดี แก้วใส', relation: 'ภรรยา' } }],
  ['r-990211', '990211', 'นาย', 'เอกชัย', 'พงษ์พันธ์', 'male', 34, 'O', '+', 'redcross', 'mrb', '2025-12-20', '2025-01-03', { pra: 4 }],
  ['r-990212', '990212', 'นางสาว', 'รัตนา', 'ทับทิม', 'female', 47, 'B', '+', 'redcross', 'mrb', '2026-09-30', '2022-11-22', { pra: 34 }],
  ['r-990234', '990234', 'นาย', 'กิตติ', 'เพ็ชรดี', 'male', 31, 'O', '+', 'living', 'mrb', '2026-10-01', '2026-06-03', { matchedDonor: { donorId: 'd-990307', name: 'นางรัชนี เพ็ชรดี', relation: 'มารดา' } }],
  ['r-990231', '990231', 'นาย', 'บุญมี', 'ใจเย็น', 'male', 44, 'O', '-', 'redcross', 'waitingRedCross', '2026-10-08', '2025-11-02', { pra: 0, hla: { A: ['24', '33'], B: ['13', '58'], DR: ['15', '17'] } }],
  ['r-990216', '990216', 'นาง', 'จินตนา', 'รักษ์ไทย', 'female', 63, 'B', '-', 'redcross', 'waitingRedCross', '2021-10-10', '2021-05-04', { pra: 18, hla: { A: ['2', '24'], B: ['35', '51'], DR: ['4', '11'] } }],
  ['r-990218', '990218', 'นางสาว', 'กาญจนา', 'ศรีทอง', 'female', 45, 'O', '+', 'redcross', 'waitingRedCross', '2024-07-02', '2024-03-12', { pra: 12, hla: { A: ['2', '11'], B: ['46', '51'], DR: ['9', '12'] } }],
  ['r-990238', '990238', 'นาย', 'เกรียงไกร', 'ทองแท้', 'male', 50, 'O', '+', 'redcross', 'waitingRedCross', '2025-09-15', '2025-02-10', { pra: 4, hla: { A: ['2', '24'], B: ['13', '60'], DR: ['4', '15'] } }],
  ['r-990239', '990239', 'นาง', 'สุภาพ', 'มีสุข', 'female', 57, 'A', '+', 'redcross', 'waitingRedCross', '2025-03-01', '2024-10-01', { pra: 34, hla: { A: ['11', '33'], B: ['46', '75'], DR: ['12', '15'] } }],
  ['r-990227', '990227', 'นาย', 'สมบัติ', 'ดีงาม', 'male', 58, 'A', '+', 'redcross', 'matching', '2026-10-20', '2025-05-20', { pra: 6, note: 'เริ่มจับคู่ 20 ต.ค. 16:05', hla: { A: ['1', '2'], B: ['8', '44'], DR: ['3', '4'] } }],
  ['r-990229', '990229', 'นาย', 'อนุชา', 'บุญเรือง', 'male', 39, 'O', '+', 'living', 'waitingSurgery', '2026-10-10', '2026-05-20', { note: 'นัดผ่าตัด 28 ต.ค. 2569', matchedDonor: { donorId: 'd-990303', name: 'นางสมพร บุญเรือง', relation: 'มารดา' } }],
  ['r-990215', '990215', 'นาย', 'ธีรพล', 'แก้วมณี', 'male', 52, 'AB', '+', 'redcross', 'waitingSurgery', '2026-10-21', '2026-02-17', { note: 'ได้รับไตแล้ว · ผ่าตัด 23 ต.ค. 2569' }],
  ['r-990260', '990260', 'นางสาว', 'วิไลวรรณ', 'ศรีสุข', 'female', 36, 'O', '+', 'living', 'opd', '2026-09-05', '2025-01-10', { matchedDonor: { donorId: 'd-990290', name: 'นายสมชาย ศรีสุข', relation: 'พี่ชาย' } }],
  ['r-990198', '990198', 'นางสาว', 'สุนิสา', 'บุญมา', 'female', 33, 'B', '+', 'redcross', 'opd', '2026-09-14', '2023-07-01', {}],
];

function birthFromAge(age: number): string {
  const y = new Date().getFullYear() - age;
  return `${y}-03-15`;
}

export const recipientsDb: RecipientDetailDto[] = seeds.map(
  ([id, hn, prefix, firstName, lastName, sex, age, bloodGroup, rh, caseType, status, statusSince, registeredAt, extra]) => ({
    id,
    hn,
    prefix,
    firstName,
    lastName,
    sex,
    age,
    bloodGroup,
    rh,
    caseType,
    status,
    statusSince,
    registeredAt,
    phone: '08x-xxx-' + hn.slice(-4),
    lineId: undefined,
    nationalId: `x-xxxx-xxxxx-xx-${hn.slice(-1)}`,
    birthDate: birthFromAge(age),
    address: '99/12 ม.4 ต.ในเมือง อ.เมือง จ.พิษณุโลก 65000',
    rrt: 'HD',
    rrtStart: '2024-03-01',
    hla: { A: ['2', '24'], B: ['13', '60'], DR: ['4', '15'] },
    redCrossQueueNo: caseType === 'redcross' ? `WL-${registeredAt.slice(0, 4)}-0${hn.slice(-3)}` : undefined,
    redCrossSince: caseType === 'redcross' ? registeredAt : undefined,
    physician: 'นพ.สมเกียรติ วงศ์ไทย',
    intendedDonors: extra?.matchedDonor
      ? [{ firstName: extra.matchedDonor.name.replace(/^(นาย|นางสาว|นาง)/, '').split(' ')[0], lastName: extra.matchedDonor.name.split(' ')[1] ?? '', relation: extra.matchedDonor.relation, donorId: extra.matchedDonor.donorId }]
      : [],
    stageDates: { register: registeredAt },
    ...extra,
  }),
);
