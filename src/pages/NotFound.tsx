import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { KidneyBuddy } from '@/components/brand/KidneyBuddy';
import { Button } from '@/components/ui/Button';

/** 404 · ใช้ทั้งในระบบ (/clinical/*) และนอกระบบ */
export default function NotFound({ standalone }: { standalone?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className={standalone ? 'grid min-h-screen place-items-center bg-slate-100 p-6' : 'py-6'}>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-14 text-center">
        <KidneyBuddy pose="not_found" size={190} />
        <p className="text-sm font-semibold text-slate-400">404</p>
        <h1 className="text-2xl font-bold">ไม่พบหน้าที่ต้องการ</h1>
        <p className="text-sm text-slate-500">ลิงก์อาจไม่ถูกต้อง หรือข้อมูลนี้ถูกย้าย/ลบแล้ว</p>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            ย้อนกลับ
          </Button>
          <Button icon={Home} to={standalone ? '/' : '/clinical/recipients'}>
            {standalone ? 'หน้าแรก' : 'ไปหน้ารายชื่อผู้รับ'}
          </Button>
        </div>
      </div>
    </div>
  );
}
