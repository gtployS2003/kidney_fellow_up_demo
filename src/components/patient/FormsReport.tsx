import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, FileCheck2, FileClock, FilePen, Pencil } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import { Badge, TONES } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formsApi, type FormRecord } from '@/services/api/formsApi';
import { FORM_LIST, baseDone } from '@/modules/evaluation/progress';
import type { AnyForm, FormKey } from '@/modules/evaluation/forms/data';
import { thaiDate } from '@/lib/format';

export type OpenFormFn = (key: FormKey | 'register', mode: 'edit' | 'preview') => void;

/** รายงานฟอร์มของผู้ป่วย — รวมทุกฟอร์มเป็นรายการ พร้อมสถานะ และเปิดดู/แก้ไขได้ */
export function FormsReport({ person, kind, onOpen }: { person: PersonRef; kind: PersonKind; onOpen: OpenFormFn }) {
  const list = FORM_LIST[kind];
  const [records, setRecords] = useState<Record<string, FormRecord<AnyForm>> | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(list.map((f) => formsApi.get<AnyForm>(kind, person.id, f.key, { sex: person.sex, done: baseDone(person, kind, f.key) }))).then((rs) => {
      if (alive) setRecords(Object.fromEntries(rs.map((r, i) => [list[i].key, r])));
    });
    return () => {
      alive = false;
    };
  }, [kind, person, list]);

  if (!records) return <Skeleton className="h-[360px] rounded-2xl" />;
  const done = list.filter((f) => records[f.key]?.completed).length + 1;
  const total = list.length + 1;

  const rows = [
    { key: 'register' as const, num: '—', title: kind === 'donor' ? 'แบบฟอร์มลงทะเบียนผู้บริจาค' : 'แบบฟอร์มลงทะเบียน', state: 'done' as const, date: person.registeredAt, by: '—', group: 'ลงทะเบียน' },
    ...list.map((f) => {
      const r = records[f.key];
      return {
        key: f.key,
        num: f.num,
        title: f.title,
        state: r?.completed ? ('done' as const) : r?.savedAt ? ('draft' as const) : ('empty' as const),
        date: (r?.data as { date?: string } | undefined)?.date,
        by: r?.savedBy ?? '—',
        group: f.key === 'mrb' ? 'ก่อนผ่าตัด · MRB' : 'ก่อนผ่าตัด · Evaluation',
      };
    }),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="min-w-[240px] flex-1">
          <p className="text-sm font-bold">
            ฟอร์มที่บันทึกแล้ว {done}/{total}
          </p>
          <div className="mt-1.5 h-2 overflow-hidden rounded bg-slate-100">
            <motion.div className="h-full rounded bg-green-600" initial={{ width: 0 }} animate={{ width: `${(done / total) * 100}%` }} transition={{ duration: 0.6 }} />
          </div>
        </div>
        <Badge label={`บันทึกแล้ว ${done}`} tone={TONES.green} dot />
        <Badge label={`ร่าง ${rows.filter((r) => r.state === 'draft').length}`} tone={TONES.amber} dot />
        <Badge label={`ยังไม่กรอก ${rows.filter((r) => r.state === 'empty').length}`} tone={TONES.slate} dot />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="w-14 px-4 py-2.5">ข้อ</th>
              <th className="px-2 py-2.5">ฟอร์ม</th>
              <th className="px-2 py-2.5">ขั้นตอน</th>
              <th className="px-2 py-2.5">สถานะ</th>
              <th className="px-2 py-2.5">วันที่ในฟอร์ม</th>
              <th className="px-2 py-2.5">บันทึกโดย</th>
              <th className="px-4 py-2.5 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const Icon = r.state === 'done' ? FileCheck2 : r.state === 'draft' ? FileClock : FilePen;
              return (
                <motion.tr key={r.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-400">{r.num}</td>
                  <td className="px-2 py-3">
                    <span className="flex items-center gap-2 font-semibold">
                      <Icon className={`h-4 w-4 ${r.state === 'done' ? 'text-green-600' : r.state === 'draft' ? 'text-amber-600' : 'text-slate-300'}`} />
                      {r.title}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-500">{r.group}</td>
                  <td className="px-2 py-3">
                    {r.state === 'done' ? <Badge label="บันทึกแล้ว" tone={TONES.green} dot /> : r.state === 'draft' ? <Badge label="ร่าง" tone={TONES.amber} dot /> : <Badge label="ยังไม่กรอก" tone={TONES.slate} dot />}
                  </td>
                  <td className="px-2 py-3">{r.date && r.state !== 'empty' ? thaiDate(r.date) : '—'}</td>
                  <td className="px-2 py-3 text-slate-500">{r.state === 'empty' ? '—' : r.by}</td>
                  <td className="px-4 py-3">
                    <span className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" icon={Eye} disabled={r.state === 'empty'} onClick={() => onOpen(r.key, 'preview')}>
                        Preview / Export
                      </Button>
                      <Button size="sm" variant="ghost" icon={Pencil} onClick={() => onOpen(r.key, 'edit')}>
                        {r.key === 'register' ? 'ดูข้อมูล' : r.state === 'empty' ? 'กรอกฟอร์ม' : 'เปิดฟอร์ม'}
                      </Button>
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">ฟอร์มขั้นตอนผ่าตัด / ก่อนกลับบ้าน / ติดตาม OPD จะเพิ่มเข้ารายการเมื่อกำหนดแบบฟอร์มแล้ว</p>
    </div>
  );
}
