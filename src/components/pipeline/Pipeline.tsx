import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronRight, Clock, Link2 } from 'lucide-react';
import type { CaseType, RecipientStatus } from '@/types';
import { PIPELINE } from '@/lib/status';
import { fullName } from '@/lib/format';
import { CaseBadge } from '@/components/ui/Badge';
import { Segmented } from '@/components/ui/Segmented';
import { Card } from '@/components/ui/Card';

const MAX_PER_COLUMN = 3;

/** แถวที่แสดงในการ์ด Pipeline — ใช้ได้ทั้งผู้รับและผู้บริจาค */
export interface PipelineRow {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  hn: string;
  age: number;
  bloodGroup: string;
  rh: string;
  caseType: CaseType;
  status: RecipientStatus;
  evaluation?: { done: number; total: number };
  note?: string;
  pra?: number;
  /** บรรทัดเชื่อมโยง เช่น ผู้บริจาค/ผู้รับที่จับคู่ */
  linkLine?: string;
}

/** Waiting Status Pipeline — 4 คอลัมน์ (Evaluation / ตรวจผ่าน / รอ MRB / รอผ่าตัด) */
export function Pipeline({
  rows,
  basePath,
  subtitle = 'ผู้ป่วยที่ยังไม่ได้ผ่าตัด แยกตามสถานะ · สถานะเปลี่ยนอัตโนมัติเมื่อขั้นตอนเสร็จ',
  showCaseFilter = true,
  showCaseBadge = true,
}: {
  rows: PipelineRow[];
  /** เช่น /clinical/recipients */
  basePath: string;
  subtitle?: string;
  showCaseFilter?: boolean;
  showCaseBadge?: boolean;
}) {
  const [filter, setFilter] = useState<CaseType | 'all'>('all');
  const navigate = useNavigate();
  const filtered = useMemo(() => rows.filter((r) => filter === 'all' || r.caseType === filter), [rows, filter]);

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold">Waiting Status Pipeline</h2>
          <p className="text-[13px] text-slate-500">{subtitle}</p>
        </div>
        {showCaseFilter && (<Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'living', label: 'มีคู่แล้ว' },
            { value: 'redcross', label: 'สภากาชาด' },
          ]}
        />)}
      </div>

      <LayoutGroup>
        <div className="grid gap-4 lg:grid-cols-4">
          {PIPELINE.map((col) => {
            const items = filtered.filter((r) => r.status === col.status);
            return (
              <div key={col.status} className="flex flex-col gap-2.5 rounded-[14px] border border-slate-200 bg-white p-2.5">
                <div className="flex items-center gap-2 rounded-[10px] px-3 py-2.5" style={{ background: col.head, color: col.headText }}>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold">{col.title}</p>
                    <p className="text-[11px] opacity-85">{col.subtitle}</p>
                  </div>
                  <motion.span key={items.length} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="rounded-full px-2.5 py-0.5 text-sm font-bold" style={{ background: col.headText === '#ffffff' ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.6)' }}>
                    {items.length}
                  </motion.span>
                </div>

                <AnimatePresence mode="popLayout">
                  {items.slice(0, MAX_PER_COLUMN).map((r) => (
                    <motion.button
                      layout
                      key={r.id}
                      type="button"
                      onClick={() => navigate(`${basePath}/${r.id}`)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="relative flex flex-col gap-1.5 overflow-hidden rounded-[10px] border py-2.5 pl-4 pr-3 text-left"
                      style={{ background: col.tint, borderColor: col.edge }}
                    >
                      <span className="absolute inset-y-0 left-0 w-1" style={{ background: col.accent }} />
                      <span className="flex items-start gap-2">
                        <span className="flex-1 text-sm font-semibold leading-snug">{fullName(r)}</span>
                        {showCaseBadge && <CaseBadge caseType={r.caseType} />}
                      </span>
                      <span className="text-xs text-slate-600">
                        HN {r.hn} · {r.age} ปี · {r.bloodGroup}
                        {r.rh}
                      </span>
                      {r.linkLine && (
                        <span className="flex items-center gap-1.5 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-teal-700">
                          <Link2 className="h-3 w-3 shrink-0" /> {r.linkLine}
                        </span>
                      )}
                      {r.evaluation && (
                        <span className="h-1.5 overflow-hidden rounded bg-red-200">
                          <motion.span
                            className="block h-full rounded bg-red-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${(r.evaluation.done / r.evaluation.total) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-slate-600">
                        {col.status === 'waitingSurgery' ? <CalendarDays className="h-3 w-3" /> : col.status === 'passed' ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {r.evaluation ? `ตรวจครบ ${r.evaluation.done}/${r.evaluation.total} รายการ` : r.note ?? (r.pra !== undefined ? `PRA ${r.pra}%` : '—')}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>

                {items.length === 0 && <p className="py-6 text-center text-xs text-slate-400">ไม่มีผู้ป่วย</p>}

                <Link
                  to={`${basePath}/list?status=${col.status}${filter !== 'all' ? `&caseType=${filter}` : ''}`}
                  className="mt-auto flex items-center gap-1 px-1 py-1 text-[13px] font-semibold text-primary hover:underline"
                >
                  ดูทั้งหมด {items.length} ราย <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </Card>
  );
}
