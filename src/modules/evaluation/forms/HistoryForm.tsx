import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pill, Plus, Search, Stethoscope, X } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { Box, FSection, FormLoading, Seg, useFormRecord } from '@/components/forms/FormBits';
import { TextInput } from '@/components/ui/Form';
import { Badge, TONES } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { A4Page, Chk, RegHeader, tableStyle, td, th, Val } from '@/components/paper/Paper';
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

  const preview = (
    <A4Page>
      <RegHeader title="Naresuan University Hospital Kidney Transplantation Registration From" date={thaiDate(f.date)} blood={rec.bloodGroup} name={`${rec.prefix}${rec.firstName}`} surname={rec.lastName} age={rec.age} hn={rec.hn} />
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={td} colSpan={3}>
              Cause of ESRD
            </td>
          </tr>
          <tr>
            {ESRD_CAUSES.map((col, i) => (
              <td key={i} style={{ ...td, borderRight: i < 2 ? 'none' : td.border, borderLeft: i > 0 ? 'none' : td.border }}>
                {col.map((c) => (
                  <div key={c}>
                    <Chk
                      on={f.causes.includes(c)}
                      label={c === 'Allograft dysfunction' ? `Allograft dysfunction (Due to ${f.allograftDueTo || '…………'})` : c === 'Other' ? `Other ${f.otherCause || '…………'}` : c}
                    />
                  </div>
                ))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...th, width: 180 }}>Medical conditions</th>
            <th style={th}>Details (if available)</th>
            <th style={{ ...th, width: 200 }}>Current medications</th>
          </tr>
        </thead>
        <tbody>
          {CONDITIONS.map((c, i) => (
            <tr key={c}>
              <td style={td}>{c}</td>
              <td style={td}>
                <Val>{f.conditions[c]?.has ? f.conditions[c].detail || 'มี' : ''}</Val>
              </td>
              {i === 0 && (
                <td style={td} rowSpan={CONDITIONS.length}>
                  {f.meds.map((m, j) => (
                    <div key={j}>
                      <Val>
                        {m.name} {m.dose} {m.how}
                      </Val>
                    </div>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </A4Page>
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
