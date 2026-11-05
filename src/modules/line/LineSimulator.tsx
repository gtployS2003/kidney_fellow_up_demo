import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BellRing, History, Info, RotateCcw, Smartphone, Stethoscope } from 'lucide-react';
import { SimProvider, useSim } from './store';
import { ChatPhone } from './ChatPhone';
import { PERSONAS, fullName, type PersonaKey } from './personas';
import { NOTIFY_LIST } from './notify';
import { cn } from '@/lib/format';

/** หน้าเดโม LINE OA (จำลอง) — ทดลองส่งข้อความ / กดปุ่มตอบกลับ / เปิดหน้า LIFF โดยไม่เชื่อม LINE จริง */
export default function LineSimulator() {
  return (
    <SimProvider>
      <Inner />
    </SimProvider>
  );
}

function Inner() {
  const { active, setActive, persona, sendNotify, log, reset } = useSim();
  const users: [PersonaKey, string, string][] = [
    ['guest', 'ผู้ใช้ใหม่ (ยังไม่ลงทะเบียน)', 'Rich menu A · ลงทะเบียน'],
    ...Object.values(PERSONAS).map((p) => [p.key, fullName(p), `${p.kind === 'donor' ? 'ผู้บริจาค' : 'ผู้รับ'} · ${p.stage}`] as [PersonaKey, string, string]),
  ];
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="หน้าแรก">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Smartphone className="h-5 w-5 text-[#06c755]" />
        <div className="flex-1">
          <p className="font-bold">LINE OA · ผู้รับและผู้บริจาค (เดโมจำลอง)</p>
          <p className="text-xs text-slate-500">ไม่ได้เชื่อม LINE จริง · ข้อความ ปุ่มตอบกลับ และหน้า LIFF ทำงานในเบราว์เซอร์</p>
        </div>
        <Link to="/clinical/recipients" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Stethoscope className="h-4 w-4" /> ระบบแพทย์/พยาบาล
        </Link>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 p-6 lg:flex-row lg:items-start lg:justify-center">
        <ChatPhone />
        <div className="flex w-full max-w-[460px] flex-col gap-4">
          <section className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-bold">1 · ผู้ใช้ในโทรศัพท์</p>
            {users.map(([k, n, s]) => (
              <button key={k} type="button" onClick={() => setActive(k)} className={cn('flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left', active === k ? 'border-primary bg-blue-50' : 'border-slate-200 hover:bg-slate-50')}>
                <span className={cn('h-4 w-4 rounded-full border-2', active === k ? 'border-[5px] border-primary' : 'border-slate-300')} />
                <span className="flex-1">
                  <b className="block text-sm">{n}</b>
                  <span className="text-xs text-slate-500">{s}</span>
                </span>
              </button>
            ))}
            <p className="flex items-start gap-1.5 text-xs text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> เลือก “ผู้ใช้ใหม่” แล้วกด “ลงทะเบียน” ในโทรศัพท์ เพื่อทดลองยืนยันตัวตน (ThaiD จำลอง) และดู Rich menu เปลี่ยนอัตโนมัติ
            </p>
          </section>
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              <p className="flex-1 font-bold">2 · ส่งแจ้งเตือนทดสอบ (จากระบบ)</p>
              <button type="button" onClick={reset} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700">
                <RotateCcw className="h-3.5 w-3.5" /> ล้างแชท
              </button>
            </div>
            {!persona ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">ผู้ใช้ยังไม่ได้ลงทะเบียน · ระบบยังส่งแจ้งเตือนไม่ได้</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {NOTIFY_LIST.map((n) => (
                  <motion.button key={n.no} whileTap={{ scale: 0.97 }} type="button" onClick={() => sendNotify(n.no)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-[13px] hover:border-primary hover:bg-blue-50">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">{n.no}</span>
                    {n.label}
                  </motion.button>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500">ข้อ 9 จะส่งอัตโนมัติด้วย เมื่อบันทึกความดันเกิน 140/90 ในหน้า “บันทึกสุขภาพ”</p>
          </section>
          <section className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="flex items-center gap-2 font-bold">
              <History className="h-4 w-4 text-slate-500" /> 3 · สิ่งที่ระบบได้รับ (postback / บันทึก)
            </p>
            {log.length === 0 && <p className="text-sm text-slate-400">ยังไม่มี · ลองกดปุ่มในข้อความ หรือบันทึกข้อมูลในหน้า LIFF</p>}
            {log.map((e, i) => (
              <div key={i} className={cn('flex gap-3 py-2 text-[13px]', i > 0 && 'border-t border-slate-100')}>
                <span className="w-12 shrink-0 text-xs text-slate-400">{e.time}</span>
                <span>
                  <b className="block">{e.who}</b>
                  <span className="text-slate-600">{e.text}</span>
                </span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
