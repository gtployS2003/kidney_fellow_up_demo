import { useEffect, useState } from 'react';
import { Activity, Building2, FileText, Scissors } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import { postopApi, type SurgeryRecord } from '@/services/api/postopApi';
import { FormShell } from '@/components/forms/FormShell';
import { FormLoading } from '@/components/forms/FormBits';
import { Field, TextInput, Textarea } from '@/components/ui/Form';
import { Badge, TONES } from '@/components/ui/Badge';
import { Bars } from '@/components/charts/Bars';
import { A4Page, LogoBox, Row, tableStyle, td } from '@/components/paper/Paper';
import { fullName, thaiDate } from '@/lib/format';
import { SubNav, usePostop } from './common';
import { RcDonorForm } from './RcDonorForm';

type K = keyof SurgeryRecord;

interface P {
  person: PersonRef;
  kind: PersonKind;
  filled: boolean;
}

/**
 * ขั้นตอน “ผ่าตัด”
 * - ผู้รับที่ได้ไตจากสภากาชาด: มีขั้นตอนย่อย 3.1 บันทึกการผ่าตัด → 3.2 ข้อมูลผู้บริจาค (สภากาชาด) · 3.2 เปิดเมื่อบันทึก 3.1 แล้ว
 * - ผู้รับที่มีผู้บริจาคมีชีวิต / ผู้บริจาค: ฟอร์มเดียว (ไม่มีขั้นตอนย่อย)
 */
export function SurgeryPanel({ person, kind, filled }: P) {
  const rc = kind === 'recipient' && person.caseType === 'redcross';
  if (!rc) return <SurgeryForm person={person} kind={kind} filled={filled} />;
  return <RedCrossSurgery person={person} kind={kind} filled={filled} />;
}

function RedCrossSurgery({ person, kind, filled }: P) {
  const [state, setState] = useState<{
    surgery: boolean;
    donor: boolean;
  } | null>(null);
  const [sel, setSel] = useState<'surgery' | 'rcDonor'>('surgery');
  useEffect(() => {
    let alive = true;
    Promise.all([postopApi.get(kind, person, 'surgery', filled), postopApi.get(kind, person, 'rcDonor', filled)]).then(([s, d]) => {
      if (!alive) return;
      const st = {
        surgery: !!s.savedAt,
        donor: !!d.savedAt && !!(d.data as { redCrossCode?: string }).redCrossCode,
      };
      setState(st);
      setSel(st.surgery && !st.donor ? 'rcDonor' : 'surgery');
    });
    return () => {
      alive = false;
    };
  }, [kind, person, filled]);
  if (!state) return <FormLoading />;
  const items = [
    {
      key: 'surgery',
      num: '3.1',
      title: 'บันทึกการผ่าตัด',
      sub: 'ศัลยแพทย์และทีมผ่าตัด',
      icon: Scissors,
      tint: '#dbeafe',
      fg: '#2563eb',
      done: state.surgery,
    },
    {
      key: 'rcDonor',
      num: '3.2',
      title: 'ข้อมูลผู้บริจาค (สภากาชาด)',
      sub: 'กรอกหลังผ่าตัด',
      icon: Building2,
      tint: '#ede9fe',
      fg: '#6d28d9',
      done: state.donor,
      pending: state.surgery && !state.donor,
      locked: !state.surgery,
      lockedHint: 'เปิดให้กรอกหลังบันทึก 3.1 บันทึกการผ่าตัด',
    },
  ];
  return (
    <SubNav items={items} sel={sel} onSel={(k) => setSel(k as typeof sel)} footer="3.2 เปิดให้กรอกหลังบันทึก 3.1 · ผู้รับที่มีผู้บริจาคมีชีวิตไม่มีขั้นตอนย่อยนี้">
      {sel === 'surgery' ? <SurgeryForm person={person} kind={kind} filled={filled} onSaved={() => setState((s) => (s ? { ...s, surgery: true } : s))} /> : <RcDonorForm person={person} filled={filled} onSaved={() => setState((s) => (s ? { ...s, donor: true } : s))} />}
    </SubNav>
  );
}

function SurgeryForm({ person, kind, filled, onSaved }: P & { onSaved?: () => void }) {
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
      desc={rc ? '3.1 ผ่าตัด · บันทึกโดยศัลยแพทย์และทีมผ่าตัด · บันทึกแล้วจึงกรอก 3.2 ข้อมูลผู้บริจาคได้' : `ขั้นตอนนี้ไม่มีขั้นตอนย่อย · บันทึกโดยศัลยแพทย์และทีมผ่าตัด${donor ? ' · ผู้บริจาค' : ''}`}
      icon={Scissors}
      gradient={['#0ea5e9', '#2563eb']}
      patient={person}
      dateLabel="วันที่ผ่าตัด"
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={async (draft) => {
        await save();
        if (!draft) onSaved?.();
      }}
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
          <Bars
            height={110}
            data={creat.map((v, i) => ({
              label: `D${i}`,
              value: v,
              color: i >= 4 ? '#2563eb' : '#93c5fd',
            }))}
          />
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
    </FormShell>
  );
}
