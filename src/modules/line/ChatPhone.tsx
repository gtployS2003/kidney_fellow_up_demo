import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronUp, Keyboard, Menu, Search, SendHorizontal, ShieldCheck } from 'lucide-react';
import { useSim } from './store';
import { FlexCard } from './FlexCard';
import { RichMenu } from './RichMenu';
import { Mascot } from './Mascot';
import { KidneyBuddy } from '@/components/brand/KidneyBuddy';
import { RegisterPage } from './liff/RegisterPage';
import { AppointmentsPage, FollowUpPage, HealthPage, KidneyPage, KnowledgePage, MedsPage, ProfilePage, SettingsPage } from './liff/Pages';
import { cn } from '@/lib/format';

/** หน้าจอ LINE จำลอง: แชท · Rich menu · หน้า LIFF (เปิดซ้อนในโทรศัพท์) */
export function ChatPhone() {
  const { messages, persona, liff, openLiff, pressButton, sendUserText } = useSim();
  const [menuOpen, setMenuOpen] = useState(true);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, menuOpen]);

  const send = () => {
    if (!text.trim()) return;
    sendUserText(text.trim());
    setText('');
  };
  const page = liff?.page;
  const needPersona = page && page !== 'register' && !persona;

  return (
    <div className="relative h-[820px] w-[400px] shrink-0 rounded-[54px] bg-slate-900 p-[11px] shadow-2xl">
      <div className="relative flex h-full flex-col overflow-hidden rounded-[44px] bg-white">
        {/* status bar */}
        <div className="flex h-11 shrink-0 items-center justify-between px-7 text-[14px] font-semibold">
          <span>9:41</span>
          <span className="h-7 w-28 rounded-full bg-slate-900" />
          <span className="text-[11px]">●●● 5G</span>
        </div>
        {/* LINE header */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 px-3">
          <ChevronLeft className="h-6 w-6" />
          <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[#06c755]">
            <ShieldCheck className="h-3 w-3 text-white" strokeWidth={2.6} />
          </span>
          <b className="flex-1 truncate text-[15px]">ศูนย์ปลูกถ่ายไต รพ.ม.นเรศวร</b>
          <Search className="h-5 w-5" />
          <Menu className="h-5 w-5" />
        </div>
        {/* chat */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#c6d4e4] px-3 py-3">
          <AnimatePresence initial={false}>
            {messages.map((m) =>
              m.type === 'date' ? (
                <div key={m.id} className="mx-auto rounded-full bg-white/55 px-3 py-0.5 text-[10.5px] text-slate-600">
                  {m.text}
                </div>
              ) : (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={cn('flex items-end gap-2', m.from === 'user' && 'flex-row-reverse')}>
                  {m.from === 'bot' && (
                    <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white">
                      <Mascot size={30} />
                    </span>
                  )}
                  {m.type === 'flex' ? (
                    <FlexCard d={m.data} answered={m.answered} onPress={(i) => pressButton(m.id, i)} />
                  ) : m.type === 'sticker' ? (
                    <KidneyBuddy pose={m.pose} size={128} />
                  ) : (
                    <span className={cn('max-w-[250px] whitespace-pre-line rounded-[18px] px-3.5 py-2 text-[13px] leading-5', m.from === 'user' ? 'bg-[#8de055]' : 'bg-white')}>{m.text}</span>
                  )}
                  <span className="pb-0.5 text-[9.5px] text-slate-500">{m.time}</span>
                </motion.div>
              ),
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
        {/* rich menu */}
        <AnimatePresence initial={false}>
          {menuOpen && !typing && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="shrink-0 overflow-hidden">
              <RichMenu kind={persona?.kind ?? null} onOpen={(p) => openLiff(p)} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* bottom bar */}
        {typing ? (
          <div className="flex h-12 shrink-0 items-center gap-2 border-t border-slate-200 px-3">
            <button type="button" onClick={() => setTyping(false)} aria-label="แสดงเมนู" className="rounded p-1 text-slate-500">
              <Menu className="h-5 w-5" />
            </button>
            <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Aa" className="h-9 flex-1 rounded-full bg-slate-100 px-4 text-[13px] outline-none" />
            <button type="button" onClick={send} aria-label="ส่ง" className="text-primary">
              <SendHorizontal className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex h-11 shrink-0 items-center border-t border-slate-200 px-4">
            <button type="button" onClick={() => setTyping(true)} aria-label="พิมพ์ข้อความ" className="text-slate-500">
              <Keyboard className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="flex flex-1 items-center justify-center gap-1 text-[13px] font-semibold text-slate-700">
              {persona ? (persona.kind === 'donor' ? 'เมนูผู้บริจาคไต' : 'เมนูผู้รับไต') : 'เมนู'} {menuOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
            <span className="w-5" />
          </div>
        )}
        <div className="flex h-5 shrink-0 items-center justify-center">
          <span className="h-[5px] w-32 rounded-full bg-slate-900" />
        </div>

        {/* LIFF overlay */}
        <AnimatePresence>
          {page && (
            <motion.div key={page} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className="absolute inset-x-0 bottom-0 top-11 z-40 overflow-hidden rounded-t-2xl bg-white">
              {page === 'register' && <RegisterPage />}
              {needPersona && <p className="p-8 text-center text-sm text-slate-500">กรุณาลงทะเบียนก่อน</p>}
              {persona && page === 'appointments' && <AppointmentsPage p={persona} />}
              {persona && page === 'meds' && <MedsPage p={persona} tab={liff?.tab} />}
              {persona && page === 'kidney' && <KidneyPage p={persona} />}
              {persona && page === 'health' && <HealthPage p={persona} tab={liff?.tab} />}
              {persona && page === 'followup' && <FollowUpPage p={persona} />}
              {persona && page === 'profile' && <ProfilePage p={persona} />}
              {persona && page === 'settings' && <SettingsPage p={persona} />}
              {persona && page === 'knowledge' && <KnowledgePage p={persona} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
