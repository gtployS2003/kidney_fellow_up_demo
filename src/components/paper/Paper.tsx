import type { CSSProperties, ReactNode } from 'react';

/**
 * ชิ้นส่วนหน้ากระดาษ A4 — ใช้ inline style ทั้งหมด
 * เพื่อให้ Preview / พิมพ์ / Export เป็น Word ได้หน้าตาเดียวกัน (ไม่พึ่ง Tailwind)
 */
const INK = '#111827';
const VALUE = '#1d4ed8';
const FONT = "'IBM Plex Sans Thai','TH Sarabun New','Segoe UI',Tahoma,sans-serif";

export function A4Page({ children }: { children: ReactNode }) {
  return (
    <div
      className="a4-page"
      style={{ width: 794, minHeight: 1123, boxSizing: 'border-box', padding: '40px 52px', background: '#fff', color: INK, fontFamily: FONT, fontSize: 13, lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {children}
    </div>
  );
}

export function LogoBox() {
  return (
    <div style={{ width: 110, height: 58, border: '1px dashed #94a3b8', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 10, flexShrink: 0 }}>
      <b>LOGO</b>
      <span>รพ.ม.นเรศวร</span>
    </div>
  );
}

export function Row({ children, gap = 16, style }: { children: ReactNode; gap?: number; style?: CSSProperties }) {
  return <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap, ...style }}>{children}</div>;
}

/** ช่องเส้นประแบบในแบบฟอร์มกระดาษ */
export function Dotted({ label, value, width = 140, after }: { label?: string; value?: ReactNode; width?: number; after?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 4 }}>
      {label && <span>{label}</span>}
      <span style={{ display: 'inline-block', minWidth: width, borderBottom: `1px dotted ${INK}`, padding: '0 4px', color: VALUE }}>{value || '\u00a0'}</span>
      {after && <span>{after}</span>}
    </span>
  );
}

export function Chk({ on, label }: { on?: boolean; label?: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginRight: 4 }}>
      <span style={{ width: 11, height: 11, border: `1px solid ${INK}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, lineHeight: 1, color: VALUE, fontWeight: 700 }}>{on ? '✓' : ''}</span>
      {label}
    </span>
  );
}

export function Val({ children }: { children: ReactNode }) {
  return <span style={{ color: VALUE }}>{children}</span>;
}

export const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 };
export const td: CSSProperties = { border: `0.8px solid ${INK}`, padding: '4px 6px', verticalAlign: 'top' };
export const th: CSSProperties = { ...td, background: '#f1f5f9', fontWeight: 600, textAlign: 'center' };

/** หัวกระดาษมาตรฐานของ “Kidney Transplantation Registration From” */
export function RegHeader({ title, date, blood, name, surname, age, hn }: { title: string; date: string; blood?: string; name: string; surname: string; age: string | number; hn: string }) {
  return (
    <>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
      </Row>
      <Row>
        <Dotted label="วันที่กรอกข้อมูล" value={date} width={170} />
        <span>
          กรุ๊ปเลือด {['A', 'B', 'O', 'AB'].map((g) => <Chk key={g} on={blood === g} label={g} />)}
        </span>
      </Row>
      <Row>
        <Dotted label="ชื่อ(นาย / นาง / นางสาว)" value={name} width={150} />
        <Dotted label="นามสกุล" value={surname} width={150} />
        <Dotted label="อายุ" value={String(age)} width={40} after="ปี" />
      </Row>
      <Dotted label="HN" value={hn} width={120} />
    </>
  );
}
