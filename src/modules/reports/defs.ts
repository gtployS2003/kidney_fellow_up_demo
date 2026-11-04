import { Activity, Building2, ClipboardCheck, HeartPulse, Link2, Scissors, Timer, Users, type LucideIcon } from 'lucide-react';
import type { ReportKey } from '@/services/api/reportApi';

export interface ReportDef {
  key: ReportKey;
  title: string;
  desc: string;
  icon: LucideIcon;
  fg: string;
  bg: string;
  /** มีตัวอย่างหน้ารายงานในเดโมแล้ว */
  sample: boolean;
}

/** รายการรายงาน — ทั้งหมด “รอยืนยัน” กับหน้างาน */
export const REPORTS: ReportDef[] = [
  { key: 'status', title: 'สรุปผู้ป่วยตามสถานะ', desc: 'จำนวนผู้รับ/ผู้บริจาคในแต่ละขั้นตอน และแนวโน้มรายเดือน', icon: Users, fg: '#2563eb', bg: '#dbeafe', sample: true },
  { key: 'surgery', title: 'การผ่าตัดปลูกถ่ายไต', desc: 'จำนวนผ่าตัดรายเดือน/ปี แยกผู้บริจาคมีชีวิต vs สภากาชาด', icon: Scissors, fg: '#0369a1', bg: '#e0f2fe', sample: false },
  { key: 'duration', title: 'ระยะเวลาแต่ละขั้นตอน', desc: 'ลงทะเบียน → ตรวจผ่าน → MRB → ผ่าตัด ใช้เวลาเฉลี่ยกี่วัน', icon: Timer, fg: '#7c3aed', bg: '#ede9fe', sample: false },
  { key: 'waiting', title: 'Waiting list (สภากาชาด)', desc: 'จำนวนที่รอ ระยะเวลารอ และการกระจายตามกรุ๊ปเลือด / PRA', icon: Building2, fg: '#6d28d9', bg: '#ede9fe', sample: true },
  { key: 'matching', title: 'ผลการจับคู่', desc: 'ได้รับไต / ไม่ได้รับ / ปฏิเสธ และเหตุผลที่ปฏิเสธบ่อย', icon: Link2, fg: '#0f766e', bg: '#ccfbf1', sample: true },
  { key: 'pending', title: 'รายการตรวจที่ค้าง', desc: 'ผู้ป่วยที่มีรายการ Evaluation ยังไม่มีผลหรือไม่ผ่าน', icon: ClipboardCheck, fg: '#c2410c', bg: '#ffedd5', sample: false },
  { key: 'outcome', title: 'ผลลัพธ์หลังปลูกถ่าย', desc: 'Cr, ภาวะแทรกซ้อน, admit ซ้ำ, อัตรารอดของไตและผู้ป่วย', icon: Activity, fg: '#16a34a', bg: '#dcfce7', sample: false },
  { key: 'donorFollow', title: 'ติดตามผู้บริจาค', desc: 'การมาตามนัดหลังบริจาค และค่าการทำงานของไตที่เหลือ', icon: HeartPulse, fg: '#be185d', bg: '#fce7f3', sample: false },
];
