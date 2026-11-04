import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LabPanel } from '@/components/lab/LabPanel';
import { PersonAppointments } from '@/components/lab/PersonAppointments';
import { PersonTimeline } from '@/components/patient/PersonTimeline';
import { FormsReport, type OpenFormFn } from '@/components/patient/FormsReport';
import { cn } from '@/lib/format';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Building2, Check, ChevronRight, Droplet, Link2, MessageCircle, Pencil, Phone, User, UserX } from 'lucide-react';
import type { DonorDetailDto, StageKey } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { Button } from '@/components/ui/Button';
import { Badge, CaseBadge, StatusBadge, TONES } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { stagger } from '@/components/ui/motion';
import { ProcessStepper } from '@/components/stage/ProcessStepper';
import { StagePanel } from '@/components/stage/StagePanel';
import { useAsync } from '@/hooks/useAsync';
import { donorApi } from '@/services/api/donorApi';
import { STATUS_META, aboCompatible, stageIndex, stageOf } from '@/lib/status';
import { fullName, initials, thaiDate } from '@/lib/format';

export default function DonorSummary() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: d, loading } = useAsync(() => donorApi.get(id), [id]);
  const title = d ? (d.caseType === 'redcross' ? d.redCrossCode ?? '' : fullName(d)) : '…';
  useCrumbs(['ผู้บริจาคไต (Donor)', 'รายชื่อผู้บริจาคไต', title]);
  const [params] = useSearchParams();
  const fromAppt = params.get('from') === 'appt' ? params.get('date') : null;
  const [stage, setStage] = useState<StageKey | null>(params.get('tab') ? null : 'preop');
  const [openSub, setOpenSub] = useState<{ key: string; mode: 'edit' | 'preview'; n: number } | null>(null);
  const [tab, setTab] = useState<'ภาพรวม' | 'ผลตรวจ Lab' | 'นัดหมาย' | 'Timeline' | 'รายงานฟอร์ม'>(params.get('tab') === 'lab' ? 'ผลตรวจ Lab' : 'ภาพรวม');

  const openForm: OpenFormFn = (key, mode) => {
    if (key === 'register') {
      setOpenSub(null);
      setStage('register');
    } else {
      setOpenSub({ key, mode, n: Date.now() });
      setStage('preop');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading)
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-[200px] rounded-2xl" />
        <Skeleton className="h-[120px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
  if (!d) return <EmptyState icon={UserX} title="ไม่พบผู้บริจาค" action={<Button to="/clinical/donors/list">กลับไปหน้ารายชื่อ</Button>} />;

  if (d.caseType === 'redcross') return <RedCrossDonor d={d} onBack={() => navigate(-1)} />;

  const currentIndex = stageIndex(stageOf(d.status));
  const tone = STATUS_META[d.status].tone;
  const compatible = d.recipient.bloodGroup ? aboCompatible(d.bloodGroup, d.recipient.bloodGroup) : null;

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex flex-col gap-5">
      {fromAppt && (
        <Link to={`/clinical/appointments?date=${fromAppt}`} className="flex w-fit items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> กลับไปปฏิทิน · {thaiDate(fromAppt)}
        </Link>
      )}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-5 p-6">
          <button type="button" onClick={() => navigate(-1)} className="grid h-10 w-10 place-items-center rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="กลับ">
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <motion.span initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="grid h-16 w-16 place-items-center rounded-2xl text-[22px] font-bold" style={{ background: tone.bg, color: tone.fg }}>
            {initials(d)}
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-bold">{fullName(d)}</h1>
              <Badge label="ผู้บริจาค" tone={TONES.blue} />
              <CaseBadge caseType={d.caseType} />
              <StatusBadge status={d.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              HN {d.hn} · อายุ {d.age} ปี ({d.sex === 'male' ? 'ชาย' : 'หญิง'}) · ลงทะเบียน {thaiDate(d.registeredAt)}
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-slate-700">
              <span className="flex items-center gap-1.5">
                <Droplet className="h-3.5 w-3.5 text-slate-400" /> กรุ๊ปเลือด {d.bloodGroup}
                {d.rh}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> {d.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" /> แพทย์เจ้าของไข้ {d.physician}
              </span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Button variant="secondary" icon={MessageCircle}>
              แชท
            </Button>
            <Button icon={Pencil}>แก้ไขข้อมูล</Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 border-t border-teal-100 bg-teal-50/70 px-6 py-3.5">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-teal-100 text-teal-700">
            <Link2 className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-teal-700">ผู้รับที่จับคู่</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-bold">{d.recipient.name}</span>
              <span className="text-[13px] text-slate-500">
                ผู้บริจาคเป็น{d.relation}
                {d.recipient.hn ? ` · HN ${d.recipient.hn}` : ''}
                {d.recipient.bloodGroup ? ` · ${d.recipient.bloodGroup}${d.recipient.rh ?? ''}` : ''}
              </span>
              {d.recipient.status && <StatusBadge status={d.recipient.status} />}
            </div>
          </div>
          {compatible !== null && (
            <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-[12.5px] font-semibold ${compatible ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}`}>
              {compatible ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <AlertTriangle className="h-3.5 w-3.5" />}
              ABO: {d.bloodGroup} → {d.recipient.bloodGroup} {compatible ? 'เข้ากันได้' : 'ไม่เข้ากัน'}
            </motion.span>
          )}
          {d.recipient.id && (
            <Button variant="ghost" size="sm" iconRight={ChevronRight} to={`/clinical/recipients/${d.recipient.id}`}>
              ดูข้อมูลผู้รับ
            </Button>
          )}
        </div>
        {/* แท็บข้อมูลผู้ป่วย — กดได้ทุกเมื่อ ไม่ว่าจะอยู่ขั้นตอนไหน */}
        <div className="flex gap-1 overflow-x-auto border-t border-slate-200 px-4">
          {(['ภาพรวม', 'ผลตรวจ Lab', 'นัดหมาย', 'Timeline', 'รายงานฟอร์ม'] as const).map((t) => {
            const active = stage === null && tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setOpenSub(null);
                  setStage(null);
                  setTab(t);
                }}
                className={cn('relative whitespace-nowrap px-4 py-3 text-sm transition-colors', active ? 'font-semibold text-primary' : 'font-medium text-slate-500 hover:text-slate-800')}
              >
                {t}
                {active && <motion.span layoutId="donor-tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
              </button>
            );
          })}
        </div>
      </Card>

      <ProcessStepper currentIndex={currentIndex} selected={stage} onSelect={(k) => { setOpenSub(null); setStage(k); }} dates={d.stageDates} />

      <>
        {stage ? (
          <motion.div key={`${stage}-${openSub?.n ?? 0}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            <StagePanel stage={stage} currentIndex={currentIndex} person={d} kind="donor" registerRows={registerRows(d)} registerDate={d.registeredAt} initialSub={openSub?.key} initialMode={openSub?.mode} />
          </motion.div>
        ) : (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
            {tab === 'ผลตรวจ Lab' ? (
              <LabPanel kind="donor" id={d.id} />
            ) : tab === 'นัดหมาย' ? (
              <PersonAppointments kind="donor" id={d.id} />
            ) : tab === 'Timeline' ? (
              <PersonTimeline person={d} kind="donor" />
            ) : tab === 'รายงานฟอร์ม' ? (
              <FormsReport person={d} kind="donor" onOpen={openForm} />
            ) : (
              <div className="grid gap-5 lg:grid-cols-3">
                {registerRows(d).map((g, i) => (
                  <Card key={i} className="flex flex-col gap-1 p-5">
                    {g.map(([k, v], j) => (
                      <div key={k} className={`flex gap-3 py-2 text-[13px] ${j ? 'border-t border-slate-100' : ''}`}>
                        <span className="w-[110px] shrink-0 text-slate-400">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </>
    </motion.div>
  );
}

function registerRows(d: DonorDetailDto): [string, string][][] {
  return [
    [
      ['ชื่อ-นามสกุล', fullName(d)],
      ['HN', d.hn],
      ['เลขบัตรประชาชน', d.nationalId],
      ['วันเกิด / อายุ', `${thaiDate(d.birthDate)} · ${d.age} ปี`],
      ['กรุ๊ปเลือด', `${d.bloodGroup}${d.rh}`],
    ],
    [
      ['ที่อยู่', d.address],
      ['โทรศัพท์', d.phone],
      ['LINE ID', d.lineId ?? '—'],
    ],
    [
      ['ผู้รับไต', d.recipient.name],
      ['ความสัมพันธ์', d.relation],
      ['สถานะผู้รับ', d.recipient.status ? STATUS_META[d.recipient.status].label : '—'],
    ],
  ];
}

/** ผู้บริจาคจากสภากาชาด — บันทึกหลังผู้รับผ่าตัด (field จริงรอกำหนด) */
function RedCrossDonor({ d, onBack }: { d: DonorDetailDto; onBack: () => void }) {
  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex flex-col gap-5">
      <Card className="flex flex-wrap items-center gap-5 p-6">
        <button type="button" onClick={onBack} className="grid h-10 w-10 place-items-center rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="กลับ">
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <Building2 className="h-7 w-7" />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[22px] font-bold">{d.redCrossCode}</h1>
            <CaseBadge caseType="redcross" />
            <StatusBadge status={d.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">ผู้บริจาคสมองตาย · บันทึกหลังผู้รับผ่าตัด {thaiDate(d.recipientSurgeryDate)}</p>
        </div>
      </Card>
      <Card className="flex flex-col gap-4 p-6">
        <CardHeader title="ข้อมูลผู้บริจาค (สภากาชาด)" icon={Building2} iconTone={{ fg: '#6d28d9', bg: '#ede9fe' }} right={<Badge label="field รอกำหนด" tone={TONES.violet} />} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            ['รหัสผู้บริจาค', d.redCrossCode ?? '—'],
            ['โรงพยาบาลต้นทาง', d.sourceHospital ?? '—'],
            ['อายุ / เพศ', `${d.age} ปี · ${d.sex === 'male' ? 'ชาย' : 'หญิง'}`],
            ['กรุ๊ปเลือด', `${d.bloodGroup}${d.rh}`],
            ['ผู้รับที่ได้รับการจัดสรร', d.recipient.name],
            ['วันที่ผ่าตัดผู้รับ', thaiDate(d.recipientSurgeryDate)],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-slate-400">{k}</p>
              <p className="text-sm font-semibold">{v}</p>
            </div>
          ))}
        </div>
        <p className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] text-amber-800">ข้อมูลที่ต้องเก็บของผู้บริจาคจากสภากาชาดยังไม่ทราบ — รอถามหน้างาน (ข้อมูลจริงกรอกจากขั้นตอน “ผ่าตัด” ของผู้รับ)</p>
        {d.recipient.id && (
          <Button variant="secondary" iconRight={ChevronRight} to={`/clinical/recipients/${d.recipient.id}`} className="w-fit">
            ไปหน้าผู้รับ
          </Button>
        )}
      </Card>
    </motion.div>
  );
}
