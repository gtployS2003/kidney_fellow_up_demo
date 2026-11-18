import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight, History } from 'lucide-react';
import type { MrbCaseDto, PersonKind } from '@/types';
import type { AnyForm, FormKey } from '@/modules/evaluation/forms/data';
import { mrbApi } from '@/services/api/mrbApi';
import { fullName, thaiDate } from '@/lib/format';

/** โหลด/บันทึกฟอร์มของเคส MRB ร่วม (ใช้ id เคส ไม่ใช่ id บุคคล) */
export function useMrbRecord<T extends AnyForm>(caseId: string | undefined, key: FormKey, done: boolean, onSaved?: (key: FormKey, completed: boolean) => void) {
  const [form, setForm] = useState<T | null>(null);
  const [info, setInfo] = useState<string | undefined>();
  useEffect(() => {
    if (!caseId) return;
    let alive = true;
    setForm(null);
    mrbApi.getForm<T>(caseId, key, done).then((r) => {
      if (!alive) return;
      setForm(r.data);
      setInfo(r.savedAt ? `${r.completed ? 'บันทึกล่าสุด' : 'บันทึกร่าง'} ${thaiDate(r.savedAt)} · ${r.savedBy ?? ''}` : undefined);
    });
    return () => {
      alive = false;
    };
  }, [caseId, key, done]);
  const save = async (draft: boolean) => {
    if (!form || !caseId) return;
    const r = await mrbApi.saveForm(caseId, key, form, draft);
    setInfo(`${draft ? 'บันทึกร่าง' : 'บันทึกล่าสุด'} ${thaiDate(r.savedAt)} · ${r.savedBy ?? ''}`);
    onSaved?.(key, !draft);
  };
  const patch = (p: Partial<T>) => setForm((f) => (f ? { ...f, ...p } : f));
  return { form, setForm, patch, save, info };
}

export function useMrbCase(kind: PersonKind, id: string) {
  const [c, setC] = useState<MrbCaseDto | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    mrbApi.caseFor(kind, id).then((x) => alive && setC(x));
    return () => {
      alive = false;
    };
  }, [kind, id]);
  return c;
}

function Person({ role, name, meta, here, tone }: { role: string; name: string; meta: string; here: boolean; tone: 'r' | 'd' }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className={tone === 'r' ? 'rounded-md bg-blue-100 px-2 py-0.5 text-[10.5px] font-semibold text-blue-700' : 'rounded-md bg-teal-100 px-2 py-0.5 text-[10.5px] font-semibold text-teal-700'}>{role}</span>
        <span className="truncate text-[13px] font-semibold text-slate-900">{name}</span>
      </div>
      <p className="text-[11px] text-slate-500">
        {meta}
        {here && ' · หน้านี้'}
      </p>
    </div>
  );
}

/** แถบ “เคส MRB ร่วม” — ผู้รับ ⇄ ผู้บริจาค + ลิงก์ไปหน้าอีกฝั่ง */
export function MrbCaseBanner({ c, here, date, sub }: { c: MrbCaseDto; here: PersonKind; date?: string; sub: FormKey }) {
  const other = here === 'recipient' ? c.donor : c.recipient.id ? c.recipient : undefined;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-orange-200 bg-orange-50 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-orange-800">เคส MRB ร่วม (1 เคสต่อคู่)</span>
          <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10.5px] font-medium text-orange-700">
            เคสที่ {c.no}
            {date ? ` · MRB ${thaiDate(date)}` : ''}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <Person role="ผู้รับ" tone="r" name={fullName(c.recipient)} meta={`HN ${c.recipient.hn}${c.recipient.age ? ` · ${c.recipient.age} ปี` : ''} · ${c.recipient.bloodGroup}`} here={here === 'recipient'} />
          <ArrowLeftRight className="h-4 w-4 shrink-0 text-orange-700" />
          {c.donor ? (
            <Person role="ผู้บริจาค" tone="d" name={fullName(c.donor)} meta={`HN ${c.donor.hn} · ${c.donor.relation ?? ''} · ${c.donor.age} ปี · ${c.donor.bloodGroup}`} here={here === 'donor'} />
          ) : (
            <span className="text-[12px] text-slate-500">ไม่มีผู้บริจาคมีชีวิต · รอไตจากสภากาชาด</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        {other && (
          <Link to={`/clinical/${other.kind === 'recipient' ? 'recipients' : 'donors'}/${other.id}?sub=${sub}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-indigo hover:underline">
            ไปหน้า{other.kind === 'recipient' ? 'ผู้รับ' : 'ผู้บริจาค'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
          <History className="h-3 w-3" /> ประวัติเคส MRB ({c.historyCount})
        </span>
      </div>
    </div>
  );
}
