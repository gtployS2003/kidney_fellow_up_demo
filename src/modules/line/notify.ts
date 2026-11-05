import type { Persona } from './personas';

export type LiffPage = 'register' | 'appointments' | 'meds' | 'kidney' | 'health' | 'followup' | 'profile' | 'settings' | 'knowledge';
export interface FlexButton {
  label: string;
  primary?: boolean;
  /** reply = ส่งคำตอบกลับ (postback) · open = เปิดหน้า LIFF */
  action: { type: 'reply'; text: string } | { type: 'open'; page: LiffPage; tab?: string } | { type: 'snooze' };
}
export interface FlexData {
  no: number;
  icon: 'calPlus' | 'calendar' | 'calX' | 'calAlert' | 'scissors' | 'pill' | 'list' | 'heart' | 'alert';
  kicker: string;
  title: string;
  rows?: [string, string, string?][];
  list?: string[];
  text?: string;
  warn?: boolean;
  buttons: FlexButton[];
}

const fmt = (d: Date) => d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const plus = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
};

/** แจ้งเตือน 9 แบบ (เฉพาะเรื่องที่ผู้ป่วยต้องดูแลตัวเอง) — เนื้อหาปรับตามผู้รับ/ผู้บริจาค */
export const NOTIFY_LIST: { no: number; label: string; recipientOnly?: boolean }[] = [
  { no: 1, label: 'มีนัดใหม่' },
  { no: 2, label: 'เตือนนัดล่วงหน้า 1 วัน' },
  { no: 3, label: 'นัดถูกเลื่อน / ยกเลิก' },
  { no: 4, label: 'ขาดนัด' },
  { no: 5, label: 'นัดผ่าตัด + เตรียมตัว' },
  { no: 6, label: 'เตือนกินยา' },
  { no: 7, label: 'แพทย์ปรับยา / รายการยาใหม่' },
  { no: 8, label: 'เตือนบันทึกสุขภาพ' },
  { no: 9, label: 'ค่าที่บันทึกผิดปกติ' },
];

export function buildNotify(no: number, p: Persona, extra?: { sys: number; dia: number }): FlexData {
  const donor = p.kind === 'donor';
  switch (no) {
    case 1:
      return { no, icon: 'calPlus', kicker: donor ? 'มีนัดใหม่ · ตรวจติดตามประจำปี' : 'มีนัดใหม่', title: donor ? 'ตรวจติดตามหลังบริจาคไต' : p.postop ? 'OPD อายุรกรรมโรคไต' : 'ตรวจ Echocardiogram', rows: [['วันที่', plus(14)], ['เวลา', '09:00 น.'], ['สถานที่', p.postop ? 'ห้องตรวจ 3' : 'ตึกหัวใจ ชั้น 2']], buttons: [{ label: 'ดูนัด', primary: true, action: { type: 'open', page: 'appointments' } }] };
    case 2:
      return { no, icon: 'calendar', kicker: 'เตือนนัด · พรุ่งนี้', title: 'OPD อายุรกรรมโรคไต', rows: [['เวลา', '09:00 น. · ห้องตรวจ 3']], list: ['งดน้ำ งดอาหาร 8 ชม. ก่อนเจาะเลือด', 'นำยาที่ใช้ประจำมาด้วย'], buttons: [{ label: 'ยืนยันมาตามนัด', primary: true, action: { type: 'reply', text: 'ยืนยันมาตามนัด' } }] };
    case 3:
      return { no, icon: 'calX', kicker: 'นัดถูกเลื่อน', title: 'เปลี่ยนวันนัด OPD', rows: [['เดิม', plus(7), '#94a3b8'], ['ใหม่', `${plus(11)} · 09:00`, '#2563eb']], buttons: [{ label: 'รับทราบ', primary: true, action: { type: 'reply', text: 'รับทราบ' } }] };
    case 4:
      return { no, icon: 'calAlert', kicker: 'ขาดนัด', title: donor ? 'ไม่ได้มาตรวจประจำปี' : 'ท่านไม่ได้มาตามนัดวันนี้', warn: true, text: 'กรุณาติดต่อศูนย์ปลูกถ่ายไตเพื่อนัดใหม่', rows: [['โทร', '055-96-xxxx'], ['เวลา', 'จ.–ศ. 08:00–16:00']], buttons: [{ label: 'รับทราบ', primary: true, action: { type: 'reply', text: 'รับทราบ' } }] };
    case 5:
      return { no, icon: 'scissors', kicker: donor ? 'นัดผ่าตัดบริจาคไต' : 'นัดผ่าตัด', title: 'นัด Admit ก่อนผ่าตัด', rows: [['วันที่', plus(20)], ['เวลา', '13:00 · ตึกผู้ป่วยใน ชั้น 5']], list: donor ? ['งดน้ำ งดอาหารหลังเที่ยงคืน', 'งดยาแอสไพริน / ยาสมุนไพร 7 วันก่อนผ่าตัด', 'นำบัตรประชาชนมาด้วย'] : ['งดน้ำ งดอาหารหลังเที่ยงคืน', 'นำยาทั้งหมดและบัตรประชาชนมาด้วย', 'มีญาติมาด้วย 1 คน'], buttons: [{ label: 'รับทราบ', primary: true, action: { type: 'reply', text: 'รับทราบ' } }] };
    case 6:
      return { no, icon: 'pill', kicker: `เตือนกินยา · ${donor ? '12:00' : '20:00'}`, title: 'ถึงเวลากินยาแล้ว', rows: donor ? [['Paracetamol 500 mg', '1–2 เม็ด (เมื่อปวด)']] : p.postop ? [['Tacrolimus 3.5 mg', '1 แคปซูล'], ['Mycophenolate 500 mg', '1 เม็ด']] : [['Amlodipine 5 mg', '1 เม็ด']], buttons: [{ label: 'กินแล้ว', primary: true, action: { type: 'reply', text: 'กินแล้ว' } }, { label: 'เตือนอีก 15 นาที', action: { type: 'snooze' } }] };
    case 7:
      if (!donor && !p.postop) return { no, icon: 'list', kicker: 'แพทย์ปรับยา', title: 'รายการยาเปลี่ยนแปลง', rows: [['Amlodipine', '5 → 10 mg วันละครั้ง', '#2563eb']], text: 'เริ่มขนาดใหม่ตั้งแต่พรุ่งนี้เช้า', buttons: [{ label: 'ดูรายการยา', primary: true, action: { type: 'open', page: 'meds' } }] };
      return donor
        ? { no, icon: 'list', kicker: 'รายการยากลับบ้าน', title: 'ยาหลังผ่าตัดบริจาคไต', rows: [['Paracetamol 500 mg', 'เมื่อปวด ทุก 6 ชม.']], text: 'หลีกเลี่ยงยาแก้ปวดกลุ่ม NSAIDs เช่น ไอบูโพรเฟน', buttons: [{ label: 'ดูรายการยา', primary: true, action: { type: 'open', page: 'meds' } }] }
        : { no, icon: 'list', kicker: 'แพทย์ปรับยา', title: 'รายการยาเปลี่ยนแปลง', rows: [['Tacrolimus', '3 → 3.5 mg × 2', '#2563eb']], text: 'เริ่มขนาดใหม่ตั้งแต่มื้อเย็นวันนี้', buttons: [{ label: 'ดูรายการยา', primary: true, action: { type: 'open', page: 'meds', tab: 'immuno' } }] };
    case 8:
      return { no, icon: 'heart', kicker: donor ? 'เตือนบันทึกสุขภาพ · รายสัปดาห์' : 'เตือนบันทึกสุขภาพ', title: donor ? 'สัปดาห์นี้ยังไม่ได้วัดความดัน' : 'วันนี้ยังไม่ได้บันทึก', rows: donor ? [['ครั้งล่าสุด', '124/78']] : [['น้ำเข้า–น้ำออก', 'ยังไม่บันทึก', '#ea580c'], ['ความดัน', 'ยังไม่บันทึก', '#ea580c']], buttons: [{ label: 'บันทึกเลย', primary: true, action: { type: 'open', page: 'health', tab: donor ? 'bp' : 'fluid' } }] };
    default: {
      const v = extra ?? { sys: 158, dia: 96 };
      return { no: 9, icon: 'alert', kicker: 'ค่าที่บันทึกผิดปกติ', title: `ความดัน ${v.sys}/${v.dia} mmHg`, warn: true, text: 'สูงกว่าเกณฑ์ (140/90)', list: ['นั่งพัก 15 นาที แล้ววัดซ้ำ', donor ? 'ลดอาหารเค็ม' : 'ถ้ายังสูง หรือปวดศีรษะ ตาพร่า ให้มาโรงพยาบาล', 'ถ้ายังสูงติดต่อกัน 2 ครั้ง ให้โทรปรึกษาศูนย์ฯ'], buttons: [{ label: 'รับทราบ', primary: true, action: { type: 'reply', text: 'รับทราบ' } }] };
    }
  }
}
