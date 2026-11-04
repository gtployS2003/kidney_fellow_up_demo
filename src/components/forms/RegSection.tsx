import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { fadeUp } from '@/components/ui/motion';

/** หัวข้อในฟอร์มลงทะเบียน (ผู้รับ / ผู้บริจาค) */
export function Section({ id, n, title, sub, children, onFocus }: { id: string; n: number; title: string; sub?: string; children: ReactNode; onFocus: (id: string) => void }) {
  return (
    <motion.div variants={fadeUp} id={id} className="scroll-mt-24" onFocusCapture={() => onFocus(id)} onMouseEnter={() => onFocus(id)}>
      <Card animate={false} className="flex flex-col gap-[18px] p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-[13px] font-bold text-primary">{n}</span>
          <div>
            <h2 className="text-base font-bold">{title}</h2>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
          </div>
        </div>
        {children}
      </Card>
    </motion.div>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[13px] font-bold text-slate-600">{children}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

