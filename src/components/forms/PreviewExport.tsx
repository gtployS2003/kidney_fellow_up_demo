import { BusyDialog, useBusyRun } from '@/components/brand/BuddyStates';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Download, Eye, FileText, Pencil, Printer, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/format';
import { exportWord, printForm } from './exporters';
import { PrintArea } from './PrintArea';

export type ViewMode = 'edit' | 'preview';

/** สลับ “กรอกข้อมูล / Preview” (ใช้ร่วมกันทุกหน้าที่มีแบบฟอร์มกระดาษ) */
export function ModeToggle({ mode, onChange, id, editLabel = 'กรอกข้อมูล', editIcon: EditIcon = Pencil }: { mode: ViewMode; onChange: (m: ViewMode) => void; id: string; editLabel?: string; editIcon?: LucideIcon }) {
  return (
    <div className="flex gap-0.5 rounded-[10px] border border-indigo-100 bg-white p-[3px]">
      {(
        [
          ['edit', editLabel, EditIcon],
          ['preview', 'Preview', Eye],
        ] as const
      ).map(([k, l, I]) => (
        <button key={k} type="button" onClick={() => onChange(k)} className={cn('relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold', mode === k ? 'text-white' : 'text-slate-600')}>
          {mode === k && <motion.span layoutId={`mode-${id}`} className="absolute inset-0 rounded-lg bg-brand-indigo" />}
          <I className="relative h-3.5 w-3.5" />
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  );
}

/** ปุ่ม Export (PDF / Word / พิมพ์) — ส่งออกจากเนื้อหาใน PrintArea ของหน้านั้น */
export function ExportMenu({ fileName, title }: { fileName: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { busy, run } = useBusyRun();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" size="sm" icon={Download} iconRight={ChevronDown} className="!border-indigo-200 !text-brand-indigo" onClick={() => setOpen(!open)}>
        Export
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} className="absolute right-0 z-30 mt-2 w-[220px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop">
            {[
              {
                icon: FileText,
                color: '#dc2626',
                t: 'PDF',
                d: 'เลือก “Save as PDF” ในหน้าต่างพิมพ์',
                fn: printForm,
              },
              {
                icon: FileText,
                color: '#2563eb',
                t: 'Word (.doc)',
                d: 'แก้ไขต่อได้',
                fn: () => exportWord(fileName),
              },
              {
                icon: Printer,
                color: '#475569',
                t: 'พิมพ์',
                d: 'ส่งไปเครื่องพิมพ์',
                fn: printForm,
              },
            ].map((o) => (
              <button
                key={o.t}
                type="button"
                onClick={() => {
                  setOpen(false);
                  run(o.t === 'พิมพ์' ? 'กำลังเตรียมเอกสาร…' : `กำลังสร้างไฟล์ ${o.t.split(' ')[0]}…`, o.fn);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
              >
                <o.icon className="h-[18px] w-[18px]" style={{ color: o.color }} />
                <span>
                  <span className="block text-[13px] font-semibold">{o.t}</span>
                  <span className="block text-[11px] text-slate-400">{o.d}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <BusyDialog open={!!busy} title={busy ?? ''} desc={title} delay={0} />
    </div>
  );
}

/** พื้นที่แสดงกระดาษ A4 (โหมด Preview) */
export function PreviewCanvas({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-3 overflow-x-auto rounded-2xl bg-slate-200 p-6">
      <div className="flex w-full max-w-[794px] items-center gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-white px-3 py-1">Preview · A4 แนวตั้ง</span>
        <span className="flex-1" />
        <span>Export ได้จากปุ่มด้านบน</span>
      </div>
      <div className="shadow-[0_4px_16px_rgba(0,0,0,.12)]">{children}</div>
      {note && <p className="max-w-[794px] rounded-lg bg-white px-3 py-2 text-xs text-slate-600">{note}</p>}
    </motion.div>
  );
}

export { PrintArea };
