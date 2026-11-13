import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Building2, Check, Info, Link2, Lock, Printer, Save, Search, UserPlus } from 'lucide-react';
import type { DonorCreateDto, DonorDetailDto, IntendedDonor, RecipientDetailDto } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { CaseBadge, StatusBadge } from '@/components/ui/Badge';
import { Checkbox, ChoiceChips, DataTag, Field, TextInput, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { KidneyBuddy } from '@/components/brand/KidneyBuddy';
import { stagger } from '@/components/ui/motion';
import { Section, SubHeading } from '@/components/forms/RegSection';
import { useAsync } from '@/hooks/useAsync';
import { recipientApi } from '@/services/api/recipientApi';
import { donorApi } from '@/services/api/donorApi';
import { ageFrom, cn, fullName } from '@/lib/format';

const initial = (recipientId = ''): DonorCreateDto => ({
  filledDate: new Date().toISOString().slice(0, 10),
  recipientId,
  relation: '',
  prefix: '',
  bloodGroup: '',
  firstName: '',
  lastName: '',
  hn: '',
  nationalId: '',
  birthDate: '',
  ethnicity: '',
  nationality: '',
  maritalStatus: '',
  education: '',
  occupation: '',
  occupationOther: '',
  income: '',
  expense: '',
  savings: '',
  coverage: '',
  address: '',
  sameAddressAsRecipient: false,
  phone1: '',
  phone2: '',
  lineId: '',
  siblings: '',
  children: '',
  relativeFirstName: '',
  relativeLastName: '',
  relativePhone1: '',
  relativePhone2: '',
});

type Key = keyof DonorCreateDto;
const SECTIONS: { id: string; title: string; required: Key[] }[] = [
  { id: 'd1', title: 'ประเภทผู้บริจาค', required: [] },
  { id: 'd2', title: 'ผู้รับไต', required: ['recipientId', 'relation'] },
  { id: 'd3', title: 'ข้อมูลส่วนตัว', required: ['prefix', 'bloodGroup', 'firstName', 'lastName', 'hn', 'nationalId', 'birthDate'] },
  { id: 'd4', title: 'เศรษฐกิจและสิทธิการรักษา', required: ['coverage'] },
  { id: 'd5', title: 'ข้อมูลการติดต่อ', required: ['phone1'] },
  { id: 'd6', title: 'ครอบครัวและญาติ', required: ['relativeFirstName', 'relativeLastName', 'relativePhone1'] },
];

export default function DonorRegister() {
  useCrumbs(['ผู้บริจาคไต (Donor)', 'ลงทะเบียนผู้บริจาคไต']);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromRecipient = params.get('recipient') ?? '';
  const [f, setF] = useState<DonorCreateDto>(() => initial(fromRecipient));
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [current, setCurrent] = useState('d1');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<DonorDetailDto | null>(null);
  const [q, setQ] = useState('');
  const [pickedIntended, setPickedIntended] = useState<number | null>(null);

  // ผู้รับที่เลือก (ดึงรายละเอียดเพื่อใช้รายชื่อผู้ประสงค์บริจาค)
  const recipient = useAsync(() => (f.recipientId ? recipientApi.get(f.recipientId) : Promise.resolve(null)), [f.recipientId, saved?.id]);
  const search = useAsync(() => (q.trim().length >= 2 ? recipientApi.list({ search: q }) : Promise.resolve([])), [q]);
  const r = recipient.data;
  const candidates: (IntendedDonor & { idx: number })[] = useMemo(() => (r?.intendedDonors ?? []).map((d, idx) => ({ ...d, idx })).filter((d) => !d.donorId), [r]);

  // ถ้ามาจากหน้าลงทะเบียนผู้รับ → เลือกผู้ประสงค์บริจาคคนแรกให้อัตโนมัติ
  useEffect(() => {
    if (fromRecipient && candidates.length && pickedIntended === null && !f.firstName) pickIntended(candidates[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates]);

  const set = <K extends Key>(k: K, v: DonorCreateDto[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const bind = (k: Key) => ({ value: f[k] as string, onChange: (e: { target: { value: string } }) => set(k, e.target.value as never) });
  const err = (k: Key) => errors[k];
  const filled = (k: Key) => (typeof f[k] === 'string' ? (f[k] as string).trim() !== '' : true);
  const done = Object.fromEntries(SECTIONS.map((s) => [s.id, s.required.every(filled) && (s.id !== 'd5' || f.sameAddressAsRecipient || f.address.trim() !== '')]));

  function pickIntended(d: IntendedDonor & { idx: number }) {
    setPickedIntended(d.idx);
    setF((p) => ({ ...p, firstName: d.firstName, lastName: d.lastName, relation: d.relation }));
  }

  async function submit() {
    const missing: Partial<Record<Key, string>> = {};
    SECTIONS.forEach((s) => s.required.forEach((k) => !filled(k) && (missing[k] = 'กรุณากรอกข้อมูล')));
    if (!f.sameAddressAsRecipient && !f.address.trim()) missing.address = 'กรุณากรอกข้อมูล';
    if (Object.keys(missing).length) {
      setErrors(missing);
      const first = SECTIONS.find((s) => s.required.some((k) => missing[k])) ?? SECTIONS[4];
      document.getElementById(first.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSaving(true);
    try {
      setSaved(await donorApi.create(f));
    } finally {
      setSaving(false);
    }
  }

  const remaining = candidates.filter((c) => c.idx !== pickedIntended);

  return (
    <>
      <PageHeader
        leading={<Button variant="secondary" icon={ArrowLeft} to="/clinical/donors" className="!w-10 !px-0" />}
        title="ลงทะเบียนผู้บริจาคไต (Donor)"
        subtitle="Kidney Transplantation Donor Registration Form · ช่องที่มี * จำเป็นต้องกรอก"
        actions={
          <Field label="วันที่กรอกข้อมูล" required className="w-[200px]">
            <TextInput type="date" {...bind('filledDate')} />
          </Field>
        }
      />

      {/* แถบลงทะเบียนคู่ (มาจากหน้าลงทะเบียนผู้รับ) */}
      <AnimatePresence>
        {fromRecipient && r && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 rounded-2xl border border-teal-200 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-teal-700">
              <Link2 className="h-4 w-4" /> ลงทะเบียนคู่ผู้รับ – ผู้บริจาค <span className="text-xs font-normal text-slate-500">· เปิดต่อจากหน้าลงทะเบียนผู้รับ</span>
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <PairStep n={1} state="done" title={`ผู้รับ: ${fullName(r)}`} sub={`บันทึกแล้ว · HN ${r.hn}`} />
              <ArrowRight className="h-4 w-4 text-slate-300" />
              <PairStep n={2} state="current" title={`ผู้บริจาค: ${f.firstName ? `${f.firstName} ${f.lastName}` : '—'}`} sub="กำลังกรอก" />
              {remaining.length > 0 && (
                <>
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                  <PairStep n={3} state="todo" title={`ผู้บริจาค: ${remaining[0].firstName} ${remaining[0].lastName}`} sub="ลงทะเบียนต่อได้ (ไม่บังคับ)" />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-6">
        <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex min-w-0 flex-1 flex-col gap-5">
          <Section id="d1" n={1} title="ประเภทผู้บริจาค" onFocus={setCurrent}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-primary-soft p-4">
                <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-teal-100 text-teal-700">
                  <Link2 className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold">ผู้บริจาคมีชีวิต (มีคู่แล้ว)</p>
                  <p className="text-xs text-slate-500">ญาติหรือคู่สมรส · กรอกแบบฟอร์มนี้</p>
                </div>
                <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-primary">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-60">
                <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-violet-100 text-violet-700">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold">ผู้บริจาคสมองตาย (สภากาชาด)</p>
                  <p className="text-xs text-slate-500">ไม่ลงทะเบียนที่นี่ — บันทึกในขั้นตอน “ผ่าตัด” ของผู้รับ หลังผ่าตัดเสร็จ</p>
                </div>
              </div>
            </div>
          </Section>

          <Section id="d2" n={2} title="ผู้รับไต" sub="ชื่อ-นามสกุลของผู้รับไต และความสัมพันธ์ · ค้นหาจากผู้รับที่ลงทะเบียนแล้ว" onFocus={setCurrent}>
            {!r ? (
              <div className="relative">
                <label className={cn('flex h-11 items-center gap-2 rounded-[10px] border px-3', err('recipientId') ? 'border-red-400' : 'border-slate-300')}>
                  <Search className="h-4 w-4 text-slate-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="พิมพ์ชื่อหรือ HN ของผู้รับ (อย่างน้อย 2 ตัวอักษร)" className="w-full bg-transparent text-sm outline-none" />
                </label>
                {err('recipientId') && <p className="mt-1 text-xs text-red-600">กรุณาเลือกผู้รับ</p>}
                <AnimatePresence>
                  {(search.data?.length ?? 0) > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop">
                      {search.data!.slice(0, 6).map((x) => (
                        <button key={x.id} type="button" onClick={() => { set('recipientId', x.id); setQ(''); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                          <span className="flex-1">
                            <span className="block text-sm font-semibold">{fullName(x)}</span>
                            <span className="block text-xs text-slate-500">
                              HN {x.hn} · {x.bloodGroup}
                              {x.rh}
                            </span>
                          </span>
                          <StatusBadge status={x.status} />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3.5 rounded-xl border border-teal-300 bg-teal-50 p-3.5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-100 text-[15px] font-bold text-red-800">
                  {r.firstName.charAt(0)}
                  {r.lastName.charAt(0)}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold">{fullName(r)}</span>
                    <CaseBadge caseType={r.caseType} />
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-[13px] text-slate-500">
                    HN {r.hn} · {r.age} ปี · กรุ๊ปเลือด {r.bloodGroup}
                    {r.rh}
                  </p>
                </div>
                {!fromRecipient && (
                  <Button variant="secondary" size="sm" onClick={() => { set('recipientId', ''); setPickedIntended(null); }}>
                    เปลี่ยน
                  </Button>
                )}
              </motion.div>
            )}

            {r && candidates.length > 0 && (
              <div className="flex flex-col gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-blue-800">
                  <Info className="h-4 w-4" /> ผู้ประสงค์บริจาคที่ผู้รับระบุไว้ — เลือกเพื่อเติมชื่อ นามสกุล และความสัมพันธ์อัตโนมัติ
                  <span className="flex-1" />
                  <DataTag kind="reg" />
                </p>
                {candidates.map((c) => {
                  const sel = pickedIntended === c.idx;
                  return (
                    <button key={c.idx} type="button" onClick={() => pickIntended(c)} className={cn('flex items-center gap-2.5 rounded-[10px] border bg-white px-3 py-2.5 text-left', sel ? 'border-primary ring-2 ring-primary/15' : 'border-blue-100')}>
                      <span className={cn('grid h-[18px] w-[18px] place-items-center rounded-full border-[1.5px]', sel ? 'border-primary' : 'border-slate-400')}>{sel && <span className="h-2 w-2 rounded-full bg-primary" />}</span>
                      <span className="text-sm font-semibold">
                        {c.firstName} {c.lastName}
                      </span>
                      <span className="flex-1 text-[13px] text-slate-500">
                        {c.age ? `${c.age} ปี · ` : ''}
                        {c.relation}
                      </span>
                      {sel && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">เลือกแล้ว</span>}
                    </button>
                  );
                })}
              </div>
            )}
            <Field label="ความสัมพันธ์กับผู้รับไต" required error={err('relation')} tag={pickedIntended !== null ? 'reg' : undefined}>
              <TextInput placeholder="เช่น พี่ชาย, มารดา, คู่สมรส" {...bind('relation')} />
            </Field>
          </Section>

          <Section id="d3" n={3} title="ข้อมูลส่วนตัวผู้บริจาค" onFocus={setCurrent}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="คำนำหน้า" required error={err('prefix')}>
                <ChoiceChips options={['นาย', 'นาง', 'นางสาว']} value={f.prefix} onChange={(v) => set('prefix', v)} />
              </Field>
              <Field label="กรุ๊ปเลือด" required error={err('bloodGroup')}>
                <ChoiceChips options={['A', 'B', 'O', 'AB']} value={f.bloodGroup} onChange={(v) => set('bloodGroup', v)} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_180px]">
              <Field label="ชื่อ" required error={err('firstName')} tag={pickedIntended !== null ? 'reg' : undefined}>
                <TextInput {...bind('firstName')} />
              </Field>
              <Field label="นามสกุล" required error={err('lastName')} tag={pickedIntended !== null ? 'reg' : undefined}>
                <TextInput {...bind('lastName')} />
              </Field>
              <Field label="HN" required error={err('hn')}>
                <TextInput placeholder="เช่น 990320" {...bind('hn')} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_200px_140px]">
              <Field label="เลขบัตรประชาชน" required error={err('nationalId')}>
                <TextInput placeholder="x-xxxx-xxxxx-xx-x" {...bind('nationalId')} />
              </Field>
              <Field label="วันเดือนปีเกิด" required error={err('birthDate')}>
                <TextInput type="date" {...bind('birthDate')} />
              </Field>
              <Field label="อายุ" tag="auto">
                <TextInput disabled readOnly value={ageFrom(f.birthDate) ?? ''} placeholder="อัตโนมัติ" suffix="ปี" />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="เชื้อชาติ">
                <TextInput placeholder="เช่น ไทย" {...bind('ethnicity')} />
              </Field>
              <Field label="สัญชาติ">
                <TextInput placeholder="เช่น ไทย" {...bind('nationality')} />
              </Field>
            </div>
            <Field label="สถานภาพ">
              <ChoiceChips options={['โสด', 'สมรส', 'หม้าย', 'หย่า']} value={f.maritalStatus} onChange={(v) => set('maritalStatus', v)} />
            </Field>
            <Field label="ระดับการศึกษาสูงสุด">
              <ChoiceChips options={['ไม่มี', 'ประถมศึกษา', 'มัธยมศึกษา', 'ปวช.', 'ปวส.', 'อนุปริญญา', 'ปริญญาตรี']} value={f.education} onChange={(v) => set('education', v)} />
            </Field>
            <Field label="อาชีพ">
              <div className="flex flex-wrap items-center gap-2">
                <ChoiceChips options={['ไม่มี', 'รับราชการ', 'รัฐวิสาหกิจ', 'ธุรกิจส่วนตัว/ค้าขาย', 'พนักงานเอกชน', 'นักเรียน/นักศึกษา', 'อื่นๆ']} value={f.occupation} onChange={(v) => set('occupation', v)} />
                {f.occupation === 'อื่นๆ' && <TextInput className="!h-9 !w-[220px]" placeholder="ระบุอาชีพ" {...bind('occupationOther')} />}
              </div>
            </Field>
          </Section>

          <Section id="d4" n={4} title="ฐานะทางเศรษฐกิจและสิทธิการรักษา" onFocus={setCurrent}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="รายได้ต่อเดือน">
                <TextInput inputMode="numeric" placeholder="0" suffix="บาท" {...bind('income')} />
              </Field>
              <Field label="รายจ่ายต่อเดือน">
                <TextInput inputMode="numeric" placeholder="0" suffix="บาท" {...bind('expense')} />
              </Field>
              <Field label="เงินออมสำรองสำหรับค่าใช้จ่ายส่วนเกิน">
                <TextInput inputMode="numeric" placeholder="0" suffix="บาท" {...bind('savings')} />
              </Field>
            </div>
            <Field label="สิทธิการรักษา" required error={err('coverage')}>
              <ChoiceChips options={['เบิกราชการ', 'รัฐวิสาหกิจ', 'เบิกเอกชน', 'เบิกประกัน', 'หลักประกันสุขภาพ (30 บาท)', 'ประกันสังคม', 'จ่ายเอง']} value={f.coverage} onChange={(v) => set('coverage', v)} />
            </Field>
          </Section>

          <Section id="d5" n={5} title="ข้อมูลการติดต่อ" onFocus={setCurrent}>
            <div className="flex items-center gap-2">
              <Checkbox checked={f.sameAddressAsRecipient} onChange={(v) => set('sameAddressAsRecipient', v)} label="ใช้ที่อยู่เดียวกับผู้รับไต" />
              <DataTag kind="reg" />
            </div>
            <Field label="ที่อยู่ที่สามารถติดต่อได้" required error={err('address')}>
              <Textarea disabled={f.sameAddressAsRecipient} value={f.sameAddressAsRecipient ? (r as RecipientDetailDto | null)?.address ?? '' : f.address} onChange={(e) => set('address', e.target.value)} placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="หมายเลขโทรศัพท์ 1" required error={err('phone1')}>
                <TextInput inputMode="tel" placeholder="0xx-xxx-xxxx" {...bind('phone1')} />
              </Field>
              <Field label="หมายเลขโทรศัพท์ 2">
                <TextInput inputMode="tel" placeholder="ไม่บังคับ" {...bind('phone2')} />
              </Field>
              <Field label="LINE ID">
                <TextInput placeholder="ใช้เชื่อมต่อ LINE LIFF" {...bind('lineId')} />
              </Field>
            </div>
          </Section>

          <Section id="d6" n={6} title="ครอบครัวและญาติที่ติดต่อได้" onFocus={setCurrent}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="จำนวนพี่น้อง (ไม่รวมท้องเดียวกัน)">
                <TextInput inputMode="numeric" suffix="คน" placeholder="0" {...bind('siblings')} />
              </Field>
              <Field label="จำนวนบุตร">
                <TextInput inputMode="numeric" suffix="คน" placeholder="0" {...bind('children')} />
              </Field>
            </div>
            <SubHeading>ญาติใกล้ชิดที่สามารถติดต่อได้</SubHeading>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ชื่อ" required error={err('relativeFirstName')}>
                <TextInput {...bind('relativeFirstName')} />
              </Field>
              <Field label="นามสกุล" required error={err('relativeLastName')}>
                <TextInput {...bind('relativeLastName')} />
              </Field>
              <Field label="หมายเลขโทรศัพท์ 1" required error={err('relativePhone1')}>
                <TextInput inputMode="tel" {...bind('relativePhone1')} />
              </Field>
              <Field label="หมายเลขโทรศัพท์ 2">
                <TextInput inputMode="tel" placeholder="ไม่บังคับ" {...bind('relativePhone2')} />
              </Field>
            </div>
          </Section>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" to="/clinical/donors">
              ยกเลิก
            </Button>
            <Button variant="secondary" icon={Save}>
              บันทึกร่าง
            </Button>
            <Button icon={Check} onClick={submit} disabled={saving}>
              {saving ? 'กำลังบันทึก…' : 'บันทึกการลงทะเบียน'}
            </Button>
          </div>
        </motion.div>

        <aside className="sticky top-24 hidden w-[300px] shrink-0 flex-col gap-5 xl:flex">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-2 text-[15px] font-bold">หัวข้อในแบบฟอร์ม</p>
            {SECTIONS.map((s, i) => {
              const ok = done[s.id];
              const cur = current === s.id;
              return (
                <button key={s.id} type="button" onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={cn('relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px]', cur ? 'font-semibold text-primary' : 'text-slate-700 hover:bg-slate-50')}>
                  {cur && <motion.span layoutId="donor-form-index" className="absolute inset-0 rounded-lg bg-primary-soft" />}
                  <motion.span animate={{ backgroundColor: ok ? '#16a34a' : cur ? '#2563eb' : '#ffffff', borderColor: ok || cur ? 'rgba(0,0,0,0)' : '#cbd5e1' }} className="relative grid h-[22px] w-[22px] place-items-center rounded-full border text-[11px] font-bold">
                    {ok ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : <span className={cur ? 'text-white' : 'text-slate-400'}>{i + 1}</span>}
                  </motion.span>
                  <span className="relative">{s.title}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="flex items-center gap-2 text-[15px] font-bold">
              <Printer className="h-4 w-4 text-slate-500" /> Sticker บนแบบฟอร์ม
            </p>
            <p className="text-[12.5px] text-slate-500">ตอนพิมพ์จะมีกรอบ “Sticker Recipient” และ “Sticker Donor” ท้ายฟอร์มเหมือนกระดาษ</p>
            <div className="flex gap-2">
              {['Sticker Recipient', 'Sticker Donor'].map((x) => (
                <span key={x} className="grid h-12 flex-1 place-items-center rounded border border-slate-500 text-[11px] text-slate-600">
                  {x}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[15px] font-bold">หลังบันทึก ระบบจะ</p>
            {['ผูกผู้บริจาคกับผู้รับ (แสดงในทั้งสองฝั่ง)', 'ตั้งสถานะเริ่มต้นเป็น Evaluation', 'ส่งลิงก์ LINE LIFF (ถ้ามี LINE ID)'].map((t) => (
              <p key={t} className="flex gap-2 text-[13px] text-slate-700">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100">
                  <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                </span>
                {t}
              </p>
            ))}
          </div>
          <p className="flex gap-2.5 rounded-xl border border-orange-200 bg-orange-50 p-3.5 text-xs text-orange-800">
            <Lock className="h-4 w-4 shrink-0" /> เลขบัตรประชาชนและข้อมูลรายได้แสดงเฉพาะทีมที่มีสิทธิ์ และบันทึกใน Audit log
          </p>
        </aside>
      </div>

      <Modal open={!!saved} onClose={() => setSaved(null)}>
        {saved && (
          <div className="flex flex-col items-center gap-3 text-center">
            <KidneyBuddy pose="success" size={160} />
            <h3 className="text-xl font-bold">ลงทะเบียนผู้บริจาคสำเร็จ</h3>
            <p className="text-sm text-slate-600">
              {fullName(saved)} · HN {saved.hn}
              <br />
              ผูกกับผู้รับ <b>{saved.recipient.name}</b> ({saved.relation}) · สถานะ <b>Evaluation</b>
            </p>
            <div className="mt-2 flex w-full flex-col gap-2">
              {remaining.length > 0 && (
                <Button
                  icon={UserPlus}
                  iconRight={ArrowRight}
                  onClick={() => {
                    const next = remaining[0];
                    setSaved(null);
                    setF({ ...initial(f.recipientId), firstName: next.firstName, lastName: next.lastName, relation: next.relation });
                    setPickedIntended(next.idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  ลงทะเบียนผู้บริจาคคนถัดไป ({remaining[0].firstName})
                </Button>
              )}
              <Button variant={remaining.length ? 'secondary' : 'primary'} onClick={() => navigate(`/clinical/donors/${saved.id}`)}>
                ไปหน้าสรุปผู้บริจาค
              </Button>
              {saved.recipient.id && (
                <Button variant="ghost" onClick={() => navigate(`/clinical/recipients/${saved.recipient.id}`)}>
                  กลับไปหน้าผู้รับ
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function PairStep({ n, state, title, sub }: { n: number; state: 'done' | 'current' | 'todo'; title: string; sub: string }) {
  return (
    <div
      className={cn(
        'flex min-w-[220px] flex-1 items-center gap-2.5 rounded-[10px] border px-3 py-2.5',
        state === 'done' && 'border-green-300 bg-green-50',
        state === 'current' && 'border-primary bg-primary-soft ring-1 ring-primary/30',
        state === 'todo' && 'border-slate-200 bg-slate-50',
      )}
    >
      <span className={cn('grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold', state === 'done' ? 'bg-green-600 text-white' : state === 'current' ? 'bg-primary text-white' : 'border border-slate-300 bg-white text-slate-400')}>
        {state === 'done' ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
      </span>
      <span>
        <span className={cn('block text-[13px] font-semibold', state === 'todo' && 'text-slate-400')}>{title}</span>
        <span className="block text-[11.5px] text-slate-500">{sub}</span>
      </span>
    </div>
  );
}
