import { Info, Upload, Users } from 'lucide-react';
import { FormShell } from '@/components/forms/FormShell';
import { Box, FSection, FormLoading, useFormRecord } from '@/components/forms/FormBits';
import { Field, Select, TextInput } from '@/components/ui/Form';
import { Badge, TONES } from '@/components/ui/Badge';
import { A4Page, Dotted, LogoBox, Row, tableStyle, td, th, Val } from '@/components/paper/Paper';
import { fullName, thaiDate } from '@/lib/format';
import { COUNSELING_TOPICS, FORM_META, counselingKeys, type CounselingForm as F } from './data';
import type { FormProps } from './types';

const key = (c: number, s: number) => `${c}-${s}`;

export function CounselingForm({ rec, kind, done, onSaved, initialMode }: FormProps) {
  const { form: f, patch, save, info } = useFormRecord<F>(rec, kind, 'counseling', done, onSaved);
  if (!f) return <FormLoading />;

  const keys = counselingKeys();
  const count = keys.filter((k) => f.understood[k]).length;
  const set = (k: string, v: boolean) => patch({ understood: { ...f.understood, [k]: v } });
  const setCat = (c: number, v: boolean) => {
    const u = { ...f.understood };
    COUNSELING_TOPICS[c].items.forEach((_, s) => (u[key(c, s)] = v));
    patch({ understood: u });
  };

  const preview = (
    <A4Page>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
          การให้คำปรึกษาผู้ป่วยปลูกถ่ายไต ศูนย์ไตเทียม
          <br />
          โรงพยาบาลมหาวิทยาลัยนเรศวร
        </div>
        <div style={{ width: 110 }} />
      </Row>
      <div style={{ fontWeight: 500 }}>การให้คำปรึกษาแนะนำที่เกี่ยวข้องกับการปลูกถ่ายไตจากผู้บริจาคมีชีวิต และผู้บริจาคสมองตาย</div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={th}>หัวข้อคำแนะนำ</th>
            <th style={{ ...th, width: 110 }}>เข้าใจ</th>
          </tr>
        </thead>
        <tbody>
          {COUNSELING_TOPICS.map((t, c) => (
            <tr key={c}>
              <td style={td}>
                <div>
                  {c + 1}. {t.title}
                </div>
                {t.items.map((it, s) => (
                  <div key={s} style={{ paddingLeft: 36 }}>
                    {c + 1}.{s + 1} {c === 6 && s === 1 ? `เจาะเลือดทุกเดือนภายในวันที่ ${f.bloodDrawDay || '……'}` : it}
                  </div>
                ))}
              </td>
              <td style={{ ...td, textAlign: 'center' }}>
                <div>{!t.items.length && f.understood[key(c, 0)] ? <Val>✓</Val> : '\u00a0'}</div>
                {t.items.map((_, s) => (
                  <div key={s}>{f.understood[key(c, s)] ? <Val>✓</Val> : '\u00a0'}</div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ paddingLeft: 30, paddingTop: 10 }}>
        <Dotted label="ข้าพเจ้า" value={fullName(rec)} width={260} /> รับทราบข้อมูลเกี่ยวกับการปลูกถ่ายไตแล้ว
      </div>
      <div>และขอดำเนินการรักษาต่อไป</div>
      <div style={{ paddingLeft: 300, paddingTop: 6 }}>
        <Dotted label="ลงชื่อ" width={170} after="ผู้รับฟังคำแนะนำ" />
        <div style={{ paddingLeft: 30 }}>( {fullName(rec)} )</div>
      </div>
      <div style={{ paddingTop: 6 }}>
        <Dotted label="ลงชื่อ" width={170} after="ผู้ให้คำปรึกษา" />
        <div style={{ paddingLeft: 30 }}>( {f.counselor || '……………………………'} )</div>
      </div>
    </A4Page>
  );

  return (
    <FormShell
      initialMode={initialMode}
      title={FORM_META.counseling.title}
      desc="1.1 Evaluation · ให้ความรู้เรื่องการปลูกถ่ายไตจากผู้บริจาคมีชีวิตและผู้บริจาคสมองตาย"
      icon={Users}
      patient={rec}
      dateLabel="วันที่ให้คำปรึกษา"
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={save}
      savedInfo={info}
      fileName={`${FORM_META.counseling.fileName}-${rec.hn}`}
    >
      <FSection title="ผู้ให้คำปรึกษาและความคืบหน้า" right={<Badge label={`เข้าใจแล้ว ${count}/${keys.length}`} tone={{ fg: '#3730a3', bg: '#e0e7ff', dot: '#4f46e5' }} />}>
        <div className="grid gap-3.5 md:grid-cols-2">
          <Field label="ผู้ให้คำปรึกษา">
            <Select value={f.counselor} onChange={(e) => patch({ counselor: e.target.value })}>
              <option value="">เลือก</option>
              <option>พย.วิภา สุขใจ</option>
              <option>พย.สมใจ รักดี</option>
              <option>นพ.สมเกียรติ วงศ์ไทย</option>
            </Select>
          </Field>
          <Field label="ผู้รับฟังคำแนะนำ" tag="reg">
            <TextInput disabled value={`${fullName(rec)} (ผู้ป่วย)`} readOnly />
          </Field>
        </div>
        <div className="h-1.5 overflow-hidden rounded bg-slate-100">
          <div className="h-full rounded bg-brand-indigo transition-all duration-500" style={{ width: `${(count / keys.length) * 100}%` }} />
        </div>
      </FSection>

      <FSection title="หัวข้อคำแนะนำ">
        {COUNSELING_TOPICS.map((t, c) => {
          const catKeys = t.items.length ? t.items.map((_, s) => key(c, s)) : [key(c, 0)];
          const all = catKeys.every((k) => f.understood[k]);
          return (
            <div key={c} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2.5">
                {!t.items.length && <Box checked={!!f.understood[key(c, 0)]} onChange={(v) => set(key(c, 0), v)} />}
                <span className="text-sm font-bold text-brand-indigo">{c + 1}.</span>
                <span className="flex-1 text-sm font-semibold">{t.title}</span>
                {t.items.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Box checked={all} onChange={(v) => setCat(c, v)} size={18} /> เข้าใจทั้งหมวด
                  </label>
                )}
              </div>
              {t.items.map((it, s) => {
                const k = key(c, s);
                const on = !!f.understood[k];
                return (
                  <div key={k} className="flex items-center gap-2.5 border-t border-slate-100 py-2.5 pl-9 pr-3.5">
                    <Box checked={on} onChange={(v) => set(k, v)} />
                    <span className="text-xs font-semibold text-slate-400">
                      {c + 1}.{s + 1}
                    </span>
                    {c === 6 && s === 1 ? (
                      <span className="flex flex-1 items-center gap-2 text-[13.5px]">
                        เจาะเลือดทุกเดือนภายในวันที่
                        <TextInput className="!h-8 !w-16" inputMode="numeric" value={f.bloodDrawDay} onChange={(e) => patch({ bloodDrawDay: e.target.value })} />
                        ของเดือน
                      </span>
                    ) : (
                      <span className="flex-1 text-[13.5px]">{it}</span>
                    )}
                    <span className={on ? 'text-xs font-medium text-green-700' : 'text-xs font-medium text-orange-700'}>{on ? 'เข้าใจ' : 'ยังไม่ได้ให้คำแนะนำ'}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </FSection>

      <FSection title="ลายเซ็น">
        <p className="flex items-center gap-2.5 rounded-[10px] border border-blue-200 bg-blue-50 px-3 py-2.5 text-[12.5px] text-blue-800">
          <Info className="h-4 w-4 shrink-0" /> ใช้วิธีพิมพ์ฟอร์ม (Export → พิมพ์) ให้ผู้ป่วยและผู้ให้คำปรึกษาลงชื่อ แล้วแนบไฟล์สแกนกลับเข้าระบบ
        </p>
        <label className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-dashed border-indigo-300 bg-slate-50 py-4 text-[13px] font-semibold text-brand-indigo hover:bg-indigo-50">
          <Upload className="h-[18px] w-[18px]" />
          {f.signedFile ? f.signedFile : 'แนบเอกสารที่ลงชื่อแล้ว (PDF / JPG)'}
          <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => patch({ signedFile: e.target.files?.[0]?.name })} />
          {!f.signedFile && <Badge label="ยังไม่ได้แนบ" tone={TONES.orange} />}
        </label>
        {f.date && <p className="text-xs text-slate-400">วันที่ให้คำปรึกษา {thaiDate(f.date)}</p>}
      </FSection>
    </FormShell>
  );
}
