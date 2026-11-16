import { useState } from 'react';
import { SuccessDialog } from '@/components/brand/BuddyStates';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CircleCheck, CircleHelp, CircleX, Flag } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { FormLoading, useFormRecord } from '@/components/forms/FormBits';
import { Textarea } from '@/components/ui/Form';
import { A4Page, Chk, Dotted, LogoBox, Row, Val } from '@/components/paper/Paper';
import { cn, fullName, thaiDate } from '@/lib/format';
import { FORM_META, type MrbForm as F } from './data';
import { KIND_LABEL, type FormProps } from './types';

export function MrbForm({ rec, kind, done, onSaved, initialMode }: FormProps) {
  const who = KIND_LABEL[kind];
  const { form: f, patch, save, info } = useFormRecord<F>(rec, kind, 'mrb', done, onSaved);
  const [passed, setPassed] = useState(false);
  if (!f) return <FormLoading />;
  const needReason = f.result === 'fail' && !f.note.trim();

  const preview = (
    <A4Page>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <div style={{ fontSize: 15, fontWeight: 600 }}>บันทึกผลการพิจารณา Medical Review Board (MRB)</div>
      </Row>
      <Row>
        <Dotted label="ชื่อ-สกุล" value={fullName(rec)} width={240} />
        <Dotted label="HN" value={rec.hn} width={100} />
        <Dotted label="อายุ" value={String(rec.age)} width={40} after="ปี" />
      </Row>
      <Row>
        <Dotted label="ประเภท" value={who} width={100} />
        <Dotted label="วันที่พิจารณา" value={thaiDate(f.date)} width={160} />
      </Row>
      <div style={{ paddingTop: 8, fontWeight: 600 }}>สรุปผลคณะกรรมการ (Committee Result)</div>
      <Row gap={30}>
        <Chk on={f.result === 'pass'} label="ผ่าน" />
        <Chk on={f.result === 'fail'} label="ไม่ผ่าน" />
      </Row>
      <div style={{ paddingTop: 8 }}>บันทึกเพิ่มเติม (Note)</div>
      <div style={{ minHeight: 90, border: '0.8px solid #111827', padding: 8 }}>
        <Val>{f.note}</Val>
      </div>
      <div style={{ textAlign: 'right', paddingTop: 24 }}>
        <Dotted label="ลงชื่อ" width={190} after="ประธานคณะกรรมการ" />
      </div>
    </A4Page>
  );

  return (
    <FormShell
      initialMode={initialMode}
      title={FORM_META.mrb.title}
      desc={`2 · Medical Review Board · ${who} · มีแค่ ผ่าน / ไม่ผ่าน`}
      icon={Building2}
      gradient={['#facc15', '#ca8a04']}
      patient={rec}
      dateLabel="วันที่พิจารณา"
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={async (draft) => {
        if (!draft && needReason) throw new Error('กรุณาระบุเหตุผล');
        await save(draft);
        if (!draft && f.result === 'pass') setPassed(true);
      }}
      savedInfo={info}
      fileName={`${FORM_META.mrb.fileName}-${rec.hn}`}
    >
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="flex items-center gap-2 text-sm font-bold">
          <Flag className="h-4 w-4 text-primary" /> สรุปผลคณะกรรมการ (Committee Result)
        </p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {(
            [
              ['pass', CircleCheck, 'ผ่าน', 'ผ่านการพิจารณาของคณะกรรมการ', '#16a34a', '#dcfce7', '#f0fdf4', '#22c55e'],
              ['fail', CircleX, 'ไม่ผ่าน', 'ไม่ผ่านการพิจารณาของคณะกรรมการ', '#dc2626', '#fee2e2', '#fef2f2', '#ef4444'],
            ] as const
          ).map(([k, Icon, t, sub, fg, bg, sel, bd]) => {
            const on = f.result === k;
            return (
              <motion.button
                key={k}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => patch({ result: k })}
                className="flex flex-col items-center gap-2 rounded-xl px-4 py-6"
                style={{ background: on ? sel : '#fff', border: `${on ? 2 : 1.5}px solid ${on ? bd : '#e2e8f0'}` }}
              >
                <motion.span animate={{ scale: on ? 1.08 : 1 }} className="grid h-11 w-11 place-items-center rounded-full" style={{ background: bg, color: fg }}>
                  <Icon className="h-[22px] w-[22px]" />
                </motion.span>
                <span className="text-[15px] font-bold">{t}</span>
                <span className="text-[12.5px] text-slate-500">{sub}</span>
              </motion.button>
            );
          })}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-slate-700">
            บันทึกเพิ่มเติม (Note) {f.result === 'fail' && <span className="font-semibold text-red-600">* ระบุเหตุผล</span>}
          </span>
          <Textarea className={cn(needReason && '!border-red-300')} value={f.note} onChange={(e) => patch({ note: e.target.value })} />
        </label>
      </section>
      {f.result === 'pass' && (
        <p className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-[12.5px] text-green-800">
          <ArrowRight className="h-4 w-4" /> เมื่อบันทึก → {who}เปลี่ยนสถานะเป็น {kind === 'recipient' && rec.caseType === 'redcross' ? '“รอไตจากสภากาชาด”' : '“รอผ่าตัด”'} อัตโนมัติ
        </p>
      )}
      {f.result === 'fail' && (
        <p className="flex items-center gap-2.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 text-[12.5px] text-orange-800">
          <CircleHelp className="h-4 w-4" /> ไม่ผ่าน → สถานะถัดไปยังรอกำหนด (เช่น กลับไป Evaluation / ยุติ) — รอถามหน้างาน
        </p>
      )}
      <SuccessDialog open={passed} onClose={() => setPassed(false)} title="บันทึกผล MRB: ผ่าน" desc={kind === 'donor' ? 'สถานะผู้บริจาคเปลี่ยนเป็น “รอผ่าตัด” อัตโนมัติ' : 'สถานะเปลี่ยนเป็นขั้นถัดไปอัตโนมัติ (มีคู่แล้ว → รอผ่าตัด · ไม่มีคู่ → รอไตจากสภากาชาด)'} />
    </FormShell>
  );
}
