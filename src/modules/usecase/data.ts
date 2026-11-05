export type ActorKey = 'staff' | 'recipient' | 'donor';
export type ExtKey = 'imed' | 'thaid' | 'line' | 'redcross';
export interface UseCase {
  id: string;
  name: string;
  desc: string;
  actors: ActorKey[];
  ext?: ExtKey[];
  /** หน้าในเดโมที่ใช้ดูได้ */
  link?: string;
  /** แสดงป้ายว่าใช้กับใคร (ในแพ็กเกจ LINE OA) */
  who?: ('R' | 'D')[];
}
export interface Pkg {
  id: string;
  name: string;
  col: 0 | 1 | 2;
  ucs: UseCase[];
  auto?: boolean;
}

export const ACTORS: Record<ActorKey, { name: string; sub: string }> = {
  staff: { name: 'แพทย์ / พยาบาล', sub: 'สิทธิ์เท่ากัน · ใช้เว็บระบบ' },
  recipient: { name: 'ผู้รับไต', sub: 'ใช้ผ่าน LINE OA' },
  donor: { name: 'ผู้บริจาคไต', sub: 'ใช้ผ่าน LINE OA' },
};
export const EXTERNAL: Record<ExtKey, { name: string; sub: string }> = {
  imed: { name: 'iMed (HIS)', sub: 'นัด · ผลแล็บ · HLA/PRA · ข้อมูลการมา' },
  thaid: { name: 'ThaiD', sub: 'ยืนยันตัวตน (กรมการปกครอง)' },
  line: { name: 'LINE Platform', sub: 'Messaging API · LIFF · Rich menu' },
  redcross: { name: 'สภากาชาดไทย', sub: 'นอกระบบ · ไฟล์ Export / แจ้งผลทางโทรศัพท์' },
};

const S: ActorKey[] = ['staff'];
const P: ActorKey[] = ['recipient', 'donor'];

/** Use case ทั้งหมดตามระบบที่ออกแบบ (Phase 1) */
export const PACKAGES: Pkg[] = [
  {
    id: 'rec', name: 'ผู้รับบริจาคไต (Recipient)', col: 0, ucs: [
      { id: 'R1', name: 'ลงทะเบียนผู้รับ (คู่กับผู้บริจาค)', desc: 'กรอกแบบฟอร์มลงทะเบียน 6 หัวข้อ ระบุผู้ประสงค์บริจาค แล้วลงทะเบียนผู้บริจาคต่อได้ทันที', actors: S, link: '/clinical/recipients/register' },
      { id: 'R2', name: 'ดู Dashboard / รายชื่อ / Pipeline', desc: 'ภาพรวมผู้รับแยกตามสถานะ (สถานะเปลี่ยนอัตโนมัติเมื่อขั้นตอนเสร็จ)', actors: S, link: '/clinical/recipients' },
      { id: 'R3', name: 'บันทึก Evaluation 1.1–1.5', desc: 'ให้คำปรึกษา · การรักษาปัจจุบัน · ซักประวัติ · ตรวจร่างกาย · รายการส่งตรวจ (ผ่าน/ไม่ผ่าน รายข้อ)', actors: S, link: '/clinical/recipients/list' },
      { id: 'R4', name: 'บันทึกผล MRB', desc: 'ผ่าน / ไม่ผ่าน + หมายเหตุ · ผ่านแล้วสถานะเปลี่ยนอัตโนมัติ', actors: S },
      { id: 'R5', name: 'Preview / Export ฟอร์ม A4', desc: 'ทุกฟอร์มดูแบบกระดาษ A4 และ Export PDF / Word / พิมพ์ · ลายเซ็นใช้พิมพ์–เซ็น–สแกนแนบ', actors: S },
      { id: 'R6', name: 'ดู Timeline / รายงานฟอร์ม', desc: 'เหตุการณ์ทั้งหมดของผู้ป่วย และรายการฟอร์มพร้อมสถานะ', actors: S },
    ],
  },
  {
    id: 'don', name: 'ผู้บริจาคไต (Donor)', col: 0, ucs: [
      { id: 'D1', name: 'ลงทะเบียนผู้บริจาค', desc: 'ผูกกับผู้รับ · ดึงรายชื่อผู้ประสงค์บริจาคที่ผู้รับระบุไว้', actors: S, link: '/clinical/donors/register' },
      { id: 'D2', name: 'บันทึก Evaluation ผู้บริจาค 1.1–1.4 + MRB', desc: 'ให้คำปรึกษา (ข้อ 3.4 เฉพาะหญิง) · ซักประวัติ · ตรวจร่างกาย · ส่งตรวจ · MRB', actors: S, link: '/clinical/donors/list' },
      { id: 'D3', name: 'ดูข้อมูลไตจากสภากาชาด', desc: 'บันทึกหลังผู้รับ (กรณีไม่มีผู้บริจาค) ผ่าตัดเสร็จ · field รอกำหนด', actors: S },
    ],
  },
  {
    id: 'post', name: 'ผ่าตัด → ติดตาม OPD', col: 0, ucs: [
      { id: 'O1', name: 'บันทึกการผ่าตัด', desc: 'บันทึกการผ่าตัดและการทำงานของไตหลังผ่าตัด (ฟอร์มรอแบบจริงจากหน้างาน)', actors: S },
      { id: 'O2', name: 'ก่อนกลับบ้าน (Discharge)', desc: 'Checklist · สรุปการจำหน่าย · ยากลับบ้าน · นัดติดตาม', actors: S },
      { id: 'O3', name: 'บันทึกการตรวจ OPD / ปรับยา', desc: 'บันทึกแต่ละครั้ง · ประวัติปรับยา · ภาวะแทรกซ้อน', actors: S },
      { id: 'O4', name: 'ดูรอบติดตาม OPD', desc: 'ตารางรอบมาตรฐาน · มาแล้ว / ขาดนัด / รอบถัดไป (ผู้รับและผู้บริจาค)', actors: S, ext: ['imed'] },
    ],
  },
  {
    id: 'match', name: 'จับคู่ผู้บริจาค', col: 1, ucs: [
      { id: 'M1', name: 'ค้นหาด้วย HLA', desc: 'กรอก HLA ที่สภากาชาดแจ้ง (ไม่บันทึก) · เรียงตาม mismatch · ABO ไม่เข้ากันซ่อนอัตโนมัติ', actors: S, ext: ['imed', 'redcross'], link: '/clinical/matching/hla' },
      { id: 'M2', name: 'เริ่มจับคู่ / บันทึกผลสภากาชาด', desc: 'ยืนยัน checklist → “กำลังจับคู่” · บันทึกผล ได้รับ / ไม่ได้รับ / ปฏิเสธ', actors: S, ext: ['redcross'], link: '/clinical/matching/in-progress' },
      { id: 'M3', name: 'ตรวจ Pre-KT checklist คู่มีชีวิต', desc: 'ผลจาก iMed · แพทย์ตัดสินผ่าน/ไม่ผ่านรายข้อ', actors: S, ext: ['imed'] },
      { id: 'M4', name: 'ส่งรายชื่อให้สภากาชาด', desc: 'เลือกผู้ป่วย · Export ไฟล์ · บันทึกรอบที่ส่ง', actors: S, ext: ['redcross'], link: '/clinical/matching/send' },
      { id: 'M5', name: 'ดูประวัติการจับคู่', desc: 'ผลทุกครั้ง พร้อมเหตุผล', actors: S, link: '/clinical/matching/history' },
    ],
  },
  {
    id: 'appt', name: 'นัดหมาย & ผลแล็บ', col: 1, ucs: [
      { id: 'A1', name: 'ดูปฏิทินนัดหมาย', desc: 'นัดจาก iMed (มุมมองเดือน) · ไปดูผลแล็บล่าสุดของผู้ป่วยได้', actors: S, ext: ['imed'], link: '/clinical/appointments' },
      { id: 'A2', name: 'สร้าง / แก้ไขนัดในระบบ', desc: 'นัดนอกเหนือจาก iMed · ผู้ป่วยที่เชื่อม LINE ได้รับแจ้งเตือน', actors: S },
      { id: 'A3', name: 'ดูผลแล็บ', desc: 'ผลล่าสุด + แนวโน้ม 5 ครั้ง จาก iMed', actors: S, ext: ['imed'] },
    ],
  },
  {
    id: 'rep', name: 'รายงาน & บทความ', col: 1, ucs: [
      { id: 'P1', name: 'ดู / Export รายงาน', desc: 'รายงานตัวอย่าง 3 รายการ (รายการทั้งหมดรอยืนยัน)', actors: S, link: '/clinical/reports' },
      { id: 'P2', name: 'จัดการบทความความรู้', desc: 'เขียน · กลุ่มผู้อ่าน / ช่วงการรักษา / เพศ · แบนเนอร์แนะนำ · เผยแพร่ไป LINE OA', actors: S, link: '/clinical/articles' },
    ],
  },
  {
    id: 'ldata', name: 'ข้อมูลจาก LINE', col: 1, ucs: [
      { id: 'L1', name: 'ดู Trend ข้อมูลที่ผู้ป่วยบันทึก', desc: 'ความดัน · น้ำเข้า–ออก · น้ำหนัก · การกินยา · ค่าที่เกินเกณฑ์', actors: S },
      { id: 'L2', name: 'ตั้งค่าการแจ้งเตือนรายผู้ป่วย', desc: 'เป้าดื่มน้ำ / เวลาเตือนยา (มีค่าเริ่มต้น) · label สถานะเชื่อม LINE', actors: S },
    ],
  },
  {
    id: 'oa', name: 'LINE OA (LIFF)', col: 2, ucs: [
      { id: 'U1', name: 'ลงทะเบียน / ยืนยันตัวตน', desc: 'ยืนยันด้วย ThaiD → ดึงข้อมูลที่เจ้าหน้าที่ลงทะเบียนไว้ → ผูก LINE + เปลี่ยน Rich menu ตามประเภท', actors: P, ext: ['thaid', 'line'], link: '/line', who: ['R', 'D'] },
      { id: 'U2', name: 'ดูนัด / ยืนยันมาตามนัด', desc: 'นัดถัดไป + การเตรียมตัว · ตรวจที่ต้องไป (ช่วง Evaluation) · ไม่มีขอเลื่อนนัด', actors: P, link: '/line', who: ['R', 'D'] },
      { id: 'U3', name: 'การกินยา (กดกินแล้ว)', desc: 'ยาวันนี้ · ยากดภูมิ (หลังผ่าตัด) · ยาทั้งหมด', actors: P, link: '/line', who: ['R', 'D'] },
      { id: 'U4', name: 'ดูค่าไต', desc: 'Cr · eGFR (· Tacrolimus) จาก iMed', actors: P, ext: ['imed'], link: '/line', who: ['R', 'D'] },
      { id: 'U5', name: 'บันทึกสุขภาพ', desc: 'ผู้รับ: น้ำเข้า–ออก · ความดัน · น้ำหนัก · อุณหภูมิ / ผู้บริจาค: ความดัน · น้ำหนัก', actors: P, link: '/line', who: ['R', 'D'] },
      { id: 'U6', name: 'อ่านความรู้', desc: 'บทความที่เผยแพร่ตามกลุ่มผู้อ่าน (ผู้บริจาค: ปุ่มหลัก · ผู้รับ: ผ่าน Profile)', actors: P, link: '/line', who: ['R', 'D'] },
      { id: 'U7', name: 'ติดตามอาการ', desc: 'สถานะการรักษา · อาการที่ต้องรีบมาโรงพยาบาล', actors: P, link: '/line', who: ['R', 'D'] },
      { id: 'U8', name: 'Profile / ตั้งค่าแจ้งเตือน', desc: 'ปิดได้เฉพาะเตือนบันทึกสุขภาพ', actors: P, link: '/line', who: ['R', 'D'] },
      { id: 'U9', name: 'รับแจ้งเตือน + ตอบกลับ', desc: '9 แบบ (นัด · ผ่าตัด · ยา · บันทึกสุขภาพ · ค่าผิดปกติ) · คำตอบลง Timeline · ไม่แจ้งเรื่องสภากาชาด/ผลแล็บ', actors: P, ext: ['line'], link: '/line', who: ['R', 'D'] },
    ],
  },
  {
    id: 'auto', name: 'ระบบทำอัตโนมัติ', col: 2, auto: true, ucs: [
      { id: 'X1', name: 'เปลี่ยนสถานะอัตโนมัติ', desc: 'Evaluation → ตรวจผ่าน → รอ MRB → … เมื่อขั้นตอนเสร็จ (เจ้าหน้าที่ไม่ต้องกดเปลี่ยน)', actors: [] },
      { id: 'X2', name: 'ส่งแจ้งเตือนทาง LINE', desc: 'ตามเหตุการณ์ในระบบ · ข้อมูลจาก iMed', actors: [], ext: ['line', 'imed'] },
      { id: 'X3', name: 'ตรวจขาดนัด', desc: 'เลยวันนัดแล้วไม่มีข้อมูลการมาจาก iMed → แจ้งเตือนขาดนัด', actors: [], ext: ['imed'] },
    ],
  },
];
