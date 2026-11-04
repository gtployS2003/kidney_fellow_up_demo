import { BarChart3, CalendarDays, Link2, User, UserPlus, type LucideIcon } from 'lucide-react';

export interface NavGroup {
  key: string;
  label: string;
  icon: LucideIcon;
  /** ถ้าไม่มี children = เมนูเดี่ยว */
  to?: string;
  base: string;
  children?: { label: string; to: string; end?: boolean }[];
}

/** เมนูหลักของทีมแพทย์และพยาบาล (ไม่มี “ตั้งค่า” — dev ตั้งค่าที่หลังบ้าน) */
export const NAV: NavGroup[] = [
  {
    key: 'recipient',
    label: 'ผู้รับบริจาคไต (Recipient)',
    icon: User,
    base: '/clinical/recipients',
    children: [
      { label: 'Dashboard', to: '/clinical/recipients', end: true },
      { label: 'ลงทะเบียนผู้รับบริจาคไต', to: '/clinical/recipients/register' },
      { label: 'รายชื่อผู้รับบริจาคไต', to: '/clinical/recipients/list' },
    ],
  },
  {
    key: 'donor',
    label: 'ผู้บริจาคไต (Donor)',
    icon: UserPlus,
    base: '/clinical/donors',
    children: [
      { label: 'Dashboard', to: '/clinical/donors', end: true },
      { label: 'ลงทะเบียนผู้บริจาคไต', to: '/clinical/donors/register' },
      { label: 'รายชื่อผู้บริจาคไต', to: '/clinical/donors/list' },
    ],
  },
  {
    key: 'matching',
    label: 'จับคู่ผู้บริจาค',
    icon: Link2,
    base: '/clinical/matching',
    children: [
      { label: 'Dashboard', to: '/clinical/matching', end: true },
      { label: 'ค้นหาด้วย HLA', to: '/clinical/matching/hla' },
      { label: 'กำลังจับคู่', to: '/clinical/matching/in-progress' },
      { label: 'ส่งรายชื่อให้สภากาชาด', to: '/clinical/matching/send' },
      { label: 'ประวัติการจับคู่', to: '/clinical/matching/history' },
    ],
  },
  { key: 'appointments', label: 'นัดหมาย', icon: CalendarDays, base: '/clinical/appointments', to: '/clinical/appointments' },
  { key: 'reports', label: 'รายงาน', icon: BarChart3, base: '/clinical/reports', to: '/clinical/reports' },
];
