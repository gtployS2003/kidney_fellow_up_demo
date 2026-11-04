import { AnimatePresence, motion } from 'framer-motion';
import { Info, Stethoscope } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { FSection, FormLoading, Seg, useFormRecord } from '@/components/forms/FormBits';
import { DataTag, Field, Textarea, TextInput } from '@/components/ui/Form';
import { A4Page, Chk, Dotted, LogoBox, Row } from '@/components/paper/Paper';
import { cn, fullName, thaiDate } from '@/lib/format';
import { DONOR_DISEASES, DONOR_FAMILY, DONOR_HABITS, FORM_META, type DonorHistoryForm as F, type YesNo } from './data';
import type { FormProps } from './types';

const YN_TONES = { มี: { bg: '#fde68a', fg: '#92400e' } };

export function DonorHistoryForm({ rec, kind, done, onSaved, initialMode }: FormProps) {
  const { form: f, patch, save, info } = useFormRecord<F>(rec, kind, 'donorHistory', done, onSaved);
  if (!f) return <FormLoading />;

  const setMap = (field: 'diseases' | 'habits' | 'family', name: string, p: Partial<YesNo>) => patch({ [field]: { ...f[field], [name]: { ...f[field][name], ...p } } } as Partial<F>);
  const setChronic = (v: 'มี' | 'ไม่มี') => {
    // ถ้า “ไม่มีโรคประจำตัว” ตั้งรายการย่อยเป็น ไม่มี ให้อัตโนมัติ
    if (v === 'ไม่มี') patch({ chronic: v, diseases: Object.fromEntries(DONOR_DISEASES.map((d) => [d.name, { has: 'ไม่มี' as const, detail: '' }])) });
    else patch({ chronic: v });
  };

  const ynRow = (field: 'diseases' | 'habits' | 'family', name: string, spec: boolean, indent = false) => {
    const v = f[field][name];
    const yes = v.has === 'มี';
    return (
      <div key={name} className={cn('grid grid-cols-[210px_140px_1fr] items-center gap-3 border-t border-slate-100 px-3 py-1.5', yes && 'bg-amber-50')}>
        <span className={cn('text-[13px]', indent && 'pl-2', yes && 'font-semibold')}>
          {indent && '– '}
          {name}
        </span>
        <Seg value={v.has} options={['ไม่มี', 'มี'] as const} onChange={(x) => setMap(field, name, { has: x })} tones={YN_TONES} />
        {yes || spec ? (
          <TextInput className={cn('!h-8', !yes && 'opacity-50')} disabled={!yes} placeholder="ระบุ…" value={v.detail} onChange={(e) => setMap(field, name, { detail: e.target.value })} />
        ) : (
          <span className="text-[12.5px] text-slate-400">—</span>
        )}
      </div>
    );
  };

  const pRow = (name: string, v: YesNo | { has: string; detail?: string }, opts: { indent?: boolean; spec?: boolean } = {}) => (
    <Row key={name} gap={0} style={{ alignItems: 'center' }}>
      <span style={{ width: 170, paddingLeft: opts.indent ? 12 : 0 }}>{opts.indent ? `-  ${name}` : name}</span>
      <span style={{ width: 110 }}>
        <Chk on={v.has === 'มี'} label="มี" />
      </span>
      <span style={{ width: 80 }}>
        <Chk on={v.has === 'ไม่มี'} label="ไม่มี" />
      </span>
      {opts.spec && <Dotted label="ระบุ" value={v.detail} width={170} />}
    </Row>
  );

  const preview = (
    <A4Page>
      <Row style={{ alignItems: 'center' }}>
        <LogoBox />
        <span style={{ flex: 1 }} />
        <Dotted label="วันที่" value={thaiDate(f.date)} width={140} />
      </Row>
      <Row>
        <Dotted label="ชื่อ-สกุล" value={fullName(rec)} width={300} />
        <Dotted label="อายุ" value={String(rec.age)} width={60} after="ปี" />
      </Row>
      <Dotted label="HN" value={rec.hn} width={140} />
      <Row gap={14}>
        <span style={{ width: 150 }}>เพศ</span>
        <Chk on={rec.sex === 'male'} label="Male" />
        <Chk on={rec.sex === 'female'} label="Female" />
        <Dotted label="Blood group" value={rec.bloodGroup} width={40} />
        <Dotted label="Rh" value={f.rhGroup} width={40} />
      </Row>
      <div style={{ fontWeight: 600, paddingTop: 4 }}>ซักประวัติ</div>
      {pRow('โรคประจำตัว', { has: f.chronic })}
      {DONOR_DISEASES.map((d) => pRow(d.name, f.diseases[d.name], { indent: true, spec: d.spec }))}
      {DONOR_HABITS.map((h) => pRow(h, f.habits[h], { spec: h !== 'สารเสพติด' }))}
      <div>ยาที่ใช้ประจำ</div>
      <Dotted value={f.meds} width={600} />
      <div style={{ fontWeight: 600, paddingTop: 6 }}>ประวัติครอบครัว</div>
      {DONOR_FAMILY.map((h) => pRow(h, f.family[h], { spec: true }))}
      <div>ประวัติอื่นๆ</div>
      <Dotted value={f.otherHistory} width={600} />
    </A4Page>
  );

  return (
    <FormShell
      initialMode={initialMode}
      title={FORM_META.donorHistory.title}
      desc="1.2 Evaluation ผู้บริจาค · โรคประจำตัว · พฤติกรรม · ยาที่ใช้ประจำ · ประวัติครอบครัว"
      icon={Stethoscope}
      gradient={['#f43f5e', '#e11d48']}
      patient={rec}
      dateLabel="วันที่"
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={save}
      savedInfo={info}
      fileName={`${FORM_META.donorHistory.fileName}-${rec.hn}`}
    >
      <FSection title="ข้อมูลพื้นฐาน" tags={['reg']}>
        <div className="grid gap-3.5 md:grid-cols-3">
          <Field label="เพศ">
            <TextInput disabled readOnly value={rec.sex === 'male' ? 'Male' : 'Female'} />
          </Field>
          <Field label="Blood group">
            <TextInput disabled readOnly value={rec.bloodGroup} />
          </Field>
          <Field label="Rh">
            <Seg value={f.rhGroup as '+' | '-' | ''} options={['+', '-'] as const} onChange={(v) => patch({ rhGroup: v })} width={120} />
          </Field>
        </div>
      </FSection>

      <FSection title="ซักประวัติ" tags={['his']}>
        <div className="flex items-center gap-3 rounded-[10px] bg-slate-50 px-3 py-2.5">
          <span className="flex-1 text-sm font-bold">โรคประจำตัว</span>
          <Seg value={f.chronic} options={['ไม่มี', 'มี'] as const} onChange={setChronic} tones={YN_TONES} />
        </div>
        <AnimatePresence initial={false}>
          <motion.div layout className="overflow-hidden rounded-[10px] border border-slate-200">
            {DONOR_DISEASES.map((d) => ynRow('diseases', d.name, d.spec, true))}
          </motion.div>
        </AnimatePresence>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="h-3.5 w-3.5" /> ถ้า “โรคประจำตัว = ไม่มี” รายการย่อยตั้งเป็น ไม่มี ให้อัตโนมัติ · ช่อง “ระบุ” เปิดเมื่อเลือก มี
        </p>
      </FSection>

      <FSection title="พฤติกรรม">
        <div className="overflow-hidden rounded-[10px] border border-slate-200">{DONOR_HABITS.map((h) => ynRow('habits', h, h !== 'สารเสพติด'))}</div>
      </FSection>

      <FSection title="ยาที่ใช้ประจำ" tags={['his']}>
        <Textarea rows={2} placeholder="ไม่มี / ระบุชื่อยา ขนาด วิธีใช้" value={f.meds} onChange={(e) => patch({ meds: e.target.value })} />
      </FSection>

      <FSection title="ประวัติครอบครัว">
        <div className="overflow-hidden rounded-[10px] border border-slate-200">{DONOR_FAMILY.map((h) => ynRow('family', h, true))}</div>
        <Field label="ประวัติอื่นๆ">
          <Textarea rows={2} value={f.otherHistory} onChange={(e) => patch({ otherHistory: e.target.value })} />
        </Field>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          ผลการซักประวัติบางส่วนดึงจาก iMed ได้ <DataTag kind="his" />
        </span>
      </FSection>
    </FormShell>
  );
}
