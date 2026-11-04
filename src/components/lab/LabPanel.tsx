import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, FlaskConical } from 'lucide-react';
import type { PersonKind } from '@/types';
import { DataTag, Select } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { labApi } from '@/services/api/appointmentApi';
import { cn, thaiDate } from '@/lib/format';

/** ผลตรวจ Lab ล่าสุด (ดึงจาก iMed) — ใช้ในแท็บ “ผลตรวจ Lab” ของผู้รับ/ผู้บริจาค */
export function LabPanel({ kind, id }: { kind: PersonKind; id: string }) {
  const [date, setDate] = useState<string | undefined>(undefined);
  const { data, loading } = useAsync(() => labApi.latest(kind, id, date), [kind, id, date]);

  if (!data) return <Skeleton className="h-[520px] rounded-2xl" />;
  const groups = [...new Set(data.items.map((i) => i.group))];
  const prevDate = data.dates[data.dates.indexOf(data.reportedAt.slice(0, 10)) + 1];

  return (
    <div className="flex items-start gap-5">
      <div className={cn('flex min-w-0 flex-1 flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 transition-opacity', loading && 'opacity-60')}>
        <div className="flex flex-wrap items-center gap-2.5">
          <FlaskConical className="h-[18px] w-[18px] text-primary" />
          <div className="flex-1">
            <p className="text-base font-bold">ผลตรวจ Lab {data.reportedAt.slice(0, 10) === data.dates[0] ? 'ล่าสุด' : ''}</p>
            <p className="text-[12.5px] text-slate-500">รายงานผล {thaiDate(data.reportedAt)} · 10:15 น.</p>
          </div>
          <DataTag kind="his" />
          <Select className="!h-9 !w-[200px] !text-[13px]" value={date ?? data.dates[0]} onChange={(e) => setDate(e.target.value)}>
            {data.dates.map((d, i) => (
              <option key={d} value={d}>
                {thaiDate(d)} {i === 0 ? '(ล่าสุด)' : ''}
              </option>
            ))}
          </Select>
        </div>
        <div className="overflow-x-auto rounded-[10px] border border-slate-200">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-3 py-2">รายการ</th>
                <th className="px-3 py-2">ผล</th>
                <th className="px-3 py-2">หน่วย</th>
                <th className="px-3 py-2">ค่าอ้างอิง</th>
                <th className="px-3 py-2">ครั้งก่อน{prevDate ? ` (${thaiDate(prevDate).slice(0, 6)})` : ''}</th>
                <th className="px-3 py-2">แนวโน้ม 5 ครั้ง</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <GroupRows key={g} group={g} items={data.items.filter((i) => i.group === g)} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <AlertTriangle className="h-3.5 w-3.5 text-orange-600" /> ค่าที่อยู่นอกช่วงอ้างอิง (H/L) ไฮไลต์สีส้ม · ค่าเป้าหมายยา (เช่น Tacrolimus) ตั้งค่าหลังบ้าน
        </p>
      </div>
      <div className="flex w-[300px] shrink-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-[15px] font-bold">ผลที่ยังรอ</p>
        {data.pending.length === 0 ? (
          <p className="text-[13px] text-slate-400">ไม่มี</p>
        ) : (
          data.pending.map((p) => (
            <div key={p.name} className="flex items-center gap-2 text-[13px]">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span className="flex-1 font-semibold">{p.name}</span>
              <span className="text-xs text-slate-400">ส่ง {thaiDate(p.sentAt).slice(0, 6)} · รอผล</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GroupRows({ group, items }: { group: string; items: import('@/types').LabItemDto[] }) {
  return (
    <>
      <tr className="border-t border-slate-100 bg-slate-50">
        <td colSpan={6} className="px-3 py-1.5 text-xs font-bold text-slate-500">
          {group}
        </td>
      </tr>
      {items.map((it, i) => {
        const max = Math.max(...it.trend, 1);
        return (
          <motion.tr key={it.name} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.03 } }} className={cn('border-t border-slate-100', it.flag && 'bg-orange-50')}>
            <td className="px-3 py-2.5">{it.name}</td>
            <td className="px-3 py-2.5">
              <span className={cn('font-bold', it.flag ? 'text-orange-700' : 'text-slate-900')}>{it.value}</span>
              {it.flag && <span className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10.5px] font-semibold text-orange-700">{it.flag}</span>}
            </td>
            <td className="px-3 py-2.5 text-slate-500">{it.unit}</td>
            <td className="px-3 py-2.5 text-slate-500">{it.ref}</td>
            <td className="px-3 py-2.5">{it.previous || '—'}</td>
            <td className="px-3 py-2.5">
              {it.trend.length ? (
                <span className="flex h-5 items-end gap-[3px]">
                  {it.trend.map((v, k) => (
                    <motion.span key={k} initial={{ height: 0 }} animate={{ height: Math.max(3, Math.round((18 * v) / max)) }} transition={{ delay: k * 0.04 }} className="w-2 rounded-sm" style={{ background: k === it.trend.length - 1 ? (it.flag ? '#c2410c' : '#2563eb') : '#cbd5e1' }} />
                  ))}
                </span>
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </td>
          </motion.tr>
        );
      })}
    </>
  );
}
