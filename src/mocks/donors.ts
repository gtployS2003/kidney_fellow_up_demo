import type { DonorDetailDto, RecipientStatus, CaseType, BloodGroup, Sex } from '@/types';
import { recipientsDb } from './recipients';

/** ข้อมูลตัวอย่าง — ไม่ใช่ข้อมูลจริง */
type Seed = [
  id: string,
  hn: string,
  prefix: string,
  first: string,
  last: string,
  sex: Sex,
  age: number,
  bg: BloodGroup,
  caseType: CaseType,
  status: RecipientStatus,
  statusSince: string,
  registeredAt: string,
  relation: string,
  recipient: { id?: string; name?: string },
  extra?: Partial<DonorDetailDto>,
];

const seeds: Seed[] = [
  ['d-990301', '990301', 'นาย', 'พิชัย', 'ใจงาม', 'male', 41, 'B', 'living', 'evaluation', '2026-09-10', '2026-09-10', 'พี่ชาย', { id: 'r-990221' }, { evaluation: { done: 5, total: 11 } }],
  ['d-990305', '990305', 'นาย', 'วิชัย', 'สายบุญ', 'male', 52, 'O', 'living', 'evaluation', '2026-09-28', '2026-09-28', 'สามี', { id: 'r-990232' }, { evaluation: { done: 3, total: 11 } }],
  ['d-990309', '990309', 'นางสาว', 'อรอุมา', 'ทองคำ', 'female', 28, 'A', 'living', 'evaluation', '2026-08-15', '2026-08-15', 'บุตร', { name: 'นายธนากร ทองคำ' }, { evaluation: { done: 8, total: 11 } }],
  ['d-990302', '990302', 'นาง', 'วันดี', 'แก้วใส', 'female', 44, 'A', 'living', 'passed', '2026-10-15', '2026-07-14', 'ภรรยา', { id: 'r-990226' }, { note: 'ผ่านเมื่อ 15 ต.ค. 2569 · รอส่งเรื่อง MRB' }],
  ['d-990311', '990311', 'นาย', 'ณัฐวุฒิ', 'ชัยวงศ์', 'male', 35, 'B', 'living', 'passed', '2026-10-19', '2026-06-20', 'พี่ชาย', { name: 'นางสาวปวีณา ชัยวงศ์' }, { note: 'ผ่านเมื่อ 19 ต.ค. 2569' }],
  ['d-990307', '990307', 'นาง', 'รัชนี', 'เพ็ชรดี', 'female', 58, 'O', 'living', 'mrb', '2026-10-01', '2026-06-03', 'มารดา', { id: 'r-990234' }, { note: 'ส่งเรื่อง MRB 01 ต.ค. 2569' }],
  ['d-990314', '990314', 'นาย', 'อำนาจ', 'ศรีวงศ์', 'male', 47, 'AB', 'living', 'mrb', '2026-10-10', '2026-05-11', 'พี่ชาย', { name: 'นายอนันต์ ศรีวงศ์' }, { note: 'ส่งเรื่อง MRB 10 ต.ค. 2569' }],
  ['d-990303', '990303', 'นาง', 'สมพร', 'บุญเรือง', 'female', 62, 'O', 'living', 'waitingSurgery', '2026-10-10', '2026-05-22', 'มารดา', { id: 'r-990229' }, { note: 'นัดผ่าตัด 28 ต.ค. 2569' }],
  ['d-990316', '990316', 'นางสาว', 'จิราพร', 'คำดี', 'female', 33, 'B', 'living', 'waitingSurgery', '2026-10-18', '2026-08-05', 'น้องสาว', { name: 'นายวีรพงษ์ คำดี' }, { note: 'นัดผ่าตัด 12 พ.ย. 2569' }],
  ['d-990290', '990290', 'นาย', 'สมชาย', 'ศรีสุข', 'male', 45, 'O', 'living', 'opd', '2026-09-05', '2025-01-12', 'พี่ชาย', { id: 'r-990260' }, {}],
  // ไตจากสภากาชาด — บันทึกหลังผู้รับผ่าตัด (field จริงรอกำหนด)
  ['dd-2569-0187', '', '', 'ผู้บริจาคสภากาชาด', 'DD-2569-0187', 'male', 45, 'O', 'redcross', 'postop', '2026-10-13', '2026-10-13', 'จัดสรรโดยสภากาชาด', { name: 'นายประเสริฐ มั่นคง' }, { redCrossCode: 'DD-2569-0187', sourceHospital: 'รพ.ศูนย์ลำปาง', recipientSurgeryDate: '2026-10-12' }],
  ['dd-2569-0142', '', '', 'ผู้บริจาคสภากาชาด', 'DD-2569-0142', 'female', 38, 'B', 'redcross', 'postop', '2026-09-03', '2026-09-03', 'จัดสรรโดยสภากาชาด', { id: 'r-990198' }, { redCrossCode: 'DD-2569-0142', sourceHospital: 'รพ.มหาราชนครเชียงใหม่', recipientSurgeryDate: '2026-09-02' }],
  ['dd-2569-0098', '', '', 'ผู้บริจาคสภากาชาด', 'DD-2569-0098', 'male', 51, 'A', 'redcross', 'postop', '2026-07-19', '2026-07-19', 'จัดสรรโดยสภากาชาด', { name: 'นายสมศักดิ์ ใจดี' }, { redCrossCode: 'DD-2569-0098', sourceHospital: 'รพ.พุทธชินราช', recipientSurgeryDate: '2026-07-18' }],
];

export const donorsDb: DonorDetailDto[] = seeds.map(([id, hn, prefix, firstName, lastName, sex, age, bloodGroup, caseType, status, statusSince, registeredAt, relation, rcp, extra]) => {
  const r = rcp.id ? recipientsDb.find((x) => x.id === rcp.id) : undefined;
  return {
    id,
    hn,
    prefix,
    firstName,
    lastName,
    sex,
    age,
    bloodGroup,
    rh: '+',
    caseType,
    status,
    statusSince,
    registeredAt,
    relation,
    recipient: r ? { id: r.id, name: `${r.prefix}${r.firstName} ${r.lastName}`, hn: r.hn, bloodGroup: r.bloodGroup, rh: r.rh, status: r.status } : { name: rcp.name ?? '—' },
    phone: hn ? '08x-xxx-' + hn.slice(-4) : '—',
    nationalId: hn ? `x-xxxx-xxxxx-xx-${hn.slice(-1)}` : '—',
    birthDate: `${new Date().getFullYear() - age}-05-10`,
    address: '99/12 ม.4 ต.ในเมือง อ.เมือง จ.พิษณุโลก 65000',
    physician: 'นพ.สมเกียรติ วงศ์ไทย',
    stageDates: { register: registeredAt },
    ...extra,
  };
});
