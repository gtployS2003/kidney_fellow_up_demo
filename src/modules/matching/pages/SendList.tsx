import { SuccessDialog } from '@/components/brand/BuddyStates';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, Database, Download, Eye, FileText, History, Info, Printer, Search, Send } from 'lucide-react';
import type { SendCandidateDto } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, TONES } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Skeleton';
import { Box } from '@/components/forms/FormBits';
import { PrintArea } from '@/components/forms/PrintArea';
import { exportWord, printForm } from '@/components/forms/exporters';
import { A4Page, LogoBox, Row, tableStyle, td, th } from '@/components/paper/Paper';
import { useAsync } from '@/hooks/useAsync';
import { matchingApi } from '@/services/api/matchingApi';
import { cn, thaiDate } from '@/lib/format';

const hlaText = (c: SendCandidateDto) => (c.hla ? `A ${c.hla.A.join(',')} · B ${c.hla.B.join(',')} · DR ${c.hla.DR.join(',')}` : '—');

export default function SendList() {
  useCrumbs(['จับคู่ผู้บริจาค', 'ส่งรายชื่อให้สภากาชาด']);
  const cands = useAsync(() => matchingApi.sendCandidates(), []);
  const rounds = useAsync(() => matchingApi.sendRounds(), []);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');
  const [abo, setAbo] = useState('all');
  const [onlyNew, setOnlyNew] = useState(false);
  const [preview, setPreview] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState(0);
  const [viewRound, setViewRound] = useState<string | null>(null);

  useEffect(() => {
    if (cands.data) setPicked(new Set(cands.data.map((c) => c.recipientId)));
  }, [cands.data]);

  const all = cands.data ?? [];
  const rows = useMemo(
    () => all.filter((c) => (abo === 'all' || c.bloodGroup === abo) && (!onlyNew || c.isNew) && `${c.name} ${c.hn}`.includes(q)),
    [all, abo, onlyNew, q],
  );
  const chosen = all.filter((c) => picked.has(c.recipientId));
  const last = rounds.data?.[0];
  const newCount = all.filter((c) => c.isNew).length;
  const toggle = (id: string) => {
    const n = new Set(picked);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setPicked(n);
  };
  const allOn = rows.length > 0 && rows.every((r) => picked.has(r.recipientId));

  async function markSent() {
    await matchingApi.markSent(chosen.map((c) => c.recipientId), 'Excel');
    rounds.reload();
    cands.reload();
    setSentCount(chosen.length);
  }

  const paper = (
    <A4Page>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>รายชื่อผู้ป่วยรอรับไตจากผู้บริจาคสมองตาย</div>
          <div>โรงพยาบาลมหาวิทยาลัยนเรศวร · ส่งถึง ศูนย์รับบริจาคอวัยวะ สภากาชาดไทย</div>
          <div>วันที่ {thaiDate(new Date().toISOString())} · จำนวน {chosen.length} ราย</div>
        </div>
      </Row>
      <table style={{ ...tableStyle, fontSize: 11.5 }}>
        <thead>
          <tr>
            {['#', 'ชื่อ-นามสกุล', 'HN', 'เลขบัตรประชาชน', 'ABO', 'HLA (A · B · DR)', 'PRA', 'ผ่าน MRB', 'โทรศัพท์'].map((h) => (
              <th key={h} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chosen.map((c, i) => (
            <tr key={c.recipientId}>
              <td style={{ ...td, textAlign: 'center' }}>{i + 1}</td>
              <td style={td}>{c.name}</td>
              <td style={td}>{c.hn}</td>
              <td style={td}>{c.nationalId}</td>
              <td style={{ ...td, textAlign: 'center' }}>
                {c.bloodGroup}
                {c.rh}
              </td>
              <td style={td}>{hlaText(c)}</td>
              <td style={{ ...td, textAlign: 'center' }}>{c.pra ?? '—'}%</td>
              <td style={td}>{thaiDate(c.mrbPassedAt)}</td>
              <td style={td}>{c.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', paddingTop: 24 }}>ลงชื่อ ........................................ ผู้ส่ง</div>
    </A4Page>
  );

  return (
    <>
      <PageHeader
        title="ส่งรายชื่อให้สภากาชาด"
        subtitle="รายชื่อผู้ป่วยที่จะรับไตเมื่อมีผู้บริจาคสมองตาย · Export แล้วนำไปส่งเอง (ระบบไม่ส่งตรง)"
        actions={
          <>
            <Button variant="secondary" icon={Eye} disabled={!chosen.length} onClick={() => setPreview(true)}>
              Preview
            </Button>
            <div className="relative">
              <Button variant="secondary" icon={Download} iconRight={ChevronDown} disabled={!chosen.length} onClick={() => setMenu(!menu)}>
                Export
              </Button>
              <AnimatePresence>
                {menu && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 z-30 mt-2 w-[210px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop">
                    {[
                      { t: 'PDF', d: 'Save as PDF', I: FileText, fn: printForm },
                      { t: 'Word (.doc)', d: 'แก้ไขต่อได้', I: FileText, fn: () => exportWord(`KT-redcross-list-${new Date().toISOString().slice(0, 10)}`) },
                      { t: 'พิมพ์', d: 'ส่งไปเครื่องพิมพ์', I: Printer, fn: printForm },
                    ].map((o) => (
                      <button key={o.t} type="button" onClick={() => { setMenu(false); setTimeout(o.fn, 50); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50">
                        <o.I className="h-4 w-4 text-slate-500" />
                        <span>
                          <span className="block text-[13px] font-semibold">{o.t}</span>
                          <span className="block text-[11px] text-slate-400">{o.d}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button icon={Send} disabled={!chosen.length} onClick={markSent}>
              บันทึกว่าส่งแล้ว
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-white p-4">
        {[
          ['ส่งล่าสุด', last ? `${thaiDate(last.sentAt)} · ${last.sentBy}` : '—'],
          ['ในรายชื่อรอบที่แล้ว', last ? `${last.count} ราย` : '—'],
          ['เลือกไว้รอบนี้', `${chosen.length} ราย`],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-[11.5px] text-slate-400">{k}</p>
            <p className="text-sm font-semibold">{v}</p>
          </div>
        ))}
        <span className="flex-1" />
        {newCount > 0 && (
          <span className="flex items-center gap-2 rounded-[10px] border border-orange-200 bg-orange-50 px-3 py-2 text-[12.5px] font-semibold text-orange-800">
            <AlertTriangle className="h-4 w-4" /> ผู้ป่วยใหม่ที่ยังไม่เคยส่ง {newCount} ราย (ติดป้าย “ใหม่”)
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex h-10 w-[300px] items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อ / HN" className="w-full bg-transparent text-[13px] outline-none" />
        </label>
        <Select className="!h-10 !w-auto" value={abo} onChange={(e) => setAbo(e.target.value)}>
          <option value="all">กรุ๊ปเลือด: ทั้งหมด</option>
          {['A', 'B', 'O', 'AB'].map((g) => (
            <option key={g}>{g}</option>
          ))}
        </Select>
        <button type="button" onClick={() => setOnlyNew(!onlyNew)} className={cn('h-10 rounded-[10px] border px-3 text-[13px] font-medium', onlyNew ? 'border-orange-300 bg-orange-50 text-orange-800' : 'border-slate-300 bg-white text-slate-700')}>
          เฉพาะ “ใหม่”
        </button>
        <span className="flex-1" />
        <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-700">
          <Database className="h-3.5 w-3.5" /> HLA / PRA ดึงจาก iMed
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {cands.loading ? (
          <Skeleton className="m-4 h-40" />
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="w-12 px-4 py-2.5">
                  <Box checked={allOn} size={18} onChange={(v) => { const n = new Set(picked); rows.forEach((r) => (v ? n.add(r.recipientId) : n.delete(r.recipientId))); setPicked(n); }} />
                </th>
                {['ชื่อ-นามสกุล', 'HN', 'เลขบัตรประชาชน', 'ABO', 'HLA (A · B · DR)', 'PRA', 'ผ่าน MRB', 'โทรศัพท์'].map((h) => (
                  <th key={h} className="px-2 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.recipientId} className={cn('border-t border-slate-100', c.isNew && 'bg-amber-50/70')}>
                  <td className="px-4 py-3">
                    <Box checked={picked.has(c.recipientId)} size={18} onChange={() => toggle(c.recipientId)} />
                  </td>
                  <td className="px-2 py-3">
                    <span className="flex items-center gap-2 font-semibold">
                      {c.name}
                      {c.isNew && <Badge label="ใหม่" tone={TONES.orange} />}
                      {c.matching && <Badge label="กำลังจับคู่" tone={TONES.amber} />}
                    </span>
                  </td>
                  <td className="px-2 py-3">{c.hn}</td>
                  <td className="px-2 py-3">{c.nationalId}</td>
                  <td className="px-2 py-3 font-semibold">
                    {c.bloodGroup}
                    {c.rh}
                  </td>
                  <td className="px-2 py-3">{hlaText(c)}</td>
                  <td className="px-2 py-3">{c.pra ?? '—'}%</td>
                  <td className="px-2 py-3">{thaiDate(c.mrbPassedAt)}</td>
                  <td className="px-2 py-3">{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Info className="h-3.5 w-3.5" /> ผู้ป่วยที่อยู่ระหว่าง “กำลังจับคู่” ยังอยู่ในรายชื่อได้ (ยกเลิกการเลือกได้) · คอลัมน์ในไฟล์ Export ใช้ชุดเดียวกับตารางนี้ (ยืนยันกับสภากาชาดอีกครั้ง)
      </p>

      <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-1 flex items-center gap-2 text-[15px] font-bold">
          <History className="h-4 w-4 text-slate-500" /> ประวัติการส่งรายชื่อ
        </p>
        {(rounds.data ?? []).map((r, i) => (
          <div key={r.id} className={cn('py-2.5', i > 0 && 'border-t border-slate-100')}>
            <div className="flex items-center gap-4 text-[13px]">
              <span className="w-[140px] font-semibold">{thaiDate(r.sentAt)}</span>
              <span className="w-[80px]">{r.count} ราย</span>
              <span className="flex-1 text-slate-500">{r.sentBy}</span>
              <Badge label={r.format} tone={TONES.slate} />
              <button type="button" onClick={() => setViewRound(viewRound === r.id ? null : r.id)} className="text-[13px] font-semibold text-primary hover:underline">
                {viewRound === r.id ? 'ซ่อน' : 'ดูรายชื่อรอบนี้'}
              </button>
            </div>
            <AnimatePresence initial={false}>
              {viewRound === r.id && (
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-2 text-[12.5px] text-slate-500">
                  {r.recipientIds.map((id) => all.find((c) => c.recipientId === id)?.name ?? id).join(' · ')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} width={860}>
        <p className="mb-3 text-base font-bold">Preview · A4</p>
        <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-200 p-4">
          <div className="mx-auto w-fit shadow-[0_4px_16px_rgba(0,0,0,.12)]">{paper}</div>
        </div>
      </Modal>

      <PrintArea>{paper}</PrintArea>
      <SuccessDialog open={sentCount > 0} onClose={() => setSentCount(0)} title="บันทึกการส่งรายชื่อแล้ว" desc={`ส่งรายชื่อ ${sentCount} ราย ให้สภากาชาดไทย · บันทึกเป็นรอบการส่งแล้ว`} />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-pop">
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
