import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PRINT_ROOT_ID } from './exporters';

/** เนื้อหาที่จะถูกพิมพ์ / Export เป็น Word (ซ่อนบนหน้าจอ) — ให้มีได้ทีละ 1 ชุดต่อหน้า */
export function PrintArea({ children }: { children: ReactNode }) {
  return createPortal(
    <div id={PRINT_ROOT_ID} className="print-only">
      {children}
    </div>,
    document.body,
  );
}
