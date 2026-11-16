import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/** หน้าว่าง — ภายหลังสามารถสลับไอคอนเป็น Lottie (@lottiefiles/dotlottie-react) ได้ที่ไฟล์นี้ไฟล์เดียว */
export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <motion.span
        className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <Icon className="h-7 w-7" />
      </motion.span>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action}
    </div>
  );
}
