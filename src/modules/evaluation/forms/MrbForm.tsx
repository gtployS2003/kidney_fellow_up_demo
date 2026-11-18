import { useState, type ReactNode } from 'react';
import { SuccessDialog } from '@/components/brand/BuddyStates';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CircleCheck, CircleX, Flag } from 'lucide-react';
import type { MrbCaseDto } from '@/types';
import { FormShell } from '@/components/forms/FormShell';
import { FSection, FormLoading } from '@/components/forms/FormBits';
import { Checkbox, ChoiceChips, Field, TextInput, Textarea } from '@/components/ui/Form';
import { PostMrbPaper, PreLivingPaper } from '@/components/paper/MrbPaper';
import { cn, fullName } from '@/lib/format';
import { MrbCaseBanner, useMrbCase, useMrbRecord } from '@/modules/mrb/MrbCaseBits';
import { COVERAGES, FORM_META, type MrbForm as F, type PassFail, type PreLivingForm } from './data';
import type { FormProps } from './types';

/** 2.2 สรุป MRB — เคสร่วม · ผลแยกรายคน + Post MRB conclusion + Pre-living KT evaluation form */
export function MrbForm(props: FormProps) {
  const c = useMrbCase(props.kind, props.rec.id);
  if (c === undefined) return <FormLoading />;
  if (c === null) return <p className="rounded-xl bg-white p-6 text-sm text-slate-500">ไม่พบเคส MRB</p>;
  return <Inner {...props} c={c} />;
}

function ResultPick({ value, onChange }: { value: PassFail; onChange: (v: PassFail) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(
        [
          ['pass', CircleCheck, 'ผ่าน', 'ผ่านการพิจารณาของคณะกรรมการ', '#16a34a', '#dcfce7', '#f0fdf4', '#22c55e'],
          ['fail', CircleX, 'ไม่ผ่าน', 'ไม่ผ่านการพิจารณาของคณะกรรมการ', '#dc2626', '#fee2e2', '#fef2f2', '#ef4444'],
        ] as const
      ).map(([k, Icon, t, sub, fg, bg, sel, bd]) => {
        const on = value === k;
        return (
          <motion.button
            key={k}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(k)}
            className="flex flex-col items-center gap-1.5 rounded-xl px-4 py-3.5"
            style={{ background: on ? sel : '#fff', border: `${on ? 2 : 1.5}px solid ${on ? bd : '#e2e8f0'}` }}
          >
            <motion.span animate={{ scale: on ? 1.08 : 1 }} className="grid h-9 w-9 place-items-center rounded-full" style={{ background: bg, color: fg }}>
              <Icon className="h-5 w-5" />
            </motion.span>
            <span className="text-[15px] font-bold">{t}</span>
            <span className="text-[12px] text-slate-500">{sub}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

const Who = ({ tone, children }: { tone: 'r' | 'd'; children: ReactNode }) => (
  <span className={cn('w-fit rounded-md px-2 py-0.5 text-[11px] font-semibold', tone === 'r' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700')}>{children}</span>
);
const Sub = ({ children }: { children: ReactNode }) => <p className="text-xs font-bold text-slate-600">{children}</p>;
const Row = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{children}</div>;
const Radio = <T extends string>({ value, options, onChange }: { value: T | ''; options: [T, string][]; onChange: (v: T | '') => void }) => (
  <ChoiceChips options={options.map((o) => o[1])} value={options.find((o) => o[0] === value)?.[1] ?? ''} onChange={(l) => onChange((options.find((o) => o[1] === l)?.[0] ?? '') as T | '')} />
);

/** สถานะถัดไปตามผลรายคน (กติกาที่ตกลงกับหน้างาน) */
function nextStatus(c: MrbCaseDto, f: F): string | null {
  if (!f.result) return null;
  if (f.result === 'fail') return 'ผู้รับไม่ผ่าน → ผู้รับกลับไปประเมิน · ผู้บริจาคหยุดรอ';
  if (!c.donor) return 'ผู้รับผ่าน → “รอไตจากสภากาชาด”';
  if (f.donorResult === 'pass') return 'ผ่านทั้งคู่ → ผู้รับและผู้บริจาค “รอผ่าตัด” · Date of admission / operation ส่งต่อไปขั้นผ่าตัด';
  if (f.donorResult === 'fail') return 'ผู้บริจาคไม่ผ่าน → ผู้บริจาค “ยุติ” · ผู้รับ “รอไตจากสภากาชาด / หาผู้บริจาคใหม่” (เปิดเคส MRB ใหม่ได้)';
  return null;
}

function Inner({ rec, kind, done, onSaved, initialMode, c }: FormProps & { c: MrbCaseDto }) {
  const { form: f, patch, save, info } = useMrbRecord<F>(c.id, 'mrb', done, onSaved);
  const [passed, setPassed] = useState<string | null>(null);
  if (!f) return <FormLoading />;
  const p = f.pre;
  const pp = (x: Partial<PreLivingForm>) => patch({ pre: { ...p, ...x } });
  const hasDonor = !!c.donor;
  const needReason = (f.result === 'fail' || f.donorResult === 'fail') && !f.note.trim();
  const next = nextStatus(c, f);
  const setPlan = (k: 'planRecipient' | 'planDonor', i: number, v: string) => patch({ [k]: f[k].map((x, j) => (j === i ? v : x)) } as Partial<F>);

  const preview = (
    <div className="paper-stack">
      <PostMrbPaper c={c} f={f} />
      <PreLivingPaper c={c} f={f} />
    </div>
  );

  return (
    <FormShell
      initialMode={initialMode}
      title={FORM_META.mrb.title}
      desc="2.2 MRB · Medical Review Board · Post MRB conclusion + Pre-living KT evaluation form"
      icon={Building2}
      gradient={['#facc15', '#ca8a04']}
      patient={rec}
      dateLabel="วันที่พิจารณา"
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={async (draft) => {
        if (!draft && !f.result) throw new Error('กรุณาเลือกผลของผู้รับ');
        if (!draft && hasDonor && !f.donorResult) throw new Error('กรุณาเลือกผลของผู้บริจาค');
        if (!draft && needReason) throw new Error('กรุณาระบุเหตุผลใน Note');
        await save(draft);
        if (!draft && next) setPassed(next);
      }}
      savedInfo={info}
      fileName={`${FORM_META.mrb.fileName}-${c.recipient.hn}`}
    >
      <MrbCaseBanner c={c} here={kind} date={f.date} sub="mrb" />

      <section className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Flag className="h-4 w-4 text-primary" /> สรุปผลคณะกรรมการ (Committee Result) · แยกผลรายคน
        </p>
        <Who tone="r">ผลผู้รับ · {fullName(c.recipient)}</Who>
        <ResultPick value={f.result} onChange={(result) => patch({ result })} />
        {hasDonor && (
          <>
            <Who tone="d">ผลผู้บริจาค · {fullName(c.donor!)}</Who>
            <ResultPick value={f.donorResult} onChange={(donorResult) => patch({ donorResult })} />
          </>
        )}
        <Field label="บันทึกเพิ่มเติม (Note)" error={needReason ? 'ไม่ผ่าน — กรุณาระบุเหตุผล' : undefined}>
          <Textarea className={cn('!min-h-[64px]', needReason && '!border-red-300')} value={f.note} onChange={(e) => patch({ note: e.target.value })} />
        </Field>
      </section>

      <FSection title="ใบสรุปผลการเข้าประชุม (Post MRB conclusion)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="ชื่อ Recipient · HN">
            <TextInput disabled value={`${fullName(c.recipient)} · ${c.recipient.hn}`} />
          </Field>
          <Field label="ชื่อ Donor (for LRKT) · HN">
            <TextInput disabled value={c.donor ? `${fullName(c.donor)} · ${c.donor.hn}` : '— ไม่มีผู้บริจาคมีชีวิต —'} />
          </Field>
        </div>
        <Field label="สิทธิการรักษา">
          <ChoiceChips options={[...COVERAGES]} value={f.coverage} onChange={(v) => patch({ coverage: v as F['coverage'] })} />
        </Field>
        {(['planRecipient', ...(hasDonor ? ['planDonor'] : [])] as const).map((k) => (
          <div key={k} className="flex flex-col gap-1.5">
            <Sub>{k === 'planRecipient' ? 'Plan (Recipient)' : 'Plan (Donor)'}</Sub>
            {f[k as 'planRecipient' | 'planDonor'].map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 text-right text-xs text-slate-500">{i + 1}.</span>
                <TextInput className="!h-9" placeholder="พิมพ์แผนการรักษา…" value={v} onChange={(e) => setPlan(k as 'planRecipient' | 'planDonor', i, e.target.value)} />
              </div>
            ))}
          </div>
        ))}
        <Field label="Typing">
          <div className="flex flex-wrap items-center gap-2.5">
            <Radio
              value={f.typing}
              options={[
                ['yes', 'Typing ได้'],
                ['consult', 'Typing หลังจาก consult'],
                ['no', 'ไม่ Typing'],
              ]}
              onChange={(typing) => patch({ typing })}
            />
            {f.typing === 'consult' && <TextInput className="!h-9 w-[200px]" placeholder="consult …" value={f.typingConsult} onChange={(e) => patch({ typingConsult: e.target.value })} />}
          </div>
        </Field>
        <Field label="Remark">
          <Textarea className="!min-h-[64px]" value={f.remark} onChange={(e) => patch({ remark: e.target.value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="แพทย์ (M.D.)">
            <TextInput value={f.physician} onChange={(e) => patch({ physician: e.target.value })} />
          </Field>
          <Field label="Date">
            <TextInput type="date" value={f.signDate} onChange={(e) => patch({ signDate: e.target.value })} />
          </Field>
        </div>
      </FSection>

      <FSection title="Pre-living KT evaluation form">
        <Sub>1. Recipient</Sub>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Date of evaluation">
            <TextInput type="date" value={p.evalDate} onChange={(e) => pp({ evalDate: e.target.value })} />
          </Field>
          <Field label="Date of admission">
            <TextInput type="date" value={p.admitDate} onChange={(e) => pp({ admitDate: e.target.value })} />
          </Field>
          <Field label="Date of operation">
            <TextInput type="date" value={p.opDate} onChange={(e) => pp({ opDate: e.target.value })} />
          </Field>
        </div>
        <Field label="Medications" tag="his">
          <Textarea className="!min-h-[64px]" value={p.meds} onChange={(e) => pp({ meds: e.target.value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['antiPlatelet', 'Anti-platelet', 'ชื่อยา'],
              ['antiCoagulant', 'Anti-coagulant', 'ชื่อยา'],
            ] as const
          ).map(([k, l, ph]) => (
            <div key={k} className="flex flex-col gap-1.5">
              <Checkbox checked={p[k].on} onChange={(on) => pp({ [k]: { ...p[k], on } })} label={l} />
              <TextInput className="!h-9" disabled={!p[k].on} placeholder={ph} value={p[k].name} onChange={(e) => pp({ [k]: { ...p[k], name: e.target.value } })} />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <Checkbox checked={p.stop.on} onChange={(on) => pp({ stop: { ...p.stop, on } })} label="Stop date" />
            <TextInput className="!h-9" type="date" disabled={!p.stop.on} value={p.stop.date} onChange={(e) => pp({ stop: { ...p.stop, date: e.target.value } })} />
          </div>
        </div>

        {hasDonor && (
          <>
            <Sub>2. Donor</Sub>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Creatinine (mg/dL)" tag="his">
                <TextInput value={p.donorCr} onChange={(e) => pp({ donorCr: e.target.value })} />
              </Field>
              <Field label="eGFR/mCLcr (ml/min/1.73 m²)" tag="his">
                <TextInput value={p.donorEgfr} onChange={(e) => pp({ donorEgfr: e.target.value })} />
              </Field>
            </div>
          </>
        )}

        <Sub>3. Risk</Sub>
        <Field label="General">
          <Row>
            <Checkbox checked={p.prevKt} onChange={(prevKt) => pp({ prevKt })} label="Previous-KT" />
            <Checkbox checked={p.pregnancy} onChange={(pregnancy) => pp({ pregnancy })} label="Pregnancy" />
            <Checkbox checked={p.transfusion} onChange={(transfusion) => pp({ transfusion })} label="Blood transfusion" />
          </Row>
        </Field>
        <Field label="ABO">
          <Row>
            <Radio
              value={p.abo}
              options={[
                ['compatible', 'Compatibility'],
                ['incompatible', 'Incompatibility'],
              ]}
              onChange={(abo) => pp({ abo })}
            />
            {p.abo === 'incompatible' && (
              <>
                <span className="text-xs text-slate-500">(D)</span>
                <TextInput className="!h-9 w-[80px]" value={p.aboD} onChange={(e) => pp({ aboD: e.target.value })} />
                <span className="text-xs text-slate-500">to (R)</span>
                <TextInput className="!h-9 w-[80px]" value={p.aboR} onChange={(e) => pp({ aboR: e.target.value })} />
              </>
            )}
          </Row>
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['A', 'B', 'DR', 'DQ'] as const).map((k) => (
            <Field key={k} label={k === 'A' ? 'HLA mismatch A' : k}>
              <TextInput inputMode="numeric" value={p.hla[k]} onChange={(e) => pp({ hla: { ...p.hla, [k]: e.target.value } })} />
            </Field>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ['screening', 'Screening PRA'],
              ['peak', 'Peak PRA'],
              ['current', 'Current PRA'],
            ] as const
          ).map(([k, l]) => (
            <Field key={k} label={l}>
              <TextInput value={p.pra[k]} onChange={(e) => pp({ pra: { ...p.pra, [k]: e.target.value } })} />
            </Field>
          ))}
        </div>
        <Field label="Anti-HLA DSA">
          <Radio
            value={p.dsa}
            options={[
              ['negative', 'Negative'],
              ['positive', 'Positive'],
            ]}
            onChange={(dsa) => pp({ dsa })}
          />
          {p.dsa === 'positive' &&
            p.dsaRows.map((r, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['cls', 'class'],
                    ['ag', 'Ag'],
                    ['mfi', 'MFI'],
                  ] as const
                ).map(([k, l]) => (
                  <TextInput key={k} className="!h-9" placeholder={l} value={r[k]} onChange={(e) => pp({ dsaRows: p.dsaRows.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) as PreLivingForm['dsaRows'] })} />
                ))}
              </div>
            ))}
        </Field>
        <Field label="Crossmatch">
          <Row>
            <Radio
              value={p.xm}
              options={[
                ['negative', 'Negative'],
                ['positive', 'Positive'],
              ]}
              onChange={(xm) => pp({ xm })}
            />
            {p.xm === 'positive' && (
              <>
                <TextInput className="!h-9 w-[90px]" placeholder="class" value={p.xmClass} onChange={(e) => pp({ xmClass: e.target.value })} />
                <Checkbox checked={p.xmIgG} onChange={(xmIgG) => pp({ xmIgG })} label="IgG" />
                <Checkbox checked={p.xmIgM} onChange={(xmIgM) => pp({ xmIgM })} label="IgM" />
                <TextInput className="!h-9 w-[120px]" value={p.xmNote} onChange={(e) => pp({ xmNote: e.target.value })} />
              </>
            )}
          </Row>
        </Field>

        <Sub>4. Problems from MRB</Sub>
        <Radio
          value={p.problems}
          options={[
            ['none', 'No problem'],
            ['resolved', 'Problems resolved'],
          ]}
          onChange={(problems) => pp({ problems })}
        />

        <Sub>5. Plan</Sub>
        <Field label="Desensitization">
          <div className="flex flex-col gap-2">
            <Row>
              <Checkbox checked={p.plasmapheresis.on} onChange={(on) => pp({ plasmapheresis: { ...p.plasmapheresis, on } })} label="Plasmapheresis" />
              {p.plasmapheresis.on && (
                <>
                  <TextInput className="!h-9 w-[90px]" suffix="ครั้ง" value={p.plasmapheresis.sessions} onChange={(e) => pp({ plasmapheresis: { ...p.plasmapheresis, sessions: e.target.value } })} />
                  <TextInput className="!h-9 w-[170px]" type="date" value={p.plasmapheresis.date} onChange={(e) => pp({ plasmapheresis: { ...p.plasmapheresis, date: e.target.value } })} />
                </>
              )}
            </Row>
            <Row>
              <Checkbox checked={p.ivig.on} onChange={(on) => pp({ ivig: { ...p.ivig, on } })} label="IVIg" />
              {p.ivig.on && (
                <>
                  <TextInput className="!h-9 w-[110px]" placeholder="dose" value={p.ivig.dose} onChange={(e) => pp({ ivig: { ...p.ivig, dose: e.target.value } })} />
                  <TextInput className="!h-9 w-[170px]" type="date" value={p.ivig.date} onChange={(e) => pp({ ivig: { ...p.ivig, date: e.target.value } })} />
                </>
              )}
            </Row>
            <Row>
              <Checkbox checked={p.rituximab.on} onChange={(on) => pp({ rituximab: { ...p.rituximab, on } })} label="Rituximab" />
              {p.rituximab.on && <TextInput className="!h-9 w-[170px]" type="date" value={p.rituximab.date} onChange={(e) => pp({ rituximab: { ...p.rituximab, date: e.target.value } })} />}
            </Row>
          </div>
        </Field>
        <Field label="Induction">
          <Row>
            <Checkbox checked={p.basiliximab} onChange={(basiliximab) => pp({ basiliximab })} label="Basiliximab" />
            <Checkbox checked={p.atg} onChange={(atg) => pp({ atg })} label="ATG" />
            <Checkbox checked={p.ivmp} onChange={(ivmp) => pp({ ivmp })} label="IVMP" />
          </Row>
        </Field>
        <Field label="Maintenance">
          <Row>
            <Checkbox checked={p.maintenanceStd} onChange={(maintenanceStd) => pp({ maintenanceStd })} label="Tacrolimus/Mycophenolate mofetil/Prednisolone" />
            <Checkbox checked={p.maintenanceOther.on} onChange={(on) => pp({ maintenanceOther: { ...p.maintenanceOther, on } })} label="Others" />
            {p.maintenanceOther.on && <TextInput className="!h-9 w-[220px]" value={p.maintenanceOther.text} onChange={(e) => pp({ maintenanceOther: { ...p.maintenanceOther, text: e.target.value } })} />}
          </Row>
        </Field>
        <Field label="Infectious prophylaxis">
          <Row>
            <Checkbox checked={p.cotrimoxazole} onChange={(cotrimoxazole) => pp({ cotrimoxazole })} label="Cotrimoxazole" />
            <Checkbox checked={p.acyclovir} onChange={(acyclovir) => pp({ acyclovir })} label="Acyclovir" />
            <span className="text-[13px] text-slate-500">CMV</span>
            <Radio
              value={p.cmv}
              options={[
                ['prophylaxis', 'prophylaxis'],
                ['preemptive', 'pre-emptive'],
              ]}
              onChange={(cmv) => pp({ cmv })}
            />
          </Row>
        </Field>
      </FSection>

      {next && (
        <p className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-[12.5px] text-green-800">
          <ArrowRight className="h-4 w-4 shrink-0" /> เมื่อบันทึก → {next}
        </p>
      )}
      <SuccessDialog open={!!passed} onClose={() => setPassed(null)} title="บันทึกผล MRB แล้ว" desc={passed ?? ''} />
    </FormShell>
  );
}
