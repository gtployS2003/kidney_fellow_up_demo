import { Hammer } from 'lucide-react';
import { useCrumbs } from '@/components/layout/crumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export default function ComingSoon({ module, round }: { module: string; round: number }) {
  useCrumbs([module]);
  return (
    <EmptyState
      icon={Hammer}
      title={`${module} — อยู่ระหว่างพัฒนา`}
      description={`หน้าในส่วนนี้จะทำในรอบที่ ${round} ตามดีไซน์ใน Figma`}
      action={<Button to="/clinical/recipients" variant="secondary">กลับไปหน้าผู้รับบริจาคไต</Button>}
    />
  );
}
