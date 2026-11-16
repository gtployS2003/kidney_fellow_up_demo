import { AnimatePresence, motion } from 'framer-motion';
import { Activity, CheckCheck } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { FSection, FormLoading, Hint, Seg, useFormRecord } from '@/components/forms/FormBits';
import { Field, TextInput, Textarea } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Brand, Line, NoteLine, Opt, Page, PatientHead, R, TableHead, Title, bt, tbl } from '@/components/paper/Sheet';
import { cn, thaiDate } from '@/lib/format';
import { FORM_META, SYSTEMS, bmi, bsa, type PhysicalForm as F } from './data';
import type { FormProps } from './types';

export function PhysicalForm({ rec, kind, done, onSaved, initialMode }: FormProps) {
  const { form: f, patch, save, info } = useFormRecord<F>(rec, kind, 'physical', done, onSaved);
  if (!f) return <FormLoading />;

  const B = bmi(f.weight, f.height);
  const S = bsa(f.weight, f.height);
  const setSys = (k: string, p: Partial<F['systems'][string]>) => patch({ systems: { ...f.systems, [k]: { ...f.systems[k], ...p } } });
  const allNormal = () => patch({ systems: Object.fromEntries(SYSTEMS.map((s) => [s, { result: 'normal' as const, note: '' }])) });

  const vit: [string, keyof F, string, 'his' | 'auto'][] = [
    ['Body weight', 'weight', 'kg', 'his'],
    ['Height', 'height', 'cm', 'his'],
    ['Blood pressure', 'bp', 'mmHg', 'his'],
    ['Pulse rate', 'pulse', 'bpm', 'his'],
    ['Body temperature', 'temp', '°C', 'his'],
    ['Respiratory rate', 'rr', '/min', 'his'],
  ];

  const title = `Naresuan University Hospital Kidney Transplantation ${kind === 'donor' ? 'Donor ' : ''}Registration Form`;
  const vitRow = (l: string, v: string, u: string) => (
    <R key={l} gap={0}>
      <span style={{ width: l.length > 14 ? 124 : 102, flexShrink: 0 }}>{l}</span>
      <Line value={v} grow />
      <span style={{ width: 48, paddingLeft: 6, flexShrink: 0 }}>{u}</span>
    </R>
  );
  const preview = (
    <Page>
      <Brand />
      <Title>{title}</Title>
      <PatientHead date={thaiDate(f.date)} blood={rec.bloodGroup} first={`${rec.prefix}${rec.firstName}`} last={rec.lastName} age={rec.age} hn={rec.hn} />
      <div style={{ height: 4 }} />
      <div style={tbl}>
        <TableHead first>Physical Examination</TableHead>
        <div style={{ ...bt, display: 'flex', gap: 30, padding: '10px 12px 12px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vitRow('Body weight', f.weight, 'kg')}
            {vitRow('Height', f.height, 'cm')}
            {vitRow('BMI', B, 'kg/m²')}
            {vitRow('BSA', S, 'm²')}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vitRow('Blood pressure', f.bp, 'mmHg')}
            {vitRow('Pulse rate', f.pulse, 'bpm')}
            {vitRow('Body temperature', f.temp, '°C')}
            {vitRow('Respiratory rate', f.rr, '/min')}
          </div>
        </div>
        {SYSTEMS.map((s) => (
          <div key={s} style={{ ...bt, padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1, fontWeight: 500 }}>{s}</span>
              <Opt on={f.systems[s].result === 'normal'} label="normal" w={112} />
              <Opt on={f.systems[s].result === 'abnormal'} label="abnormal" w={100} />
            </div>
            <NoteLine value={f.systems[s].note} />
            <NoteLine />
          </div>
        ))}
        <div style={{ ...bt, padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <span style={{ fontWeight: 500 }}>Other</span>
          <NoteLine value={f.other} />
          <NoteLine />
        </div>
      </div>
    </Page>
  );

  return (
    <FormShell
      initialMode={initialMode}
      title={FORM_META.physical.title}
      desc={kind === 'donor' ? '1.3 Evaluation ผู้บริจาค · Physical examination' : '1.4 Evaluation · Physical examination'}
      icon={Activity}
      gradient={['#10b981', '#059669']}
      patient={rec}
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={save}
      savedInfo={info}
      fileName={`${FORM_META.physical.fileName}-${rec.hn}`}
    >
      <FSection title="Physical examination">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {vit.slice(0, 2).map(([l, k, u, t]) => (
            <Field key={l} label={l} tag={t}>
              <TextInput inputMode="decimal" suffix={u} value={f[k] as string} onChange={(e) => patch({ [k]: e.target.value } as Partial<F>)} />
            </Field>
          ))}
          <Field label="BMI" tag="auto">
            <TextInput disabled readOnly value={B} placeholder="—" suffix="kg/m²" className="!font-semibold !text-violet-700" />
          </Field>
          <Field label="BSA" tag="auto">
            <TextInput disabled readOnly value={S} placeholder="—" suffix="m²" className="!font-semibold !text-violet-700" />
          </Field>
          {vit.slice(2).map(([l, k, u, t]) => (
            <Field key={l} label={l} tag={t}>
              <TextInput suffix={u} value={f[k] as string} onChange={(e) => patch({ [k]: e.target.value } as Partial<F>)} />
            </Field>
          ))}
        </div>
      </FSection>

      <FSection
        title="การตรวจตามระบบ"
        right={
          <Button variant="secondary" size="sm" icon={CheckCheck} className="!border-green-300 !text-green-700" onClick={allNormal}>
            ปกติทั้งหมด
          </Button>
        }
      >
        {SYSTEMS.map((s) => {
          const v = f.systems[s];
          const ab = v.result === 'abnormal';
          return (
            <motion.div key={s} layout className={cn('flex flex-col gap-2.5 rounded-[10px] border p-3', ab ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white')}>
              <div className="flex items-center gap-2.5">
                <span className="flex-1 text-[13.5px] font-semibold">{s}</span>
                <Seg
                  value={v.result}
                  options={['normal', 'abnormal'] as const}
                  onChange={(x) => setSys(s, { result: x })}
                  width={220}
                  tones={{ normal: { bg: '#dcfce7', fg: '#15803d' }, abnormal: { bg: '#fecaca', fg: '#b91c1c' } }}
                />
              </div>
              <AnimatePresence initial={false}>
                {ab && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <Textarea rows={2} className="!min-h-[56px] !border-red-300" placeholder="บันทึกสิ่งที่พบ" value={v.note} onChange={(e) => setSys(s, { note: e.target.value })} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        <Field label="Other">
          <Textarea rows={2} className="!min-h-[56px]" value={f.other} onChange={(e) => patch({ other: e.target.value })} />
        </Field>
        <Hint>ช่องบันทึกรายละเอียดจะเปิดเมื่อเลือก abnormal · ปุ่ม “ปกติทั้งหมด” ตั้งทุกระบบเป็น normal</Hint>
      </FSection>
    </FormShell>
  );
}
