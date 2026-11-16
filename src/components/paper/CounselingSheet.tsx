import type { ReactNode } from 'react';
import { Brand, Line, Page, R, RULE, Signature, VALUE, headBg } from './Sheet';

/** แถวหนึ่งบรรทัดในตาราง “หัวข้อคำแนะนำ | เข้าใจ” */
interface CLine {
  text: ReactNode;
  head?: boolean;
  /** undefined = ไม่มีช่องติ๊ก (หัวข้อหลักที่มีหัวข้อย่อย) */
  on?: boolean;
  /** ไม่เกี่ยวข้อง (เช่น ข้อ 3.4 ในผู้บริจาคชาย) */
  na?: boolean;
}

/**
 * ฟอร์ม “การให้คำปรึกษาผู้ป่วยปลูกถ่ายไต ศูนย์ไตเทียม” (ใช้ทั้งผู้รับ 1.1 และผู้บริจาค 1.1)
 * groups = หัวข้อหลัก + หัวข้อย่อย · ✓ ตรงกับบรรทัดของตัวเองเสมอ (ข้อความยาวตัดบรรทัดได้)
 */
export function CounselingSheet({ groups, patientName, counselor }: { groups: CLine[][]; patientName: string; counselor?: string }) {
  const B = `1px solid ${RULE}`;
  return (
    <Page gap={11}>
      <Brand />
      <div style={{ textAlign: 'center', fontSize: 15.5, fontWeight: 600, lineHeight: 1.35 }}>
        การให้คำปรึกษาผู้ป่วยปลูกถ่ายไต ศูนย์ไตเทียม
        <br />
        โรงพยาบาลมหาวิทยาลัยนเรศวร
      </div>
      <div style={{ textAlign: 'center', fontSize: 13.5, fontWeight: 500 }}>การให้คำปรึกษาแนะนำที่เกี่ยวข้องกับการปลูกถ่ายไตจากผู้บริจาคมีชีวิต และผู้บริจาคสมองตาย</div>
      <div style={{ border: B, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', background: headBg, fontWeight: 600 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '6px 0' }}>หัวข้อคำแนะนำ</div>
          <div style={{ width: 114, textAlign: 'center', padding: '6px 0', borderLeft: B }}>เข้าใจ</div>
        </div>
        {groups.map((g, gi) => (
          <div key={gi} style={{ borderTop: B }}>
            {g.map((l, i) => {
              const top = i === 0 ? 6 : 2;
              const bot = i === g.length - 1 ? 7 : 2;
              return (
                <div key={i} style={{ display: 'flex' }}>
                  <div style={{ flex: 1, padding: `${top}px 12px ${bot}px ${l.head ? 10 : 42}px`, fontWeight: l.head ? 500 : 400, lineHeight: 1.45 }}>{l.text}</div>
                  <div style={{ width: 114, borderLeft: B, display: 'flex', justifyContent: 'center', paddingTop: top + 2 }}>
                    {l.na ? <span style={{ fontSize: 11, color: '#64748b' }}>N/A</span> : l.on && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={VALUE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <R gap={8} style={{ paddingLeft: 34 }}>
          ข้าพเจ้า <Line value={patientName} grow center /> รับทราบข้อมูลเกี่ยวกับการปลูกถ่ายไตแล้ว
        </R>
        <div>และขอดำเนินการรักษาต่อไป</div>
      </div>
      <div style={{ display: 'flex', gap: 30, paddingTop: 26 }}>
        <Signature role="ผู้ให้คำปรึกษา" name={counselor} />
        <Signature role="ผู้รับฟังคำแนะนำ" name={patientName} />
      </div>
    </Page>
  );
}

/** เส้นประเล็ก ๆ ภายในบรรทัด (เช่น “เจาะเลือดทุกเดือนภายในวันที่ ……”) */
export function InlineLine({ value }: { value?: string }) {
  return (
    <span style={{ display: 'inline-block', minWidth: 86, borderBottom: '1px dotted #6b7280', color: VALUE, fontWeight: 500, textAlign: 'center', marginLeft: 6 }}>{value || ' '}</span>
  );
}
