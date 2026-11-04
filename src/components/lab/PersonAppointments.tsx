import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import type { PersonKind } from '@/types';
import { Badge, TONES } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { appointmentApi } from '@/services/api/appointmentApi';
import { isoDate as iso } from '@/lib/format';
import { thaiDate } from '@/lib/format';

/** นัดหมายของผู้ป่วยรายเดียว (ย้อนหลัง 60 วัน – ล่วงหน้า 90 วัน) */
export function PersonAppointments({ kind, id }: { kind: PersonKind; id: string }) {
  const from = new Date();
  from.setDate(from.getDate() - 60);
  const to = new Date();
  to.setDate(to.getDate() + 90);
  const { data } = useAsync(() => appointmentApi.range(iso(from), iso(to), id), [id]);
  const today = iso(new Date());
  if (!data) return <Skeleton className="h-60 rounded-2xl" />;
  if (!data.length) return <EmptyState icon={CalendarDays} title="ไม่มีนัดหมายในช่วงนี้" action={<Link to="/clinical/appointments" className="text-sm font-semibold text-primary">ไปหน้านัดหมาย</Link>} />;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-[13px]">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
          <tr>
            {['วันที่', 'เวลา', 'ประเภทนัด', 'สถานที่', ''].map((h) => (
              <th key={h} className="px-4 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((a) => (
            <tr key={a.id} className={`border-t border-slate-100 ${a.date === today ? 'bg-blue-50' : a.date < today ? 'text-slate-400' : ''}`}>
              <td className="px-4 py-2.5 font-semibold">{thaiDate(a.date)}</td>
              <td className="px-4 py-2.5">{a.time}</td>
              <td className="px-4 py-2.5">
                {a.type}
                {a.source === 'manual' && <Badge label="สร้างในระบบ" tone={TONES.violet} className="ml-2" />}
              </td>
              <td className="px-4 py-2.5">{a.room}</td>
              <td className="px-4 py-2.5">
                <Link to={`/clinical/appointments?date=${a.date}`} className="text-xs font-semibold text-primary hover:underline">
                  ดูในปฏิทิน
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-2 text-xs text-slate-400">ย้อนหลัง 60 วัน – ล่วงหน้า 90 วัน · {kind === 'recipient' ? 'ผู้รับ' : 'ผู้บริจาค'}</p>
    </div>
  );
}
