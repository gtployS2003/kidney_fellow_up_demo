import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { PersonKind, PersonRef } from '@/types';
import type { AnyForm, FormKey } from '@/modules/evaluation/forms/data';
import { formsApi } from '@/services/api/formsApi';
import { DataTag } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, thaiDate } from '@/lib/format';

/** การ์ดหัวข้อในฟอร์ม */
export function FSection({ title, tags, right, children, className }: { title: string; tags?: ('reg' | 'his' | 'auto')[]; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-3.5 rounded-[14px] border border-slate-200 bg-white p-[18px]', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[15px] font-bold">{title}</h3>
        {tags?.map((t) => <DataTag key={t} kind={t} />)}
        <span className="flex-1" />
        {right}
      </div>
      {children}
    </section>
  );
}

/** ปุ่มสลับ 2–3 ตัวเลือก (เช่น ไม่มี/มี, normal/abnormal, Positive/Negative) */
export function Seg<T extends string>({
  value,
  options,
  onChange,
  tones,
  width = 140,
}: {
  value: T | '';
  options: readonly T[];
  onChange: (v: T) => void;
  tones?: Partial<Record<T, { bg: string; fg: string }>>;
  width?: number;
}) {
  return (
    <div className="flex gap-[3px] rounded-lg bg-slate-100 p-[3px]" style={{ width }}>
      {options.map((o) => {
        const on = o === value;
        const t = tones?.[o] ?? { bg: '#ffffff', fg: '#0f172a' };
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn('flex-1 rounded-md py-1 text-xs transition-colors', on ? 'font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-600')}
            style={on ? { background: t.bg, color: t.fg } : undefined}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function Box({ checked, onChange, size = 20 }: { checked: boolean; onChange?: (v: boolean) => void; size?: number }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={cn('grid shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-colors', checked ? 'border-brand-indigo bg-brand-indigo' : 'border-slate-400 bg-white')}
      style={{ width: size, height: size }}
      aria-pressed={checked}
    >
      {checked && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </motion.span>
      )}
    </button>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-slate-500">{children}</p>;
}

/** โหลด/บันทึกฟอร์มของผู้ป่วยหนึ่งราย */
export function useFormRecord<T extends AnyForm>(rec: PersonRef, kind: PersonKind, key: FormKey, done: boolean, onSaved?: (key: FormKey, completed: boolean) => void) {
  const [form, setForm] = useState<T | null>(null);
  const [info, setInfo] = useState<string | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    setForm(null);
    formsApi.get<T>(kind, rec.id, key, { sex: rec.sex, done }).then((r) => {
      if (!alive) return;
      setForm(r.data);
      setInfo(r.savedAt ? `${r.completed ? 'บันทึกล่าสุด' : 'บันทึกร่าง'} ${thaiDate(r.savedAt)} · ${r.savedBy ?? ''}` : undefined);
    });
    return () => {
      alive = false;
    };
  }, [kind, rec.id, rec.sex, key, done]);

  const save = async (draft: boolean) => {
    if (!form) return;
    const r = await formsApi.save(kind, rec.id, key, form, draft);
    setInfo(`${draft ? 'บันทึกร่าง' : 'บันทึกล่าสุด'} ${thaiDate(r.savedAt)} · ${r.savedBy ?? ''}`);
    onSaved?.(key, !draft);
  };
  const patch = (p: Partial<T>) => setForm((f) => (f ? { ...f, ...p } : f));
  return { form, setForm, patch, save, info };
}

export function FormLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[72px] rounded-2xl" />
      <Skeleton className="h-[64px] rounded-2xl" />
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  );
}
