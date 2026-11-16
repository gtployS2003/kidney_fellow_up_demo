import type { CSSProperties } from 'react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pill, Plus, Search, Stethoscope, X } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { Box, FSection, FormLoading, Seg, useFormRecord } from '@/components/forms/FormBits';
import { TextInput } from '@/components/ui/Form';
import { Badge, TONES } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Brand, Line, Opt, Page, PatientHead, RULE, TableHead, Title, VALUE, bt, headBg, tbl } from '@/components/paper/Sheet';
import { cn, thaiDate } from '@/lib/format';
import { CONDITIONS, ESRD_CAUSES, FORM_META, type HistoryForm as F } from './data';
import type { FormProps } from './types';

export function HistoryForm({ rec, kind, done, onSaved, initialMode }: FormProps) {
  const { form: f, patch, save, info } = useFormRecord<F>(rec, kind, 'history', done, onSaved);
  const [q, setQ] = useState('');
  if (!f) return <FormLoading />;

  const toggleCause = (c: string) => patch({ causes: f.causes.includes(c) ? f.causes.filter((x) => x !== c) : [...f.causes, c] });
  const setCond = (k: string, p: Partial<F['conditions'][string]>) => patch({ conditions: { ...f.conditions, [k]: { ...f.conditions[k], ...p } } });
  const setMed = (i: number, p: Partial<F['meds'][number]>) => patch({ meds: f.meds.map((m, j) => (j === i ? { ...m, ...p } : m)) });

  const B = `1px solid ${RULE}`;
  const cellTd: CSSProperties = { border: B, padding: '0 10px', height: 26, verticalAlign: 'middle' };
  const preview = (
    <Page>
      <Brand />
      <Title>Naresuan University Hospital Kidney Transplantation Registration Form</Title>
      <PatientHead date={thaiDate(f.date)} blood={rec.bloodGroup} first={`${rec.prefix}${rec.firstName}`} last={rec.lastName} age={rec.age} hn={rec.hn} />
      <div style={{ height: 4 }} />
      <div style={tbl}>
        <TableHead first>Cause of ESRD</TableHead>
        <div style={{ ...bt, display: 'flex', padding: '8px 10px', gap: 0 }}>
          {ESRD_CAUSES.map((col, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, width: i === 0 ? 211 : i === 1 ? 248 : undefined, flex: i === 2 ? 1 : 'none' }}>
              {col.map((c) => (
                <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c === 'Other' ? (
                    <span style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                      <Opt on={f.causes.includes(c)} label="Other" />
                      <Line value={f.otherCause} grow />
                    </span>
                  ) : (
                    <Opt on={f.causes.includes(c)} label={c} />
                  )}
                  {c === 'Allograft dysfunction' && (
                    <span style={{ display: 'flex', alignItems: 'flex-end', gap: 4, paddingLeft: 18 }}>
                      (Due to <Line value={f.allograftDueTo} grow />)
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, margin: '-1px 0 -1px', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 211 }} />
            <col style={{ width: 236 }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              {['Medical conditions', 'Details (if available)', 'Current medications'].map((h) => (
                <th key={h} style={{ ...cellTd, background: headBg, fontWeight: 600, textAlign: 'center', borderLeft: h === 'Medical conditions' ? 'none' : B, borderRight: h === 'Current medications' ? 'none' : B }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONDITIONS.map((c, i) => (
              <tr key={c}>
                <td style={{ ...cellTd, borderLeft: 'none' }}>
                  {c === 'Other' ? (
                    <span style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                      Other <Line value={f.conditions[c]?.has ? f.conditions[c].detail : ''} grow />
                    </span>
                  ) : (
                    c
                  )}
                </td>
                <td style={{ ...cellTd, color: VALUE, fontWeight: 500 }}>{c !== 'Other' && f.conditions[c]?.has ? f.conditions[c].detail || 'มี' : ''}</td>
                {i === 0 && (
                  <td rowSpan={CONDITIONS.length} style={{ ...cellTd, borderRight: 'none', verticalAlign: 'top', padding: '7px 10px', color: VALUE, fontWeight: 500, lineHeight: 1.45 }}>
                    {f.meds.map((m, j) => (
                      <div key={j} style={{ paddingBottom: 6 }}>
                        {j + 1}. {m.name} {m.dose} {m.how}
                      </div>
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );

  return (
    <FormShell
      initialMode={initialMode}
      title={FORM_META.history.title}
      desc="1.3 Evaluation · Cause of ESRD · Medical conditions · Current medications"
      icon={Stethoscope}
      gradient={['#f43f5e', '#e11d48']}
      patient={rec}
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={save}
      savedInfo={info}
      fileName={`${FORM_META.history.fileName}-${rec.hn}`}
    >
      <FSection title="Cause of ESRD" right={<Badge label="เลือกได้มากกว่า 1" tone={TONES.slate} />}>
        <label className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-300 px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาสาเหตุ…" className="w-full bg-transparent text-[13px] outline-none" />
        </label>
        <div className="grid gap-2.5 md:grid-cols-3">
          {ESRD_CAUSES.map((col, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              {col
                .filter((c) => c.toLowerCase().includes(q.toLowerCase()))
                .map((c) => {
                  const on = f.causes.includes(c);
                  return (
                    <motion.button
                      key={c}
                      type="button"
                      layout
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleCause(c)}
                      className={cn('flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[12.5px]', on ? 'border-brand-indigo bg-indigo-50 font-semibold text-indigo-800' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300')}
                    >
                      <Box checked={on} size={18} />
                      {c}
                    </motion.button>
                  );
                })}
            </div>
          ))}
        </div>
        <AnimatePresence>
          {(f.causes.includes('Allograft dysfunction') || f.causes.includes('Other')) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid gap-3 overflow-hidden md:grid-cols-2">
              {f.causes.includes('Allograft dysfunction') && <TextInput placeholder="Allograft dysfunction — Due to …" value={f.allograftDueTo} onChange={(e) => patch({ allograftDueTo: e.target.value })} />}
              {f.causes.includes('Other') && <TextInput placeholder="Other — ระบุ" value={f.otherCause} onChange={(e) => patch({ otherCause: e.target.value })} />}
            </motion.div>
          )}
        </AnimatePresence>
      </FSection>

      <FSection title="Medical conditions" tags={['his']}>
        <div className="overflow-hidden rounded-[10px] border border-slate-200">
          <div className="grid grid-cols-[200px_140px_1fr] gap-3 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            <span>Medical conditions</span>
            <span />
            <span>Details (if available)</span>
          </div>
          {CONDITIONS.map((c) => {
            const v = f.conditions[c];
            return (
              <div key={c} className={cn('grid grid-cols-[200px_140px_1fr] items-center gap-3 border-t border-slate-100 px-3 py-1.5', v.has && 'bg-amber-50')}>
                <span className={cn('text-[13px]', v.has && 'font-semibold')}>{c}</span>
                <Seg value={v.has ? 'มี' : 'ไม่มี'} options={['ไม่มี', 'มี'] as const} onChange={(x) => setCond(c, { has: x === 'มี' })} tones={{ มี: { bg: '#fde68a', fg: '#92400e' } }} />
                {v.has ? <TextInput className="!h-8" placeholder="รายละเอียด" value={v.detail} onChange={(e) => setCond(c, { detail: e.target.value })} /> : <span className="text-[12.5px] text-slate-400">—</span>}
              </div>
            );
          })}
        </div>
      </FSection>

      <FSection
        title="Current medications"
        tags={['his']}
        right={
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => patch({ meds: [...f.meds, { name: '', dose: '', how: '' }] })}>
            เพิ่มยา
          </Button>
        }
      >
        {f.meds.length === 0 && <p className="text-[13px] text-slate-400">ยังไม่มีรายการยา</p>}
        <AnimatePresence initial={false}>
          {f.meds.map((m, i) => (
            <motion.div key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-[20px_1fr_130px_1fr_28px] items-center gap-2.5 rounded-[10px] bg-slate-50 px-3 py-2">
              <Pill className="h-4 w-4 text-pink-700" />
              <TextInput className="!h-8" placeholder="ชื่อยา" value={m.name} onChange={(e) => setMed(i, { name: e.target.value })} />
              <TextInput className="!h-8" placeholder="ขนาด" value={m.dose} onChange={(e) => setMed(i, { dose: e.target.value })} />
              <TextInput className="!h-8" placeholder="วิธีใช้" value={m.how} onChange={(e) => setMed(i, { how: e.target.value })} />
              <button type="button" onClick={() => patch({ meds: f.meds.filter((_, j) => j !== i) })} className="grid h-7 w-7 place-items-center rounded text-slate-400 hover:bg-slate-200" aria-label="ลบ">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </FSection>
    </FormShell>
  );
}
