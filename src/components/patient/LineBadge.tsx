import { MessageCircle } from 'lucide-react';
import { isLineLinked } from '@/services/api/lineApi';

/** label สถานะเชื่อม LINE (แสดงอย่างเดียว) */
export function LineBadge({ id, lineId }: { id: string; lineId?: string }) {
  const on = isLineLinked(id, lineId);
  return on ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
      <span className="grid h-4 w-4 place-items-center rounded-[5px] bg-[#06c755]">
        <MessageCircle className="h-2.5 w-2.5 text-white" strokeWidth={3} />
      </span>
      เชื่อม LINE แล้ว
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">ยังไม่เชื่อม LINE</span>
  );
}
