import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Check, FileText, Pencil, Save, type LucideIcon } from 'lucide-react';
import type { PersonRef } from '@/types';
import { DataTag, TextInput } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { cn, fullName, thaiDate } from '@/lib/format';
import { ExportMenu, ModeToggle, PreviewCanvas, PrintArea } from './PreviewExport';

interface Props {
  title: string;
  desc: string;
  icon: LucideIcon;
  gradient?: [string, string];
  patient: Pick<PersonRef, 'prefix' | 'firstName' | 'lastName' | 'hn' | 'age' | 'bloodGroup'>;
  dateLabel?: string;
  date: string;
  onDate?: (v: string) => void;
  /** หน้าตาเหมือนกระดาษ (A4) */
  preview: ReactNode;
  /** ฟอร์มกรอกข้อมูล */
  children: ReactNode;
  onSave?: (draft: boolean) => Promise<void> | void;
  savedInfo?: string;
  fileName: string;
  /** แสดงหมายเหตุใต้ Preview */
  previewNote?: string;
  initialMode?: 'edit' | 'preview';
  /** ดูอย่างเดียว (ข้อมูลดึงจาก iMed) — ไม่มีปุ่มบันทึก · สลับ “ดูข้อมูล / Preview” */
  readOnly?: boolean;
  /** แถบแจ้งใต้หัวฟอร์ม (เช่น ที่มาของข้อมูล) */
  notice?: ReactNode;
}

/** โครงฟอร์มทุกขั้นตอนย่อย: หัวฟอร์ม + สลับ กรอกข้อมูล/Preview + Export + แถบผู้ป่วย + ปุ่มบันทึก */
export function FormShell({ title, desc, icon: Icon, gradient = ['#6366f1', '#4f46e5'], patient, dateLabel = 'วันที่กรอกข้อมูล', date, onDate, preview, children, onSave, savedInfo, fileName, previewNote, initialMode = 'edit', readOnly, notice }: Props) {
  const [mode, setMode] = useState<'edit' | 'preview'>(initialMode);
  const [saving, setSaving] = useState<null | 'draft' | 'final'>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function save(draft: boolean) {
    if (!onSave) return;
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
        <span
          className="grid h-11 w-11 place-items-center rounded-xl text-white"
          style={{
            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          }}
        >
          <Icon className="h-[22px] w-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold text-indigo-800">{title}</p>
          <p className="text-[12.5px] text-slate-600">{desc}</p>
        </div>
        <ModeToggle id={title} mode={mode} onChange={setMode} editLabel={readOnly ? 'ดูข้อมูล' : 'กรอกข้อมูล'} editIcon={readOnly ? FileText : Pencil} />
        <ExportMenu fileName={fileName} title={title} />
      </div>

      {notice}

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
          {readOnly || !onDate ? <span className="text-sm font-semibold">{thaiDate(date)}</span> : <TextInput type="date" className="!h-9 w-[170px]" value={date} onChange={(e) => onDate(e.target.value)} />}
        </label>
      </div>

      <>
        {mode === 'edit' ? (
          <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="flex flex-col gap-4">
            {children}
            {!readOnly && (
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
            )}
          </motion.div>
        ) : (
          <PreviewCanvas note={previewNote}>{preview}</PreviewCanvas>
        )}
      </>

      {/* สำเนาสำหรับพิมพ์ / Export (อยู่นอก #root — แสดงเฉพาะตอนพิมพ์) */}
      <PrintArea>{preview}</PrintArea>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-pop">
            <Check className="h-4 w-4 text-green-400" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { thaiDate };
