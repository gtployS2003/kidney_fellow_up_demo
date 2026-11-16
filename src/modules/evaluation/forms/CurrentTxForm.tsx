import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Droplet, EyeOff, Info } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { FSection, FormLoading, Seg, useFormRecord } from '@/components/forms/FormBits';
import { ChoiceChips, DataTag, Field, TextInput, Textarea } from '@/components/ui/Form';
import { Brand, Fld, Line, Opt, Page, PatientHead, R, RULE, Title, VALUE, bl, bt, cellPad, tbl } from '@/components/paper/Sheet';
import { thaiDate } from '@/lib/format';
import { FORM_META, SEROLOGY, type CurrentTxForm as F } from './data';
import type { FormProps } from './types';

const VESSELS_AV = ['Radiocephalic', 'Brachiocephalic', 'Lower extremity', 'Other'];
const VEINS_CATH = ['Internal jugular vein', 'Subclavian vein', 'Femoral vein'];

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

  const B = `1px solid ${RULE}`;
  const kv = (k: string, v: ReactNode, first?: boolean) => (
    <div key={k} style={{ display: 'flex', ...(first ? {} : bt) }}>
      <div style={{ ...cellPad, width: 236, flexShrink: 0 }}>{k}</div>
      <div style={{ ...cellPad, ...bl, flex: 1, color: VALUE, fontWeight: 500 }}>{v || '\u00a0'}</div>
    </div>
  );
  const col = (w: number | undefined, children: ReactNode, left?: boolean) => (
    <div style={{ ...cellPad, display: 'flex', flexDirection: 'column', gap: 6, width: w, flex: w ? 'none' : 1, boxSizing: 'border-box', ...(left ? bl : {}) }}>{children}</div>
  );
  const C1 = 164, C2 = 72, C3 = 218, C4 = 82;
  const d = (x?: string) => (x ? thaiDate(x) : '');
  const preview = (
    <Page>
      <Brand />
      <Title>Naresuan University Hospital Kidney Transplantation Registration</Title>
      <PatientHead date={thaiDate(f.date)} blood={rec.bloodGroup} first={`${rec.prefix}${rec.firstName}`} last={rec.lastName} age={rec.age} hn={rec.hn} />
      <div style={{ fontWeight: 600, fontSize: 13.5, paddingTop: 6 }}>Dialysis information</div>
      <div style={tbl}>
        <div style={{ display: 'flex' }}>
          <div style={{ ...cellPad, width: 236, flexShrink: 0 }}>Mode</div>
          <div style={{ ...cellPad, ...bl, flex: 1, display: 'flex', flexWrap: 'wrap', rowGap: 7 }}>
            {(['Preemptive KT', 'Hemodialysis', 'Peritoneal dialysis'] as const).map((m) => (
              <Opt key={m} on={f.mode === m} label={m} w={186} />
            ))}
          </div>
        </div>
        {kv('HD frequency / PD regimen', f.frequency)}
        {kv('Date of dialysis initiation', d(f.initiation))}
        {kv('Current dialysis unit', f.unit)}
        {kv('Residual renal function', f.residual)}
        {kv('Dry weight', f.dryWeight ? `${f.dryWeight} kg` : '')}
        <div style={{ ...cellPad, ...bt, display: 'flex' }}>
          <Fld label="Dialysis access creation date" value={d(f.accessDate)} grow />
        </div>
        <div style={{ ...bt, display: 'flex' }}>
          <div style={{ width: C1 + C2 + C3 + C4, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
              {col(C1 + C2, <><Opt on={f.accessType === 'AVF'} label="AVF" /><Opt on={f.accessType === 'AVG'} label="AVG" /></>)}
              {col(C3 + C4, <><Opt on={f.accessType === 'Permanent catheter'} label="Permanent catheter" /><Opt on={f.accessType === 'Temporary catheter'} label="Temporary catheter" /></>, true)}
            </div>
            <div style={{ display: 'flex', ...bt }}>
              {col(C1, VESSELS_AV.map((v) => <Opt key={v} on={isAV && f.vessel === v} label={v} />))}
              {col(C2, <><Opt on={isAV && f.side === 'Left'} label="Left" /><Opt on={isAV && f.side === 'Right'} label="Right" /></>, true)}
              {col(C3, VEINS_CATH.map((v) => <Opt key={v} on={isCath && f.vessel === v} label={v} />), true)}
              {col(C4, <><Opt on={isCath && f.side === 'Left'} label="Left" /><Opt on={isCath && f.side === 'Right'} label="Right" /></>, true)}
            </div>
            <div style={{ ...cellPad, ...bt, minHeight: 96, boxSizing: 'border-box' }}>
              Dialysis-related Infections / complication
              <div style={{ color: VALUE, fontWeight: 500 }}>{f.infection}</div>
            </div>
          </div>
          {col(undefined, <Opt on={f.accessType === 'Tenckhoff catheter'} label="Tenckhoff catheter" />, true)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingTop: 10 }}>
        {SEROLOGY.map((sname) => {
          const r = f.serology[sname];
          return (
            <R key={sname} gap={0}>
              <span style={{ width: 110, flexShrink: 0 }}>{sname}</span>
              <span style={{ width: 220, flexShrink: 0, display: 'inline-flex', alignItems: 'flex-end', gap: 5 }}>
                <Opt on={r.result === 'Positive'} label={sname === 'Anti-HBs' ? 'Positive (titer' : 'Positive'} />
                {sname === 'Anti-HBs' && (
                  <>
                    <Line value={r.titer} w={90} />)
                  </>
                )}
              </span>
              <Opt on={r.result === 'Negative'} label="Negative" w={136} />
              <Fld label="Date" value={d(r.date)} grow />
            </R>
          );
        })}
        <R>
          <Fld label="Previous blood transfusion last date" value={d(f.transfusionDate)} grow />
          <Fld label="amount" value={f.transfusionAmount} w={86} after="unit" />
        </R>
        <R>
          <Fld label="Previous pregnancy" value={female ? f.pregnancy : '—'} w={200} />
        </R>
        <R gap={0} style={{ alignItems: 'center' }}>
          <span style={{ width: 248, flexShrink: 0 }}>Previous herpes infection</span>
          {['Yes', 'No', 'Unknown'].map((o) => (
            <Opt key={o} on={f.herpes === o} label={o} w={110} />
          ))}
        </R>
        <R>
          <Fld label="Drug allergy" value={f.allergy} grow />
        </R>
        <R gap={0} style={{ alignItems: 'center' }}>
          <span style={{ width: 248, flexShrink: 0 }}>Previous chicken pox / shingles</span>
          {['Yes', 'No', 'Unknown'].map((o) => (
            <Opt key={o} on={f.chickenpox === o} label={o} w={110} />
          ))}
        </R>
      </div>
    </Page>
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
