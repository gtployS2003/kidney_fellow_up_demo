/** ส่งออกฟอร์ม — ใช้เนื้อหาจากหน้า Preview (inline style) */

const PRINT_ROOT_ID = 'print-root';

/** พิมพ์ / บันทึกเป็น PDF ผ่านหน้าต่างพิมพ์ของ browser (เลือก “Save as PDF”) */
export function printForm() {
  window.print();
}

/** ส่งออกเป็นไฟล์ Word (.doc) — Word เปิดไฟล์ HTML นามสกุล .doc ได้โดยตรง
 *  (ภายหลังฝั่ง .NET สามารถสร้าง .docx ด้วย OpenXML แทนได้) */
export function exportWord(fileName: string) {
  const el = document.getElementById(PRINT_ROOT_ID);
  if (!el) return;
  const html = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${fileName}</title>
<style>@page{size:A4;margin:14mm} body{font-family:'TH Sarabun New','IBM Plex Sans Thai',Tahoma,sans-serif}</style></head><body>${el.innerHTML}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.doc`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export { PRINT_ROOT_ID };

/** ดาวน์โหลดตารางเป็น CSV (มี BOM ให้ Excel อ่านภาษาไทยได้) */
export function downloadCsv(fileName: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
