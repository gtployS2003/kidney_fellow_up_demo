import type { CSSProperties, ReactNode } from 'react';
import logoSrc from '@/assets/nuh-logo.png?inline';

/**
 * ชุดชิ้นส่วนหน้ากระดาษ A4 (ฟอร์มกระดาษของศูนย์ปลูกถ่ายไต) — ตรงกับแบบใน Figma
 * - inline style ทั้งหมด → Preview / พิมพ์ / Export Word หน้าตาเดียวกัน
 * - โลโก้ฝังเป็น data URI → ติดไปกับไฟล์ Word ได้
 * - ขนาดใน Figma (กระดาษกว้าง 640) × 1.24 = ขนาดบนหน้าจอ (กว้าง 794)
 */
export const INK = '#111827';
export const VALUE = '#1d4ed8';
export const MUTE = '#4b5563';
export const RULE = '#374151';
export const FONT = "'Sarabun','TH Sarabun PSK','TH SarabunPSK','TH Sarabun New',Tahoma,sans-serif";
const DOT = '1px dotted #6b7280';
const B = `1px solid ${RULE}`;

export function Page({ children, gap = 9 }: { children: ReactNode; gap?: number }) {
  return (
    <div
      className="a4-page"
      style={{ width: 794, minHeight: 1123, boxSizing: 'border-box', padding: '36px 50px 42px', background: '#fff', color: INK, fontFamily: FONT, fontSize: 13, lineHeight: 1.45, display: 'flex', flexDirection: 'column', gap }}
    >
      {children}
    </div>
  );
}

/** โลโก้ + ชื่อโรงพยาบาล (มุมซ้ายบนของทุกฟอร์ม) */
export function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img src={logoSrc} alt="โลโก้โรงพยาบาลมหาวิทยาลัยนเรศวร" style={{ width: 124, height: 57, objectFit: 'contain' }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: '#1f4e9c' }}>โรงพยาบาลมหาวิทยาลัยนเรศวร</span>
        <span style={{ fontSize: 13, color: '#475569' }}>คณะแพทยศาสตร์ มหาวิทยาลัยนเรศวร</span>
      </div>
    </div>
  );
}

export function Title({ children, sub, size = 15 }: { children: ReactNode; sub?: ReactNode; size?: number }) {
  return (
    <div style={{ textAlign: 'center', padding: '2px 0 4px', lineHeight: 1.35 }}>
      <div style={{ fontSize: size, fontWeight: 600 }}>{children}</div>
      {sub && <div style={{ fontSize: 13.5, fontWeight: 500, color: MUTE }}>{sub}</div>}
    </div>
  );
}

/** แถวแนวนอน (ช่องกรอกวางเรียงกัน ชิดฐาน) */
export function R({ children, gap = 14, style }: { children: ReactNode; gap?: number; style?: CSSProperties }) {
  return <div style={{ display: 'flex', alignItems: 'flex-end', gap, width: '100%', boxSizing: 'border-box', ...style }}>{children}</div>;
}

/** ช่องติ๊ก */
export function Box({ on }: { on?: boolean }) {
  return (
    <span style={{ width: 12, height: 12, border: `1px solid ${INK}`, borderRadius: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box' }}>
      {on && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={VALUE} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </span>
  );
}

/** ตัวเลือก □ ข้อความ — w = ความกว้างคอลัมน์ (ให้ตรงกันทุกแถว) */
export function Opt({ on, label, w, style }: { on?: boolean; label: ReactNode; w?: number; style?: CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: w, flexShrink: 0, ...style }}>
      <Box on={on} />
      <span>{label}</span>
    </span>
  );
}

/** เส้นประให้กรอก (ค่าสีน้ำเงิน) — grow = ยืดเต็มที่เหลือ */
export function Line({ value, w, grow, center }: { value?: ReactNode; w?: number; grow?: boolean; center?: boolean }) {
  const empty = value === undefined || value === null || value === '' || value === '—';
  return (
    <span style={{ display: 'inline-block', borderBottom: DOT, padding: '0 5px', minHeight: 18, color: VALUE, fontWeight: 500, width: grow ? undefined : w, flex: grow ? 1 : 'none', minWidth: grow ? 30 : undefined, textAlign: center ? 'center' : undefined, boxSizing: 'border-box', lineHeight: 1.35 }}>
      {empty ? ' ' : value}
    </span>
  );
}

/** ป้าย + เส้นประ + หน่วย */
export function Fld({ label, value, w, after, grow, labelW, afterW }: { label?: ReactNode; value?: ReactNode; w?: number; after?: ReactNode; grow?: boolean; labelW?: number; afterW?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 5, flex: grow ? 1 : 'none' }}>
      {label !== undefined && <span style={{ width: labelW, flexShrink: 0 }}>{label}</span>}
      <Line value={value} w={w} grow={grow} />
      {after !== undefined && <span style={{ width: afterW, flexShrink: 0 }}>{after}</span>}
    </span>
  );
}

/** แถวตัวเลือก: ป้ายด้านซ้ายกว้างคงที่ + ตัวเลือกเรียงเป็นคอลัมน์ (ตัดบรรทัดอัตโนมัติ) */
export function OptRow({ label, labelW = 160, children }: { label: ReactNode; labelW?: number; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      <span style={{ width: labelW, flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: 7, flex: 1 }}>{children}</div>
    </div>
  );
}

/** หัวข้อส่วน (ตัวหนา + เส้นใต้บาง) */
export function SectionHead({ children }: { children: ReactNode }) {
  return <div style={{ fontWeight: 600, fontSize: 13.5, borderBottom: '1px solid #cbd5e1', padding: '8px 0 3px' }}>{children}</div>;
}

/** หัวข้อมูลผู้ป่วยมาตรฐาน: วันที่ / กรุ๊ปเลือด · ชื่อ / นามสกุล (/ อายุ) · HN (หรือ อายุ + HN) */
export function PatientHead({ date, blood, first, last, age, hn, ageWithHn }: { date: string; blood?: string; first: string; last: string; age: string | number; hn: string; ageWithHn?: boolean }) {
  return (
    <>
      <R gap={20}>
        <Fld label="วันที่กรอกข้อมูล" value={date} grow />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          กรุ๊ปเลือด
          {['A', 'B', 'O', 'AB'].map((g) => (
            <Opt key={g} on={blood === g} label={g} />
          ))}
        </span>
      </R>
      <R>
        <Fld label="ชื่อ (นาย / นาง / นางสาว)" value={first} grow />
        <Fld label="นามสกุล" value={last} grow />
        {!ageWithHn && <Fld label="อายุ" value={String(age)} w={45} after="ปี" />}
      </R>
      <R>
        {ageWithHn && <Fld label="อายุ" value={String(age)} w={50} after="ปี" />}
        <Fld label="HN" value={hn} w={175} />
      </R>
    </>
  );
}

// ---------- ตาราง (ใช้ div + เส้นขอบ ให้ตรงกับแบบ) ----------
export const tbl: CSSProperties = { border: B, display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' };
export const bt: CSSProperties = { borderTop: B };
export const bl: CSSProperties = { borderLeft: B };
export const headBg = '#f1f5f9';
export const cellPad: CSSProperties = { padding: '5px 10px' };

/** แถบหัวข้อสีเทาในตาราง */
export function TableHead({ children, first, style }: { children: ReactNode; first?: boolean; style?: CSSProperties }) {
  return <div style={{ ...cellPad, background: headBg, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 32, ...(first ? {} : bt), ...style }}>{children}</div>;
}

/** บรรทัดเส้นประจาง ๆ สำหรับเขียนผล */
export function NoteLine({ value }: { value?: ReactNode }) {
  return <div style={{ borderBottom: '1px dotted #cbd5e1', minHeight: 20, color: VALUE, fontWeight: 500, padding: '0 3px' }}>{value || ' '}</div>;
}

/** ช่องลงชื่อ: ลงชื่อ ....... บทบาท / ( ชื่อ ) */
export function Signature({ role, name }: { role: string; name?: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 7 }}>
        ลงชื่อ <Line w={186} /> {role}
      </span>
      <span style={{ display: 'inline-flex', gap: 5 }}>
        ( <span style={{ width: 186, textAlign: 'center', color: VALUE, fontWeight: 500 }}>{name || ' '}</span> )
      </span>
    </div>
  );
}
