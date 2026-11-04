import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Dna, EyeOff, Info, Link2, RotateCcw, Search, SearchX, X } from 'lucide-react';
import type { BloodGroup, HlaQuery, MatchCandidateDto } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTag, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Box } from '@/components/forms/FormBits';
import { matchingApi } from '@/services/api/matchingApi';
import { cn, durationSince } from '@/lib/format';
import { HlaChips } from '../components/shared';

const emptyQuery = (): HlaQuery => ({ abo: '', A: ['', ''], B: ['', ''], DR: ['', ''], DQ: ['', ''] });
const CHECKS = ['ตัวตนผู้ป่วยตรงกัน (ชื่อ / HN / เลขบัตร)', 'กรุ๊ปเลือดตรงกับข้อมูลในระบบ', 'ผู้ป่วยไม่มีภาวะที่ทำให้ไม่พร้อมผ่าตัด', 'ติดต่อผู้ป่วยได้แล้ว'];

export default function HlaSearch() {
  useCrumbs(['จับคู่ผู้บริจาค', 'ค้นหาด้วย HLA']);
  const navigate = useNavigate();
  // ค่า HLA อยู่ใน state ของหน้านี้เท่านั้น — ไม่บันทึก
  const [q, setQ] = useState<HlaQuery>(emptyQuery);
  const [useDq, setUseDq] = useState(false);
  const [results, setResults] = useState<MatchCandidateDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<MatchCandidateDto | null>(null);
  const [checks, setChecks] = useState<boolean[]>(CHECKS.map(() => false));
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const canSearch = q.A.some(Boolean) || q.B.some(Boolean) || q.DR.some(Boolean);
  const setAllele = (locus: 'A' | 'B' | 'DR' | 'DQ', i: number, v: string) => {
    const cur = (q[locus] ?? ['', '']) as [string, string];
    const next: [string, string] = i === 0 ? [v, cur[1]] : [cur[0], v];
    setQ({ ...q, [locus]: next });
  };

  async function search() {
    setLoading(true);
    setSel(null);
    try {
      setResults(await matchingApi.searchHla({ ...q, DQ: useDq ? q.DQ : undefined }));
    } finally {
      setLoading(false);
    }
  }
  function open(c: MatchCandidateDto) {
    setSel(c);
    setChecks(CHECKS.map(() => false));
  }
  async function confirm() {
    if (!sel) return;
    setConfirming(true);
    await matchingApi.startMatching(sel.recipientId);
    setConfirming(false);
    setDone(sel.name);
    setResults((r) => r?.filter((x) => x.recipientId !== sel.recipientId) ?? null);
    setSel(null);
  }

  const qv = { A: q.A, B: q.B, DR: q.DR };

  return (
    <>
      <PageHeader title="ค้นหาด้วย HLA" subtitle="ใช้ตอนสภากาชาดแจ้ง HLA ของผู้บริจาค · ค้นหาเฉพาะผู้ป่วยสถานะ “รอไตจากสภากาชาด”" />

      <div className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Dna className="h-[18px] w-[18px] text-primary" />
          <h2 className="text-base font-bold">ข้อมูลที่สภากาชาดแจ้ง</h2>
          <span className="flex-1" />
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
            <EyeOff className="h-3.5 w-3.5" /> ใช้ค้นหาเท่านั้น · ไม่บันทึกลงระบบ
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-slate-700">กรุ๊ปเลือด</span>
            <Select className="!w-[110px]" value={q.abo} onChange={(e) => setQ({ ...q, abo: e.target.value as BloodGroup | '' })}>
              <option value="">ทุกกรุ๊ป</option>
              {['A', 'B', 'O', 'AB'].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
          </label>
          {(['A', 'B', 'DR'] as const).map((l) => (
            <AlleleInput key={l} label={`HLA-${l}`} value={q[l]} onChange={(i, v) => setAllele(l, i, v)} />
          ))}
          <div className={cn('transition-opacity', !useDq && 'opacity-50')}>
            <AlleleInput label="HLA-DQ" value={q.DQ ?? ['', '']} disabled={!useDq} onChange={(i, v) => setAllele('DQ', i, v)} extra={<button type="button" onClick={() => setUseDq(!useDq)} className="text-[11px] font-semibold text-primary">{useDq ? 'ปิด' : 'เปิดใช้'}</button>} />
          </div>
          <span className="flex-1" />
          <Button variant="secondary" icon={RotateCcw} onClick={() => { setQ(emptyQuery()); setResults(null); setSel(null); }}>
            ล้าง
          </Button>
          <Button icon={Search} disabled={!canSearch || loading} onClick={search}>
            ค้นหา
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-wrap items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            <Link2 className="h-4 w-4" /> เริ่มจับคู่กับสภากาชาดแล้ว: <b>{done}</b> → สถานะ “กำลังจับคู่ (สภากาชาด)”
            <span className="flex-1" />
            <Button size="sm" variant="secondary" onClick={() => navigate('/clinical/matching/in-progress?tab=redcross')}>
              ไปหน้ากำลังจับคู่
            </Button>
            <button type="button" onClick={() => setDone(null)} aria-label="ปิด">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-5">
          {results === null && !loading ? (
            <EmptyState icon={Dna} title="กรอก HLA ที่สภากาชาดแจ้ง แล้วกดค้นหา" description="ระบบจะแสดงผู้ป่วยของเราที่เข้าคู่ได้ เรียงตามจำนวน mismatch" />
          ) : loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[76px]" />
              ))}
            </div>
          ) : results!.length === 0 ? (
            <EmptyState icon={SearchX} title="ไม่พบผู้ป่วยที่เข้าคู่ได้" description="ไม่มีการบันทึกใด ๆ" />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex-1">
                  <p className="text-base font-bold">ผู้ป่วยที่เข้าคู่ได้ {results!.length} ราย</p>
                  <p className="text-[12.5px] text-slate-500">เรียงตาม HLA mismatch น้อย → มาก · ABO ไม่เข้ากันซ่อนอัตโนมัติ · แพทย์/พยาบาลเป็นผู้ตัดสิน</p>
                </div>
                <DataTag kind="his" />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-[1.3fr_70px_1.4fr_80px_56px_80px] gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                  <span>ผู้ป่วย</span>
                  <span>ABO</span>
                  <span>HLA ของผู้ป่วย</span>
                  <span>Mismatch</span>
                  <span>PRA</span>
                  <span>รอมา</span>
                </div>
                <AnimatePresence initial={false}>
                  {results!.map((c, i) => {
                    const on = sel?.recipientId === c.recipientId;
                    const col = c.mismatch.total <= 2 ? 'text-green-700' : c.mismatch.total <= 3 ? 'text-amber-700' : 'text-red-700';
                    return (
                      <motion.button
                        layout
                        key={c.recipientId}
                        type="button"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={() => open(c)}
                        className={cn('grid w-full grid-cols-[1.3fr_70px_1.4fr_80px_56px_80px] items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-left', on ? 'bg-blue-50 ring-[1.5px] ring-inset ring-primary' : 'hover:bg-slate-50')}
                      >
                        <span>
                          <span className="block text-[13.5px] font-semibold text-primary">{c.name}</span>
                          <span className="block text-xs text-slate-400">HN {c.hn}</span>
                        </span>
                        <span>
                          <span className="block text-[13.5px] font-semibold">
                            {c.bloodGroup}
                            {c.rh}
                          </span>
                          <span className={cn('block text-[11px]', c.aboIdentical ? 'text-green-700' : 'text-amber-700')}>{c.aboIdentical ? 'ตรงกรุ๊ป' : 'เข้ากันได้'}</span>
                        </span>
                        <HlaChips hla={c.hla} query={qv} />
                        <span>
                          <span className={cn('block text-base font-bold', col)}>{c.mismatch.total}/{useDq ? 8 : 6}</span>
                          <span className="block text-[11px] text-slate-400">
                            A{c.mismatch.A} B{c.mismatch.B} DR{c.mismatch.DR}
                            {c.mismatch.DQ !== undefined ? ` DQ${c.mismatch.DQ}` : ''}
                          </span>
                        </span>
                        <span className="text-[13px]">{c.pra ?? '—'}%</span>
                        <span className="text-[13px]">{durationSince(c.waitingSince)}</span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="h-3.5 w-3.5" /> คลิกแถวเพื่อตรวจสอบข้อมูลก่อนยืนยัน · ผู้ป่วยที่อยู่ระหว่าง “กำลังจับคู่” แล้วจะไม่แสดงในผลค้นหา
              </p>
            </>
          )}
        </div>

        <AnimatePresence>
          {sel && (
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="sticky top-24 flex w-[400px] shrink-0 flex-col gap-4 rounded-2xl border-[1.5px] border-primary bg-white p-5 shadow-pop"
            >
              <div className="flex items-center">
                <h3 className="flex-1 text-base font-bold">ตรวจสอบก่อนยืนยัน</h3>
                <button type="button" onClick={() => setSel(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="ปิด">
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">{sel.name.replace(/^(นาย|นางสาว|นาง)/, '').slice(0, 2)}</span>
                <div>
                  <p className="text-[14.5px] font-bold">{sel.name}</p>
                  <p className="text-xs text-slate-500">
                    HN {sel.hn} · {sel.age} ปี · PRA {sel.pra ?? '—'}% · รอ {durationSince(sel.waitingSince)}
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-[10px] border border-slate-200 text-[12.5px]">
                <div className="grid grid-cols-[50px_1fr_1fr_40px] gap-2 bg-slate-50 px-2.5 py-2 font-semibold text-slate-500">
                  <span />
                  <span>สภากาชาดแจ้ง</span>
                  <span>ในระบบ (iMed)</span>
                  <span />
                </div>
                {[
                  ['ABO', q.abo || '—', `${sel.bloodGroup}${sel.rh}`, sel.aboIdentical || !q.abo ? 0 : -1],
                  ['A', q.A.filter(Boolean).join(', ') || '—', sel.hla.A.join(', '), sel.mismatch.A],
                  ['B', q.B.filter(Boolean).join(', ') || '—', sel.hla.B.join(', '), sel.mismatch.B],
                  ['DR', q.DR.filter(Boolean).join(', ') || '—', sel.hla.DR.join(', '), sel.mismatch.DR],
                ].map(([k, a, b, m]) => (
                  <div key={k as string} className="grid grid-cols-[50px_1fr_1fr_40px] items-center gap-2 border-t border-slate-100 px-2.5 py-2">
                    <span className="font-semibold text-slate-500">{k}</span>
                    <span>{a}</span>
                    <span>{b}</span>
                    {m === 0 ? <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={2.5} /> : <span className="text-[11px] font-semibold text-slate-500">{m === -1 ? 'ต่าง' : `MM ${m}`}</span>}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[13.5px] font-bold">Checklist ก่อนยืนยัน</p>
                {CHECKS.map((c, i) => (
                  <label key={c} className="flex items-center gap-2.5 text-[13px] text-slate-700">
                    <Box checked={checks[i]} size={18} onChange={(v) => setChecks(checks.map((x, j) => (j === i ? v : x)))} />
                    {c}
                  </label>
                ))}
              </div>
              <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> ระบบบันทึก: ผู้ยืนยัน + เวลาที่เริ่มจับคู่ · ไม่บันทึก HLA ที่ใช้ค้นหา
              </p>
              <div className="flex gap-2.5">
                <Button variant="secondary" onClick={() => setSel(null)}>
                  ยกเลิก
                </Button>
                <Button icon={Link2} className="flex-1" disabled={!checks.every(Boolean) || confirming} onClick={confirm}>
                  {confirming ? 'กำลังบันทึก…' : 'ยืนยัน · เริ่มจับคู่กับสภากาชาด'}
                </Button>
              </div>
              {!checks.every(Boolean) && <p className="text-[11.5px] text-slate-400">ปุ่มยืนยันใช้ได้เมื่อติ๊ก checklist ครบ</p>}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function AlleleInput({ label, value, onChange, disabled, extra }: { label: string; value: [string, string]; onChange: (i: number, v: string) => void; disabled?: boolean; extra?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-[13px] font-medium text-slate-700">
        {label} {extra}
      </span>
      <div className="flex gap-1.5">
        {[0, 1].map((i) => (
          <input
            key={i}
            disabled={disabled}
            inputMode="numeric"
            value={value[i]}
            onChange={(e) => onChange(i, e.target.value.replace(/[^0-9:]/g, ''))}
            className="h-[42px] w-16 rounded-lg border border-slate-300 px-2.5 text-center text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-slate-100"
          />
        ))}
      </div>
    </div>
  );
}
