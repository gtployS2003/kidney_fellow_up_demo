import { BusyDialog, useBusyRun } from '@/components/brand/BuddyStates';
import { useState, type ReactElement, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Check, ChevronsLeft, ClipboardCheck, Download, Eye, Hammer, Lock, Pencil, Scissors, UserCheck, type LucideIcon } from 'lucide-react';
import type { PersonKind, PersonRef, StageKey } from '@/types';
import { STAGES } from '@/lib/status';
import { cn, thaiDate } from '@/lib/format';
import { Badge, TONES } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formsApi } from '@/services/api/formsApi';
import type { FormKey } from '@/modules/evaluation/forms/data';
import { CounselingForm } from '@/modules/evaluation/forms/CounselingForm';
import { CurrentTxForm } from '@/modules/evaluation/forms/CurrentTxForm';
import { HistoryForm } from '@/modules/evaluation/forms/HistoryForm';
import { PhysicalForm } from '@/modules/evaluation/forms/PhysicalForm';
import { PlanForm } from '@/modules/evaluation/forms/PlanForm';
import { MrbForm } from '@/modules/evaluation/forms/MrbForm';
import { DonorCounselingForm } from '@/modules/evaluation/forms/DonorCounselingForm';
import { DonorHistoryForm } from '@/modules/evaluation/forms/DonorHistoryForm';
import type { FormProps } from '@/modules/evaluation/forms/types';
import { SurgeryPanel } from './postop/SurgeryPanel';
import { DischargePanel } from './postop/DischargePanel';
import { OpdPanel } from './postop/OpdPanel';
import { Modal } from '@/components/ui/Modal';
import { PrintArea } from '@/components/forms/PrintArea';
import { exportWord, printForm } from '@/components/forms/exporters';
import { A4Page, LogoBox, Row, tableStyle, td } from '@/components/paper/Paper';
import { FileText, Printer } from 'lucide-react';

type FormComp = (p: FormProps) => ReactElement;
interface EvalForm {
  key: FormKey;
  title: string;
  Comp: FormComp;
}

/** ขั้นตอนย่อย Evaluation แยกตามประเภทบุคคล */
const EVAL_FORMS: Record<PersonKind, EvalForm[]> = {
  recipient: [
    { key: 'counseling', title: 'รายการให้คำปรึกษา', Comp: CounselingForm },
    { key: 'currentTx', title: 'ข้อมูลการรักษาปัจจุบัน', Comp: CurrentTxForm },
    { key: 'history', title: 'ซักประวัติโดยแพทย์', Comp: HistoryForm },
    { key: 'physical', title: 'ตรวจร่างกายโดยแพทย์', Comp: PhysicalForm },
    { key: 'plan', title: 'รายการรอส่งตรวจเพิ่มเติม', Comp: PlanForm },
  ],
  donor: [
    { key: 'donorCounseling', title: 'รายการให้คำปรึกษาผู้บริจาค', Comp: DonorCounselingForm },
    { key: 'donorHistory', title: 'ซักประวัติโดยแพทย์', Comp: DonorHistoryForm },
    { key: 'physical', title: 'ตรวจร่างกายโดยแพทย์', Comp: PhysicalForm },
    { key: 'plan', title: 'รายการส่งตรวจเพิ่มเติม', Comp: PlanForm },
  ],
};

type SubState = 'done' | 'pending' | 'todo';
interface SubStep {
  key: string;
  num: string;
  title: string;
  state: SubState;
}

/** ขั้นตอนย่อยของ “ก่อนผ่าตัด” — สถานะจาก backend (เดโม: คำนวณจากสถานะผู้ป่วย) + ฟอร์มที่บันทึกในเซสชันนี้ */
function preopSteps(r: PersonRef, kind: PersonKind, saved: FormKey[]) {
  const forms = EVAL_FORMS[kind];
  const n = forms.length;
  const afterEval = r.status !== 'evaluation';
  const doneCount = afterEval ? n : Math.floor(((r.evaluation?.done ?? 0) / (r.evaluation?.total ?? 11)) * n);
  const evalChildren: SubStep[] = forms.map((ef, i) => ({
    key: ef.key,
    num: `1.${i + 1}`,
    title: ef.title,
    state: i < doneCount || saved.includes(ef.key) ? 'done' : 'todo',
  }));
  const mrbBase: SubState = r.status === 'mrb' ? 'pending' : ['passed', 'evaluation'].includes(r.status) ? 'todo' : 'done';
  const mrbState: SubState = saved.includes('mrb') ? 'done' : mrbBase;
  return { evalChildren, mrbState, evalDone: evalChildren.every((c) => c.state === 'done'), baseDone: (k: FormKey) => (k === 'mrb' ? mrbBase === 'done' : forms.findIndex((e) => e.key === k) < doneCount) };
}

function Mark({ state, count }: { state: SubState; count?: number }) {
  if (state === 'done')
    return (
      <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-green-600">
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </span>
    );
  if (state === 'pending' && count) return <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-red-500 text-[11px] font-bold text-white">{count}</span>;
  if (state === 'pending') return <Badge label="กำลังรอ" tone={TONES.amber} dot />;
  return <span className="h-[22px] w-[22px] shrink-0 rounded-full border-[1.5px] border-slate-300" />;
}

export function StagePanel({
  stage,
  currentIndex,
  person,
  kind,
  registerRows,
  registerDate,
  initialSub,
  initialMode,
}: {
  stage: StageKey;
  currentIndex: number;
  person: PersonRef;
  kind: PersonKind;
  /** ข้อมูลแสดงในขั้นตอน “ลงทะเบียน” (แบ่งเป็นกลุ่ม) */
  registerRows: [string, string][][];
  registerDate: string;
  /** เปิดขั้นตอนย่อยนี้ก่อน (เช่น จากแท็บรายงานฟอร์ม) */
  initialSub?: string;
  initialMode?: 'edit' | 'preview';
}) {
  const idx = STAGES.findIndex((s) => s.key === stage);
  const label = STAGES[idx].label;

  if (idx > currentIndex) {
    return (
      <EmptyState
        icon={Lock}
        title={`ยังไม่ถึงขั้นตอน “${label}”`}
        description="ขั้นตอนนี้จะเปิดอัตโนมัติเมื่อขั้นตอนก่อนหน้าเสร็จ"
      />
    );
  }
  if (stage === 'register') return <RegisterPanel key={initialSub === 'register' ? `reg-${initialMode}` : 'reg'} rows={registerRows} date={registerDate} kind={kind} person={person} openPreview={initialSub === 'register' && initialMode === 'preview'} />;
  if (stage === 'preop') return <PreopPanel key={initialSub ?? 'default'} rec={person} kind={kind} initialSub={initialSub} initialMode={initialMode} />;
  // ขั้นตอนหลังผ่าตัด — แบบฟอร์มจริงยังรอกำหนด (ใช้ตามดีไซน์ใน Figma)
  if (stage === 'surgery') return <SurgeryPanel person={person} kind={kind} filled />;
  if (stage === 'discharge') return <DischargePanel person={person} kind={kind} filled />;
  return <OpdPanel person={person} kind={kind} filled />;
}

function PreopPanel({ rec, kind, initialSub, initialMode }: { rec: PersonRef; kind: PersonKind; initialSub?: string; initialMode?: 'edit' | 'preview' }) {
  const [saved, setSaved] = useState<FormKey[]>(() => formsApi.completedKeys(rec.id));
  const { evalChildren, mrbState, evalDone, baseDone } = preopSteps(rec, kind, saved);
  const forms = EVAL_FORMS[kind];
  const firstTodo = evalChildren.find((c) => c.state !== 'done')?.key ?? 'mrb';
  const [sel, setSel] = useState<string>(initialSub ?? firstTodo);
  const [collapsed, setCollapsed] = useState(false);
  const pendingCount = evalChildren.filter((c) => c.state !== 'done').length;
  const onSaved = (k: FormKey, completed: boolean) => {
    if (completed) setSaved((s) => (s.includes(k) ? s : [...s, k]));
  };
  const formProps: FormProps = { rec, kind, onSaved, done: baseDone(sel as FormKey), initialMode: sel === initialSub ? initialMode : undefined };
  const Current = forms.find((f) => f.key === sel)?.Comp;

  return (
    <div className="flex items-start gap-5">
      <motion.nav animate={{ width: collapsed ? 64 : 290 }} className="sticky top-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5">
        <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
          {!collapsed && (
            <>
              <span className="text-xs font-semibold text-slate-600">ขั้นตอนย่อย</span>
              <Badge label={`${evalChildren.filter((c) => c.state === 'done').length + (mrbState === 'done' ? 1 : 0)}/${forms.length + 1}`} tone={TONES.slate} />
              <span className="flex-1" />
            </>
          )}
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="พับเมนู">
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} className="block">
              <ChevronsLeft className="h-4 w-4" />
            </motion.span>
          </button>
        </div>

        <NavItem icon={ClipboardCheck} tint="#fee2e2" fg="#dc2626" num="1" title="Evaluation" sub={`${forms.length} ขั้นตอน · ตรวจประเมิน${kind === 'donor' ? 'ผู้บริจาค' : 'ก่อนปลูกถ่าย'}`} collapsed={collapsed} mark={<Mark state={evalDone ? 'done' : 'pending'} count={pendingCount} />} />
        {!collapsed && (
          <div className="ml-7 border-l-2 border-indigo-100 pl-2.5">
            {evalChildren.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setSel(c.key)}
                className={cn('relative flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left', sel === c.key ? 'font-bold text-indigo-800' : 'text-slate-700 hover:bg-slate-50')}
              >
                {sel === c.key && <motion.span layoutId="sub-sel" className="absolute inset-0 rounded-[10px] bg-indigo-50" />}
                <span className="relative text-[11px] font-semibold text-slate-400">{c.num}</span>
                <span className="relative flex-1 truncate text-[13px]">{c.title}</span>
                <span className="relative">
                  <Mark state={c.state} />
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="my-1 border-t border-dashed border-slate-200" />
        <button type="button" onClick={() => setSel('mrb')} className="relative block w-full text-left">
          {sel === 'mrb' && <motion.span layoutId="sub-sel" className="absolute inset-0 rounded-xl bg-indigo-50" />}
          <NavItem icon={Building2} tint="#fef9c3" fg="#a16207" num="2" title="รอ MRB" sub="Medical Review Board" collapsed={collapsed} mark={<Mark state={mrbState} />} />
        </button>
      </motion.nav>

      <div className="min-w-0 flex-1">
        <>
          <motion.div key={sel} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
            {sel === 'mrb' ? <MrbForm {...formProps} /> : Current ? <Current {...formProps} /> : null}
          </motion.div>
        </>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, tint, fg, num, title, sub, mark, collapsed }: { icon: LucideIcon; tint: string; fg: string; num: string; title: string; sub: string; mark: ReactNode; collapsed: boolean }) {
  return (
    <div className="relative flex items-center gap-2.5 rounded-xl px-2.5 py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]" style={{ background: tint, color: fg }}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">{num}</span>
              <span className="truncate text-sm font-bold">{title}</span>
            </span>
            <span className="block truncate text-xs text-slate-400">{sub}</span>
          </span>
          {mark}
        </>
      )}
    </div>
  );
}

/** หัวฟอร์ม (กรอกข้อมูล / Preview / Export) + พื้นที่ฟอร์ม */
export function FormArea({ title, desc, icon: Icon }: { title: string; desc: string; icon: LucideIcon }) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-3.5">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <Icon className="h-[22px] w-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold text-indigo-800">{title}</p>
          <p className="text-[12.5px] text-slate-600">{desc}</p>
        </div>
        <div className="flex gap-0.5 rounded-[10px] border border-indigo-100 bg-white p-[3px]">
          {(
            [
              ['edit', 'กรอกข้อมูล', Pencil],
              ['preview', 'Preview', Eye],
            ] as const
          ).map(([k, l, I]) => (
            <button key={k} type="button" onClick={() => setMode(k)} className={cn('relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold', mode === k ? 'text-white' : 'text-slate-600')}>
              {mode === k && <motion.span layoutId={`mode-${title}`} className="absolute inset-0 rounded-lg bg-brand-indigo" />}
              <I className="relative h-3.5 w-3.5" />
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
        <Button variant="secondary" icon={Download} size="sm" className="!border-indigo-200 !text-brand-indigo">
          Export
        </Button>
      </div>
      <EmptyState icon={Hammer} title="ยังไม่มีแบบฟอร์มของขั้นตอนนี้" description="รอกำหนดแบบฟอร์มจากหน้างาน" />
    </div>
  );
}

/** ขั้นตอนลงทะเบียน: แสดงข้อมูล + Preview A4 + Export (PDF / Word / พิมพ์) */
function RegisterPanel({ rows, date, kind, person, openPreview }: { rows: [string, string][][]; date: string; kind: PersonKind; person: PersonRef; openPreview?: boolean }) {
  const [preview, setPreview] = useState(!!openPreview);
  const [menu, setMenu] = useState(false);
  const title = kind === 'donor' ? 'แบบฟอร์มลงทะเบียนผู้บริจาค' : 'แบบฟอร์มลงทะเบียน';
  const fileName = `KT-${kind === 'donor' ? 'D' : 'R'}-registration-${person.hn}`;
  const GROUPS = ['ข้อมูลส่วนตัว', 'ข้อมูลการติดต่อ', kind === 'donor' ? 'ผู้รับไต' : 'ข้อมูลการรักษา / ผู้ประสงค์บริจาค'];
  const paper = (
    <A4Page>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
          Naresuan University Hospital Kidney Transplantation {kind === 'donor' ? 'Donor ' : ''}Registration Form
          <br />
          {title}
        </div>
        <div style={{ width: 110, textAlign: 'right' }}>วันที่ {thaiDate(date)}</div>
      </Row>
      {rows.map((g, gi) => (
        <div key={gi}>
          <div style={{ fontWeight: 600, padding: '6px 0 4px' }}>
            {gi + 1}. {GROUPS[gi] ?? ''}
          </div>
          <table style={tableStyle}>
            <tbody>
              {g.map(([k, v]) => (
                <tr key={k}>
                  <td style={{ ...td, width: 200, background: '#f8fafc' }}>{k}</td>
                  <td style={td}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <Row gap={20} style={{ paddingTop: 28, justifyContent: 'flex-end' }}>
        <div style={{ width: 150, height: 70, border: '1px solid #64748b', display: 'grid', placeItems: 'center', fontSize: 11 }}>Sticker Recipient</div>
        <div style={{ width: 150, height: 70, border: '1px solid #64748b', display: 'grid', placeItems: 'center', fontSize: 11 }}>Sticker Donor</div>
      </Row>
    </A4Page>
  );
  const busyRun = useBusyRun();
  const run = (fn: () => void) => {
    setMenu(false);
    busyRun.run('กำลังสร้างไฟล์…', fn);
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-3.5">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
          <UserCheck className="h-[22px] w-[22px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold text-indigo-800">{title}</p>
          <p className="text-[12.5px] text-slate-600">ขั้นตอนนี้ไม่มีขั้นตอนย่อย · ลงทะเบียนเมื่อ {thaiDate(date)}</p>
        </div>
        <Button variant="secondary" icon={Eye} size="sm" onClick={() => setPreview(true)}>
          Preview
        </Button>
        <div className="relative">
          <Button variant="secondary" icon={Download} size="sm" className="!border-indigo-200 !text-brand-indigo" onClick={() => setMenu(!menu)}>
            Export
          </Button>
          <AnimatePresence>
            {menu && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 z-30 mt-2 w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop">
                {(
                  [
                    ['PDF', 'Save as PDF', FileText, printForm],
                    ['Word (.doc)', 'แก้ไขต่อได้', FileText, () => exportWord(fileName)],
                    ['พิมพ์', 'ส่งไปเครื่องพิมพ์', Printer, printForm],
                  ] as const
                ).map(([t, d, I, fn]) => (
                  <button key={t} type="button" onClick={() => run(fn)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50">
                    <I className="h-4 w-4 text-slate-500" />
                    <span>
                      <span className="block text-[13px] font-semibold">{t}</span>
                      <span className="block text-[11px] text-slate-400">{d}</span>
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {rows.map((group, gi) => (
          <motion.div key={gi} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: gi * 0.06 } }} className="rounded-2xl border border-slate-200 bg-white p-5">
            {group.map(([k, v], i) => (
              <div key={k} className={cn('flex gap-3 py-2 text-[13px]', i > 0 && 'border-t border-slate-100')}>
                <span className="w-[110px] shrink-0 text-slate-400">{k}</span>
                <span className="font-medium text-slate-900">{v}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
      <Modal open={preview} onClose={() => setPreview(false)} width={860}>
        <div className="mb-3 flex items-center gap-2">
          <p className="flex-1 text-base font-bold">Preview · A4</p>
          <Button size="sm" variant="secondary" icon={Printer} onClick={() => run(printForm)}>
            พิมพ์ / PDF
          </Button>
          <Button size="sm" variant="secondary" icon={FileText} onClick={() => run(() => exportWord(fileName))}>
            Word
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-auto rounded-xl bg-slate-200 p-4">
          <div className="mx-auto w-fit shadow-[0_4px_16px_rgba(0,0,0,.12)]">{paper}</div>
        </div>
      </Modal>
      <PrintArea>{paper}</PrintArea>
      <BusyDialog open={!!busyRun.busy} title={busyRun.busy ?? ''} desc={title} delay={0} />
    </div>
  );
}

function FormHeaderStatic({ title, desc, icon: Icon }: { title: string; desc: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-3.5">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
        <Icon className="h-[22px] w-[22px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-bold text-indigo-800">{title}</p>
        <p className="text-[12.5px] text-slate-600">{desc}</p>
      </div>
      <Button variant="secondary" icon={Download} size="sm" className="!border-indigo-200 !text-brand-indigo">
        Export
      </Button>
    </div>
  );
}
