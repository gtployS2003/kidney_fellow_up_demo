import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronsLeft, type LucideIcon } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import { postopApi, type PostopSection } from '@/services/api/postopApi';
import { Badge, TONES } from '@/components/ui/Badge';
import { cn, thaiDate } from '@/lib/format';

/** โหลด/บันทึกข้อมูลขั้นตอนหลังผ่าตัด 1 หัวข้อ */
export function usePostop<T>(kind: PersonKind, person: PersonRef, section: PostopSection, filled: boolean) {
  const [data, setData] = useState<T | null>(null);
  const [info, setInfo] = useState<string | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    setData(null);
    postopApi.get<T>(kind, person, section, filled).then((r) => {
      if (!alive) return;
      setData(r.data);
      setInfo(r.savedAt ? `บันทึกล่าสุด ${thaiDate(r.savedAt)}` : undefined);
    });
    return () => {
      alive = false;
    };
  }, [kind, person, section, filled]);
  const patch = (p: Partial<T>) => setData((d) => (d ? { ...d, ...p } : d));
  const save = async () => {
    if (!data) return;
    const at = await postopApi.save(kind, person.id, section, data);
    setInfo(`บันทึกล่าสุด ${thaiDate(at)} · นพ.สมเกียรติ วงศ์ไทย`);
  };
  return { data, setData, patch, save, info };
}

export interface SubItem {
  key: string;
  num: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  tint: string;
  fg: string;
  badge?: number;
  done?: boolean;
}

/** เมนูขั้นตอนย่อยด้านซ้าย (พับได้) — ใช้กับ ก่อนกลับบ้าน / ติดตาม OPD */
export function SubNav({ items, sel, onSel, children }: { items: SubItem[]; sel: string; onSel: (k: string) => void; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const done = items.filter((i) => i.done).length;
  return (
    <div className="flex items-start gap-5">
      <motion.nav animate={{ width: collapsed ? 64 : 290 }} className="sticky top-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5">
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
          {!collapsed && (
            <>
              <span className="text-xs font-semibold text-slate-600">ขั้นตอนย่อย</span>
              <Badge label={`${done}/${items.length}`} tone={TONES.slate} />
              <span className="flex-1" />
            </>
          )}
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="พับเมนู">
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} className="block">
              <ChevronsLeft className="h-4 w-4" />
            </motion.span>
          </button>
        </div>
        {items.map((it, i) => (
          <button key={it.key} type="button" title={it.title} onClick={() => onSel(it.key)} className={cn('relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left', i > 0 && 'mt-0.5')}>
            {sel === it.key && <motion.span layoutId="postop-sub" className="absolute inset-0 rounded-xl bg-indigo-50" />}
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[10px]" style={{ background: it.tint, color: it.fg }}>
              <it.icon className="h-[18px] w-[18px]" />
            </span>
            {!collapsed && (
              <>
                <span className="relative min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-400">{it.num}</span>
                    <span className={cn('truncate text-sm font-bold', sel === it.key && 'text-indigo-800')}>{it.title}</span>
                  </span>
                  <span className="block truncate text-xs text-slate-400">{it.sub}</span>
                </span>
                {it.badge ? (
                  <span className="relative grid h-[22px] w-[22px] place-items-center rounded-full bg-red-500 text-[11px] font-bold text-white">{it.badge}</span>
                ) : it.done ? (
                  <span className="relative grid h-[22px] w-[22px] place-items-center rounded-full bg-green-600">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </span>
                ) : null}
              </>
            )}
          </button>
        ))}
      </motion.nav>
      <div className="min-w-0 flex-1">
        <motion.div key={sel} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function Kv({ k, v, tone }: { k: string; v: ReactNode; tone?: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{k}</p>
      <p className="text-sm font-semibold" style={tone ? { color: tone } : undefined}>
        {v || '—'}
      </p>
    </div>
  );
}
