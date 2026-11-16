import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { KidneyBuddy, type BuddyPose } from '@/components/brand/KidneyBuddy';

/** หน้าว่าง / ค้นหาไม่พบ — ใช้ Kidney Buddy (Lottie) ท่า not_found เป็นค่าเริ่มต้น · icon เก็บไว้เพื่อความเข้ากันได้ */
export function EmptyState({ title, description, action, pose = 'not_found' }: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode; pose?: BuddyPose }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <KidneyBuddy pose={pose} size={120} />
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
