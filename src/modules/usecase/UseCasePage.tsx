import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Info, MousePointerClick, Workflow } from 'lucide-react';
import { ACTORS, EXTERNAL, PACKAGES, type ActorKey, type ExtKey, type UseCase } from './data';
import { cn } from '@/lib/format';

const COL_X = [200, 530, 880];
const COL_W = [300, 300, 340];
const TOP = 96;
const OVAL_H = 32;
const GAP = 8;
const HEAD = 38;
const PAD = 12;
const PKG_GAP = 20;

interface Box { x: number; y: number; w: number; h: number }

/** Use Case Diagram ตามระบบที่ออกแบบ (Phase 1) — คลิก use case เพื่อดูรายละเอียด */
export default function UseCasePage() {
  const [sel, setSel] = useState<UseCase | null>(null);

  const layout = useMemo(() => {
    const yCol = [TOP, TOP, TOP];
    const pkgs = PACKAGES.map((p) => {
      const h = HEAD + p.ucs.length * (OVAL_H + GAP) - GAP + PAD;
      const box: Box = { x: COL_X[p.col], y: yCol[p.col], w: COL_W[p.col], h };
      yCol[p.col] += h + PKG_GAP;
      const ucs = p.ucs.map((u, i) => ({ u, box: { x: box.x + 14, y: box.y + HEAD + i * (OVAL_H + GAP), w: box.w - 28, h: OVAL_H } }));
      return { p, box, ucs };
    });
    const bottom = Math.max(...yCol) - PKG_GAP + 24;
    return { pkgs, bottom };
  }, []);

  const W = 1440;
  const boundary: Box = { x: 170, y: 40, w: 1080, h: layout.bottom - 40 };
  const extY = boundary.y + boundary.h + 70;
  const H = extY + 90;
  const staffPkgs = layout.pkgs.filter((x) => x.p.col !== 2);
  const oa = layout.pkgs.find((x) => x.p.id === 'oa')!;
  const staffY = (staffPkgs[0].box.y + Math.max(...staffPkgs.map((s) => s.box.y + s.box.h))) / 2;
  const actorPos: Record<ActorKey, { x: number; y: number }> = { staff: { x: 80, y: staffY }, recipient: { x: 1345, y: oa.box.y + oa.box.h * 0.3 }, donor: { x: 1345, y: oa.box.y + oa.box.h * 0.72 } };
  const extX: Record<ExtKey, number> = { imed: 420, redcross: 660, thaid: 930, line: 1150 };
  const active = (a: ActorKey) => !sel || sel.actors.includes(a);
  const extActive = (e: ExtKey) => !sel || !!sel.ext?.includes(e);
  const extPkgs = (e: ExtKey) => layout.pkgs.filter((x) => x.p.ucs.some((u) => u.ext?.includes(e)));

  const actor = (k: ActorKey) => {
    const { x, y } = actorPos[k];
    const on = active(k);
    return (
      <g key={k} opacity={on ? 1 : 0.3} style={{ transition: 'opacity .2s' }}>
        <circle cx={x} cy={y - 34} r={11} fill="#fff" stroke="#1e3a8a" strokeWidth={2.2} />
        <path d={`M${x} ${y - 23} V${y + 6} M${x - 18} ${y - 12} H${x + 18} M${x} ${y + 6} L${x - 14} ${y + 28} M${x} ${y + 6} L${x + 14} ${y + 28}`} stroke="#1e3a8a" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <text x={x} y={y + 48} textAnchor="middle" fontSize={14} fontWeight={700} fill="#0f172a">
          {ACTORS[k].name}
        </text>
        <text x={x} y={y + 64} textAnchor="middle" fontSize={11} fill="#64748b">
          {ACTORS[k].sub}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="หน้าแรก">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-100 text-indigo-700">
          <Workflow className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="font-bold">Use Case Diagram · Kidney Transplant Follow-up System</p>
          <p className="text-xs text-slate-500">ตามระบบที่ออกแบบ (Phase 1) · ระบบแพทย์/พยาบาล + LINE OA ผู้รับและผู้บริจาค</p>
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
          <MousePointerClick className="h-4 w-4" /> คลิก use case เพื่อดูรายละเอียด
        </span>
      </header>

      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 p-6">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[1100px]" style={{ width: '100%' }} role="img" aria-label="Use case diagram">
            {/* เส้นเชื่อม actor → แพ็กเกจ (วาดก่อน ให้อยู่ใต้กล่อง) */}
            {staffPkgs.map(({ p, box }) => (
              <line key={p.id} x1={actorPos.staff.x + 20} y1={actorPos.staff.y - 10} x2={box.x} y2={box.y + box.h / 2} stroke={active('staff') ? '#94a3b8' : '#e2e8f0'} strokeWidth={1.5} />
            ))}
            {(['recipient', 'donor'] as const).map((k) => (
              <line key={k} x1={actorPos[k].x - 20} y1={actorPos[k].y - 10} x2={oa.box.x + oa.box.w} y2={actorPos[k].y - 10} stroke={active(k) ? '#94a3b8' : '#e2e8f0'} strokeWidth={1.5} />
            ))}
            {(Object.keys(EXTERNAL) as ExtKey[]).flatMap((e) =>
              extPkgs(e).map(({ p, box }) => (
                <line key={e + p.id} x1={extX[e]} y1={extY - 28} x2={box.x + box.w / 2} y2={box.y + box.h} stroke={extActive(e) && (!sel || p.ucs.includes(sel)) ? '#a78bfa' : '#ede9fe'} strokeWidth={1.3} strokeDasharray="6 5" />
              )),
            )}

            {/* ขอบเขตระบบ */}
            <rect x={boundary.x} y={boundary.y} width={boundary.w} height={boundary.h} rx={22} fill="#f8fafc" stroke="#1e3a8a" strokeWidth={2} />
            <text x={boundary.x + 22} y={boundary.y + 32} fontSize={16} fontWeight={700} fill="#1e3a8a">
              Kidney Transplant Follow-up System
            </text>
            <text x={boundary.x + boundary.w - 22} y={boundary.y + 32} fontSize={12} fill="#64748b" textAnchor="end">
              ซ้าย: เว็บระบบแพทย์/พยาบาล · ขวา: LINE OA (LIFF)
            </text>

            {/* แพ็กเกจ + use case */}
            {layout.pkgs.map(({ p, box, ucs }) => (
              <g key={p.id}>
                <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={14} fill={p.auto ? '#fefce8' : p.col === 2 ? '#f0fdf4' : '#ffffff'} stroke={p.auto ? '#fde047' : p.col === 2 ? '#86efac' : '#bfdbfe'} strokeWidth={1.5} strokeDasharray={p.auto ? '5 4' : undefined} />
                <text x={box.x + 14} y={box.y + 24} fontSize={13} fontWeight={700} fill={p.auto ? '#a16207' : p.col === 2 ? '#15803d' : '#1d4ed8'}>
                  {p.auto ? '«system» ' : ''}
                  {p.name}
                </text>
                {ucs.map(({ u, box: b }) => {
                  const on = sel?.id === u.id;
                  return (
                    <g key={u.id} onClick={() => setSel(on ? null : u)} style={{ cursor: 'pointer' }}>
                      <ellipse cx={b.x + b.w / 2} cy={b.y + b.h / 2} rx={b.w / 2} ry={b.h / 2} fill={on ? '#2563eb' : p.auto ? '#fffbeb' : '#eff6ff'} stroke={on ? '#1d4ed8' : p.auto ? '#facc15' : '#93c5fd'} strokeWidth={on ? 2 : 1.2} />
                      <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 4.5} textAnchor="middle" fontSize={12} fontWeight={on ? 700 : 500} fill={on ? '#ffffff' : '#0f172a'}>
                        {u.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            ))}

            {/* actors */}
            {(['staff', 'recipient', 'donor'] as const).map(actor)}

            {/* ระบบภายนอก */}
            {(Object.keys(EXTERNAL) as ExtKey[]).map((e) => (
              <g key={e} opacity={extActive(e) ? 1 : 0.35}>
                <rect x={extX[e] - 105} y={extY - 28} width={210} height={64} rx={12} fill={e === 'redcross' ? '#fff1f2' : '#f5f3ff'} stroke={e === 'redcross' ? '#fda4af' : '#c4b5fd'} strokeWidth={1.5} strokeDasharray={e === 'redcross' ? '5 4' : undefined} />
                <text x={extX[e]} y={extY - 8} textAnchor="middle" fontSize={11} fill="#7c3aed">
                  {e === 'redcross' ? '«external · นอกระบบ»' : '«external system»'}
                </text>
                <text x={extX[e]} y={extY + 10} textAnchor="middle" fontSize={14} fontWeight={700} fill="#0f172a">
                  {EXTERNAL[e].name}
                </text>
                <text x={extX[e]} y={extY + 27} textAnchor="middle" fontSize={10.5} fill="#64748b">
                  {EXTERNAL[e].sub}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <p className="border-b border-slate-200 px-5 py-3 font-bold">รายการ use case ทั้งหมด ({PACKAGES.reduce((s, p) => s + p.ucs.length, 0)})</p>
            <div className="divide-y divide-slate-100">
              {PACKAGES.map((p) => (
                <div key={p.id} className="px-5 py-3">
                  <p className={cn('mb-1.5 text-[13px] font-bold', p.auto ? 'text-yellow-700' : p.col === 2 ? 'text-green-700' : 'text-blue-700')}>{p.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.ucs.map((u) => (
                      <button key={u.id} type="button" onClick={() => setSel(u)} className={cn('rounded-full border px-3 py-1 text-[12.5px]', sel?.id === u.id ? 'border-primary bg-primary text-white' : 'border-slate-200 hover:border-primary hover:bg-blue-50')}>
                        <b className="mr-1 opacity-60">{u.id}</b>
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <motion.div key={sel?.id ?? 'none'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-20">
            {!sel ? (
              <div className="flex flex-col gap-3 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-bold text-slate-900">
                  <Info className="h-4 w-4 text-primary" /> วิธีอ่านแผนภาพ
                </p>
                <p>• กรอบใหญ่ = ขอบเขตระบบ · กล่องสีฟ้า = ระบบแพทย์/พยาบาล · กล่องสีเขียว = LINE OA · กล่องเหลือง = สิ่งที่ระบบทำอัตโนมัติ</p>
                <p>• เส้นทึบ = actor ใช้งานกลุ่ม use case นั้น · เส้นประม่วง = เชื่อมกับระบบภายนอก</p>
                <p>• แพทย์และพยาบาลมีสิทธิ์เท่ากัน · ไม่มีหน้าตั้งค่า (ค่ากลางตั้งโดยผู้พัฒนา)</p>
                <p>• สภากาชาดอยู่นอกระบบ: ส่งรายชื่อเป็นไฟล์ และแจ้งผลทางโทรศัพท์ (พยาบาลบันทึกเอง) · ไม่แจ้งเรื่องสภากาชาดผ่าน LINE</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <span className="w-fit rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">{sel.id}</span>
                <p className="text-lg font-bold">{sel.name}</p>
                <p className="text-sm leading-6 text-slate-600">{sel.desc}</p>
                <div className="flex flex-col gap-1.5 text-sm">
                  <p>
                    <span className="text-slate-400">Actor: </span>
                    <b>{sel.actors.length ? sel.actors.map((a) => ACTORS[a].name).join(', ') : 'ระบบ (อัตโนมัติ)'}</b>
                  </p>
                  {sel.ext && (
                    <p>
                      <span className="text-slate-400">ระบบภายนอก: </span>
                      <b>{sel.ext.map((e) => EXTERNAL[e].name).join(', ')}</b>
                    </p>
                  )}
                </div>
                {sel.link && (
                  <Link to={sel.link} className="flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white">
                    เปิดในเดโม <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
                <button type="button" onClick={() => setSel(null)} className="w-fit text-xs text-slate-500 hover:underline">
                  ล้างการเลือก
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
