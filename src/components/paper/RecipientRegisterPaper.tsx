import type { ReactNode } from 'react';
import type { DonorDetailDto, RecipientDetailDto } from '@/types';
import { Brand, Fld, Line, Opt, OptRow, Page, R, Title, MUTE } from './Sheet';
import { thaiDate } from '@/lib/format';

/**
 * แบบฟอร์มลงทะเบียน (ตามฟอร์มกระดาษของศูนย์ฯ)
 * - ผู้รับ: “แบบฟอร์มข้อมูลผู้ป่วยก่อนเข้ารับการปลูกถ่ายไต” 2 หน้า
 * - ผู้บริจาค: “Donor Registration Form” 1 หน้า + กรอบ Sticker
 * ช่องที่ระบบยังไม่ได้เก็บ (การศึกษา รายได้ ญาติ ฯลฯ) จะเป็นเส้นประว่างให้กรอกด้วยมือ
 */
type Base = { prefix: string; firstName: string; lastName: string; hn: string; age: number; bloodGroup: string; rh: string; nationalId?: string; birthDate?: string; address?: string; phone?: string };

const LW = 162;
const COL = 130;
const MARITAL = ['โสด', 'สมรส', 'หม้าย', 'หย่า'];
const EDU = ['ไม่มี', 'ประถมศึกษา', 'มัธยมศึกษา', 'ปวช.', 'ปวส.', 'อนุปริญญา', 'ปริญญาตรี'];
const JOB = ['ไม่มี', 'รับราชการ', 'รัฐวิสาหกิจ', 'ธุรกิจส่วนตัว/ค้าขาย', 'พนักงานเอกชน', 'นักเรียน/นักศึกษา'];
const COVER = ['เบิกราชการ', 'รัฐวิสาหกิจ', 'เบิกเอกชน', 'เบิกประกัน', 'หลักประกันสุขภาพ (30 บาทรักษาทุกโรค)', 'ประกันสังคม', 'จ่ายเอง'];

const opts = (list: string[]) => list.map((x) => <Opt key={x} label={x} w={x.startsWith('หลักประกัน') ? COL * 2 : COL} />);
const blank = (n: number, values: (string | undefined)[] = []) =>
  Array.from({ length: n }).map((_, i) => (
    <R key={i}>
      <Line value={values[i]} grow />
    </R>
  ));
/** แบ่งที่อยู่เป็นบรรทัด (ก่อนชื่ออำเภอ/จังหวัด) */
const addrLines = (a?: string) => {
  if (!a) return [];
  const i = a.search(/\sจ\./);
  return i > 0 ? [a.slice(0, i), a.slice(i + 1)] : [a];
};
const phones = (p1?: string) => (
  <>
    <R gap={0}>
      <span style={{ width: LW, flexShrink: 0 }}>หมายเลขโทรศัพท์</span>
      <Fld label="1." value={p1} grow />
    </R>
    <R gap={0} style={{ paddingLeft: LW }}>
      <Fld label="2." grow />
    </R>
  </>
);

function Head({ b, date, title, sub }: { b: Base; date: string; title: string; sub: string }) {
  return (
    <>
      <Brand />
      <Title sub={sub}>{title}</Title>
      <R gap={20} style={{ justifyContent: 'flex-end' }}>
        <Fld label="วันที่กรอกข้อมูล" value={thaiDate(date)} w={186} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          กรุ๊ปเลือด
          {['A', 'B', 'O', 'AB'].map((g) => (
            <Opt key={g} on={b.bloodGroup === g} label={g} />
          ))}
        </span>
      </R>
      <R>
        <Fld label="ชื่อ (นาย / นาง / นางสาว)" value={`${b.prefix}${b.firstName}`} grow />
        <Fld label="นามสกุล" value={b.lastName} grow />
      </R>
      <R>
        <Fld label="อายุ" value={String(b.age)} w={62} after="ปี" />
        <Fld label="HN" value={b.hn} grow />
      </R>
      <R>
        <Fld label="เชื้อชาติ" grow />
        <Fld label="สัญชาติ" grow />
      </R>
      <R>
        <Fld label="วันเดือนปีเกิด" value={b.birthDate ? thaiDate(b.birthDate) : ''} grow />
        <Fld label="อายุ" value={`${b.age} ปี`} w={112} />
      </R>
      <R>
        <Fld label="เลขบัตรประชาชน" value={b.nationalId} grow />
      </R>
      <div style={{ height: 3 }} />
      <OptRow label="สถานภาพ" labelW={LW}>{opts(MARITAL)}</OptRow>
      <OptRow label="ระดับการศึกษาสูงสุด" labelW={LW}>{opts(EDU)}</OptRow>
      <OptRow label="อาชีพ" labelW={LW}>
        {opts(JOB)}
        <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 5 }}>
          <Opt label="อื่นๆ" />
          <Line w={150} />
        </span>
      </OptRow>
      <div style={{ height: 3 }} />
      <R>
        <Fld label="รายได้ต่อเดือน" after="บาท" grow />
        <Fld label="รายจ่ายต่อเดือน" after="บาท" grow />
      </R>
      <R>
        <Fld label="เงินออมสำรองสำหรับค่าใช้จ่ายส่วนเกิน" after="บาท" grow />
      </R>
      <OptRow label="สิทธิการรักษา" labelW={LW}>{opts(COVER)}</OptRow>
      <div style={{ height: 3 }} />
      <div>ที่อยู่ที่สามารถติดต่อได้</div>
      {blank(3, addrLines(b.address))}
      {phones(b.phone)}
    </>
  );
}

function Relatives({ children }: { children?: ReactNode }) {
  return (
    <>
      <R>
        <Fld label="พี่น้อง (ไม่รวมท้องเดียวกัน)" w={74} after="คน" />
        <Fld label="บุตร" w={74} after="คน" />
      </R>
      {children}
      <R>
        <span>ญาติใกล้ชิดที่สามารถติดต่อได้</span>
        <Fld label="ชื่อ" grow />
        <Fld label="นามสกุล" grow />
      </R>
    </>
  );
}

export function RecipientRegisterPaper({ rec, date }: { rec: Base & Partial<RecipientDetailDto>; date: string }) {
  const donors = rec.intendedDonors ?? [];
  return (
    <>
      <Page gap={8}>
        <Head b={rec} date={date} title="Naresuan University Hospital Kidney Transplantation Registration Form" sub="แบบฟอร์มข้อมูลผู้ป่วยก่อนเข้ารับการปลูกถ่ายไต" />
        <div style={{ height: 3 }} />
        <Relatives />
        <div>ที่อยู่ญาติที่สามารถติดต่อได้</div>
        {blank(3)}
        {phones()}
      </Page>
      <Page gap={9}>
        <R style={{ justifyContent: 'space-between', fontSize: 12, color: MUTE }}>
          <span>แบบฟอร์มข้อมูลผู้ป่วยก่อนเข้ารับการปลูกถ่ายไต (ต่อ)</span>
          <span>
            ชื่อ {rec.prefix}
            {rec.firstName} {rec.lastName} · HN {rec.hn}
          </span>
        </R>
        <div style={{ height: 4 }} />
        <R gap={18} style={{ alignItems: 'center' }}>
          ท่านมีผู้ประสงค์จะบริจาคไตให้หรือไม่
          <Opt on={donors.length > 0} label="มี" />
          <Opt on={donors.length === 0} label="ไม่มี" />
        </R>
        <div>หากมีผู้ประสงค์จะบริจาคไต โปรดระบุ</div>
        {[0, 1, 2, 3].map((i) => {
          const d = donors[i];
          return (
            <R key={i} gap={10}>
              <span style={{ width: 16 }}>{i + 1}.</span>
              <Fld label="ชื่อ" value={d?.firstName} grow />
              <Fld label="นามสกุล" value={d?.lastName} grow />
              <Fld label="อายุ" w={44} after="ปี" />
              <Fld label="ความเกี่ยวข้อง" value={d?.relation} w={100} />
            </R>
          );
        })}
        <div style={{ height: 6 }} />
        <div>การบำบัดทดแทนไตที่ใช้ในปัจจุบัน</div>
        <R gap={28} style={{ alignItems: 'center', paddingLeft: 24 }}>
          <Opt on={rec.rrt === 'HD'} label="ฟอกเลือด" />
          <Opt on={rec.rrt === 'PD'} label="ล้างไตทางช่องท้อง" />
          <Opt on={rec.rrt === 'none'} label="ยังไม่ได้ฟอกเลือดหรือล้างไตทางช่องท้อง" />
        </R>
        <R>
          <Fld label="วันที่เริ่มการบำบัดทดแทนไต" value={rec.rrtStart ? thaiDate(rec.rrtStart) : ''} grow />
        </R>
        <div style={{ height: 6 }} />
        <R>
          <Fld label="ในกรณีที่ท่านได้รับการปลูกถ่ายไตมาก่อน เข้ารับการปลูกถ่ายไตวันที่" grow />
        </R>
        <R>
          <Fld label="โรงพยาบาล" grow />
        </R>
      </Page>
    </>
  );
}

export function DonorRegisterPaper({ d, date }: { d: Base & Partial<DonorDetailDto>; date: string }) {
  return (
    <Page gap={8}>
      <Head b={d} date={date} title="Naresuan University Hospital Kidney Transplantation Donor Registration Form" sub="แบบฟอร์มลงทะเบียนผู้บริจาคไต" />
      <div style={{ height: 3 }} />
      <R>
        <Fld label="ชื่อ นามสกุลของผู้รับไต" value={d.recipient?.name} grow />
      </R>
      <R>
        <Fld label="ความสัมพันธ์กับผู้รับไต" value={d.relation} grow />
      </R>
      <Relatives />
      {phones()}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 36, paddingTop: 18 }}>
        {['Sticker Recipient', 'Sticker Donor'].map((s) => (
          <div key={s} style={{ width: 224, height: 92, border: '1px solid #374151', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTE }}>
            {s}
          </div>
        ))}
      </div>
    </Page>
  );
}
