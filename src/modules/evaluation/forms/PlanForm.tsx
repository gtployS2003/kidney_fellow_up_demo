import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ClipboardCheck, CornerDownRight, Paperclip } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { Box, FSection, FormLoading, useFormRecord } from '@/components/forms/FormBits';
import { DataTag, Field, Select, TextInput, Textarea } from '@/components/ui/Form';
import { Badge, TONES } from '@/components/ui/Badge';
import { A4Page, Chk, Dotted, RegHeader, Row, tableStyle, td, Val } from '@/components/paper/Paper';
import { cn, thaiDate } from '@/lib/format';
import { CONSULTS, FORM_META, PLAN_ITEMS, VACCINES, planSummary, type PlanForm as F, type TrackItem, type TrackStatus } from './data';
import type { FormProps } from './types';

const ST: Record<TrackStatus, { label: string; fg: string; bg: string; bd: string }> = {
  sent: { label: 'ส่งตรวจแล้ว', fg: '#1d4ed8', bg: '#dbeafe', bd: '#93c5fd' },
  waiting: { label: 'รอผล', fg: '#a16207', bg: '#fef9c3', bd: '#fde047' },
  pass: { label: 'ผ่าน', fg: '#15803d', bg: '#dcfce7', bd: '#86efac' },
  fail: { label: 'ไม่ผ่าน', fg: '#b91c1c', bg: '#fee2e2', bd: '#fca5a5' },
};

function StatusSelect({ value, onChange }: { value: TrackStatus; onChange: (v: TrackStatus) => void }) {
  const s = ST[value];
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as TrackStatus)} className="!h-8 !w-[124px] !rounded-lg !text-[12.5px] !font-semibold" style={{ background: s.bg, color: s.fg, borderColor: s.bd }}>
      {(Object.keys(ST) as TrackStatus[]).map((k) => (
        <option key={k} value={k}>
          {ST[k].label}
        </option>
      ))}
    </Select>
  );
}

export function PlanForm({ rec, kind, done, onSaved, initialMode }: FormProps) {
  const { form: f, patch, save, info } = useFormRecord<F>(rec, kind, 'plan', done, onSaved);
  if (!f) return <FormLoading />;

  const sum = planSummary(f);
  const setPlan = (k: string, p: Partial<TrackItem>) => patch({ plan: { ...f.plan, [k]: { ...f.plan[k], ...p } } });
  const setCon = (k: string, p: Partial<TrackItem>) => patch({ consults: { ...f.consults, [k]: { ...f.consults[k], ...p } } });

  const row = (label: string, it: TrackItem, set: (p: Partial<TrackItem>) => void, opts: { forField?: boolean; disabled?: boolean } = {}) => (
    <div key={label} className={cn('border-t border-slate-100', it.status === 'fail' && it.selected && 'bg-rose-50')}>
      <div className={cn('flex items-center gap-2.5 px-3 py-2', opts.disabled && 'opacity-40')}>
        <Box checked={it.selected} size={18} onChange={(v) => !opts.disabled && set({ selected: v })} />
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          <span className={cn('text-[13px]', it.selected ? 'font-semibold' : 'text-slate-400')}>{label}</span>
          {opts.forField && it.selected && <TextInput className="!h-7 !w-[170px] !text-xs" placeholder="for …" value={it.reason ?? ''} onChange={(e) => set({ reason: e.target.value })} />}
          {it.fromHis && <DataTag kind="his" />}
        </span>
        {it.selected ? (
          <>
            <StatusSelect value={it.status} onChange={(v) => set({ status: v, fail: v === 'fail' ? it.fail ?? { what: '', where: '', why: '', followStatus: 'sent' } : it.fail })} />
            <TextInput type="date" className="!h-8 !w-[140px] !text-xs" value={it.date} onChange={(e) => set({ date: e.target.value })} />
            <Paperclip className={cn('h-4 w-4', it.status === 'pass' ? 'text-brand-indigo' : 'text-slate-300')} />
          </>
        ) : (
          <span className="w-[300px] text-right text-xs text-slate-300">{opts.disabled ? 'ไม่เกี่ยวข้อง' : 'ไม่ได้ส่งตรวจ'}</span>
        )}
      </div>
      <AnimatePresence initial={false}>
        {it.selected && it.status === 'fail' && it.fail && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex flex-col gap-2.5 px-3 pb-3 pl-10">
              <p className="flex items-center gap-2 text-[13px] font-bold text-red-700">
                <AlertTriangle className="h-4 w-4" /> ไม่ผ่าน → ต้องตรวจ / รักษาเพิ่มเติม
              </p>
              <div className="grid gap-2.5 md:grid-cols-2">
                <Field label="ต้องตรวจ / รักษาอะไรเพิ่ม">
                  <TextInput className="!border-red-300" value={it.fail.what} onChange={(e) => set({ fail: { ...it.fail!, what: e.target.value } })} />
                </Field>
                <Field label="ส่งไปที่ (แผนก / รพ.)">
                  <TextInput className="!border-red-300" value={it.fail.where} onChange={(e) => set({ fail: { ...it.fail!, where: e.target.value } })} />
                </Field>
              </div>
              <Field label="เหตุผล">
                <TextInput className="!border-red-300" value={it.fail.why} onChange={(e) => set({ fail: { ...it.fail!, why: e.target.value } })} />
              </Field>
              <div className="flex items-center gap-2.5 rounded-[10px] border border-red-200 bg-white px-3 py-2">
                <CornerDownRight className="h-4 w-4 text-red-700" />
                <span className="flex-1 text-[13px] font-semibold">ตรวจเพิ่มเติม: {it.fail.what || '—'}</span>
                <StatusSelect value={it.fail.followStatus} onChange={(v) => set({ fail: { ...it.fail!, followStatus: v } })} />
              </div>
              <p className="text-[11.5px] text-rose-800">ผลรายการเพิ่มเติม “ผ่าน” → แพทย์เปลี่ยนรายการหลักเป็น “ผ่าน”</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const group = (title: string, children: ReactNode) => (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
        <span className="flex-1 text-[13px] font-bold text-slate-600">{title}</span>
        <span className="w-[124px]">สถานะ</span>
        <span className="w-[140px]">วันที่</span>
        <span className="w-4">ผล</span>
      </div>
      {children}
    </div>
  );

  const female = rec.sex === 'female';
  const preview = (
    <A4Page>
      <RegHeader title={`Naresuan University Hospital Kidney Transplantation ${kind === 'donor' ? 'Donor ' : ''}Registration From`} date={thaiDate(f.date)} blood={rec.bloodGroup} name={`${rec.prefix}${rec.firstName}`} surname={rec.lastName} age={rec.age} hn={rec.hn} />
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={td}>Summary: Potential kidney transplantation — {kind === 'donor' ? 'Donor' : 'Recipient'}</td>
          </tr>
          <tr>
            <td style={{ ...td, height: 64 }}>
              Medical Problems
              <div>
                <Val>{f.medicalProblems}</Val>
              </div>
            </td>
          </tr>
          <tr>
            <td style={td}>Plan for evaluation</td>
          </tr>
          <tr>
            <td style={td}>
              {PLAN_ITEMS.map(([a, b]) => (
                <Row key={a} gap={0}>
                  <span style={{ width: 300 }}>
                    <Chk on={f.plan[a].selected} label={a} />
                  </span>
                  <Chk on={f.plan[b].selected} label={b} />
                </Row>
              ))}
            </td>
          </tr>
          <tr>
            <td style={td}>Consultations</td>
          </tr>
          {CONSULTS.map((c) => (
            <tr key={c.key}>
              <td style={td}>
                <Chk on={f.consults[c.key].selected} label={`${c.label}${c.forField ? ' for' : ''}`} /> {c.forField && f.consults[c.key].reason && <Val>{f.consults[c.key].reason}</Val>}
              </td>
            </tr>
          ))}
          <tr>
            <td style={td}>
              <Row gap={14}>
                <span>Vaccinations</span>
                {VACCINES.map((v) => (
                  <Chk key={v} on={f.vaccines[v].selected} label={`${v}${f.vaccines[v].detail ? ` ${f.vaccines[v].detail}` : ''}`} />
                ))}
              </Row>
            </td>
          </tr>
          <tr>
            <td style={td}>
              Request additional medical history
              <div>
                <Dotted label="of" value={f.requestOf} width={420} />
              </div>
              <div>
                <Dotted label="From" value={f.requestFrom} width={220} after="hospital" />
              </div>
            </td>
          </tr>
          <tr>
            <td style={{ ...td, height: 48 }}>
              <Dotted label="Other" value={f.other} width={560} />
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ textAlign: 'right', paddingTop: 10 }}>
        <Dotted label="Physician" value={f.physician} width={190} />
      </div>
    </A4Page>
  );

  return (
    <FormShell
      initialMode={initialMode}
      title={kind === 'donor' ? 'รายการส่งตรวจเพิ่มเติม' : FORM_META.plan.title}
      desc={`${kind === 'donor' ? '1.4 Evaluation ผู้บริจาค' : '1.5 Evaluation'} · Summary & plan · รายการที่เลือกจะถูกติดตามผล “ผ่าน / ไม่ผ่าน” รายข้อ`}
      icon={ClipboardCheck}
      gradient={['#f59e0b', '#d97706']}
      patient={rec}
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={save}
      savedInfo={info}
      fileName={`${FORM_META.plan.fileName}-${rec.hn}`}
      previewNote="Preview แสดงเหมือนฟอร์มกระดาษ (รายการที่สั่งตรวจ) — สถานะผ่าน/ไม่ผ่านอยู่ในโหมดกรอกข้อมูล"
    >
      <FSection title="Summary">
        <div className="flex items-center gap-2.5 text-[13px]">
          <span className="font-medium text-slate-700">Potential kidney transplantation</span>
          <Badge label={kind === 'donor' ? 'Donor' : 'Recipient'} tone={{ fg: '#3730a3', bg: '#e0e7ff', dot: '#4f46e5' }} />
        </div>
        <Field label="Medical Problems">
          <Textarea rows={2} value={f.medicalProblems} onChange={(e) => patch({ medicalProblems: e.target.value })} />
        </Field>
      </FSection>

      <FSection title="ติดตามผลรายการตรวจ">
        <div className="flex flex-wrap items-center gap-3.5 rounded-xl bg-slate-50 p-3">
          <div className="min-w-[220px] flex-1">
            <p className="text-sm font-bold">
              ผ่านแล้ว {sum.pass} จาก {sum.total} รายการ
            </p>
            <div className="mt-1.5 flex h-2 overflow-hidden rounded bg-slate-200">
              {[
                [sum.pass, '#16a34a'],
                [sum.waiting, '#eab308'],
                [sum.fail, '#ef4444'],
              ].map(([n, c], i) => (
                <motion.span key={i} className="h-full" style={{ background: c as string }} animate={{ width: sum.total ? `${((n as number) / sum.total) * 100}%` : '0%' }} transition={{ duration: 0.4 }} />
              ))}
            </div>
          </div>
          <Badge label={`ผ่าน ${sum.pass}`} tone={TONES.green} dot />
          <Badge label={`รอผล / ส่งแล้ว ${sum.waiting}`} tone={TONES.amber} dot />
          <Badge label={`ไม่ผ่าน ${sum.fail}`} tone={TONES.red} dot />
        </div>
        <p className={cn('flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-[12.5px]', sum.total > 0 && sum.pass === sum.total ? 'border-green-300 bg-green-50 font-semibold text-green-800' : 'border-green-200 bg-green-50/60 text-green-800')}>
          <Check className="h-4 w-4" />
          เมื่อทุกรายการที่เลือก = “ผ่าน” และฟอร์ม {kind === 'donor' ? '1.1–1.3' : '1.1–1.4'} กรอกครบ → {kind === 'donor' ? 'ผู้บริจาค' : 'ผู้ป่วย'}ย้ายไปสถานะ “ตรวจผ่าน” (กรอบเขียว) อัตโนมัติ
        </p>
        {group(
          'Plan for evaluation',
          PLAN_ITEMS.flat().map((k) => row(k, f.plan[k], (p) => setPlan(k, p), { disabled: k === 'Mammography' && !female })),
        )}
        {group(
          'Consultations',
          CONSULTS.map((c) => row(c.label, f.consults[c.key], (p) => setCon(c.key, p), { forField: c.forField, disabled: c.key === 'gyn' && !female })),
        )}
      </FSection>

      <FSection title="Vaccinations">
        {VACCINES.map((v) => (
          <div key={v} className="flex items-center gap-2.5">
            <Box checked={f.vaccines[v].selected} onChange={(sel) => patch({ vaccines: { ...f.vaccines, [v]: { ...f.vaccines[v], selected: sel } } })} size={18} />
            <span className={cn('w-[230px] text-[13px]', f.vaccines[v].selected ? 'font-semibold' : 'text-slate-400')}>{v}</span>
            <TextInput className="!h-8" placeholder="รายละเอียด / วันที่" value={f.vaccines[v].detail} onChange={(e) => patch({ vaccines: { ...f.vaccines, [v]: { ...f.vaccines[v], detail: e.target.value } } })} />
          </div>
        ))}
      </FSection>

      <FSection title="อื่น ๆ">
        <div className="grid gap-3.5 md:grid-cols-2">
          <Field label="Request additional medical history of">
            <TextInput value={f.requestOf} onChange={(e) => patch({ requestOf: e.target.value })} />
          </Field>
          <Field label="From … hospital">
            <TextInput value={f.requestFrom} onChange={(e) => patch({ requestFrom: e.target.value })} />
          </Field>
        </div>
        <Field label="Other">
          <TextInput value={f.other} onChange={(e) => patch({ other: e.target.value })} />
        </Field>
        <Field label="Physician" className="md:w-1/2">
          <Select value={f.physician} onChange={(e) => patch({ physician: e.target.value })}>
            <option>นพ.สมเกียรติ วงศ์ไทย</option>
            <option>พญ.อรุณี ใจดี</option>
          </Select>
        </Field>
      </FSection>
    </FormShell>
  );
}
