import type { CSSProperties } from 'react';
import type { ChecklistItemDto, PairChecklistDto } from '@/types';
import { checklistSummary } from '@/services/api/matchingApi';
import { A4Page, LogoBox, Row } from './Paper';

/** แบบฟอร์มกระดาษ “Pre-KT evaluation check lists” ของคู่ผู้รับ–ผู้บริจาคมีชีวิต (Preview / พิมพ์ / Export) */
const INK = '#111827';
const cellBase: CSSProperties = {
  border: `0.6px solid ${INK}`,
  padding: '2px 5px',
  verticalAlign: 'top',
  fontSize: 11,
  lineHeight: 1.35,
};
const head: CSSProperties = {
  ...cellBase,
  background: '#f1f5f9',
  fontWeight: 600,
};
const group: CSSProperties = {
  ...cellBase,
  background: '#f8fafc',
  fontWeight: 700,
  color: '#374151',
};
const muted = '#9ca3af';

/** 2026-09-02 → 02/09/69 */
function dmy(iso?: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${String((Number(y) + 543) % 100).padStart(2, '0')}`;
}
const thaiLong = (iso: string) =>
  new Date(iso).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

function naText(it: ChecklistItemDto) {
  return it.key === 'others' ? '' : it.key === 'psa' ? 'เฉพาะผู้ชาย' : 'เฉพาะผู้หญิง';
}
function result(it: ChecklistItemDto) {
  if (it.na) return 'N/A';
  if (!it.date) return 'รอผล';
  return it.decision === 'pass' ? 'ผ่าน' : it.decision === 'fail' ? 'ไม่ผ่าน' : 'รอตัดสิน';
}

function Table({ title, items }: { title: string; items: ChecklistItemDto[] }) {
  let last: string | undefined;
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
      }}
    >
      <colgroup>
        <col style={{ width: '36%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '30%' }} />
        <col style={{ width: '17%' }} />
      </colgroup>
      <thead>
        <tr>
          <th
            colSpan={4}
            style={{
              ...head,
              background: '#e5e7eb',
              textAlign: 'left',
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            {title}
          </th>
        </tr>
        <tr>
          <th style={{ ...head, textAlign: 'left' }}>รายการ</th>
          <th style={{ ...head, textAlign: 'left' }}>วันที่</th>
          <th style={{ ...head, textAlign: 'left' }}>ผล / comment</th>
          <th style={{ ...head, textAlign: 'center' }}>สรุป</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => {
          const g = it.group && it.group !== last ? it.group : null;
          last = it.group;
          const r = result(it);
          const c = it.na ? muted : INK;
          return [
            g && (
              <tr key={`g-${g}`}>
                <td colSpan={4} style={group}>
                  {g}
                </td>
              </tr>
            ),
            <tr key={it.key}>
              <td
                style={{
                  ...cellBase,
                  color: c,
                  paddingLeft: it.group ? 12 : 5,
                }}
              >
                {it.label}
              </td>
              <td style={{ ...cellBase, color: c }}>{it.na ? '' : dmy(it.date)}</td>
              <td style={{ ...cellBase, color: c }}>{it.na ? naText(it) : [it.comment, it.decision === 'fail' ? it.note : ''].filter(Boolean).join(' · ')}</td>
              <td
                style={{
                  ...cellBase,
                  textAlign: 'center',
                  color: r === 'ไม่ผ่าน' ? '#b91c1c' : c,
                  fontWeight: r === 'ไม่ผ่าน' ? 700 : 400,
                }}
              >
                {r}
              </td>
            </tr>,
          ];
        })}
      </tbody>
    </table>
  );
}

export function PreKtChecklistPaper({ pair, evaluator = 'นพ.สมเกียรติ วงศ์ไทย' }: { pair: PairChecklistDto; evaluator?: string }) {
  const rs = checklistSummary(pair.recipientItems);
  const ds = checklistSummary(pair.donorItems);
  const fails = [...pair.recipientItems.map((x) => ['Recipient', x] as const), ...pair.donorItems.map((x) => ['Donor', x] as const)].filter(([, x]) => x.decision === 'fail');
  const allPass = rs.pass === rs.total && ds.pass === ds.total;
  const sex = (s: string) => (s === 'male' ? 'ชาย' : 'หญิง');
  return (
    <A4Page>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <LogoBox />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12.5 }}>หน่วยปลูกถ่ายไต โรงพยาบาลมหาวิทยาลัยนเรศวร</div>
          <div style={{ fontSize: 19, fontWeight: 700 }}>Pre-KT evaluation check lists</div>
          <div style={{ fontSize: 11.5, color: '#374151' }}>Living donor kidney transplantation · ความพร้อมก่อนปลูกถ่ายไตของคู่ผู้รับ–ผู้บริจาค</div>
        </div>
        <div style={{ width: 118 }} />
      </Row>
      <div style={{ borderTop: `1px solid ${INK}`, margin: '2px 0' }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          rowGap: 2,
          columnGap: 16,
          fontSize: 12.5,
        }}
      >
        <span>
          <b>Recipient</b> {pair.recipient.name} · HN {pair.recipient.hn}
        </span>
        <span>
          อายุ {pair.recipient.age} ปี · {sex(pair.recipient.sex)} · กรุ๊ปเลือด {pair.recipient.bloodGroup}
          {pair.recipient.rh}
        </span>
        <span>
          <b>Donor</b> {pair.donor.name} · HN {pair.donor.hn}
        </span>
        <span>
          อายุ {pair.donor.age} ปี · {sex(pair.donor.sex)} · กรุ๊ปเลือด {pair.donor.bloodGroup}
          {pair.donor.rh} · {pair.donor.relation}
        </span>
        <span style={{ color: '#374151' }}>อัปเดตผลจาก iMed {thaiLong(pair.syncedAt)}</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          alignItems: 'start',
        }}
      >
        <Table title="1. Recipient" items={pair.recipientItems} />
        <Table title="2. Donor" items={pair.donorItems} />
      </div>
      <div style={{ fontSize: 12.5 }}>
        <b>
          สรุป Recipient: ผ่าน {rs.pass} · ไม่ผ่าน {rs.fail} · รอผล {rs.waiting} | Donor: ผ่าน {ds.pass} · ไม่ผ่าน {ds.fail} · รอผล {ds.waiting}
        </b>
        <div style={{ color: '#374151' }}>
          {allPass ? 'ผ่านครบทุกรายการ' : 'ยังไม่ผ่านครบ'}
          {fails.map(([side, x]) => ` · ${x.label} (${side}): ${[x.comment, x.note].filter(Boolean).join(' — ') || 'ไม่ผ่าน'}`).join('')}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ alignSelf: 'flex-end', textAlign: 'center', fontSize: 12.5 }}>
        <div>ลงชื่อ ........................................ แพทย์ผู้ประเมิน</div>
        <div>
          ({evaluator}) วันที่ {thaiLong(new Date().toISOString())}
        </div>
      </div>
      <Row style={{ fontSize: 10, color: muted, justifyContent: 'space-between' }}>
        <span>พิมพ์จากระบบ KT Follow-up · {thaiLong(new Date().toISOString())}</span>
        <span>หน้า 1/1</span>
      </Row>
    </A4Page>
  );
}
