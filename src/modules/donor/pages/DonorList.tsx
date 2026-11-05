import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Link2, Plus, Search, Users } from 'lucide-react';
import type { CaseType, RecipientStatus } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { CaseBadge, StatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAsync } from '@/hooks/useAsync';
import { donorApi } from '@/services/api/donorApi';
import { STATUS_META } from '@/lib/status';
import { cn, thaiDate } from '@/lib/format';
import { downloadCsv } from '@/components/forms/exporters';

const PAGE_SIZE = 9;

export default function DonorList() {
  useCrumbs(['ผู้บริจาคไต (Donor)', 'รายชื่อผู้บริจาคไต']);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? 'all') as RecipientStatus | 'all';
  const caseType = (params.get('caseType') ?? 'all') as CaseType | 'all';
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => setPage(1), [debounced, status, caseType]);

  const { data, loading } = useAsync(() => donorApi.list({ search: debounced, status, caseType }), [debounced, status, caseType]);
  const rows = data ?? [];
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);
  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v === 'all') next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="รายชื่อผู้บริจาคไต (Donor)"
        subtitle={`ผู้บริจาคทั้งหมด ${rows.length} ราย · คลิกชื่อเพื่อดูสรุปข้อมูล · คลิกชื่อผู้รับเพื่อไปหน้าผู้รับ`}
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={() => downloadCsv(`KT-donors-${new Date().toISOString().slice(0, 10)}`, ['HN', 'ชื่อ / รหัส', 'อายุ', 'เพศ', 'กรุ๊ปเลือด', 'ประเภท', 'สถานะ', 'ผู้รับ', 'ความสัมพันธ์'], rows.map((d) => [d.hn, d.caseType === 'redcross' ? d.redCrossCode ?? '' : `${d.prefix}${d.firstName} ${d.lastName}`, d.age, d.sex === 'male' ? 'ชาย' : 'หญิง', `${d.bloodGroup}${d.rh}`, d.caseType === 'living' ? 'มีคู่แล้ว' : 'สภากาชาด', STATUS_META[d.status].label, d.recipient.name, d.relation]))}>
              ส่งออก
            </Button>
            <Button icon={Plus} to="/clinical/donors/register">
              ลงทะเบียนผู้บริจาค
            </Button>
          </>
        }
      />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <label className="flex h-10 w-[320px] items-center gap-2 rounded-[10px] border border-slate-300 px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อผู้บริจาค / ผู้รับ / HN" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <Select className="!h-10 !w-auto" value={caseType} onChange={(e) => setParam('caseType', e.target.value)}>
            <option value="all">ประเภท: ทั้งหมด</option>
            <option value="living">มีคู่แล้ว</option>
            <option value="redcross">สภากาชาด</option>
          </Select>
          <Select className="!h-10 !w-auto" value={status} onChange={(e) => setParam('status', e.target.value)}>
            <option value="all">สถานะ: ทั้งหมด</option>
            {(['evaluation', 'passed', 'mrb', 'waitingSurgery', 'postop', 'discharge', 'opd'] as RecipientStatus[]).map((k) => (
              <option key={k} value={k}>
                {STATUS_META[k].label}
              </option>
            ))}
          </Select>
          <span className="ml-auto text-[13px] text-slate-500">
            แสดง {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, rows.length)} จาก {rows.length} ราย
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="w-12 px-4 py-2.5">#</th>
                <th className="px-2 py-2.5">ชื่อผู้บริจาค</th>
                <th className="px-2 py-2.5">HN</th>
                <th className="px-2 py-2.5">อายุ / เพศ</th>
                <th className="px-2 py-2.5">กรุ๊ปเลือด</th>
                <th className="px-2 py-2.5">ประเภท</th>
                <th className="px-2 py-2.5">สถานะ</th>
                <th className="px-2 py-2.5">ผู้รับ</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-3">
                      <Skeleton className="h-8" />
                    </td>
                  </tr>
                ))}
              <AnimatePresence initial={false}>
                {!loading &&
                  pageRows.map((d, i) => {
                    const rc = d.caseType === 'redcross';
                    return (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                        exit={{ opacity: 0 }}
                        onClick={() => navigate(`/clinical/donors/${d.id}`)}
                        className="group cursor-pointer border-b border-slate-100 text-[13px] text-slate-700 hover:bg-blue-50/60"
                      >
                        <td className="px-4 py-3">{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="px-2 py-3">
                          <p className="text-sm font-semibold text-primary group-hover:underline">{rc ? d.redCrossCode : `${d.prefix}${d.firstName} ${d.lastName}`}</p>
                          <p className="text-xs text-slate-400">
                            {rc ? 'บันทึกหลังผ่าตัด' : 'ลงทะเบียน'} {thaiDate(d.registeredAt)}
                          </p>
                        </td>
                        <td className="px-2 py-3">{d.hn || '—'}</td>
                        <td className="px-2 py-3">
                          {d.age} / {d.sex === 'male' ? 'ชาย' : 'หญิง'}
                        </td>
                        <td className="px-2 py-3 font-semibold text-slate-900">
                          {d.bloodGroup}
                          {d.rh}
                        </td>
                        <td className="px-2 py-3">
                          <CaseBadge caseType={d.caseType} />
                        </td>
                        <td className="px-2 py-3">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                          <RecipientCell id={d.recipient.id}>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-teal-700">
                              <Link2 className="h-3.5 w-3.5" /> {d.recipient.name}
                            </span>
                          </RecipientCell>
                          <p className="text-[11.5px] text-slate-400">{d.relation}</p>
                        </td>
                        <td className="pr-4">
                          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                        </td>
                      </motion.tr>
                    );
                  })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <div className="p-6">
            <EmptyState icon={Users} title="ไม่พบผู้บริจาค" description="ลองเปลี่ยนคำค้นหาหรือตัวกรอง" />
          </div>
        )}
        <div className="flex items-center gap-2 border-t border-slate-200 px-4 py-3">
          <span className="text-[13px] text-slate-500">แถวต่อหน้า {PAGE_SIZE}</span>
          <span className="flex-1" />
          <PageBtn disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </PageBtn>
          {Array.from({ length: pages }).map((_, i) => (
            <PageBtn key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>
              {i + 1}
            </PageBtn>
          ))}
          <PageBtn disabled={page === pages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </PageBtn>
        </div>
      </div>
    </>
  );
}

function RecipientCell({ id, children }: { id?: string; children: ReactNode }) {
  return id ? (
    <Link to={`/clinical/recipients/${id}`} className="hover:underline">
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
}

function PageBtn({ children, active, disabled, onClick }: { children: ReactNode; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn('grid h-[34px] min-w-[34px] place-items-center rounded-lg border px-2 text-[13px] font-semibold transition disabled:opacity-40', active ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}
    >
      {children}
    </button>
  );
}
