import { AnimatePresence, motion } from 'framer-motion';
import { Droplet, EyeOff, Info } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { FSection, FormLoading, Seg, useFormRecord } from '@/components/forms/FormBits';
import { ChoiceChips, DataTag, Field, TextInput, Textarea } from '@/components/ui/Form';
import { A4Page, Chk, Dotted, RegHeader, Row, tableStyle, td, Val } from '@/components/paper/Paper';
import { thaiDate } from '@/lib/format';
import { FORM_META, SEROLOGY, type CurrentTxForm as F } from './data';
import type { FormProps } from './types';

const VESSELS_AV = ['Radiocephalic', 'Brachiocephalic', 'Lower extremity', 'Other'];
const VEINS_CATH = ['Internal jugular vein', 'Subclavian vein', 'Femeral vein'];

export function CurrentTxForm({ rec, kind, done, onSaved, initialMode }: FormProps) {
  const { form: f, patch, save, info } = useFormRecord<F>(rec, kind, 'currentTx', done, onSaved);
  if (!f) return <FormLoading />;

  const isHD = f.mode === 'Hemodialysis';
  const isPD = f.mode === 'Peritoneal dialysis';
  const isPre = f.mode === 'Preemptive KT';
  const isAV = f.accessType === 'AVF' || f.accessType === 'AVG';
  const isCath = f.accessType === 'Permanent catheter' || f.accessType === 'Temporary catheter';
  const female = rec.sex === 'female';
  const setSero = (k: string, p: Partial<F['serology'][string]>) => patch({ serology: { ...f.serology, [k]: { ...f.serology[k], ...p } } });

  const preview = (
    <A4Page>
      <RegHeader title="Naresuan University Hospital Kidney Transplantation Registration" date={thaiDate(f.date)} blood={rec.bloodGroup} name={`${rec.prefix}${rec.firstName}`} surname={rec.lastName} age={rec.age} hn={rec.hn} />
      <div>Dialysis information</div>
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={{ ...td, width: 230 }}>Mode</td>
            <td style={td}>
              {['Preemptive KT', 'Hemodialysis', 'Peritoneal dialysis'].map((m) => (
                <Chk key={m} on={f.mode === m} label={m} />
              ))}
            </td>
          </tr>
          {[
            ['HD frequency /PD regimen', f.frequency],
            ['Date of dialysis initiation', thaiDate(f.initiation)],
            ['Current dialysis unit', f.unit],
            ['Residual renal function', f.residual],
            ['Dry weight', f.dryWeight ? `${f.dryWeight} kg` : ''],
          ].map(([k, v]) => (
            <tr key={k}>
              <td style={td}>{k}</td>
              <td style={td}>
                <Val>{v === '—' ? '' : v}</Val>
              </td>
            </tr>
          ))}
          <tr>
            <td style={td} colSpan={2}>
              <Dotted label="Dialysis access creation date" value={thaiDate(f.accessDate) === '—' ? '' : thaiDate(f.accessDate)} width={200} />
            </td>
          </tr>
          <tr>
            <td style={td} colSpan={2}>
              <Row gap={28} style={{ alignItems: 'flex-start' }}>
                <div>
                  <Chk on={f.accessType === 'AVF'} label="AVF" />
                  <Chk on={f.accessType === 'AVG'} label="AVG" />
                  {VESSELS_AV.map((v) => (
                    <div key={v}>
                      <Chk on={isAV && f.vessel === v} label={v} />
                    </div>
                  ))}
                  <Chk on={isAV && f.side === 'Left'} label="Left" />
                  <Chk on={isAV && f.side === 'Right'} label="Right" />
                </div>
                <div>
                  <Chk on={f.accessType === 'Permanent catheter'} label="Permanent catheter" />
                  <Chk on={f.accessType === 'Temporary catheter'} label="Temporary catheter" />
                  {VEINS_CATH.map((v) => (
                    <div key={v}>
                      <Chk on={isCath && f.vessel === v} label={v} />
                    </div>
                  ))}
                  <Chk on={isCath && f.side === 'Left'} label="Left" />
                  <Chk on={isCath && f.side === 'Right'} label="Right" />
                </div>
                <div>
                  <Chk on={f.accessType === 'Tenckhoff catheter'} label="Tenckhoff catheter" />
                </div>
              </Row>
            </td>
          </tr>
          <tr>
            <td style={{ ...td, height: 60 }} colSpan={2}>
              Dialysis-related Infections /complication
              <div>
                <Val>{f.infection}</Val>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 6 }}>
        {SEROLOGY.map((s) => {
          const r = f.serology[s];
          return (
            <Row key={s} gap={10}>
              <span style={{ width: 70 }}>{s}</span>
              <span style={{ width: 170 }}>
                <Chk on={r.result === 'Positive'} label={s === 'Anti-HBs' ? `Positive(titer ${r.titer || '……'})` : 'Positive'} />
              </span>
              <span style={{ width: 100 }}>
                <Chk on={r.result === 'Negative'} label="Negative" />
              </span>
              <Dotted label="Date" value={r.date ? thaiDate(r.date) : ''} width={110} />
            </Row>
          );
        })}
        <Row>
          <Dotted label="Previous blood transfusion last date" value={f.transfusionDate ? thaiDate(f.transfusionDate) : ''} width={150} />
          <Dotted label="amount" value={f.transfusionAmount} width={60} after="unit" />
        </Row>
        <Dotted label="Previous pregnancy" value={female ? f.pregnancy : '—'} width={140} />
        <Row gap={10}>
          <span>Previous herpes infection</span>
          {['Yes', 'No', 'Unknown'].map((o) => <Chk key={o} on={f.herpes === o} label={o} />)}
        </Row>
        <Dotted label="Drug allergy" value={f.allergy} width={220} />
        <Row gap={10}>
          <span>Previous chicken pox/shingles</span>
          {['Yes', 'No', 'Unknown'].map((o) => <Chk key={o} on={f.chickenpox === o} label={o} />)}
        </Row>
      </div>
    </A4Page>
  );

  return (
    <FormShell
      initialMode={initialMode}
      title={FORM_META.currentTx.title}
      desc="1.2 Evaluation · Dialysis information · ผลไวรัส · ประวัติอื่น ๆ"
      icon={Droplet}
      gradient={['#0ea5e9', '#2563eb']}
      patient={rec}
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={save}
      savedInfo={info}
      fileName={`${FORM_META.currentTx.fileName}-${rec.hn}`}
    >
      <FSection title="Dialysis information">
        <Field label="Mode" tag="reg">
          <ChoiceChips options={['Preemptive KT', 'Hemodialysis', 'Peritoneal dialysis']} value={f.mode} onChange={(v) => patch({ mode: v as F['mode'], accessType: v === 'Preemptive KT' ? '' : f.accessType })} />
        </Field>
        <div className="grid gap-3.5 md:grid-cols-2">
          {!isPre && (
            <Field label={isPD ? 'PD regimen' : 'HD frequency'} hint="(ตาม Mode)">
              <TextInput placeholder={isPD ? 'เช่น CAPD 4 รอบ/วัน' : 'เช่น 3 ครั้ง/สัปดาห์'} value={f.frequency} onChange={(e) => patch({ frequency: e.target.value })} />
            </Field>
          )}
          <Field label="Date of dialysis initiation" tag="reg">
            <TextInput type="date" disabled={isPre} value={f.initiation} onChange={(e) => patch({ initiation: e.target.value })} />
          </Field>
          <Field label="Current dialysis unit">
            <TextInput value={f.unit} onChange={(e) => patch({ unit: e.target.value })} />
          </Field>
          <Field label="Residual renal function">
            <TextInput value={f.residual} onChange={(e) => patch({ residual: e.target.value })} />
          </Field>
          <Field label="Dry weight" tag="his">
            <TextInput inputMode="decimal" suffix="kg" value={f.dryWeight} onChange={(e) => patch({ dryWeight: e.target.value })} />
          </Field>
        </div>
      </FSection>

      <AnimatePresence initial={false}>
        {!isPre && f.mode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <FSection title="Dialysis access">
              <div className="grid gap-3.5 md:grid-cols-[220px_1fr]">
                <Field label="Dialysis access creation date">
                  <TextInput type="date" value={f.accessDate} onChange={(e) => patch({ accessDate: e.target.value })} />
                </Field>
              </div>
              <Field label="ชนิด access">
                <ChoiceChips
                  options={isPD ? ['Tenckhoff catheter'] : ['AVF', 'AVG', 'Permanent catheter', 'Temporary catheter']}
                  value={f.accessType}
                  onChange={(v) => patch({ accessType: v as F['accessType'], vessel: '', side: '' })}
                />
              </Field>
              {(isAV || isCath) && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-5 rounded-xl border-l-[3px] border-indigo-300 bg-slate-50 p-3.5">
                  <Field label={isAV ? 'Vessel (AVF/AVG)' : 'Vein (catheter)'} className="flex-1">
                    <ChoiceChips options={isAV ? VESSELS_AV : VEINS_CATH} value={f.vessel} onChange={(v) => patch({ vessel: v })} />
                  </Field>
                  <Field label="Side">
                    <ChoiceChips options={['Left', 'Right']} value={f.side} onChange={(v) => patch({ side: v })} />
                  </Field>
                </motion.div>
              )}
              <Field label="Dialysis-related infections / complication">
                <Textarea rows={2} value={f.infection} onChange={(e) => patch({ infection: e.target.value })} />
              </Field>
            </FSection>
          </motion.div>
        )}
      </AnimatePresence>

      <FSection title="ผลตรวจไวรัส" tags={['his']}>
        <div className="overflow-hidden rounded-[10px] border border-slate-200">
          <div className="grid grid-cols-[110px_220px_1fr_150px] gap-3 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            <span>การตรวจ</span>
            <span>ผล</span>
            <span>Titer</span>
            <span>วันที่ตรวจ</span>
          </div>
          {SEROLOGY.map((s) => {
            const r = f.serology[s];
            const posBad = r.result === 'Positive' && s !== 'Anti-HBs';
            return (
              <div key={s} className="grid grid-cols-[110px_220px_1fr_150px] items-center gap-3 border-t border-slate-100 px-3 py-2">
                <span className="text-[13.5px] font-semibold">{s}</span>
                <Seg
                  value={r.result}
                  options={['Positive', 'Negative'] as const}
                  onChange={(v) => setSero(s, { result: v })}
                  width={220}
                  tones={{ Positive: posBad ? { bg: '#fee2e2', fg: '#b91c1c' } : { bg: '#dcfce7', fg: '#15803d' } }}
                />
                {s === 'Anti-HBs' ? <TextInput className="!h-8" placeholder="mIU/mL" value={r.titer} onChange={(e) => setSero(s, { titer: e.target.value })} /> : <span className="text-[13px] text-slate-400">—</span>}
                <TextInput type="date" className="!h-8" value={r.date} onChange={(e) => setSero(s, { date: e.target.value })} />
              </div>
            );
          })}
        </div>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="h-3.5 w-3.5" /> ผล Positive แสดงสีแดง (Anti-HBs Positive = มีภูมิคุ้มกัน แสดงสีเขียว)
        </p>
      </FSection>

      <FSection title="ประวัติอื่น ๆ">
        <div className="grid gap-3.5 md:grid-cols-2">
          <Field label="Previous blood transfusion · last date">
            <TextInput type="date" value={f.transfusionDate} onChange={(e) => patch({ transfusionDate: e.target.value })} />
          </Field>
          <Field label="amount">
            <TextInput inputMode="numeric" suffix="unit" value={f.transfusionAmount} onChange={(e) => patch({ transfusionAmount: e.target.value })} />
          </Field>
        </div>
        {female ? (
          <Field label="Previous pregnancy">
            <TextInput value={f.pregnancy} onChange={(e) => patch({ pregnancy: e.target.value })} />
          </Field>
        ) : (
          <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[12.5px] text-slate-400">
            <EyeOff className="h-3.5 w-3.5" /> Previous pregnancy — ซ่อนอัตโนมัติ (ผู้ป่วยชาย) <DataTag kind="reg" />
          </p>
        )}
        <div className="grid gap-3.5 md:grid-cols-2">
          <Field label="Previous herpes infection">
            <ChoiceChips options={['Yes', 'No', 'Unknown']} value={f.herpes} onChange={(v) => patch({ herpes: v })} />
          </Field>
          <Field label="Previous chicken pox / shingles">
            <ChoiceChips options={['Yes', 'No', 'Unknown']} value={f.chickenpox} onChange={(v) => patch({ chickenpox: v })} />
          </Field>
        </div>
        <Field label="Drug allergy" tag="his">
          <TextInput value={f.allergy} onChange={(e) => patch({ allergy: e.target.value })} />
        </Field>
      </FSection>
    </FormShell>
  );
}
