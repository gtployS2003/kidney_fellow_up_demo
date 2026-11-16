import { BusyDialog, useBusyRun } from '@/components/brand/BuddyStates';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Check, ChevronDown, Download, Eye, FileText, Pencil, Printer, Save, type LucideIcon } from 'lucide-react';
import type { PersonRef } from '@/types';
import { DataTag, TextInput } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { cn, fullName, thaiDate } from '@/lib/format';
import { exportWord, printForm, PRINT_ROOT_ID } from './exporters';

interface Props {
  title: string;
  desc: string;
  icon: LucideIcon;
  gradient?: [string, string];
  patient: Pick<PersonRef, 'prefix' | 'firstName' | 'lastName' | 'hn' | 'age' | 'bloodGroup'>;
  dateLabel?: string;
  date: string;
  onDate: (v: string) => void;
  /** หน้าตาเหมือนกระดาษ (A4) */
  preview: ReactNode;
  /** ฟอร์มกรอกข้อมูล */
  children: ReactNode;
  onSave: (draft: boolean) => Promise<void> | void;
  savedInfo?: string;
  fileName: string;
  /** แสดงหมายเหตุใต้ Preview */
  previewNote?: string;
  initialMode?: 'edit' | 'preview';
}

/** โครงฟอร์มทุกขั้นตอนย่อย: หัวฟอร์ม + สลับ กรอกข้อมูล/Preview + Export + แถบผู้ป่วย + ปุ่มบันทึก */
export function FormShell({ title, desc, icon: Icon, gradient = ['#6366f1', '#4f46e5'], patient, dateLabel = 'วันที่กรอกข้อมูล', date, onDate, preview, children, onSave, savedInfo, fileName, previewNote, initialMode = 'edit' }: Props) {
  const [mode, setMode] = useState<'edit' | 'preview'>(initialMode);
  const [menu, setMenu] = useState(false);
  const [saving, setSaving] = useState<null | 'draft' | 'final'>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { busy, run } = useBusyRun();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  async function save(draft: boolean) {
    setSaving(draft ? 'draft' : 'final');
    try {
      await onSave(draft);
      setToast(draft ? 'บันทึกร่างแล้ว' : 'บันทึกเรียบร้อย');
    } catch (e) {
      setToast(e instanceof Error ? `⚠ ${e.message}` : '⚠ บันทึกไม่สำเร็จ');
    } finally {
      setTimeout(() => setToast(null), 2400);
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* หัวฟอร์ม */}
      <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-3.5">
        <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}>
          <Icon className="h-[22px] w-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold text-indigo-800">{title}</p>
          <p className="text-[12.5px] text-slate-600">{desc}</p>
        </div>
        <div className="flex gap-0.5 rounded-[10px] border border-indigo-100 bg-white p-[3px]">
          {(
            [
              ['edit', 'กรอกข้อมูล', Pencil],
              ['preview', 'Preview', Eye],
            ] as const
          ).map(([k, l, I]) => (
            <button key={k} type="button" onClick={() => setMode(k)} className={cn('relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold', mode === k ? 'text-white' : 'text-slate-600')}>
              {mode === k && <motion.span layoutId={`mode-${title}`} className="absolute inset-0 rounded-lg bg-brand-indigo" />}
              <I className="relative h-3.5 w-3.5" />
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
        <div className="relative" ref={menuRef}>
          <Button variant="secondary" size="sm" icon={Download} iconRight={ChevronDown} className="!border-indigo-200 !text-brand-indigo" onClick={() => setMenu(!menu)}>
            Export
          </Button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                className="absolute right-0 z-30 mt-2 w-[220px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop"
              >
                {[
                  { icon: FileText, color: '#dc2626', t: 'PDF', d: 'เลือก “Save as PDF” ในหน้าต่างพิมพ์', fn: printForm },
                  { icon: FileText, color: '#2563eb', t: 'Word (.doc)', d: 'แก้ไขต่อได้', fn: () => exportWord(fileName) },
                  { icon: Printer, color: '#475569', t: 'พิมพ์', d: 'ส่งไปเครื่องพิมพ์', fn: printForm },
                ].map((o) => (
                  <button
                    key={o.t}
                    type="button"
                    onClick={() => {
                      setMenu(false);
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
        </div>
      </div>

      {/* แถบผู้ป่วย (ดึงจากการลงทะเบียน) */}
      <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-blue-200 bg-white px-4 py-3">
        {[
          ['ชื่อ-นามสกุล', fullName(patient)],
          ['HN', patient.hn],
          ['อายุ', `${patient.age} ปี`],
          ['กรุ๊ปเลือด', patient.bloodGroup],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-[11px] text-slate-400">{k}</p>
            <p className="text-sm font-semibold">{v}</p>
          </div>
        ))}
        <DataTag kind="reg" />
        <span className="flex-1" />
        <label className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="h-3 w-3" /> {dateLabel}
          </span>
          <TextInput type="date" className="!h-9 w-[170px]" value={date} onChange={(e) => onDate(e.target.value)} />
        </label>
      </div>

      <>
        {mode === 'edit' ? (
          <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="flex flex-col gap-4">
            {children}
            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="text-xs text-slate-400">{savedInfo ?? 'ยังไม่ได้บันทึก'}</span>
              <span className="flex-1" />
              <Button variant="secondary" icon={Save} disabled={!!saving} onClick={() => save(true)}>
                {saving === 'draft' ? 'กำลังบันทึก…' : 'บันทึกร่าง'}
              </Button>
              <Button variant="indigo" icon={Check} disabled={!!saving} onClick={() => save(false)}>
                {saving === 'final' ? 'กำลังบันทึก…' : 'บันทึก'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-3 overflow-x-auto rounded-2xl bg-slate-200 p-6">
            <div className="flex w-full max-w-[794px] items-center gap-2 text-xs text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">Preview · A4 แนวตั้ง</span>
              <span className="flex-1" />
              <span>Export ได้จากปุ่มด้านบน</span>
            </div>
            <div className="shadow-[0_4px_16px_rgba(0,0,0,.12)]">{preview}</div>
            {previewNote && <p className="max-w-[794px] rounded-lg bg-white px-3 py-2 text-xs text-slate-600">{previewNote}</p>}
          </motion.div>
        )}
      </>

      {/* สำเนาสำหรับพิมพ์ / Export (อยู่นอก #root — แสดงเฉพาะตอนพิมพ์) */}
      {createPortal(
        <div id={PRINT_ROOT_ID} className="print-only">
          {preview}
        </div>,
        document.body,
      )}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-pop">
            <Check className="h-4 w-4 text-green-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <BusyDialog open={!!busy} title={busy ?? ''} desc={title} delay={0} />
    </div>
  );
}

export { thaiDate };
