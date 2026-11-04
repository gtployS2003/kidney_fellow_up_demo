import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Info } from 'lucide-react';
import type { MatchResult } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Skeleton';
import { PrintArea } from '@/components/forms/PrintArea';
import { exportWord } from '@/components/forms/exporters';
import { A4Page, tableStyle, td, th } from '@/components/paper/Paper';
import { useAsync } from '@/hooks/useAsync';
import { matchingApi } from '@/services/api/matchingApi';
import { thaiDate } from '@/lib/format';
import { RESULT_META, ResultBadge } from '../components/shared';

const RANGES: Record<string, number> = { '1 เดือนล่าสุด': 1, '3 เดือนล่าสุด': 3, '6 เดือนล่าสุด': 6, ทั้งหมด: 1200 };

export default function MatchHistory() {
  useCrumbs(['จับคู่ผู้บริจาค', 'ประวัติการจับคู่']);
  const { data, loading } = useAsync(() => matchingApi.history(), []);
  const [range, setRange] = useState('6 เดือนล่าสุด');
  const [result, setResult] = useState<MatchResult | 'all'>('all');
  const [reason, setReason] = useState('all');

  const rows = useMemo(() => {
    const from = new Date();
    from.setMonth(from.getMonth() - RANGES[range]);
    return (data ?? []).filter((h) => new Date(h.startedAt) >= from && (result === 'all' || h.result === result) && (reason === 'all' || h.reason.startsWith(reason)));
  }, [data, range, result, reason]);
  const reasons = [...new Set((data ?? []).filter((h) => h.result === 'rejected').map((h) => h.reason.split(' — ')[0]))];
  const count = (r: MatchResult) => rows.filter((h) => h.result === r).length;

  return (
    <>
      <PageHeader
        title="ประวัติการจับคู่"
        subtitle="ผลการจับคู่กับสภากาชาดทุกครั้ง · ไม่เก็บ HLA ที่ใช้ค้นหา"
        actions={
          <Button variant="secondary" icon={Download} onClick={() => exportWord(`KT-match-history-${new Date().toISOString().slice(0, 10)}`)}>
            Export (Word)
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2.5">
        <Select className="!h-10 !w-auto" value={range} onChange={(e) => setRange(e.target.value)}>
          {Object.keys(RANGES).map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
        <Select className="!h-10 !w-auto" value={result} onChange={(e) => setResult(e.target.value as MatchResult | 'all')}>
          <option value="all">ผล: ทั้งหมด</option>
          {(Object.keys(RESULT_META) as MatchResult[]).map((r) => (
            <option key={r} value={r}>
              {RESULT_META[r].label}
            </option>
          ))}
        </Select>
        <Select className="!h-10 !w-auto" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="all">เหตุผล: ทั้งหมด</option>
          {reasons.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
        <span className="flex-1" />
        {(Object.keys(RESULT_META) as MatchResult[]).map((r) => (
          <span key={r} className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: RESULT_META[r].tone.bg, color: RESULT_META[r].tone.fg }}>
            {RESULT_META[r].label} {count(r)}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <Skeleton className="m-4 h-40" />
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                {['วันที่เริ่มจับคู่', 'ผู้ป่วย', 'ผล', 'เหตุผล / หมายเหตุ', 'ผู้ยืนยัน', 'ผู้บันทึกผล'].map((h) => (
                  <th key={h} className="px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((h, i) => (
                <motion.tr key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} className="border-t border-slate-100">
                  <td className="px-4 py-3">{thaiDate(h.startedAt)}</td>
                  <td className="px-4 py-3">
                    {h.recipientId ? (
                      <Link to={`/clinical/recipients/${h.recipientId}`} className="font-semibold text-primary hover:underline">
                        {h.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{h.name}</span>
                    )}
                    <p className="text-[11.5px] text-slate-400">HN {h.hn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ResultBadge result={h.result} />
                  </td>
                  <td className="px-4 py-3">{h.reason}</td>
                  <td className="px-4 py-3">{h.confirmedBy}</td>
                  <td className="px-4 py-3">{h.recordedBy}</td>
                </motion.tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    ไม่มีรายการในช่วงที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Info className="h-3.5 w-3.5" /> ประวัติเดียวกันจะแสดงในหน้าผู้ป่วยแต่ละคน (เคยถูกจับคู่กี่ครั้ง และผลแต่ละครั้ง)
      </p>

      <PrintArea>
        <A4Page>
          <div style={{ fontSize: 15, fontWeight: 600 }}>ประวัติการจับคู่กับสภากาชาด ({range})</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                {['วันที่', 'ผู้ป่วย', 'HN', 'ผล', 'เหตุผล', 'ผู้ยืนยัน', 'ผู้บันทึกผล'].map((x) => (
                  <th key={x} style={th}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id}>
                  <td style={td}>{thaiDate(h.startedAt)}</td>
                  <td style={td}>{h.name}</td>
                  <td style={td}>{h.hn}</td>
                  <td style={td}>{RESULT_META[h.result].label}</td>
                  <td style={td}>{h.reason}</td>
                  <td style={td}>{h.confirmedBy}</td>
                  <td style={td}>{h.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </A4Page>
      </PrintArea>
    </>
  );
}
