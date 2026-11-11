import { useState } from 'react';
import { AlertTriangle, Check, Download, IdCard, Phone, ShieldCheck, Smartphone, Undo2 } from 'lucide-react';
import { useSim } from '../store';
import { PERSONAS, findByNationalId, fullName, type Persona } from '../personas';
import { KidneyBuddy } from '@/components/brand/KidneyBuddy';
import { LBtn, LCard, LiffShell } from './Shell';
import { cn } from '@/lib/format';

type Step = 'start' | 'thaid' | 'confirm' | 'success' | 'notfound';

function Progress({ step }: { step: number }) {
  return (
    <div className="relative flex gap-2 px-5 pt-3">
      {[1, 2, 3].map((i) => (
        <span key={i} className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-white' : 'bg-white/35')} />
      ))}
    </div>
  );
}

/** ลงทะเบียน = ยืนยันตัวตน (ThaiD จำลองในเดโม) → ดึงข้อมูลที่ลงทะเบียนไว้ → ผูก LINE + เปลี่ยน Rich menu */
export function RegisterPage() {
  const { closeLiff, registered, record } = useSim();
  const [step, setStep] = useState<Step>('start');
  const [nid, setNid] = useState('');
  const [p, setP] = useState<Persona | null>(null);
  const [agree, setAgree] = useState(true);
  const n = step === 'start' ? 1 : step === 'success' ? 3 : 2;
  const hero = (
    <>
      <Progress step={n} />
      {step === 'start' && (
        <div className="relative flex justify-center pt-3">
          <span className="grid h-40 w-40 place-items-center rounded-full bg-white/25">
            <KidneyBuddy pose="register" size={150} />
          </span>
        </div>
      )}
      {step === 'thaid' && (
        <div className="relative flex flex-col items-center gap-1 pt-5">
          <span className="rounded-xl bg-white px-4 py-1.5 text-[20px] font-bold text-blue-900">ThaiD</span>
          <span className="text-[12.5px] font-semibold">คำขอใช้ข้อมูล (จำลองในเดโม)</span>
        </div>
      )}
      {step === 'notfound' && (
        <div className="relative flex justify-center pt-2">
          <KidneyBuddy pose="not_found" size={150} />
        </div>
      )}
      {step === 'confirm' && p !== undefined && (
        <div className="relative flex justify-center pt-4">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-lg">
            {step === 'confirm' && p ? <span className="grid h-20 w-20 place-items-center rounded-full bg-blue-50 text-[26px] font-bold text-primary">{p.ini}</span> : <AlertTriangle className="h-10 w-10 text-orange-500" />}
          </span>
        </div>
      )}
      {step === 'success' && (
        <div className="relative flex justify-center pt-4 pb-4">
          <KidneyBuddy pose="success" size={190} />
        </div>
      )}
    </>
  );

  function submitThaiD() {
    const found = findByNationalId(nid);
    setP(found ?? null);
    setStep(found ? 'confirm' : 'notfound');
  }

  return (
    <LiffShell onClose={closeLiff} hero={hero}>
      {step === 'start' && (
        <div className="flex flex-col gap-4 pt-8">
          <div className="text-center">
            <p className="text-[22px] font-bold">ยืนยันตัวตน</p>
            <p className="text-[13px] text-slate-500">ใช้แอป ThaiD ไม่ต้องกรอกข้อมูลใด ๆ<br />ระบบจะดึงข้อมูลที่ลงทะเบียนไว้มาให้ตรวจสอบ</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              [Smartphone, 'เปิดแอป\nThaiD'],
              [ShieldCheck, 'ยืนยันตัวตน\nและยินยอม'],
              [Undo2, 'กลับมา\nที่ LINE'],
            ].map(([I, t]) => {
              const Icon = I as typeof Smartphone;
              return (
                <div key={t as string} className="flex flex-col items-center gap-1.5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="whitespace-pre text-center text-[11.5px] leading-4 text-slate-600">{t as string}</span>
                </div>
              );
            })}
          </div>
          <LBtn onClick={() => setStep('thaid')}>
            <ShieldCheck className="h-4 w-4" /> ยืนยันตัวตนด้วย ThaiD
          </LBtn>
          <p className="flex items-center justify-center gap-1 text-[12px] text-slate-400">
            <Download className="h-3.5 w-3.5" /> ยังไม่มีแอป ThaiD? <span className="font-semibold text-primary">ดาวน์โหลด</span>
          </p>
        </div>
      )}

      {step === 'thaid' && (
        <div className="flex flex-col gap-3 pt-2">
          <LCard className="flex flex-col gap-3">
            <p className="text-[13px] text-slate-600">ศูนย์ปลูกถ่ายไต รพ.ม.นเรศวร ขอใช้ข้อมูล: เลขประจำตัวประชาชน · ชื่อ–นามสกุล · วันเกิด</p>
            <label className="flex h-12 items-center gap-2 rounded-xl border-[1.5px] border-blue-300 px-3">
              <IdCard className="h-4 w-4 text-slate-400" />
              <input value={nid} onChange={(e) => setNid(e.target.value.replace(/\D/g, '').slice(0, 13))} inputMode="numeric" placeholder="เลขบัตรประชาชน 13 หลัก (จำลอง ThaiD)" className="w-full bg-transparent text-[14px] font-semibold tracking-wider outline-none placeholder:font-normal placeholder:tracking-normal" />
            </label>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11.5px] text-slate-400">เลขบัตรตัวอย่างสำหรับเดโม</p>
              {Object.values(PERSONAS).map((x) => (
                <button key={x.key} type="button" onClick={() => setNid(x.nationalId)} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-[12px] hover:bg-blue-50">
                  <span className="font-semibold">{fullName(x)}</span>
                  <span className="text-slate-400">{x.kind === 'donor' ? 'ผู้บริจาค' : 'ผู้รับ'} · {x.nationalId}</span>
                </button>
              ))}
              <button type="button" onClick={() => setNid('1111111111111')} className="rounded-lg bg-slate-50 px-3 py-2 text-left text-[12px] text-slate-500 hover:bg-blue-50">
                ทดลองกรณีไม่พบข้อมูล · 1111111111111
              </button>
            </div>
          </LCard>
          <LBtn disabled={nid.length !== 13} onClick={submitThaiD}>
            ยินยอม
          </LBtn>
          <LBtn kind="ghost" onClick={() => setStep('start')}>
            ไม่ยินยอม
          </LBtn>
        </div>
      )}

      {step === 'confirm' && p && (
        <div className="flex flex-col gap-3 pt-14">
          <div className="text-center">
            <p className="text-[19px] font-bold">{fullName(p)}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-0.5 text-[11.5px] font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> {p.kind === 'donor' ? 'ผู้บริจาคไต' : 'ผู้รับไต'} · ยืนยันด้วย ThaiD แล้ว
            </span>
          </div>
          <div className="flex flex-col">
            {[
              ['HN', p.hn],
              ['อายุ', `${p.age} ปี`],
              ['กรุ๊ปเลือด', p.blood],
              ['โทรศัพท์', p.phone],
            ].map(([k, v], i) => (
              <div key={k} className={cn('flex justify-between py-2.5 text-[13.5px]', i > 0 && 'border-t border-slate-200/70')}>
                <span className="text-slate-400">{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-[13px]">
            <p className="text-[11.5px] text-slate-500">{p.matched ? (p.kind === 'donor' ? 'ผู้รับที่จับคู่' : 'ผู้บริจาคที่จับคู่') : 'สถานะการรักษา'}</p>
            <b>{p.matched ?? p.stage}</b>
          </div>
          <label className="flex gap-2 text-[12px] text-slate-500">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-600" />
            ยินยอมให้ศูนย์ฯ ใช้ข้อมูลเพื่อติดตามการรักษา และแจ้งเตือนผ่าน LINE
          </label>
          <LBtn disabled={!agree} onClick={() => setStep('success')}>
            <Check className="h-4 w-4" /> ใช่ ข้อมูลถูกต้อง
          </LBtn>
          <LBtn kind="ghost" onClick={() => record('แจ้งข้อมูลไม่ถูกต้อง')}>
            ข้อมูลไม่ถูกต้อง? ติดต่อเจ้าหน้าที่
          </LBtn>
        </div>
      )}

      {step === 'success' && p && (
        <div className="flex flex-col gap-6 pt-10 text-center">
          <p className="text-[24px] font-bold">เชื่อมต่อสำเร็จ</p>
          <LBtn onClick={() => registered(p.key as 'r-pre' | 'r-post' | 'd-post')}>กลับไปที่แชท</LBtn>
        </div>
      )}

      {step === 'notfound' && (
        <div className="flex flex-col gap-3 pt-6">
          <div className="text-center">
            <p className="text-[19px] font-bold">ไม่พบข้อมูลการลงทะเบียน</p>
            <p className="text-[13px] text-slate-500">ยืนยันตัวตนสำเร็จ แต่ยังไม่พบข้อมูลของท่าน<br />ในระบบศูนย์ปลูกถ่ายไต</p>
          </div>
          <LCard className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-primary">
              <Phone className="h-4 w-4" />
            </span>
            <span>
              <b className="block text-[14px]">ติดต่อศูนย์ปลูกถ่ายไต</b>
              <span className="text-[12px] text-slate-500">055-96-xxxx · จ.–ศ. 08:00–16:00</span>
            </span>
          </LCard>
          <LBtn onClick={() => setStep('thaid')}>ลองอีกครั้ง</LBtn>
          <LBtn kind="ghost" onClick={closeLiff}>
            ปิด
          </LBtn>
        </div>
      )}
    </LiffShell>
  );
}
