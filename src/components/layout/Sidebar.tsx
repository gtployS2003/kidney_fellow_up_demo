import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/format';
import { NAV } from './nav';

/** แถบเมนูซ้าย — พับเหลือไอคอนได้ (ปุ่ม toggle อยู่บน Topbar) */
export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeGroup = NAV.find((g) => pathname.startsWith(g.base))?.key;
  const [open, setOpen] = useState<Record<string, boolean>>(() => (activeGroup ? { [activeGroup]: true } : {}));

  useEffect(() => {
    if (activeGroup) setOpen((o) => ({ ...o, [activeGroup]: true }));
  }, [activeGroup]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      className="sticky top-0 flex h-screen shrink-0 flex-col gap-1 overflow-y-auto overflow-x-hidden bg-brand-sidebar px-3 py-5 print:hidden"
    >
      <Link to="/" className={cn('mb-4 flex items-center gap-2.5 px-1', collapsed && 'justify-center px-0')}>
        <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-primary text-sm font-bold text-white">KT</span>
        {!collapsed && (
          <span className="whitespace-nowrap">
            <span className="block text-sm font-bold text-white">Kidney Transplant</span>
            <span className="block text-[11px] text-slate-400">Follow-up System</span>
          </span>
        )}
      </Link>
      {!collapsed && (
        <span className="mx-1 inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-lg bg-white/[.06] px-2.5 py-1.5 text-xs font-medium text-teal-200">
          <Activity className="h-3.5 w-3.5 text-teal-300" /> ทีมแพทย์และพยาบาล
        </span>
      )}
      <p className={cn('pb-1.5 pt-4 text-[11px] font-semibold text-slate-500', collapsed ? 'text-center' : 'px-3')}>{collapsed ? '•••' : 'เมนูหลัก'}</p>

      {NAV.map((g) => {
        const Icon = g.icon;
        const isActive = activeGroup === g.key;
        const base = 'relative flex w-full items-center gap-2.5 rounded-lg py-2.5 text-left text-sm font-medium transition-colors';

        // โหมดพับ: แสดงเฉพาะไอคอน — คลิกไปหน้าแรกของกลุ่ม
        if (collapsed) {
          const to = g.to ?? g.children![0].to;
          return (
            <button key={g.key} type="button" title={g.label} onClick={() => navigate(to)} className={cn(base, 'justify-center px-0', isActive ? 'bg-white/[.12] text-white' : 'text-slate-300 hover:bg-white/[.06]')}>
              {isActive && <motion.span layoutId="nav-bar" className="absolute left-0 top-2.5 h-5 w-[3px] rounded bg-blue-400" />}
              <Icon className="h-5 w-5" />
            </button>
          );
        }

        if (!g.children) {
          return (
            <NavLink key={g.key} to={g.to!} className={({ isActive: a }) => cn(base, 'px-3', a ? 'bg-white/[.12] font-semibold text-white' : 'text-slate-200 hover:bg-white/[.06]')}>
              {({ isActive: a }) => (
                <>
                  {a && <motion.span layoutId="nav-bar" className="absolute left-0 top-2.5 h-5 w-[3px] rounded bg-blue-400" />}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="whitespace-nowrap">{g.label}</span>
                </>
              )}
            </NavLink>
          );
        }
        const isOpen = !!open[g.key];
        return (
          <div key={g.key}>
            <button type="button" onClick={() => setOpen((o) => ({ ...o, [g.key]: !isOpen }))} className={cn(base, 'px-3 hover:bg-white/[.06]', isActive ? 'text-white' : 'text-slate-200')}>
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 whitespace-nowrap">{g.label}</span>
              <motion.span animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="overflow-hidden">
                  {g.children.map((c) => (
                    <NavLink
                      key={c.to}
                      to={c.to}
                      end={c.end}
                      className={({ isActive: a }) => cn('relative flex items-center gap-2.5 whitespace-nowrap rounded-lg py-[7px] pl-[42px] pr-3 text-[13px] transition-colors', a ? 'bg-white/[.12] font-semibold text-white' : 'text-slate-300 hover:bg-white/[.06]')}
                    >
                      {({ isActive: a }) => (
                        <>
                          {a && <motion.span layoutId="nav-bar" className="absolute left-0 top-2 h-[18px] w-[3px] rounded bg-blue-400" />}
                          <span className={cn('h-1.5 w-1.5 rounded-full', a ? 'bg-blue-400' : 'bg-white/35')} />
                          {c.label}
                        </>
                      )}
                    </NavLink>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.aside>
  );
}
