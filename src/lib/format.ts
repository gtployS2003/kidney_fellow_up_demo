const TH_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

/** 2026-10-21 → 21 ต.ค. 2569 */
export function thaiDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')} ${TH_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/** อายุ (ปี) จากวันเกิด */
export function ageFrom(iso: string, today = new Date()): number | null {
  if (!iso) return null;
  const b = new Date(iso);
  if (Number.isNaN(b.getTime())) return null;
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age >= 0 ? age : null;
}

/** ระยะเวลาตั้งแต่วันที่หนึ่ง เช่น “1 ปี 9 เดือน” */
export function durationSince(iso?: string, today = new Date()): string {
  if (!iso) return '—';
  const s = new Date(iso);
  let months = (today.getFullYear() - s.getFullYear()) * 12 + (today.getMonth() - s.getMonth());
  if (today.getDate() < s.getDate()) months--;
  if (months < 1) {
    const days = Math.max(0, Math.round((today.getTime() - s.getTime()) / 86400000));
    return `${days} วัน`;
  }
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} ปี` : '', m ? `${m} เดือน` : ''].filter(Boolean).join(' ');
}

export function fullName(p: { prefix: string; firstName: string; lastName: string }): string {
  return `${p.prefix}${p.firstName} ${p.lastName}`;
}

export function initials(p: { firstName: string; lastName: string }): string {
  return `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Date → YYYY-MM-DD (เวลาท้องถิ่น) */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
