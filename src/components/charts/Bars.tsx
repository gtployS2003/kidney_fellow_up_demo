import { motion } from 'framer-motion';

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

/** กราฟแท่งแนวตั้งแบบเบา (ไม่ใช้ไลบรารีเพิ่ม) — แท่งค่อย ๆ โตขึ้นตอนแสดง */
export function Bars({ data, height = 150, color = '#2563eb', unit = '' }: { data: BarDatum[]; height?: number; color?: string; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2.5" style={{ height: height + 44 }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-semibold text-slate-600">
            {d.value}
            {unit}
          </span>
          <motion.div
            className="w-full max-w-[56px] rounded-t-md"
            style={{ background: d.color ?? color }}
            initial={{ height: 0 }}
            animate={{ height: Math.max(3, Math.round((height * d.value) / max)) }}
            transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
          />
          <span className="w-full truncate text-center text-[10.5px] text-slate-400" title={d.label}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** แถบแนวนอน (ใช้แสดงสัดส่วน/เหตุผล) */
export function HBars({ data, color = '#2563eb' }: { data: BarDatum[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-2">
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3 text-[13px]">
          <span className="w-[210px] shrink-0 truncate text-slate-600">{d.label}</span>
          <span className="h-3 flex-1 overflow-hidden rounded bg-slate-100">
            <motion.span className="block h-full rounded" style={{ background: d.color ?? color }} initial={{ width: 0 }} animate={{ width: `${(d.value / max) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
          </span>
          <span className="w-8 text-right font-semibold">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
