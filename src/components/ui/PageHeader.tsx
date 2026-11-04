import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function PageHeader({ title, subtitle, actions, leading }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; leading?: ReactNode }) {
  return (
    <motion.div
      className="flex flex-wrap items-center gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </motion.div>
  );
}
