import { motion } from 'framer-motion';
import { Activity, Info, Smartphone, Stethoscope, Workflow, Gift, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fadeUp, stagger } from '@/components/ui/motion';

interface Entry {
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  href: string;
  /** ลิงก์ไปหน้า static เดิม (public/legacy) */
  legacy?: boolean;
}

// เหลือ 4 ปุ่มตามที่กำหนด — หน้าตาเหมือน index.html เดิม
const ENTRIES: Entry[] = [
  { title: 'Use Case Diagram', desc: 'ภาพรวม Actor และฟังก์ชันการทำงานทั้งระบบ', icon: Workflow, color: '#4338ca', bg: '#eef2ff', href: `${import.meta.env.BASE_URL}legacy/usecase-diagram.html`, legacy: true },
  { title: 'แพทย์และพยาบาล', desc: 'แดชบอร์ดและเครื่องมือของทีมแพทย์และพยาบาล', icon: Stethoscope, color: '#2563eb', bg: '#dbeafe', href: '/clinical/recipients' },
  { title: 'LINE OA (ผู้รับ & ผู้บริจาค)', desc: 'เดโมจำลองแชท LINE · Rich menu · แจ้งเตือน · หน้า LIFF', icon: Smartphone, color: '#06c755', bg: '#dcfce7', href: '/line' },
];

export default function Home() {
  return (
    <div className="home-bg min-h-screen">
      <div className="home-mesh relative flex min-h-screen flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <header className="relative flex items-center gap-3 p-6 text-white lg:p-8">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Kidney Transplant</p>
            <p className="text-sm text-blue-100">Follow-up System</p>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col items-center justify-center px-6 pb-12 text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            <Info className="h-3.5 w-3.5" /> ระบบเวอร์ชันสาธิต (Mockup)
          </span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl text-3xl font-bold leading-snug text-white lg:text-4xl">
            ระบบติดตามผู้ป่วยปลูกถ่ายไตแบบครบวงจร
          </motion.h1>
          <p className="mt-3 max-w-xl leading-relaxed text-blue-100">เลือกส่วนของระบบที่ต้องการเข้าดู — ภาพรวมการทำงานของระบบ หรือหน้าจอใช้งานจริงของแต่ละบทบาท</p>

          <motion.div variants={stagger(0.07, 0.15)} initial="hidden" animate="show" className="mt-10 grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ENTRIES.map((e) => {
              const body = (
                <>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl transition group-hover:scale-105" style={{ background: e.bg, color: e.color }}>
                    <e.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{e.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{e.desc}</p>
                  </div>
                </>
              );
              const cls = 'card-glass group flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center transition hover:-translate-y-1 hover:shadow-xl';
              return (
                <motion.div key={e.title} variants={fadeUp}>
                  {e.legacy ? (
                    <a href={e.href} className={cls}>{body}</a>
                  ) : (
                    <Link to={e.href} className={cls}>{body}</Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </main>

        <footer className="relative pb-6 text-center">
          <p className="text-xs text-blue-100/80">© 2569 Kidney Transplant Follow-up System · Hospital Enterprise Software</p>
        </footer>
      </div>
    </div>
  );
}
