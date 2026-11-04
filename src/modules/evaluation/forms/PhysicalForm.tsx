import { AnimatePresence, motion } from 'framer-motion';
import { Activity, CheckCheck } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { FSection, FormLoading, Hint, Seg, useFormRecord } from '@/components/forms/FormBits';
import { Field, TextInput, Textarea } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { A4Page, Chk, Dotted, RegHeader, Row, tableStyle, td, Val } from '@/components/paper/Paper';
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

  const preview = (
    <A4Page>
      <RegHeader title={`Naresuan University Hospital Kidney Transplantation ${kind === 'donor' ? 'Donor ' : ''}Registration From`} date={thaiDate(f.date)} blood={rec.bloodGroup} name={`${rec.prefix}${rec.firstName}`} surname={rec.lastName} age={rec.age} hn={rec.hn} />
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={td}>
              <div>Physical Examination</div>
              {[
                [['Body weight', f.weight, 'kg'], ['Blood pressure', f.bp, 'mmHg']],
                [['Hight', f.height, 'cm'], ['Pulse rate', f.pulse, 'bpm']],
                [['BMI', B, 'kg/m²'], ['Body temperature', f.temp, '°C']],
                [['BSA', S, 'm²'], ['Respiratory rate', f.rr, '/min']],
              ].map((pair, i) => (
                <Row key={i} gap={40}>
                  {pair.map(([l, v, u]) => (
                    <span key={l} style={{ width: 300 }}>
                      <Dotted label={l} value={v} width={110} after={u} />
                    </span>
                  ))}
                </Row>
              ))}
            </td>
          </tr>
          {SYSTEMS.map((s) => (
            <tr key={s}>
              <td style={{ ...td, height: 54 }}>
                <Row gap={10}>
                  <span style={{ flex: 1 }}>{s}</span>
                  <span style={{ width: 140 }}>
                    <Chk on={f.systems[s].result === 'normal'} label="normal" />
                  </span>
                  <span style={{ width: 100 }}>
                    <Chk on={f.systems[s].result === 'abnormal'} label="abnormal" />
                  </span>
                </Row>
                {f.systems[s].note && (
                  <div>
                    <Val>{f.systems[s].note}</Val>
                  </div>
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td style={{ ...td, height: 54 }}>
              Other
              <div>
                <Val>{f.other}</Val>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </A4Page>
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
