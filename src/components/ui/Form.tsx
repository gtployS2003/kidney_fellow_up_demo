import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Check, Database, Link2, Calculator } from 'lucide-react';
import { cn } from '@/lib/format';

/** ป้ายแหล่งข้อมูล: ดึงจากการลงทะเบียน / ดึงจาก iMed / คำนวณอัตโนมัติ */
export function DataTag({ kind }: { kind: 'reg' | 'his' | 'auto' }) {
  const m = {
    reg: { label: 'ดึงจากการลงทะเบียน', cls: 'bg-blue-100 text-blue-700', Icon: Link2 },
    his: { label: 'ดึงจาก iMed', cls: 'bg-teal-100 text-teal-700', Icon: Database },
    auto: { label: 'คำนวณอัตโนมัติ', cls: 'bg-violet-100 text-violet-700', Icon: Calculator },
  }[kind];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold', m.cls)}>
      <m.Icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

export function Field({
  label,
  required,
  hint,
  tag,
  children,
  className,
  error,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  tag?: 'reg' | 'his' | 'auto';
  children: ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="flex flex-wrap items-center gap-1.5 text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="font-bold text-red-600">*</span>}
        {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
        {tag && <DataTag kind={tag} />}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

/** ถ้า className กำหนดความกว้างเอง (w-…) จะไม่ใส่ w-full ให้ — กัน class ชนกัน */
const widthCls = (className?: string) => (/(^|\s)!?(w|min-w|max-w)-/.test(className ?? '') ? '' : 'w-full');

const inputCls =
  'h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-slate-100 disabled:text-slate-500';

export function TextInput({ suffix, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { suffix?: string }) {
  if (!suffix) return <input className={cn(inputCls, widthCls(className), className)} {...rest} />;
  return (
    <div className="relative">
      <input className={cn(inputCls, 'w-full pr-12', className)} {...rest} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-500">{suffix}</span>
    </div>
  );
}

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")";

export function Select({ className, children, style, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(inputCls, widthCls(className), 'appearance-none bg-no-repeat pr-9', className)}
      style={{ backgroundImage: chevron, backgroundPosition: 'right 12px center', ...style }}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputCls, widthCls(className), 'h-auto min-h-[88px] py-2.5', className)} {...rest} />;
}

/** ตัวเลือกแบบชิป (แทน ☐ ในแบบฟอร์มกระดาษ) */
export function ChoiceChips({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const sel = o === value;
        return (
          <motion.button
            key={o}
            type="button"
            disabled={disabled}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(sel ? '' : o)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors disabled:opacity-50',
              sel ? 'border-primary bg-primary-soft font-semibold text-blue-800' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400',
            )}
          >
            <span className={cn('grid h-4 w-4 place-items-center rounded-full border-[1.5px]', sel ? 'border-primary' : 'border-slate-400')}>
              {sel && <motion.span layoutId={undefined} initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            {o}
          </motion.button>
        );
      })}
    </div>
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="inline-flex items-center gap-2 text-[13px] text-slate-700">
      <span className={cn('grid h-[18px] w-[18px] place-items-center rounded border-[1.5px] transition-colors', checked ? 'border-primary bg-primary' : 'border-slate-400 bg-white')}>
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
