import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Info, Link2, Lock, Plus, Save, Trash2, UserPlus } from 'lucide-react';
import type { IntendedDonor, RecipientCreateDto, RecipientDetailDto } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox, ChoiceChips, Field, TextInput, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { stagger } from '@/components/ui/motion';
import { Section, SubHeading } from '@/components/forms/RegSection';
import { recipientApi } from '@/services/api/recipientApi';
import { ageFrom, cn } from '@/lib/format';

const MAX_DONORS = 4;
const emptyDonor = (): IntendedDonor => ({ firstName: '', lastName: '', age: '', relation: '' });

const initial: RecipientCreateDto = {
  filledDate: new Date().toISOString().slice(0, 10),
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
  phone1: '',
  phone2: '',
  lineId: '',
  siblings: '',
  children: '',
  relativeFirstName: '',
  relativeLastName: '',
  relativeAddress: '',
  relativeSameAddress: false,
  relativePhone1: '',
  relativePhone2: '',
  hasIntendedDonor: '',
  intendedDonors: [emptyDonor()],
  rrt: '',
  rrtStart: '',
  prevTransplant: 'no',
  prevTransplantDate: '',
  prevTransplantHospital: '',
};

type Key = keyof RecipientCreateDto;

/** ช่องบังคับแยกตามหัวข้อ (ใช้ทั้ง validation และสารบัญด้านขวา) */
const SECTIONS: { id: string; title: string; required: Key[] }[] = [
  { id: 's1', title: 'ข้อมูลส่วนตัว', required: ['prefix', 'bloodGroup', 'firstName', 'lastName', 'hn', 'nationalId', 'birthDate'] },
  { id: 's2', title: 'เศรษฐกิจและสิทธิการรักษา', required: ['coverage'] },
  { id: 's3', title: 'ข้อมูลการติดต่อ', required: ['address', 'phone1'] },
  { id: 's4', title: 'ครอบครัวและญาติ', required: ['relativeFirstName', 'relativeLastName', 'relativePhone1'] },
  { id: 's5', title: 'ผู้ประสงค์จะบริจาคไต', required: ['hasIntendedDonor'] },
  { id: 's6', title: 'การบำบัดทดแทนไต', required: ['rrt'] },
];

export default function RecipientRegister() {
  useCrumbs(['ผู้รับบริจาคไต (Recipient)', 'ลงทะเบียนผู้รับบริจาคไต']);
  const navigate = useNavigate();
  const [f, setF] = useState<RecipientCreateDto>(initial);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<RecipientDetailDto | null>(null);
  const [current, setCurrent] = useState('s1');

  const set = <K extends Key>(k: K, v: RecipientCreateDto[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const bind = (k: Key) => ({
    value: f[k] as string,
    onChange: (e: { target: { value: string } }) => set(k, e.target.value as never),
  });

  const age = ageFrom(f.birthDate);
  const filled = (k: Key) => {
    const v = f[k];
    return typeof v === 'string' ? v.trim() !== '' : true;
  };
  const sectionDone = useMemo(
    () => Object.fromEntries(SECTIONS.map((s) => [s.id, s.required.every(filled)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [f],
  );

  const err = (k: Key) => errors[k];

  async function submit() {
    const missing: Partial<Record<Key, string>> = {};
    SECTIONS.forEach((s) => s.required.forEach((k) => !filled(k) && (missing[k] = 'กรุณากรอกข้อมูล')));
    if (f.relativeSameAddress === false && !f.relativeAddress.trim()) {
      // ที่อยู่ญาติไม่บังคับตามแบบฟอร์ม — ไม่ตรวจ
    }
    if (Object.keys(missing).length) {
      setErrors(missing);
      const first = SECTIONS.find((s) => s.required.some((k) => missing[k]));
      if (first) document.getElementById(first.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSaving(true);
    try {
      const rec = await recipientApi.create({
        ...f,
        relativeAddress: f.relativeSameAddress ? f.address : f.relativeAddress,
      });
      setSaved(rec);
    } finally {
      setSaving(false);
    }
  }

  const donors = f.intendedDonors;
  const updateDonor = (i: number, patch: Partial<IntendedDonor>) => set('intendedDonors', donors.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  return (
    <>
      <PageHeader
        leading={
          <Button variant="secondary" icon={ArrowLeft} to="/clinical/recipients" className="!w-10 !px-0" aria-label="กลับ" />
        }
        title="ลงทะเบียนผู้รับบริจาคไต (Recipient)"
        subtitle="แบบฟอร์มข้อมูลผู้ป่วยก่อนเข้ารับการปลูกถ่ายไต · ช่องที่มี * จำเป็นต้องกรอก"
        actions={
          <Field label="วันที่กรอกข้อมูล" required className="w-[200px]">
            <TextInput type="date" {...bind('filledDate')} />
          </Field>
        }
      />

      <div className="flex items-start gap-6">
        <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex min-w-0 flex-1 flex-col gap-5">
          {/* 1 */}
          <Section id="s1" n={1} title="ข้อมูลส่วนตัว" onFocus={setCurrent}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="คำนำหน้า" required error={err('prefix')}>
                <ChoiceChips options={['นาย', 'นาง', 'นางสาว']} value={f.prefix} onChange={(v) => set('prefix', v)} />
              </Field>
              <Field label="กรุ๊ปเลือด" required error={err('bloodGroup')}>
                <ChoiceChips options={['A', 'B', 'O', 'AB']} value={f.bloodGroup} onChange={(v) => set('bloodGroup', v)} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_180px]">
              <Field label="ชื่อ" required error={err('firstName')}>
                <TextInput placeholder="ชื่อจริง" {...bind('firstName')} />
              </Field>
              <Field label="นามสกุล" required error={err('lastName')}>
                <TextInput placeholder="นามสกุล" {...bind('lastName')} />
              </Field>
              <Field label="HN" required error={err('hn')}>
                <TextInput placeholder="เช่น 990230" {...bind('hn')} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_200px_140px]">
              <Field label="เลขบัตรประชาชน" required error={err('nationalId')}>
                <TextInput placeholder="x-xxxx-xxxxx-xx-x" inputMode="numeric" {...bind('nationalId')} />
              </Field>
              <Field label="วันเดือนปีเกิด" required error={err('birthDate')}>
                <TextInput type="date" {...bind('birthDate')} />
              </Field>
              <Field label="อายุ" tag="auto">
                <TextInput disabled value={age ?? ''} placeholder="อัตโนมัติ" suffix="ปี" readOnly />
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
                <ChoiceChips
                  options={['ไม่มี', 'รับราชการ', 'รัฐวิสาหกิจ', 'ธุรกิจส่วนตัว/ค้าขาย', 'พนักงานเอกชน', 'นักเรียน/นักศึกษา', 'อื่นๆ']}
                  value={f.occupation}
                  onChange={(v) => set('occupation', v)}
                />
                <AnimatePresence>
                  {f.occupation === 'อื่นๆ' && (
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 220 }} exit={{ opacity: 0, width: 0 }}>
                      <TextInput placeholder="ระบุอาชีพ" {...bind('occupationOther')} className="!h-9" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Field>
          </Section>

          {/* 2 */}
          <Section id="s2" n={2} title="ฐานะทางเศรษฐกิจและสิทธิการรักษา" sub="ใช้ประกอบการประเมินความพร้อมด้านค่าใช้จ่าย" onFocus={setCurrent}>
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
              <ChoiceChips
                options={['เบิกราชการ', 'รัฐวิสาหกิจ', 'เบิกเอกชน', 'เบิกประกัน', 'หลักประกันสุขภาพ (30 บาท)', 'ประกันสังคม', 'จ่ายเอง']}
                value={f.coverage}
                onChange={(v) => set('coverage', v)}
              />
            </Field>
          </Section>

          {/* 3 */}
          <Section id="s3" n={3} title="ข้อมูลการติดต่อ" onFocus={setCurrent}>
            <Field label="ที่อยู่ที่สามารถติดต่อได้" required error={err('address')}>
              <Textarea placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" {...bind('address')} />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="หมายเลขโทรศัพท์ 1" required error={err('phone1')}>
                <TextInput inputMode="tel" placeholder="0xx-xxx-xxxx" {...bind('phone1')} />
              </Field>
              <Field label="หมายเลขโทรศัพท์ 2">
                <TextInput inputMode="tel" placeholder="ไม่บังคับ" {...bind('phone2')} />
              </Field>
              <Field label="LINE ID" hint="(ใช้เชื่อม LINE LIFF)">
                <TextInput placeholder="ไม่บังคับ" {...bind('lineId')} />
              </Field>
            </div>
          </Section>

          {/* 4 */}
          <Section id="s4" n={4} title="ครอบครัวและญาติที่ติดต่อได้" onFocus={setCurrent}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="จำนวนพี่น้อง (ไม่รวมท้องเดียวกัน)">
                <TextInput inputMode="numeric" placeholder="0" suffix="คน" {...bind('siblings')} />
              </Field>
              <Field label="จำนวนบุตร">
                <TextInput inputMode="numeric" placeholder="0" suffix="คน" {...bind('children')} />
              </Field>
            </div>
            <SubHeading>ญาติใกล้ชิดที่สามารถติดต่อได้</SubHeading>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ชื่อ" required error={err('relativeFirstName')}>
                <TextInput placeholder="ชื่อญาติ" {...bind('relativeFirstName')} />
              </Field>
              <Field label="นามสกุล" required error={err('relativeLastName')}>
                <TextInput placeholder="นามสกุลญาติ" {...bind('relativeLastName')} />
              </Field>
            </div>
            <Checkbox checked={f.relativeSameAddress} onChange={(v) => set('relativeSameAddress', v)} label="ใช้ที่อยู่เดียวกับผู้ป่วย" />
            <Field label="ที่อยู่ญาติที่สามารถติดต่อได้">
              <Textarea
                disabled={f.relativeSameAddress}
                placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                value={f.relativeSameAddress ? f.address : f.relativeAddress}
                onChange={(e) => set('relativeAddress', e.target.value)}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="หมายเลขโทรศัพท์ 1" required error={err('relativePhone1')}>
                <TextInput inputMode="tel" placeholder="0xx-xxx-xxxx" {...bind('relativePhone1')} />
              </Field>
              <Field label="หมายเลขโทรศัพท์ 2">
                <TextInput inputMode="tel" placeholder="ไม่บังคับ" {...bind('relativePhone2')} />
              </Field>
            </div>
          </Section>

          {/* 5 */}
          <Section id="s5" n={5} title="ผู้ประสงค์จะบริจาคไต" sub="คำตอบนี้กำหนดประเภทผู้ป่วยอัตโนมัติ" onFocus={setCurrent}>
            <Field label="ท่านมีผู้ประสงค์จะบริจาคไตให้หรือไม่" required error={err('hasIntendedDonor')}>
              <ChoiceChips options={['มี', 'ไม่มี']} value={f.hasIntendedDonor === 'yes' ? 'มี' : f.hasIntendedDonor === 'no' ? 'ไม่มี' : ''} onChange={(v) => set('hasIntendedDonor', v === 'มี' ? 'yes' : v === 'ไม่มี' ? 'no' : '')} />
            </Field>

            <>
              {f.hasIntendedDonor && (
                <motion.div
                  key={f.hasIntendedDonor}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-[13px]',
                    f.hasIntendedDonor === 'yes' ? 'border-teal-200 bg-teal-50 text-teal-800' : 'border-violet-200 bg-violet-50 text-violet-800',
                  )}
                >
                  <Link2 className="h-4 w-4" />
                  ประเภทผู้ป่วย: {f.hasIntendedDonor === 'yes' ? '“มีคู่แล้ว”' : '“รอไตจากสภากาชาด (MRB)”'}
                </motion.div>
              )}
            </>

            <AnimatePresence initial={false}>
              {f.hasIntendedDonor === 'yes' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="overflow-hidden rounded-[10px] border border-slate-200">
                    <div className="grid grid-cols-[32px_1fr_1fr_90px_170px_36px] gap-2.5 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      <span>#</span>
                      <span>ชื่อ</span>
                      <span>นามสกุล</span>
                      <span>อายุ (ปี)</span>
                      <span>ความเกี่ยวข้อง</span>
                      <span />
                    </div>
                    <AnimatePresence initial={false}>
                      {donors.map((d, i) => (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-[32px_1fr_1fr_90px_170px_36px] items-center gap-2.5 border-t border-slate-100 px-3 py-2"
                        >
                          <span className="text-[13px] text-slate-600">{i + 1}</span>
                          <TextInput className="!h-9" placeholder="ชื่อ" value={d.firstName} onChange={(e) => updateDonor(i, { firstName: e.target.value })} />
                          <TextInput className="!h-9" placeholder="นามสกุล" value={d.lastName} onChange={(e) => updateDonor(i, { lastName: e.target.value })} />
                          <TextInput className="!h-9" inputMode="numeric" placeholder="อายุ" value={d.age ?? ''} onChange={(e) => updateDonor(i, { age: e.target.value === '' ? '' : Number(e.target.value) })} />
                          <TextInput className="!h-9" placeholder="เช่น บุตร, คู่สมรส" value={d.relation} onChange={(e) => updateDonor(i, { relation: e.target.value })} />
                          <button
                            type="button"
                            disabled={donors.length === 1}
                            onClick={() => set('intendedDonors', donors.filter((_, j) => j !== i))}
                            className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button
                      variant="ghost"
                      icon={Plus}
                      className="border border-blue-200"
                      disabled={donors.length >= MAX_DONORS}
                      onClick={() => set('intendedDonors', [...donors, emptyDonor()])}
                    >
                      เพิ่มผู้ประสงค์บริจาค (สูงสุด {MAX_DONORS} คน)
                    </Button>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Info className="h-3.5 w-3.5" /> หลังบันทึก สามารถ “ลงทะเบียนผู้บริจาคต่อ” ได้ทันที
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* 6 */}
          <Section id="s6" n={6} title="การบำบัดทดแทนไตและประวัติการปลูกถ่าย" onFocus={setCurrent}>
            <Field label="การบำบัดทดแทนไตที่ใช้ในปัจจุบัน" required error={err('rrt')}>
              <ChoiceChips
                options={['ฟอกเลือด', 'ล้างไตทางช่องท้อง', 'ยังไม่ได้ฟอกเลือดหรือล้างไตทางช่องท้อง']}
                value={{ HD: 'ฟอกเลือด', PD: 'ล้างไตทางช่องท้อง', none: 'ยังไม่ได้ฟอกเลือดหรือล้างไตทางช่องท้อง', '': '' }[f.rrt] ?? ''}
                onChange={(v) => set('rrt', v === 'ฟอกเลือด' ? 'HD' : v === 'ล้างไตทางช่องท้อง' ? 'PD' : v ? 'none' : '')}
              />
            </Field>
            <Field label="วันที่เริ่มการบำบัดทดแทนไต" className="md:w-1/2">
              <TextInput type="date" disabled={f.rrt === 'none'} {...bind('rrtStart')} />
            </Field>
            <SubHeading>ในกรณีที่เคยได้รับการปลูกถ่ายไตมาก่อน</SubHeading>
            <Field label="เคยได้รับการปลูกถ่ายไตหรือไม่">
              <ChoiceChips options={['ไม่เคย', 'เคย']} value={f.prevTransplant === 'yes' ? 'เคย' : 'ไม่เคย'} onChange={(v) => set('prevTransplant', v === 'เคย' ? 'yes' : 'no')} />
            </Field>
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <Field label="วันที่ปลูกถ่ายไต">
                <TextInput type="date" disabled={f.prevTransplant !== 'yes'} {...bind('prevTransplantDate')} />
              </Field>
              <Field label="โรงพยาบาล">
                <TextInput disabled={f.prevTransplant !== 'yes'} placeholder="ชื่อโรงพยาบาล" {...bind('prevTransplantHospital')} />
              </Field>
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" to="/clinical/recipients">
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

        {/* สารบัญ + สถานะการกรอก */}
        <aside className="sticky top-24 hidden w-[300px] shrink-0 flex-col gap-5 xl:flex">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-2 text-[15px] font-bold">หัวข้อในแบบฟอร์ม</p>
            {SECTIONS.map((s, i) => {
              const done = sectionDone[s.id];
              const cur = current === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={cn('relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px]', cur ? 'font-semibold text-primary' : 'text-slate-700 hover:bg-slate-50')}
                >
                  {cur && <motion.span layoutId="form-index" className="absolute inset-0 rounded-lg bg-primary-soft" />}
                  <motion.span
                    animate={{ backgroundColor: done ? '#16a34a' : cur ? '#2563eb' : '#ffffff', borderColor: done || cur ? 'rgba(0,0,0,0)' : '#cbd5e1' }}
                    className="relative grid h-[22px] w-[22px] place-items-center rounded-full border text-[11px] font-bold"
                  >
                    {done ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : <span className={cur ? 'text-white' : 'text-slate-400'}>{i + 1}</span>}
                  </motion.span>
                  <span className="relative">{s.title}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[15px] font-bold">หลังบันทึก ระบบจะ</p>
            {['ตั้งประเภทผู้ป่วยจากข้อ 5 (มีคู่แล้ว / สภากาชาด)', 'ตั้งสถานะเริ่มต้นเป็น Evaluation', 'สร้างรายการตรวจ Pre-KT evaluation', 'ส่งลิงก์ LINE LIFF ให้ผู้ป่วย (ถ้ามี LINE ID)'].map((t) => (
              <p key={t} className="flex gap-2 text-[13px] text-slate-700">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-100">
                  <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                </span>
                {t}
              </p>
            ))}
          </div>
          <p className="flex gap-2.5 rounded-xl border border-orange-200 bg-orange-50 p-3.5 text-xs text-orange-800">
            <Lock className="h-4 w-4 shrink-0" />
            เลขบัตรประชาชนและข้อมูลรายได้จะแสดงเฉพาะทีมที่มีสิทธิ์ และถูกบันทึกใน Audit log
          </p>
        </aside>
      </div>

      <SuccessModal
        rec={saved}
        onClose={() => setSaved(null)}
        onSummary={() => saved && navigate(`/clinical/recipients/${saved.id}`)}
        onDonor={() => saved && navigate(`/clinical/donors/register?recipient=${saved.id}`)}
        onNew={() => {
          setSaved(null);
          setF(initial);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </>
  );
}

function SuccessModal({ rec, onClose, onSummary, onDonor, onNew }: { rec: RecipientDetailDto | null; onClose: () => void; onSummary: () => void; onDonor: () => void; onNew: () => void }) {
  return (
    <Modal open={!!rec} onClose={onClose}>
      {rec && (
        <div className="flex flex-col items-center gap-3 text-center">
          {/* ภายหลังเปลี่ยนเป็น Lottie “success” ได้ */}
          <motion.svg width="72" height="72" viewBox="0 0 72 72" initial="hidden" animate="show">
            <motion.circle cx="36" cy="36" r="32" fill="#dcfce7" variants={{ hidden: { scale: 0 }, show: { scale: 1, transition: { type: 'spring', stiffness: 260, damping: 16 } } }} />
            <motion.path
              d="M22 37 L32 47 L51 27"
              fill="none"
              stroke="#16a34a"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { delay: 0.25, duration: 0.45 } } }}
            />
          </motion.svg>
          <h3 className="text-xl font-bold">ลงทะเบียนสำเร็จ</h3>
          <p className="text-sm text-slate-600">
            {rec.prefix}
            {rec.firstName} {rec.lastName} · HN {rec.hn}
            <br />
            ประเภท: <b>{rec.caseType === 'living' ? 'มีคู่แล้ว' : 'รอไตจากสภากาชาด'}</b> · สถานะ: <b>Evaluation</b>
          </p>
          <div className="mt-2 flex w-full flex-col gap-2">
            {rec.caseType === 'living' && (
              <Button icon={UserPlus} iconRight={ArrowRight} onClick={onDonor}>
                ลงทะเบียนผู้บริจาคต่อ
              </Button>
            )}
            <Button variant={rec.caseType === 'living' ? 'secondary' : 'primary'} onClick={onSummary}>
              ไปหน้าสรุปผู้ป่วย
            </Button>
            <Button variant="ghost" onClick={onNew}>
              ลงทะเบียนรายใหม่
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
