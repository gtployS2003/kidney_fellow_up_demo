import { motion } from 'framer-motion';
import { BookOpen, CalendarCheck, FlaskConical, Hand, HeartPulse, Pill, Stethoscope, User, type LucideIcon } from 'lucide-react';
import type { PersonKind } from '@/types';
import type { LiffPage } from './notify';
import { Mascot } from './Mascot';

interface Item {
  cap: string;
  label: string;
  icon: LucideIcon;
  page: LiffPage;
}
const COMMON: Item[] = [
  { cap: 'Appointment', label: 'นัดหมาย', icon: CalendarCheck, page: 'appointments' },
  { cap: 'Medication', label: 'การกินยา', icon: Pill, page: 'meds' },
  { cap: 'Kidney', label: 'ค่าไต', icon: FlaskConical, page: 'kidney' },
];
const TAIL: Item[] = [
  { cap: 'Follow-up', label: 'ติดตามอาการ', icon: Stethoscope, page: 'followup' },
  { cap: 'Profile', label: 'Profile', icon: User, page: 'profile' },
];
const BLOB = ['#dbeafe', '#e0e7ff', '#e0f2fe'];

/** Rich menu 3 ชุด (A ลงทะเบียน · B ผู้รับ · C ผู้บริจาค) — สัดส่วน 2500×1686 */
export function RichMenu({ kind, onOpen }: { kind: PersonKind | null; onOpen: (p: LiffPage) => void }) {
  const bg = 'relative overflow-hidden bg-gradient-to-br from-blue-200 to-blue-300';
  const deco = (
    <>
      <span className="absolute -left-4 -top-4 h-16 w-24 rotate-[-45deg] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.45)_0_6px,transparent_6px_13px)]" />
      <span className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/25" />
    </>
  );
  if (!kind)
    return (
      <div className={`${bg} p-2.5`} style={{ aspectRatio: '2500/1686' }}>
        {deco}
        <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={() => onOpen('register')} className="relative flex h-[calc(100%-26px)] w-full items-center gap-2 rounded-2xl bg-white px-3 shadow-[0_6px_16px_-6px_rgba(30,58,138,.35)]">
          <span className="grid h-[118px] w-[118px] shrink-0 place-items-center rounded-full bg-blue-50">
            <Mascot size={104} />
          </span>
          <span className="flex flex-col items-start gap-1.5 text-left">
            <span className="text-[26px] font-bold leading-8 text-blue-900">ลงทะเบียน</span>
            <span className="text-[11px] leading-4 text-slate-500">ยืนยันตัวตนด้วย ThaiD เพื่อเชื่อมต่อ LINE กับศูนย์ฯ</span>
            <span className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white">
              <Hand className="h-3.5 w-3.5" /> แตะเพื่อเริ่ม
            </span>
          </span>
        </motion.button>
        <p className="relative mt-1.5 rounded-full bg-white/70 py-0.5 text-center text-[9px] font-semibold text-blue-900">ศูนย์ปลูกถ่ายไต โรงพยาบาลมหาวิทยาลัยนเรศวร</p>
      </div>
    );
  const items = [...COMMON, kind === 'donor' ? { cap: 'Knowledge', label: 'ความรู้', icon: BookOpen, page: 'knowledge' as LiffPage } : { cap: 'Health log', label: 'บันทึกสุขภาพ', icon: HeartPulse, page: 'health' as LiffPage }, ...TAIL];
  return (
    <div className={`${bg} p-2`} style={{ aspectRatio: '2500/1686' }}>
      {deco}
      <div className="relative grid h-[calc(100%-22px)] grid-cols-3 grid-rows-2 gap-1.5">
        {items.map((it, i) => (
          <motion.button key={it.label} whileTap={{ scale: 0.96 }} type="button" onClick={() => onOpen(it.page)} className="relative flex flex-col items-center overflow-hidden rounded-[14px] border-2 border-blue-100 bg-white px-1 pt-1">
            <span className="self-start pl-1 text-[7.5px] font-semibold tracking-wide text-blue-400">{it.cap}</span>
            <span className="relative mt-0.5 grid h-[46px] w-[46px] place-items-center rounded-full" style={{ background: BLOB[i % 3] }}>
              <span className="absolute left-0 top-1 h-2 w-2 rounded-full bg-yellow-400" />
              <span className="grid h-[30px] w-[30px] -rotate-6 place-items-center rounded-[9px] border-2 border-primary bg-white">
                <it.icon className="h-4 w-4 text-primary" />
              </span>
            </span>
            <span className="mt-1 rounded-full bg-primary px-2.5 py-[3px] text-[10px] font-bold text-white">{it.label}</span>
          </motion.button>
        ))}
      </div>
      <p className="relative mt-1 rounded-full bg-white/70 py-0.5 text-center text-[8.5px] font-semibold text-blue-900">แตะเมนูเพื่อใช้งาน · ศูนย์ปลูกถ่ายไต รพ.ม.นเรศวร</p>
    </div>
  );
}
