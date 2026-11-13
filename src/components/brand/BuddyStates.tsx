import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { KidneyBuddy } from './KidneyBuddy';

/** กล่องยืนยันเมื่อบันทึกผลสำคัญสำเร็จ (MRB ผ่าน · ได้รับไต · ส่งรายชื่อ · เผยแพร่บทความ) */
export function SuccessDialog({ open, onClose, title, desc, actions }: { open: boolean; onClose: () => void; title: string; desc?: ReactNode; actions?: ReactNode }) {
  return (
    <Modal open={open} onClose={onClose} width={460}>
      <div className="flex flex-col items-center gap-2 text-center">
        <KidneyBuddy pose="success" size={140} />
        <h3 className="text-xl font-bold">{title}</h3>
        {desc && <p className="text-sm text-slate-600">{desc}</p>}
        <div className="mt-3 flex w-full flex-wrap justify-center gap-2">
          {actions ?? (
            <Button variant="secondary" onClick={onClose}>
              ปิด
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** กล่องรอสำหรับงานที่ใช้เวลา (Export · ค้นหา HLA) · แสดงหลังรอเกิน delay เพื่อไม่ให้กระพริบ */
export function BusyDialog({ open, title, desc, delay = 300 }: { open: boolean; title: string; desc?: string; delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!open) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [open, delay]);
  return (
    <Modal open={show} onClose={() => undefined} width={380}>
      <div className="flex flex-col items-center gap-2 text-center" role="status" aria-live="polite">
        <KidneyBuddy pose="loading" size={120} />
        <h3 className="text-lg font-bold">{title}</h3>
        {desc && <p className="text-sm text-slate-500">{desc}</p>}
        <div className="mt-2 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-slate-100">
          <motion.div className="h-full w-1/3 rounded-full bg-primary" animate={{ x: ['-100%', '300%'] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }} />
        </div>
      </div>
    </Modal>
  );
}

/** รันงาน export โดยแสดง BusyDialog อย่างน้อย minMs แล้วค่อยเรียกงานจริง */
export function useBusyRun(minMs = 900) {
  const [busy, setBusy] = useState<string | null>(null);
  const run = (title: string, fn: () => void) => {
    setBusy(title);
    setTimeout(() => {
      setBusy(null);
      setTimeout(fn, 80);
    }, minMs);
  };
  return { busy, run };
}

/** โหลดข้อมูลไม่สำเร็จ / เชื่อมต่อไม่ได้ */
export function ErrorState({ title, desc, onRetry, code }: { title: string; desc?: string; onRetry?: () => void; code?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center" role="alert">
      <KidneyBuddy pose="error" size={150} />
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {desc && <p className="max-w-md text-sm text-slate-500">{desc}</p>}
      {onRetry && (
        <Button icon={RefreshCw} onClick={onRetry} className="mt-2">
          ลองใหม่
        </Button>
      )}
      {code && <p className="mt-2 text-xs text-slate-400">รหัสอ้างอิง: {code} · {new Date().toLocaleString('th-TH')} · แจ้งฝ่าย IT หากยังไม่หาย</p>}
    </div>
  );
}
