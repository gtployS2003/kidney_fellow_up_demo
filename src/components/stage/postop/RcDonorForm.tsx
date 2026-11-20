import type { ReactNode } from 'react';
import { Activity, Building2, Link2, ShieldCheck } from 'lucide-react';
import type { BloodGroup, PersonRef } from '@/types';
import type { RcDonorRecord } from '@/services/api/postopApi';
import { FormShell } from '@/components/forms/FormShell';
import { FormLoading, Seg } from '@/components/forms/FormBits';
import { DataTag, Field, Select, TextInput } from '@/components/ui/Form';
import { A4Page, LogoBox, Row, tableStyle, td } from '@/components/paper/Paper';
import { aboCompatible, hlaLocusMismatch } from '@/lib/status';
import { cn, fullName, thaiDate } from '@/lib/format';
import { usePostop } from './common';

const LOCI = ['A', 'B', 'DR', 'DQ'] as const;
type Locus = (typeof LOCI)[number];
const NEG_POS = ['Negative', 'Positive'] as const;
const NP_TONES = {
  Negative: { bg: '#dcfce7', fg: '#166534' },
  Positive: { bg: '#fee2e2', fg: '#b91c1c' },
};

/** mismatch ต่อ locus + รวม (DQ นับเมื่อมีทั้งสองฝั่ง) */
function mismatch(f: RcDonorRecord) {
  const per = Object.fromEntries(LOCI.map((l) => [l, hlaLocusMismatch(f.hla[l], f.recipientHla?.[l])])) as Record<Locus, number | null>;
  const ready = per.A !== null && per.B !== null && per.DR !== null;
  const total = ready ? (per.A ?? 0) + (per.B ?? 0) + (per.DR ?? 0) + (per.DQ ?? 0) : null;
  const text = ready ? LOCI.map((l) => (per[l] === null ? 'x' : per[l])).join('-') : '—';
  return { per, total, text };
}

function aboText(f: RcDonorRecord, recipient: BloodGroup) {
  if (!f.abo) return '—';
  return aboCompatible(f.abo, recipient) ? `เข้ากันได้ (${f.abo} → ${recipient})` : `ไม่เข้ากัน (${f.abo} → ${recipient}) · ABOi`;
}

const hlaLine = (h?: Partial<Record<Locus, readonly string[]>>) =>
  h
    ? LOCI.map((l) => {
        const v = (h[l] ?? []).filter(Boolean);
        return v.length ? `${l} ${v.join(', ')}` : '';
      })
        .filter(Boolean)
        .join(' · ') || '—'
    : '—';

/** 3.2 ข้อมูลผู้บริจาค (สภากาชาด) — กรอกหลังผ่าตัด */
export function RcDonorForm({ person, filled, onSaved }: { person: PersonRef; filled: boolean; onSaved?: () => void }) {
  const { data: f, patch, save, info } = usePostop<RcDonorRecord>('recipient', person, 'rcDonor', filled);
  if (!f) return <FormLoading />;
  const mm = mismatch(f);
  const abo = aboText(f, person.bloodGroup);
  const aboBad = !!f.abo && !aboCompatible(f.abo, person.bloodGroup);
  const setHla = (l: Locus, i: 0 | 1, v: string) =>
    patch({
      hla: {
        ...f.hla,
        [l]: (i === 0 ? [v, f.hla[l][1]] : [f.hla[l][0], v]) as [string, string],
      },
    });
  const t = (k: keyof RcDonorRecord) => ({
    value: f[k] as string,
    onChange: (e: { target: { value: string } }) => patch({ [k]: e.target.value } as Partial<RcDonorRecord>),
  });

  const rows: [string, [string, string][]][] = [
    [
      '1. ข้อมูลผู้บริจาค',
      [
        ['รหัสผู้บริจาค (สภากาชาด)', f.redCrossCode],
        ['โรงพยาบาลต้นทาง', f.sourceHospital],
        ['วันที่ได้รับไต', f.receivedDate ? thaiDate(f.receivedDate) : ''],
        ['อายุ / เพศ', [f.age && `${f.age} ปี`, f.sex === 'male' ? 'ชาย' : f.sex === 'female' ? 'หญิง' : ''].filter(Boolean).join(' · ')],
        ['สาเหตุการเสียชีวิต', f.causeOfDeath],
      ],
    ],
    [
      '2. ความเข้ากันทางภูมิคุ้มกัน',
      [
        ['ABO / Rh ผู้บริจาค → ผู้รับ', f.abo ? `${f.abo}${f.rh} → ${person.bloodGroup}${person.rh} · ${abo}` : ''],
        ['HLA ผู้บริจาค', hlaLine(f.hla)],
        ['HLA ผู้รับ (iMed)', hlaLine(f.recipientHla)],
        ['HLA mismatch (A-B-DR-DQ)', mm.total === null ? '' : `${mm.text} (รวม ${mm.total})`],
        ['Crossmatch (CDC)', f.crossmatch],
        ['PRA / DSA', [f.pra && `${f.pra}%`, f.dsa && `DSA ${f.dsa}`].filter(Boolean).join(' · ')],
      ],
    ],
    [
      '3. ข้อมูลไตที่ได้รับ',
      [
        ['Creatinine ผู้บริจาค', f.donorCr ? `${f.donorCr} mg/dL` : ''],
        ['CMV IgG (D / R)', f.cmv],
        ['Cold ischemia time', f.cit],
      ],
    ],
  ];

  const preview = (
    <A4Page>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12.5 }}>หน่วยปลูกถ่ายไต โรงพยาบาลมหาวิทยาลัยนเรศวร</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>บันทึกข้อมูลผู้บริจาคไต (สภากาชาด)</div>
          <div style={{ fontSize: 11.5, color: '#374151' }}>Deceased donor kidney transplantation · กรอกหลังผ่าตัด</div>
        </div>
        <div style={{ width: 118 }} />
      </Row>
      <div style={{ borderTop: '1px solid #111827', margin: '2px 0' }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 16,
        }}
      >
        <span>
          ผู้รับ {fullName(person)} · HN {person.hn}
        </span>
        <span>
          อายุ {person.age} ปี · กรุ๊ปเลือด {person.bloodGroup}
          {person.rh}
        </span>
        <span>วันที่ผ่าตัด {person.stageDates.surgery ? thaiDate(person.stageDates.surgery) : '—'}</span>
      </div>
      {rows.map(([title, kv]) => (
        <table key={title} style={tableStyle}>
          <tbody>
            <tr>
              <td colSpan={2} style={{ ...td, background: '#e5e7eb', fontWeight: 700 }}>
                {title}
              </td>
            </tr>
            {kv.map(([k, v]) => (
              <tr key={k}>
                <td style={{ ...td, width: 230, background: '#f8fafc' }}>{k}</td>
                <td style={{ ...td, fontWeight: 600 }}>{v || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ alignSelf: 'flex-end', textAlign: 'center' }}>
        <div>ลงชื่อ ........................................ ผู้บันทึก</div>
        <div>วันที่ {thaiDate(f.date)}</div>
      </div>
    </A4Page>
  );

  return (
    <FormShell
      title="ข้อมูลผู้บริจาค (สภากาชาด)"
      desc="3.2 ผ่าตัด · กรอกหลังบันทึกการผ่าตัด · ข้อมูลที่สภากาชาดส่งมาพร้อมไต"
      icon={Building2}
      gradient={['#8b5cf6', '#6d28d9']}
      patient={person}
      dateLabel="วันที่บันทึก"
      date={f.date}
      onDate={(date) => patch({ date })}
      preview={preview}
      onSave={async (draft) => {
        await save();
        if (!draft) onSaved?.();
      }}
      savedInfo={info}
      fileName={`KT-redcross-donor-${person.hn}`}
    >
      <Card icon={Building2} tint="#ede9fe" fg="#6d28d9" title="ข้อมูลผู้บริจาค" sub="จากเอกสารสภากาชาดที่มากับไต">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="รหัสผู้บริจาค (สภากาชาด)" required>
            <TextInput placeholder="เช่น DD-2569-0142" {...t('redCrossCode')} />
          </Field>
          <Field label="โรงพยาบาลต้นทาง">
            <TextInput {...t('sourceHospital')} />
          </Field>
          <Field label="วันที่ได้รับไต">
            <TextInput type="date" {...t('receivedDate')} />
          </Field>
          <Field label="อายุ (ปี)">
            <TextInput inputMode="numeric" {...t('age')} />
          </Field>
          <Field label="เพศ">
            <Select {...t('sex')}>
              <option value="">— เลือก —</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
            </Select>
          </Field>
          <Field label="สาเหตุการเสียชีวิต">
            <TextInput {...t('causeOfDeath')} />
          </Field>
        </div>
      </Card>

      <Card icon={Link2} tint="#dbeafe" fg="#2563eb" title="ความเข้ากันทางภูมิคุ้มกัน" sub="HLA ผู้รับดึงจาก iMed · mismatch คำนวณให้อัตโนมัติ">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="ABO / Rh ผู้บริจาค" required>
            <div className="flex gap-2">
              <Select {...t('abo')}>
                <option value="">ABO</option>
                {(['O', 'A', 'B', 'AB'] as const).map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
              <Select className="!w-[92px] shrink-0" {...t('rh')}>
                <option value="">Rh</option>
                <option>+</option>
                <option>-</option>
              </Select>
            </div>
          </Field>
          <Field label="ABO ผู้รับ" tag="reg">
            <TextInput disabled value={`${person.bloodGroup}${person.rh}`} />
          </Field>
          <Field label="ความเข้ากันของ ABO" tag="auto">
            <TextInput disabled value={abo} className={cn(aboBad && '!text-red-700')} />
          </Field>
        </div>

        <div className="overflow-x-auto rounded-[10px] border border-slate-200">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Locus</th>
                <th className="px-3 py-2 text-left">ผู้บริจาค (สภากาชาด)</th>
                <th className="px-3 py-2 text-left">
                  <span className="inline-flex items-center gap-1.5">
                    ผู้รับ <DataTag kind="his" />
                  </span>
                </th>
                <th className="px-3 py-2 text-center">Mismatch</th>
              </tr>
            </thead>
            <tbody>
              {LOCI.map((l) => {
                const m = mm.per[l];
                return (
                  <tr key={l} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 font-semibold">{l}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex gap-1.5">
                        {([0, 1] as const).map((i) => (
                          <TextInput key={i} className="!h-8 !w-[84px]" aria-label={`HLA-${l} ผู้บริจาค ${i + 1}`} value={f.hla[l][i]} onChange={(e) => setHla(l, i, e.target.value)} />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex gap-1.5">
                        {[0, 1].map((i) => (
                          <span key={i} className="flex h-8 w-[84px] items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 text-slate-500">
                            {f.recipientHla?.[l]?.[i] || '—'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-center">{m === null ? <span className="text-xs text-slate-400">—</span> : <span className={cn('inline-grid h-6 min-w-6 place-items-center rounded-full px-2 text-xs font-bold', m ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700')}>{m}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] bg-blue-50 px-3.5 py-2.5 text-[13px] text-blue-800">
          <span className="font-semibold">HLA mismatch (A-B-DR-DQ)</span>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-blue-700">{mm.text}</span>
          <span className="text-[12.5px]">{mm.total === null ? 'กรอก HLA ผู้บริจาค A, B, DR ให้ครบเพื่อคำนวณ' : `รวม ${mm.total}`}</span>
          {!f.recipientHla && <span className="text-[12.5px] text-amber-700">· ยังไม่มี HLA ผู้รับใน iMed</span>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Crossmatch (CDC)">
            <Seg value={f.crossmatch} options={NEG_POS} tones={NP_TONES} width={200} onChange={(v) => patch({ crossmatch: v })} />
          </Field>
          <Field label="PRA (%)" hint={f.recipientPra !== undefined ? `iMed ล่าสุด ${f.recipientPra}%` : undefined}>
            <TextInput inputMode="decimal" {...t('pra')} />
          </Field>
          <Field label="DSA">
            <Seg value={f.dsa} options={NEG_POS} tones={NP_TONES} width={200} onChange={(v) => patch({ dsa: v })} />
          </Field>
        </div>
      </Card>

      <Card icon={Activity} tint="#dcfce7" fg="#16a34a" title="ข้อมูลไตที่ได้รับ">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Creatinine ผู้บริจาค (mg/dL)">
            <TextInput inputMode="decimal" {...t('donorCr')} />
          </Field>
          <Field label="CMV IgG (D / R)">
            <TextInput placeholder="เช่น D+ / R+" {...t('cmv')} />
          </Field>
          <Field label="Cold ischemia time">
            <TextInput placeholder="เช่น 14 ชม. 30 นาที" {...t('cit')} />
          </Field>
        </div>
      </Card>

      <p className="flex items-center gap-2 rounded-[10px] border border-violet-200 bg-violet-50 px-3 py-2.5 text-[12.5px] text-violet-800">
        <ShieldCheck className="h-4 w-4 shrink-0" /> เมื่อบันทึก → สร้างรายการในเมนูผู้บริจาค › “ไตจากสภากาชาด” อัตโนมัติ และผูกกับผู้รับรายนี้
      </p>
    </FormShell>
  );
}

function Card({ icon: Icon, tint, fg, title, sub, children }: { icon: typeof Building2; tint: string; fg: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-[14px] border border-slate-200 bg-white p-[18px]">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: tint, color: fg }}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-[15px] font-bold">{title}</h3>
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
