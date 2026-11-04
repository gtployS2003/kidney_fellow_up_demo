import { Activity, Building2, FileText, Link2, Scissors } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import type { SurgeryRecord } from '@/services/api/postopApi';
import { FormShell } from '@/components/forms/FormShell';
import { FormLoading } from '@/components/forms/FormBits';
import { Field, TextInput, Textarea } from '@/components/ui/Form';
import { Badge, TONES } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bars } from '@/components/charts/Bars';
import { A4Page, LogoBox, Row, tableStyle, td } from '@/components/paper/Paper';
import { fullName, thaiDate } from '@/lib/format';
import { usePostop } from './common';

type K = keyof SurgeryRecord;

export function SurgeryPanel({ person, kind, filled }: { person: PersonRef; kind: PersonKind; filled: boolean }) {
  const { data: f, patch, save, info } = usePostop<SurgeryRecord>(kind, person, 'surgery', filled);
  if (!f) return <FormLoading />;
  const donor = kind === 'donor';
  const rc = !donor && person.caseType === 'redcross';

  const fields: [string, K][] = donor
    ? [
        ['ชนิดการผ่าตัด', 'donorType'],
        ['ศัลยแพทย์', 'surgeon'],
        ['วิสัญญีแพทย์', 'anesthetist'],
        ['ระยะเวลาผ่าตัด', 'duration'],
        ['ไตที่บริจาค / วิธีผ่าตัด', 'side'],
        ['Warm ischemia time', 'wit'],
        ['เสียเลือด', 'bloodLoss'],
        ['ภาวะแทรกซ้อนระหว่างผ่าตัด', 'complication'],
      ]
    : [
        ['ชนิดไตที่ได้รับ', 'donorType'],
        ['ผู้บริจาค', 'donorName'],
        ['ศัลยแพทย์', 'surgeon'],
        ['วิสัญญีแพทย์', 'anesthetist'],
        ['ระยะเวลาผ่าตัด', 'duration'],
        ['ไตที่ใช้ / ตำแหน่ง', 'side'],
        ['Cold ischemia time', 'cit'],
        ['Warm ischemia time', 'wit'],
        ['HLA mismatch', 'hlaMm'],
        ['Induction therapy', 'induction'],
        ['เสียเลือด', 'bloodLoss'],
        ['DJ stent', 'djStent'],
        ['ภาวะแทรกซ้อนระหว่างผ่าตัด', 'complication'],
        ['ABO', 'abo'],
      ];
  const creat = f.creat.map((c) => parseFloat(c) || 0);
  const setCreat = (i: number, v: string) => patch({ creat: f.creat.map((c, j) => (j === i ? v : c)) });

  const preview = (
    <A4Page>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <div style={{ fontSize: 15, fontWeight: 600 }}>{donor ? 'บันทึกการผ่าตัดผู้บริจาคไต (Donor nephrectomy)' : 'บันทึกการผ่าตัดปลูกถ่ายไต (Kidney transplantation)'}</div>
      </Row>
      <div>
        {fullName(person)} · HN {person.hn} · อายุ {person.age} ปี · วันที่ผ่าตัด {thaiDate(f.date)}
      </div>
      <table style={tableStyle}>
        <tbody>
          {fields.map(([l, k]) => (
            <tr key={k}>
              <td style={{ ...td, width: 220, background: '#f8fafc' }}>{l}</td>
              <td style={td}>{f[k] as string}</td>
            </tr>
          ))}
          <tr>
            <td style={{ ...td, background: '#f8fafc' }}>Creatinine POD 0–7 (mg/dL)</td>
            <td style={td}>{f.creat.filter(Boolean).join(' · ')}</td>
          </tr>
          {!donor && (
            <tr>
              <td style={{ ...td, background: '#f8fafc' }}>Urine output D0 / Tac D5 / Dialysis</td>
              <td style={td}>
                {f.urineD0} / {f.tacD5} / {f.dialysis}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ ...td, background: '#f8fafc' }}>หมายเหตุศัลยแพทย์</td>
            <td style={{ ...td, height: 70 }}>{f.notes}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ textAlign: 'right', paddingTop: 20 }}>ลงชื่อ ........................................ ศัลยแพทย์</div>
    </A4Page>
  );

  return (
    <FormShell
      title="บันทึกการผ่าตัด"
      desc={`ขั้นตอนนี้ยังไม่มีขั้นตอนย่อย · บันทึกโดยศัลยแพทย์และทีมผ่าตัด${donor ? ' · ผู้บริจาค' : ''}`}
      icon={Scissors}
      gradient={['#0ea5e9', '#2563eb']}
      patient={person}
      dateLabel="วันที่ผ่าตัด"
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={() => save()}
      savedInfo={info}
      fileName={`KT-surgery-${person.hn}`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex min-w-[420px] flex-[1.6] flex-col gap-4">
          <section className="flex flex-col gap-3.5 rounded-[14px] border border-slate-200 bg-white p-[18px]">
            <h3 className="flex items-center gap-2 text-[15px] font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-600">
                <Scissors className="h-4 w-4" />
              </span>
              บันทึกการผ่าตัด
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {fields.map(([l, k]) => (
                <Field key={k} label={l}>
                  <TextInput className={k === 'complication' && f.complication === 'ไม่มี' ? '!text-green-700' : ''} value={f[k] as string} onChange={(e) => patch({ [k]: e.target.value } as Partial<SurgeryRecord>)} />
                </Field>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-3 rounded-[14px] border border-slate-200 bg-white p-[18px]">
            <h3 className="flex items-center gap-2 text-[15px] font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
                <FileText className="h-4 w-4" />
              </span>
              หมายเหตุศัลยแพทย์
            </h3>
            <Textarea value={f.notes} onChange={(e) => patch({ notes: e.target.value })} />
          </section>
        </div>

        <section className="flex min-w-[320px] flex-1 flex-col gap-3 rounded-[14px] border border-slate-200 bg-white p-[18px]">
          <h3 className="flex items-center gap-2 text-[15px] font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-green-100 text-green-600">
              <Activity className="h-4 w-4" />
            </span>
            {donor ? 'การทำงานของไตที่เหลือ' : 'การทำงานของไตหลังผ่าตัด'}
          </h3>
          {!donor && f.graft && <Badge label={f.graft} tone={TONES.green} className="w-fit" />}
          <p className="text-xs font-semibold text-slate-500">Creatinine (mg/dL) · POD 0–7</p>
          <Bars height={110} data={creat.map((v, i) => ({ label: `D${i}`, value: v, color: i >= 4 ? '#2563eb' : '#93c5fd' }))} />
          <div className="grid grid-cols-8 gap-1">
            {f.creat.map((c, i) => (
              <input key={i} value={c} onChange={(e) => setCreat(i, e.target.value)} className="h-8 w-full rounded-md border border-slate-300 px-1 text-center text-xs outline-none focus:border-primary" aria-label={`Creatinine D${i}`} />
            ))}
          </div>
          {!donor &&
            (
              [
                ['Urine output D0', 'urineD0'],
                ['Tacrolimus D5', 'tacD5'],
                ['Dialysis หลังผ่าตัด', 'dialysis'],
              ] as [string, K][]
            ).map(([l, k]) => (
              <label key={k} className="flex items-center gap-3 border-t border-slate-100 pt-2.5 text-[13px]">
                <span className="w-[140px] text-slate-400">{l}</span>
                <TextInput className="!h-8 flex-1" value={f[k] as string} onChange={(e) => patch({ [k]: e.target.value } as Partial<SurgeryRecord>)} />
              </label>
            ))}
        </section>
      </div>

      {rc && (
        <section className="flex flex-col gap-4 rounded-2xl border-[1.5px] border-violet-300 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-violet-100 text-violet-700">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-base font-bold">ข้อมูลผู้บริจาค (สภากาชาด)</p>
              <p className="text-[12.5px] text-slate-500">เปิดให้กรอกหลังบันทึกการผ่าตัด · เฉพาะผู้รับที่ไม่มีผู้บริจาคมีชีวิต</p>
            </div>
            <Badge label="field รอกำหนด" tone={TONES.violet} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['รหัสผู้บริจาค (สภากาชาด)', 'โรงพยาบาลต้นทาง', 'อายุ / เพศ', 'กรุ๊ปเลือด', 'HLA', 'สาเหตุการเสียชีวิต'].map((l) => (
              <Field key={l} label={l}>
                <TextInput placeholder="field รอกำหนด" className="!border-dashed" />
              </Field>
            ))}
          </div>
          <p className="flex items-center gap-2 rounded-[10px] border border-violet-200 bg-violet-50 px-3 py-2.5 text-[12.5px] text-violet-800">
            <Link2 className="h-4 w-4" /> เมื่อบันทึก → สร้างรายการในเมนูผู้บริจาค › “ไตจากสภากาชาด” อัตโนมัติ และผูกกับผู้รับรายนี้
          </p>
          <div className="flex justify-end">
            <Button variant="indigo" size="sm">
              บันทึกข้อมูลผู้บริจาค
            </Button>
          </div>
        </section>
      )}
    </FormShell>
  );
}
