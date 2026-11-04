import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, CircleHelp } from 'lucide-react';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { fadeUp, stagger } from '@/components/ui/motion';
import { REPORTS } from '../defs';

export function PendingTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
      <CircleHelp className="h-3 w-3" /> รอยืนยัน
    </span>
  );
}

export default function ReportsHub() {
  useCrumbs(['รายงาน']);
  return (
    <>
      <PageHeader
        title="รายงาน"
        subtitle="ทุกรายงานมีตัวกรองช่วงเวลา · กราฟ + ตาราง · Export Word / PDF"
        actions={
          <span className="inline-flex items-center gap-2 rounded-[10px] border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] font-semibold text-amber-800">
            <CircleHelp className="h-4 w-4" /> รายการรายงานทั้งหมด “รอยืนยัน” กับหน้างาน
          </span>
        }
      />
      <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REPORTS.map((r, i) => (
          <motion.div key={r.key} variants={fadeUp} whileHover={{ y: -3 }}>
            <Link to={`/clinical/reports/${r.key}`} className="flex h-full flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-[18px] hover:border-primary/50 hover:shadow-pop">
              <div className="flex items-center">
                <span className="grid h-10 w-10 place-items-center rounded-[10px]" style={{ background: r.bg, color: r.fg }}>
                  <r.icon className="h-5 w-5" />
                </span>
                <span className="flex-1" />
                <PendingTag />
              </div>
              <p className="text-[15px] font-bold">
                {i + 1}. {r.title}
              </p>
              <p className="flex-1 text-[12.5px] text-slate-500">{r.desc}</p>
              <span className="flex items-center gap-1 text-[13px] font-semibold text-primary">
                {r.sample ? 'ดูรายงาน' : 'ดูโครงรายงาน'} <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
