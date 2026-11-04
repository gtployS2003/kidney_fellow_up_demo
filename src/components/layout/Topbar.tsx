import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NAV } from './nav';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, ChevronRight, KeyRound, LogOut, PanelLeftClose, PanelLeftOpen, Search, UserRound } from 'lucide-react';
import { useCrumbsValue } from './crumbs';

/** แถบบน: ปุ่มพับเมนู · breadcrumb · ค้นหา · แจ้งเตือน · โปรไฟล์ (มุมขวาบน) */
export function Topbar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const crumbs = useCrumbsValue();
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-6 backdrop-blur print:hidden">
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? 'ขยายเมนู' : 'พับเมนู'}
        aria-label="สลับเมนู"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-slate-600 hover:bg-slate-100"
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
      <nav className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          const to = last ? undefined : crumbLink(crumbs, i);
          return (
            <span key={i} className="flex min-w-0 items-center gap-2">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
              {to ? (
                <Link to={to} className="truncate rounded-md px-1 py-0.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary">
                  {c}
                </Link>
              ) : (
                <span className={last ? 'truncate px-1 font-semibold text-slate-900' : 'truncate px-1 text-slate-500'}>{c}</span>
              )}
            </span>
          );
        })}
      </nav>
      <label className="hidden h-10 w-[260px] items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 lg:flex">
        <Search className="h-4 w-4 text-slate-400" />
        <input placeholder="ค้นหา HN หรือชื่อผู้ป่วย" className="w-full bg-transparent text-[13px] outline-none placeholder:text-slate-400" />
      </label>
      <button type="button" className="relative grid h-10 w-10 place-items-center rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="การแจ้งเตือน">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-red-500" />
      </button>

      <div className="relative" ref={ref}>
        <button type="button" onClick={() => setMenu(!menu)} className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 hover:bg-slate-100">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-500 text-[13px] font-semibold text-white">สก</span>
          <span className="hidden text-left md:block">
            <span className="block whitespace-nowrap text-[13px] font-semibold text-slate-900">นพ.สมเกียรติ วงศ์ไทย</span>
            <span className="block whitespace-nowrap text-[11px] text-slate-500">แพทย์ · อายุรกรรมโรคไต</span>
          </span>
          <motion.span animate={{ rotate: menu ? 180 : 0 }}>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </motion.span>
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold">นพ.สมเกียรติ วงศ์ไทย</p>
                <p className="text-xs text-slate-500">ทีมแพทย์และพยาบาล</p>
              </div>
              <div className="p-1.5">
                {[
                  [UserRound, 'ข้อมูลส่วนตัว'],
                  [KeyRound, 'เปลี่ยนรหัสผ่าน'],
                ].map(([I, t]) => {
                  const Icon = I as typeof UserRound;
                  return (
                    <button key={t as string} type="button" onClick={() => setMenu(false)} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50">
                      <Icon className="h-4 w-4 text-slate-500" /> {t as string}
                    </button>
                  );
                })}
                <Link to="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> ออกจากระบบ
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

/** หาเส้นทางของ breadcrumb จากโครงเมนู (NAV): ชื่อกลุ่ม → หน้าแรกของกลุ่ม, ชื่อเมนูย่อย → หน้านั้น */
function crumbLink(crumbs: string[], i: number): string | undefined {
  const group = NAV.find((g) => g.label === crumbs[0]);
  if (!group) return undefined;
  if (i === 0) return group.to ?? group.children?.[0].to;
  return group.children?.find((c) => c.label === crumbs[i])?.to;
}
