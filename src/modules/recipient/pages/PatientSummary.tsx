import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { LabPanel } from '@/components/lab/LabPanel';
import { PersonAppointments } from '@/components/lab/PersonAppointments';
import { PersonTimeline } from '@/components/patient/PersonTimeline';
import { LineDataPanel } from '@/components/patient/LineDataPanel';
import { LineBadge } from '@/components/patient/LineBadge';
import { FormsReport, type OpenFormFn } from '@/components/patient/FormsReport';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Droplet,
  FileText,
  Hammer,
  Info,
  Link2,
  MessageCircle,
  Pencil,
  Phone,
  Send,
  User,
  UserX,
} from 'lucide-react';
import type { RecipientDetailDto, StageKey } from '@/types';
import { useCrumbs } from '@/components/layout/crumbs';
import { Button } from '@/components/ui/Button';
import { CaseBadge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { stagger } from '@/components/ui/motion';
import { useAsync } from '@/hooks/useAsync';
import { recipientApi } from '@/services/api/recipientApi';
import { STATUS_META, stageIndex, stageOf } from '@/lib/status';
import { cn, durationSince, fullName, initials, thaiDate } from '@/lib/format';
import { ProcessStepper } from '@/components/stage/ProcessStepper';
import { StagePanel } from '@/components/stage/StagePanel';

const TABS = ['ภาพรวม', 'ผลตรวจ Lab', 'นัดหมาย', 'Timeline', 'รายงานฟอร์ม', 'ข้อมูลจาก LINE'] as const;

export default function PatientSummary() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: rec, loading } = useAsync(() => recipientApi.get(id), [id]);
  useCrumbs(['ผู้รับบริจาคไต (Recipient)', 'รายชื่อผู้รับบริจาคไต', rec ? fullName(rec) : '…']);
  const [params] = useSearchParams();
  const fromAppt = params.get('from') === 'appt' ? params.get('date') : null;
  const [stage, setStage] = useState<StageKey | null>(null);
  const [openSub, setOpenSub] = useState<{ key: string; mode: 'edit' | 'preview'; n: number } | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>(params.get('tab') === 'lab' ? 'ผลตรวจ Lab' : 'ภาพรวม');

  const openForm: OpenFormFn = (key, mode) => {
    if (key === 'register') {
      setOpenSub({ key, mode, n: Date.now() });
      setStage('register');
    } else {
      setOpenSub({ key, mode, n: Date.now() });
      setStage('preop');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-[190px] rounded-2xl" />
        <Skeleton className="h-[120px] rounded-2xl" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    );
  }
  if (!rec) {
    return <EmptyState icon={UserX} title="ไม่พบผู้ป่วย" action={<Button to="/clinical/recipients/list">กลับไปหน้ารายชื่อ</Button>} />;
  }

  const currentIndex = stageIndex(stageOf(rec.status));
  const tone = STATUS_META[rec.status].tone;

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex flex-col gap-5">
      {fromAppt && (
        <Link to={`/clinical/appointments?date=${fromAppt}`} className="flex w-fit items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> กลับไปปฏิทิน · {thaiDate(fromAppt)}
        </Link>
      )}
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-5 p-6">
          <button type="button" onClick={() => navigate(-1)} className="grid h-10 w-10 place-items-center rounded-[10px] border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="กลับ">
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <motion.span
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="grid h-16 w-16 place-items-center rounded-2xl text-[22px] font-bold"
            style={{ background: tone.bg, color: tone.fg }}
          >
            {initials(rec)}
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-bold">{fullName(rec)}</h1>
              <CaseBadge caseType={rec.caseType} />
              <StatusBadge status={rec.status} />
              <LineBadge id={rec.id} lineId={rec.lineId} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              HN {rec.hn} · อายุ {rec.age} ปี ({rec.sex === 'male' ? 'ชาย' : 'หญิง'}) · ลงทะเบียน {thaiDate(rec.registeredAt)}
            </p>
            <div className="mt-2 flex flex-wrap gap-4 text-[13px] text-slate-700">
              <span className="flex items-center gap-1.5">
                <Droplet className="h-3.5 w-3.5 text-slate-400" /> กรุ๊ปเลือด {rec.bloodGroup}
                {rec.rh}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> {rec.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" /> แพทย์เจ้าของไข้ {rec.physician}
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
        {rec.matchedDonor && (
          <div className="flex flex-wrap items-center gap-3.5 border-t border-teal-100 bg-teal-50/70 px-6 py-3.5">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-teal-100 text-teal-700">
              <Link2 className="h-[18px] w-[18px]" />
            </span>
            <div className="flex-1">
              <p className="text-xs text-teal-700">ผู้บริจาคที่จับคู่</p>
              <p className="text-[15px] font-bold">
                {rec.matchedDonor.name} <span className="text-[13px] font-normal text-slate-500">· {rec.matchedDonor.relation}</span>
              </p>
            </div>
            <Button variant="ghost" iconRight={ChevronRight} size="sm" to={rec.matchedDonor.donorId ? `/clinical/donors/${rec.matchedDonor.donorId}` : '/clinical/donors/list'}>
              ดูข้อมูลผู้บริจาค
            </Button>
          </div>
        )}
        {/* แท็บข้อมูลผู้ป่วย — กดได้ทุกเมื่อ ไม่ว่าจะอยู่ขั้นตอนไหน */}
        <div className="flex gap-1 overflow-x-auto border-t border-slate-200 px-4">
          {TABS.map((t) => {
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
                {active && <motion.span layoutId="tab-underline" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
              </button>
            );
          })}
        </div>
      </Card>

      <ProcessStepper currentIndex={currentIndex} selected={stage} onSelect={(k) => { setOpenSub(null); setStage(k); }} dates={rec.stageDates} />

      <>
        {stage ? (
          <motion.div key={`stage-${stage}-${openSub?.n ?? 0}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
            <StagePanel stage={stage} currentIndex={currentIndex} person={rec} kind="recipient" registerRows={registerRows(rec)} registerDate={rec.registeredAt} initialSub={openSub ? `${openSub.key}` : undefined} initialMode={openSub?.mode} />
          </motion.div>
        ) : (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="flex flex-col gap-5">
            <>
              <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {tab === 'ภาพรวม' ? (
                  <Overview rec={rec} onOpenPreop={() => setStage('preop')} />
                ) : tab === 'ผลตรวจ Lab' ? (
                  <LabPanel kind="recipient" id={rec.id} />
                ) : tab === 'นัดหมาย' ? (
                  <PersonAppointments kind="recipient" id={rec.id} />
                ) : tab === 'Timeline' ? (
                  <PersonTimeline person={rec} kind="recipient" />
                ) : tab === 'ข้อมูลจาก LINE' ? (
                  <LineDataPanel person={rec} kind="recipient" />
                ) : (
                  <FormsReport person={rec} kind="recipient" onOpen={openForm} />
                )}
              </motion.div>
            </>
          </motion.div>
        )}
      </>
    </motion.div>
  );
}

function Overview({ rec, onOpenPreop }: { rec: RecipientDetailDto; onOpenPreop: () => void }) {
  const ev = rec.evaluation;
  const pct = rec.status === 'evaluation' && ev ? Math.round((ev.done / ev.total) * 100) : 100;
  return (
    <div className="flex items-start gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {rec.caseType === 'redcross' ? (
          <Card className="flex flex-col gap-4 p-5">
            <CardHeader title="ข้อมูลการรอไตจากสภากาชาด" icon={Building2} iconTone={{ fg: '#6d28d9', bg: '#ede9fe' }} right={<StatusBadge status={rec.status} />} />
            <KvGrid
              items={[
                ['เลขคิวสภากาชาด', rec.redCrossQueueNo ?? '—'],
                ['วันที่ขึ้นทะเบียน', thaiDate(rec.redCrossSince)],
                ['ระยะเวลารอ', durationSince(rec.redCrossSince)],
                ['PRA ล่าสุด', rec.pra !== undefined ? `${rec.pra}%` : '—'],
                ['HLA Typing', rec.hla ? `A${rec.hla.A.join(',')} · B${rec.hla.B.join(',')} · DR${rec.hla.DR.join(',')}` : '—'],
                ['ส่ง serum ล่าสุด', '02 ต.ค. 2569'],
              ]}
            />
            <p className="flex items-center gap-2.5 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-800">
              <Info className="h-4 w-4" /> รอบส่ง serum ครั้งถัดไป 02 พ.ย. 2569 — ระบบจะแจ้งเตือนล่วงหน้า 3 วัน
            </p>
          </Card>
        ) : (
          <Card className="flex flex-col gap-4 p-5">
            <CardHeader title="ผู้บริจาคที่จับคู่" icon={Link2} iconTone={{ fg: '#0f766e', bg: '#ccfbf1' }} />
            <KvGrid
              items={[
                ['ผู้บริจาค', rec.matchedDonor?.name ?? '—'],
                ['ความสัมพันธ์', rec.matchedDonor?.relation ?? '—'],
                ['กรุ๊ปเลือดผู้รับ', `${rec.bloodGroup}${rec.rh}`],
              ]}
            />
          </Card>
        )}

        <Card className="flex flex-col gap-4 p-5">
          <CardHeader
            title="ผล Pre-KT Evaluation"
            icon={FileText}
            iconTone={{ fg: '#16a34a', bg: '#dcfce7' }}
            right={
              <button type="button" onClick={onOpenPreop} className="flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
                ดูรายละเอียด <ChevronRight className="h-3.5 w-3.5" />
              </button>
            }
          />
          <div className="flex items-center gap-3">
            <p className={cn('text-sm font-semibold', pct === 100 ? 'text-green-700' : 'text-slate-900')}>
              {pct === 100 ? 'ผ่านครบทุกรายการ' : `ตรวจแล้ว ${ev?.done}/${ev?.total} รายการ`}
            </p>
            <span className="flex-1" />
            <span className="text-xs text-slate-400">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-slate-200">
            <motion.div className="h-full rounded bg-green-600" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </Card>
      </div>

      <div className="flex w-[360px] shrink-0 flex-col gap-5">
        <Card className="flex flex-col gap-2 p-5">
          <CardHeader title="ข้อมูลทางคลินิก" icon={User} />
          {[
            ['การบำบัดทดแทนไต', { HD: 'HD 3 ครั้ง/สัปดาห์', PD: 'PD', none: 'ยังไม่ได้ฟอก/ล้างไต' }[rec.rrt] + (rec.rrtStart ? ` · ตั้งแต่ ${thaiDate(rec.rrtStart)}` : '')],
            ['กรุ๊ปเลือด', `${rec.bloodGroup}${rec.rh}`],
            ['LINE LIFF', rec.lineId ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'],
          ].map(([k, v], i) => (
            <div key={k} className={cn('flex gap-3 py-2 text-[13px]', i > 0 && 'border-t border-slate-100')}>
              <span className="w-[120px] shrink-0 text-slate-400">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <CardHeader title="นัดหมายถัดไป" icon={CalendarDays} />
          <div className="flex items-center gap-3.5 rounded-xl bg-blue-50 p-3.5">
            <div className="flex w-14 flex-col items-center rounded-[10px] bg-white py-2">
              <span className="text-xl font-bold text-primary">28</span>
              <span className="text-[11px] text-slate-500">ต.ค.</span>
            </div>
            <div>
              <p className="text-sm font-semibold">OPD อายุรกรรมโรคไต</p>
              <p className="text-xs text-slate-500">09:00 น. · ห้องตรวจ 3</p>
            </div>
          </div>
          {rec.caseType === 'redcross' && (
            <p className="flex items-center gap-2 text-[13px] text-slate-700">
              <Send className="h-4 w-4 text-violet-600" /> ส่ง serum ให้สภากาชาด · 02 พ.ย. 2569
            </p>
          )}
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <CardHeader title="กิจกรรมล่าสุด" icon={Activity} />
          {[
            ['#16a34a', `สถานะเปลี่ยนเป็น “${STATUS_META[rec.status].label}”`, `${thaiDate(rec.statusSince)} · อัตโนมัติ`],
            ['#2563eb', 'ผลตรวจ Lab ประจำเดือน', '02 ต.ค. 2569 · iMed'],
            ['#64748b', 'ลงทะเบียนผู้รับบริจาคไต', `${thaiDate(rec.registeredAt)} · ${rec.physician}`],
          ].map(([c, t, d], i, a) => (
            <div key={t} className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                {i < a.length - 1 && <span className="mt-1 h-7 w-0.5 bg-slate-200" />}
              </div>
              <div>
                <p className="text-[13px] font-semibold">{t}</p>
                <p className="text-[11px] text-slate-400">{d}</p>
              </div>
            </div>
          ))}
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Check className="h-3 w-3" /> สถานะเปลี่ยนอัตโนมัติตามขั้นตอนที่เสร็จ
          </p>
        </Card>
      </div>
    </div>
  );
}

function KvGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-3.5">
      {items.map(([k, v]) => (
        <div key={k}>
          <p className="text-xs text-slate-400">{k}</p>
          <p className="text-sm font-semibold">{v}</p>
        </div>
      ))}
    </div>
  );
}

function registerRows(rec: RecipientDetailDto): [string, string][][] {
  return [
    [
      ['ชื่อ-นามสกุล', fullName(rec)],
      ['HN', rec.hn],
      ['เลขบัตรประชาชน', rec.nationalId],
      ['วันเกิด / อายุ', `${thaiDate(rec.birthDate)} · ${rec.age} ปี`],
      ['กรุ๊ปเลือด', `${rec.bloodGroup}${rec.rh}`],
    ],
    [
      ['ที่อยู่', rec.address],
      ['โทรศัพท์', rec.phone],
      ['LINE ID', rec.lineId ?? '—'],
    ],
    [
      ['ผู้ประสงค์บริจาค', rec.intendedDonors.length ? rec.intendedDonors.map((d) => `${d.firstName} ${d.lastName} (${d.relation})${d.donorId ? ' ✓' : ''}`).join(', ') : 'ไม่มี → รอไตจากสภากาชาด'],
      ['การบำบัดปัจจุบัน', { HD: 'ฟอกเลือด (HD)', PD: 'ล้างไตทางช่องท้อง (PD)', none: 'ยังไม่ได้ฟอกเลือด/ล้างไต' }[rec.rrt]],
      ['เริ่มบำบัด', thaiDate(rec.rrtStart)],
    ],
  ];
}
