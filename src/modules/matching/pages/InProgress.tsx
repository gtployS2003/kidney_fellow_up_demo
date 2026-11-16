import { SuccessDialog } from '@/components/brand/BuddyStates';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CircleCheck, CircleMinus, CircleX, Clock, Database, EyeOff, Hourglass, Link2, Save, Search } from 'lucide-react';
import type { ChecklistDecision, ChecklistItemDto, MatchResult, MatchingInProgressDto, PairChecklistDto } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTag, TextInput, Textarea } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge, TONES } from '@/components/ui/Badge';
import { useAsync } from '@/hooks/useAsync';
import { checklistSummary, matchingApi } from '@/services/api/matchingApi';
import { cn, durationSince } from '@/lib/format';
import { QTag, elapsed, thaiDateTime } from '../components/shared';

type Tab = 'living' | 'redcross';

export default function InProgress() {
  useCrumbs(['จับคู่ผู้บริจาค', 'กำลังจับคู่']);
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'redcross' ? 'redcross' : 'living';
  const pairs = useAsync(() => matchingApi.pairs(), []);
  const prog = useAsync(() => matchingApi.inProgress(), []);

  return (
    <>
      <PageHeader title="กำลังจับคู่" subtitle="ตรวจความพร้อมคู่ผู้รับ–ผู้บริจาคมีชีวิต (Pre-KT evaluation checklist) และติดตามผลการจับคู่กับสภากาชาด" />
      <div className="flex gap-1 border-b border-slate-200">
        {(
          [
            ['living', 'คู่ผู้บริจาคมีชีวิต', pairs.data?.length],
            ['redcross', 'สภากาชาด', prog.data?.length],
          ] as const
        ).map(([k, l, n]) => (
          <button key={k} type="button" onClick={() => setParams(k === 'redcross' ? { tab: k } : {}, { replace: true })} className={cn('relative flex items-center gap-2 px-4 py-3 text-sm', tab === k ? 'font-semibold text-primary' : 'font-medium text-slate-500')}>
            {l}
            <span className={cn('rounded-full px-2 py-0.5 text-xs', tab === k ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')}>{n ?? '…'}</span>
            {tab === k && <motion.span layoutId="ip-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
          </button>
        ))}
      </div>
      <>
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          {tab === 'living' ? <LivingTab pairs={pairs.data} initial={params.get('pair')} /> : <RedCrossTab rows={prog.data} reload={prog.reload} />}
        </motion.div>
      </>
    </>
  );
}

// ======================= คู่ผู้บริจาคมีชีวิต =======================
function LivingTab({ pairs: fetched, initial }: { pairs: PairChecklistDto[] | null; initial: string | null }) {
  const [pairs, setPairs] = useState<PairChecklistDto[] | null>(fetched);
  useEffect(() => setPairs(fetched), [fetched]);
  const [selId, setSelId] = useState<string | null>(initial);
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<PairChecklistDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!pairs?.length) return;
    const p = pairs.find((x) => x.pairId === selId) ?? pairs[0];
    setSelId(p.pairId);
    setDraft(structuredClone(p));
  }, [pairs, selId]);

  if (!pairs) return <Skeleton className="h-[600px] rounded-2xl" />;
  if (!pairs.length) return <EmptyState icon={Link2} title="ไม่มีคู่ผู้บริจาคมีชีวิตที่อยู่ระหว่างตรวจ" />;

  const list = pairs.filter((p) => `${p.recipient.name} ${p.donor.name}`.includes(q));
  const setItem = (side: 'recipientItems' | 'donorItems', key: string, patch: Partial<ChecklistItemDto>) => draft && setDraft({ ...draft, [side]: draft[side].map((x) => (x.key === key ? { ...x, ...patch } : x)) });

  async function save() {
    if (!draft) return;
    setSaving(true);
    await matchingApi.savePair(draft);
    const saved = structuredClone(draft);
    setPairs((ps) => (ps ? ps.map((p) => (p.pairId === saved.pairId ? saved : p)) : ps));
    setSaving(false);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }

  return (
    <div className="flex items-start gap-5">
      <div className="sticky top-24 flex w-[290px] shrink-0 flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2.5">
        <label className="mb-1 flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-2.5">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาคู่" className="w-full bg-transparent text-[13px] outline-none" />
        </label>
        {list.map((p) => {
          const rs = checklistSummary(p.recipientItems);
          const ds = checklistSummary(p.donorItems);
          const sel = p.pairId === selId;
          const fails = rs.fail + ds.fail;
          return (
            <button key={p.pairId} type="button" onClick={() => setSelId(p.pairId)} className={cn('relative flex flex-col gap-1 rounded-[10px] px-2.5 py-2.5 text-left', !sel && 'hover:bg-slate-50')}>
              {sel && <motion.span layoutId="pair-sel" className="absolute inset-0 rounded-[10px] bg-indigo-50" />}
              <span className="relative flex items-center gap-1.5">
                <span className={cn('flex-1 text-[13.5px] font-bold', sel && 'text-indigo-800')}>{p.recipient.name}</span>
                {fails > 0 ? <Badge label={`ไม่ผ่าน ${fails}`} tone={TONES.red} /> : rs.pass === rs.total && ds.pass === ds.total ? <Badge label="ผ่านครบ" tone={TONES.green} /> : null}
              </span>
              <span className="relative flex items-center gap-1.5 text-xs text-teal-700">
                <Link2 className="h-3 w-3" /> {p.donor.name} · {p.donor.relation}
              </span>
              <span className="relative text-[11.5px] text-slate-400">
                R {rs.pass}/{rs.total} · D {ds.pass}/{ds.total}
              </span>
            </button>
          );
        })}
      </div>

      {draft && (
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Who role="R" name={draft.recipient.name} meta={`ผู้รับ · HN ${draft.recipient.hn} · ${draft.recipient.sex === 'male' ? 'ชาย' : 'หญิง'} ${draft.recipient.age} ปี · ${draft.recipient.bloodGroup}${draft.recipient.rh}`} to={`/clinical/recipients/${draft.recipient.id}`} fg="#1d4ed8" bg="#dbeafe" />
              <Link2 className="h-[18px] w-[18px] text-teal-700" />
              <Who role="D" name={draft.donor.name} meta={`ผู้บริจาค · HN ${draft.donor.hn} · ${draft.donor.sex === 'male' ? 'ชาย' : 'หญิง'} ${draft.donor.age} ปี · ${draft.donor.bloodGroup}${draft.donor.rh}`} to={`/clinical/donors/${draft.donor.id}`} fg="#0f766e" bg="#ccfbf1" />
              <span className="flex-1" />
              <DataTag kind="his" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SumBadge label="ผู้รับ" items={draft.recipientItems} />
              <SumBadge label="ผู้บริจาค" items={draft.donorItems} />
              <span className="flex-1" />
              <QTag>สรุปรวม / ผ่านครบแล้วไปไหน — รอถามหน้างาน</QTag>
            </div>
          </div>

          <div className="grid gap-3.5 xl:grid-cols-2">
            <ChecklistColumn title="Recipient" fg="#1d4ed8" bg="#eff6ff" items={draft.recipientItems} onChange={(k, p) => setItem('recipientItems', k, p)} />
            <ChecklistColumn title="Donor" fg="#0f766e" bg="#f0fdfa" items={draft.donorItems} onChange={(k, p) => setItem('donorItems', k, p)} />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4">
            <Database className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">อัปเดตจาก iMed ล่าสุด {thaiDateTime(draft.syncedAt)} · ข้อที่ไม่ตรงกับฟอร์ม 1.5/1.4 รอถามหน้างาน</span>
            <span className="flex-1" />
            <AnimatePresence>
              {toast && (
                <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[13px] font-semibold text-green-700">
                  ✓ บันทึกแล้ว
                </motion.span>
              )}
            </AnimatePresence>
            <Button icon={Save} disabled={saving} onClick={save}>
              {saving ? 'กำลังบันทึก…' : 'บันทึกผลการตัดสิน'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Who({ role, name, meta, to, fg, bg }: { role: string; name: string; meta: string; to: string; fg: string; bg: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 hover:opacity-80">
      <span className="grid h-[38px] w-[38px] place-items-center rounded-[10px] text-xs font-bold" style={{ background: bg, color: fg }}>
        {role}
      </span>
      <span>
        <span className="block text-[14.5px] font-bold">{name}</span>
        <span className="block text-xs text-slate-500">{meta}</span>
      </span>
    </Link>
  );
}

function SumBadge({ label, items }: { label: string; items: ChecklistItemDto[] }) {
  const s = checklistSummary(items);
  return <Badge label={`${label}: ผ่าน ${s.pass} · ไม่ผ่าน ${s.fail} · รอผล ${s.waiting}`} tone={TONES.slate} />;
}

function ChecklistColumn({ title, fg, bg, items, onChange }: { title: string; fg: string; bg: string; items: ChecklistItemDto[]; onChange: (key: string, p: Partial<ChecklistItemDto>) => void }) {
  let lastGroup: string | undefined;
  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: bg }}>
        <span className="flex-1 text-sm font-bold" style={{ color: fg }}>
          {title}
        </span>
        <span className="text-[11px] text-slate-500">D/M/Y · comment (iMed)</span>
        <span className="w-[118px] text-right text-[11px] font-semibold text-slate-500">แพทย์ตัดสิน</span>
      </div>
      {items.map((it) => {
        const head = it.group && it.group !== lastGroup ? it.group : null;
        lastGroup = it.group;
        return (
          <div key={it.key}>
            {head && <div className="border-t border-slate-100 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-500">{head}</div>}
            <div className={cn('flex items-center gap-2.5 border-t border-slate-100 py-2 pr-3.5', it.group ? 'pl-[26px]' : 'pl-3.5', it.decision === 'fail' && 'bg-red-50', it.na && 'bg-slate-50/70')}>
              <div className="min-w-0 flex-1">
                <p className={cn('text-[12.5px] font-semibold', it.na && 'text-slate-400')}>{it.label}</p>
                {it.na ? (
                  <p className="text-[11px] text-slate-400">{it.key === 'others' ? '—' : it.key === 'psa' ? 'เฉพาะผู้ชาย' : 'เฉพาะผู้หญิง'}</p>
                ) : it.date ? (
                  <p className="text-[11px] text-slate-500">
                    {it.date.split('-').reverse().join('/').replace(/\/(\d{4})$/, (_, y) => `/${(Number(y) + 543) % 100}`)}
                    {it.comment && <span className={cn('ml-1.5', it.decision === 'fail' ? 'text-red-700' : 'text-slate-400')}>{it.comment}</span>}
                  </p>
                ) : null}
              </div>
              {it.na ? (
                <span className="flex items-center gap-1 text-[11.5px] text-slate-400">
                  <EyeOff className="h-3 w-3" /> N/A
                </span>
              ) : !it.date ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  <Hourglass className="h-3 w-3" /> รอผลจาก iMed
                </span>
              ) : (
                <Decision value={it.decision} onChange={(d) => onChange(it.key, { decision: d })} />
              )}
            </div>
            <AnimatePresence initial={false}>
              {it.decision === 'fail' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-red-50">
                  <div className="flex flex-col gap-1.5 pb-2.5 pl-[26px] pr-3.5">
                    <TextInput className="!h-8 !border-red-300 !text-xs" placeholder="หมายเหตุแพทย์" value={it.note ?? ''} onChange={(e) => onChange(it.key, { note: e.target.value })} />
                    <span className="text-[10.5px] font-semibold text-amber-800">? ขั้นตอนส่งตรวจเพิ่มเติม — รอถามหน้างาน</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function Decision({ value, onChange }: { value: ChecklistDecision; onChange: (v: ChecklistDecision) => void }) {
  return (
    <div className="flex w-[118px] gap-0.5 rounded-lg bg-slate-100 p-0.5">
      {(
        [
          ['pass', 'ผ่าน', '#16a34a'],
          ['fail', 'ไม่ผ่าน', '#ef4444'],
        ] as const
      ).map(([k, l, c]) => (
        <button key={k} type="button" onClick={() => onChange(value === k ? '' : k)} className={cn('flex-1 rounded-md py-1 text-[11.5px] transition-colors', value === k ? 'font-semibold text-white' : 'text-slate-400 hover:text-slate-600')} style={value === k ? { background: c } : undefined}>
          {l}
        </button>
      ))}
    </div>
  );
}

// ======================= สภากาชาด =======================
const REASONS = ['Crossmatch positive', 'ข้อมูลไม่ตรงกับผู้ป่วย', 'ผู้ป่วยไม่พร้อม (ติดเชื้อ / ไม่สบาย)', 'ติดต่อผู้ป่วยไม่ได้', 'ผู้ป่วยปฏิเสธ', 'อื่นๆ'];

function RedCrossTab({ rows, reload }: { rows: MatchingInProgressDto[] | null; reload: () => void }) {
  const [selId, setSelId] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [received, setReceived] = useState<string | null>(null);

  useEffect(() => {
    if (rows?.length && !rows.find((r) => r.recipientId === selId)) setSelId(rows[0].recipientId);
  }, [rows, selId]);
  useEffect(() => {
    setResult(null);
    setReason('');
    setNote('');
  }, [selId]);

  if (!rows) return <Skeleton className="h-[500px] rounded-2xl" />;
  const sel = rows.find((r) => r.recipientId === selId);
  const canSave = result && (result !== 'rejected' || reason) && !saving;

  async function save() {
    if (!sel || !result) return;
    setSaving(true);
    const text = result === 'rejected' ? [reason, note].filter(Boolean).join(' — ') : note || (result === 'received' ? 'ได้รับไต' : 'สภากาชาดยกเลิก');
    await matchingApi.recordResult(sel.recipientId, result, text);
    setSaving(false);
    setDone(`${sel.name} → ${result === 'received' ? '“รอผ่าตัด”' : '“รอไตจากสภากาชาด”'}`);
    if (result === 'received') setReceived(sel.name);
    setSelId(null);
    reload();
  }

  return (
    <div className="flex flex-col gap-4">
      <SuccessDialog open={!!received} onClose={() => setReceived(null)} title="บันทึกผล: ได้รับไต" desc={<>{received} → สถานะ “รอผ่าตัด” · บันทึกลงประวัติการจับคู่แล้ว</>} />
      <AnimatePresence>
        {done && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            ✓ บันทึกผลแล้ว: {done} · ดูได้ใน “ประวัติการจับคู่”
          </motion.p>
        )}
      </AnimatePresence>
      {rows.length === 0 ? (
        <EmptyState icon={Clock} title="ไม่มีผู้ป่วยที่กำลังจับคู่กับสภากาชาด" description="เริ่มจับคู่ได้จากหน้า “ค้นหาด้วย HLA”" action={<Button to="/clinical/matching/hla">ไปค้นหาด้วย HLA</Button>} />
      ) : (
        <div className="flex items-start gap-5">
          <div className="flex w-[360px] shrink-0 flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-2.5">
            <div className="flex items-center gap-2 px-1.5 py-1">
              <span className="flex-1 text-[13px] font-bold text-slate-600">รอผลจากสภากาชาด</span>
              <Badge label={`${rows.length} ราย`} tone={TONES.orange} />
            </div>
            {rows.map((r) => {
              const e = elapsed(r.startedAt);
              const on = r.recipientId === selId;
              return (
                <button key={r.recipientId} type="button" onClick={() => setSelId(r.recipientId)} className={cn('flex flex-col gap-1 rounded-xl border p-3 text-left', on ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50')}>
                  <span className="flex items-center gap-2">
                    <span className={cn('flex-1 text-sm font-bold', on && 'text-indigo-800')}>{r.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ${e.hot ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{e.text}</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    HN {r.hn} · {r.bloodGroup}
                    {r.rh} · PRA {r.pra ?? '—'}%
                  </span>
                  <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                    <Clock className="h-3 w-3" /> เริ่ม {thaiDateTime(r.startedAt)} · {r.confirmedBy}
                  </span>
                </button>
              );
            })}
          </div>

          {sel && (
            <motion.div key={sel.recipientId} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link to={`/clinical/recipients/${sel.recipientId}`} className="text-[17px] font-bold hover:text-primary">
                    {sel.name}
                  </Link>
                  <Badge label="กำลังจับคู่ (สภากาชาด)" tone={TONES.orange} dot />
                </div>
                <p className="text-[13px] text-slate-500">
                  HN {sel.hn} · {sel.sex === 'male' ? 'ชาย' : 'หญิง'} {sel.age} ปี · {sel.bloodGroup}
                  {sel.rh} · PRA {sel.pra ?? '—'}% · รอไต {durationSince(sel.waitingSince)}
                </p>
                <div className="grid grid-cols-3 gap-3 rounded-[10px] bg-slate-50 px-3 py-2.5">
                  {[
                    ['เริ่มจับคู่', thaiDateTime(sel.startedAt)],
                    ['ผู้ยืนยัน', sel.confirmedBy],
                    ['ระยะเวลา', elapsed(sel.startedAt).text],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[11.5px] text-slate-400">{k}</p>
                      <p className="text-[13.5px] font-semibold">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="flex-1 text-base font-bold">บันทึกผลจากสภากาชาด</h3>
                  <QTag>ให้พยาบาลบันทึกเองหรือไม่ — รอถามหน้างาน</QTag>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(
                    [
                      ['received', CircleCheck, 'ได้รับไต', '→ สถานะ “รอผ่าตัด”', '#16a34a', '#dcfce7', '#f0fdf4', '#22c55e'],
                      ['notReceived', CircleMinus, 'ไม่ได้รับ / ยกเลิก', '→ กลับไป “รอไตจากสภากาชาด”', '#475569', '#e2e8f0', '#f8fafc', '#94a3b8'],
                      ['rejected', CircleX, 'ปฏิเสธ', 'ฝั่งเราพบปัญหา · ระบุเหตุผล', '#dc2626', '#fee2e2', '#fef2f2', '#ef4444'],
                    ] as const
                  ).map(([k, Icon, t, sub, fg, ibg, sbg, bd]) => {
                    const on = result === k;
                    return (
                      <motion.button key={k} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setResult(k)} className="flex flex-col items-center gap-1.5 rounded-xl px-3 py-5" style={{ background: on ? sbg : '#fff', border: `${on ? 2 : 1.5}px solid ${on ? bd : '#e2e8f0'}` }}>
                        <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: ibg, color: fg }}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-[14.5px] font-bold">{t}</span>
                        <span className="text-xs text-slate-500">{sub}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence initial={false}>
                  {result === 'rejected' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="mb-2 text-[13px] font-medium text-slate-700">
                        เหตุผลที่ปฏิเสธ <span className="font-bold text-red-600">*</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {REASONS.map((x) => (
                          <button key={x} type="button" onClick={() => setReason(x)} className={cn('rounded-lg border px-3 py-1.5 text-[13px]', reason === x ? 'border-red-400 bg-red-50 font-semibold text-red-700' : 'border-slate-300 text-slate-700 hover:border-slate-400')}>
                            {x}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-slate-700">หมายเหตุ</span>
                  <Textarea className="!min-h-[64px]" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ผล crossmatch / ข้อความที่สภากาชาดแจ้ง" />
                </label>
                {result && (
                  <p className="flex items-center gap-2 rounded-[10px] bg-slate-50 px-3 py-2.5 text-[12.5px] text-slate-600">
                    <ArrowRight className="h-4 w-4" /> หลังบันทึก: ผู้ป่วย{result === 'received' ? 'เปลี่ยนเป็น “รอผ่าตัด”' : 'กลับไปสถานะ “รอไตจากสภากาชาด”'} และบันทึกลงประวัติการจับคู่
                  </p>
                )}
                <div className="flex justify-end gap-2.5">
                  <Button variant="secondary" onClick={() => setResult(null)}>
                    ยกเลิก
                  </Button>
                  <Button icon={Save} disabled={!canSave} onClick={save}>
                    {saving ? 'กำลังบันทึก…' : 'บันทึกผล'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
