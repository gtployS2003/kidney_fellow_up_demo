# Kidney Transplant Follow-up System — Demo (React + TypeScript)

เดโมหน้าจอฝั่ง **แพทย์และพยาบาล** ตามดีไซน์ใน Figma
ภายหลังหน้าจอนี้ยังเป็น React ส่วน middleware/backend จะเป็น **ASP.NET Core Web API แยกตาม module**

## วิธีรัน (Windows)

ต้องมี **Node.js 18 ขึ้นไป**

```bash
npm install
npm run dev        # เปิด http://localhost:5173
npm run build      # สร้างไฟล์ static ใน dist/ (ให้ ASP.NET Core เสิร์ฟได้)
```

## เครื่องมือที่ใช้

| ส่วน | ใช้ |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router 6 |
| Styling | Tailwind CSS 3 (สีเดียวกับ Figma — ดู `tailwind.config.js`) |
| Animation | Framer Motion (เปลี่ยนหน้า, การ์ดทยอยขึ้น, ตัวเลขนับขึ้น, แท็บ/ตัวเลือกเลื่อนแบบ layout, modal, sidebar พับ/ขยาย) — เคารพการตั้งค่า “ลดการเคลื่อนไหว” ของเครื่อง |
| Lottie | จะเพิ่มในรอบถัดไป (`@lottiefiles/dotlottie-react`) ที่ `components/ui/EmptyState.tsx` และ modal บันทึกสำเร็จ |
| ไอคอน | lucide-react |

## โครงสร้าง

```
src/
  types/              DTO ที่ใช้ร่วมกับ .NET (ตั้งชื่อให้ตรงกับ C# record)
  services/api/       จุดเชื่อมกับ backend — ตอนนี้ใช้ mock / ภายหลังเรียก Web API
    client.ts         ตั้งค่า base URL, fetch, mock delay
    recipientApi.ts   module Recipient  →  /api/recipients
  mocks/              ข้อมูลตัวอย่าง (ไม่ใช่ข้อมูลผู้ป่วยจริง)
  components/
    layout/           AppShell, Sidebar, Topbar, breadcrumb
    ui/               Button, Badge, Card, Form, Modal, Segmented, EmptyState ฯลฯ
  modules/            แยกตาม module ให้ตรงกับ backend
    recipient/        Dashboard, ลงทะเบียน, รายชื่อ, Patient Summary
    donor/            Dashboard, ลงทะเบียน, รายชื่อ, สรุปผู้บริจาค
    evaluation/forms/ ฟอร์มขั้นตอนย่อย (ใช้ร่วมผู้รับ/ผู้บริจาค) + Preview A4
    matching/         Dashboard, ค้นหา HLA, กำลังจับคู่, ส่งรายชื่อ, ประวัติ
    appointments/     ปฏิทินนัดหมาย
    reports/          หน้ารวมรายงาน + รายงานตัวอย่าง
  pages/              หน้าแรก (4 ปุ่ม) และหน้าชั่วคราว
public/legacy/        ไฟล์ HTML เดิม (Use case diagram, LIFF ผู้ป่วย/ผู้บริจาค, หน้าเก่า)
```

หน้าจอ **ไม่เรียกข้อมูลเอง** ทุกหน้าเรียกผ่าน `services/api/*`
เมื่อมี backend ให้ตั้งค่าใน `.env.local`:

```
VITE_USE_MOCK=false
VITE_API_BASE=/api
```

ตอน dev, Vite จะ proxy `/api` ไปที่ `http://localhost:5000` (แก้ได้ใน `vite.config.ts`)

## Endpoint ที่หน้าจอคาดหวัง

| Method | Path | ใช้ที่ |
|---|---|---|
| GET | `/api/recipients/dashboard` | Dashboard (การ์ดสรุป) |
| GET | `/api/recipients?search=&status=&caseType=` | Dashboard (Pipeline), รายชื่อ |
| GET | `/api/recipients/{id}` | Patient Summary |
| GET | `/api/recipients/{id}/forms/{key}` | ฟอร์มขั้นตอนย่อย (`counseling`, `currentTx`, `history`, `physical`, `plan`, `mrb`) |
| PUT | `/api/recipients/{id}/forms/{key}` | บันทึก (`completed=false` = ร่าง) |
| POST | `/api/recipients` | ลงทะเบียน (body = `RecipientCreateDto`) |

| GET | `/api/donors/dashboard` | Dashboard ผู้บริจาค |
| GET | `/api/donors?search=&status=&caseType=` | Dashboard (Pipeline), รายชื่อผู้บริจาค |
| GET | `/api/donors/{id}` | สรุปผู้บริจาค |
| POST | `/api/donors` | ลงทะเบียนผู้บริจาค (body = `DonorCreateDto` — ผูกกับ `recipientId`) |
| GET | `/api/matching/dashboard` | Dashboard จับคู่ |
| POST | `/api/matching/search` | ค้นหาด้วย HLA (body = `HlaQuery` — **ห้ามบันทึก**) |
| POST | `/api/matching/{recipientId}/start` | ยืนยัน · เริ่มจับคู่ (บันทึกผู้ยืนยัน + เวลา) |
| GET | `/api/matching/in-progress` | รายชื่อที่กำลังจับคู่ |
| POST | `/api/matching/{recipientId}/result` | บันทึกผลจากสภากาชาด (`received` / `notReceived` / `rejected` + เหตุผล) |
| GET | `/api/matching/history` | ประวัติการจับคู่ |
| GET | `/api/matching/send-list` · `/send-rounds` · POST `/send-rounds` | ส่งรายชื่อให้สภากาชาด |
| GET | `/api/matching/pairs` · PUT `/pairs/{pairId}` | Pre-KT checklist คู่ผู้บริจาคมีชีวิต (ผลจาก iMed + การตัดสินของแพทย์) |
| GET | `/api/appointments?from=&to=&personId=` | ปฏิทินนัดหมาย (นัดจาก iMed + นัดที่สร้างในระบบ) |
| POST · PUT · DELETE | `/api/appointments` · `/api/appointments/{id}` | สร้าง / แก้ / ลบ นัดที่สร้างในระบบ |
| GET | `/api/{recipients\|donors}/{id}/labs?date=` | ผลแล็บล่าสุดจาก iMed |
| GET | `/api/reports/{status\|waiting\|matching}` | รายงานตัวอย่าง |
| GET/PUT | `/api/donors/{id}/forms/{key}` | ฟอร์มผู้บริจาค (`donorCounseling`, `donorHistory`, `physical`, `plan`, `mrb`) |

> สถานะผู้ป่วยเปลี่ยนอัตโนมัติตามขั้นตอนที่เสร็จ — ให้ backend เป็นผู้คำนวณ หน้าจอแสดงผลอย่างเดียว

## ความคืบหน้า

- [x] รอบ 1 — โครงหลัก, layout, sidebar, component กลาง, mock, หน้าแรก 4 ปุ่ม
- [x] รอบ 2 — ผู้รับ: Dashboard, ลงทะเบียน, รายชื่อ, Patient Summary (แถบขั้นตอนคลิกได้ + navbar ขั้นตอนย่อย)
- [x] รอบ 3 — ฟอร์ม Evaluation 1.1–1.5, MRB, Preview A4 + Export (PDF/พิมพ์ ผ่านหน้าต่างพิมพ์, Word .doc)
- [x] รอบ 4 — ผู้บริจาค: Dashboard, ลงทะเบียน (ลงทะเบียนคู่ต่อจากผู้รับ), รายชื่อ, Summary + ฟอร์ม Evaluation ผู้บริจาค 1.1–1.4 และ MRB
- [x] รอบ 5 — จับคู่ผู้บริจาค: Dashboard, ค้นหาด้วย HLA (ไม่บันทึก HLA), กำลังจับคู่ (คู่มีชีวิต + สภากาชาด), ส่งรายชื่อให้สภากาชาด, ประวัติ
- [x] รอบ 6 — นัดหมาย (ปฏิทินเดือน + สร้าง/แก้นัด), ผลแล็บล่าสุด (แท็บในหน้าผู้รับ/ผู้บริจาค), รายงาน (8 รายการ “รอยืนยัน” + ตัวอย่าง 3 รายงาน)

## Preview / Export

- หน้า Preview (A4) อยู่ใน `src/modules/recipient/forms/*Form.tsx` ใช้ชิ้นส่วน `src/components/paper/Paper.tsx` (inline style)
- **PDF / พิมพ์**: เปิดหน้าต่างพิมพ์ของ browser → เลือก “Save as PDF” (CSS `@media print` ใน `index.css`)
- **Word**: ดาวน์โหลดเป็น `.doc` (HTML ที่ Word เปิดได้) — ภายหลังฝั่ง .NET สร้าง `.docx` ด้วย OpenXML ได้
- โลโก้โรงพยาบาลยังเป็นกรอบว่าง (`LogoBox`) — ใส่ไฟล์จริงภายหลัง

## แก้ไขหลังรอบ 6

- แก้หน้าว่าง/ค้างเมื่อกดเปลี่ยนหน้าเร็ว ๆ: เลิกใช้ `AnimatePresence mode="wait"` (รอ animation ขาออก) ทั้งระบบ — เหลือ animation ขาเข้าอย่างเดียว
- ย้ายโปรไฟล์ผู้ใช้ไปมุมขวาบน (เมนู: ข้อมูลส่วนตัว · เปลี่ยนรหัสผ่าน · ออกจากระบบ) และเพิ่มปุ่มพับ/ขยายเมนูซ้ายบน Topbar (จำสถานะไว้ในเครื่อง)
- หน้าผู้รับ/ผู้บริจาค: เพิ่มแท็บ **Timeline** และ **รายงานฟอร์ม** (รวมทุกฟอร์มเป็นรายการ พร้อมสถานะ · Preview/Export · เปิดฟอร์ม)

## เปิดผ่านเว็บ (GitHub Pages)

ทุกครั้งที่ push เข้า branch `main` — GitHub Actions (`.github/workflows/deploy.yml`) จะ build แล้ว deploy ให้อัตโนมัติ
เปิดได้ที่ `https://<github-user>.github.io/<ชื่อ-repo>/` เช่น `https://gtploys2003.github.io/kidney_fellow_up_demo/`

ตั้งค่าครั้งแรก (ครั้งเดียว): GitHub repo → **Settings → Pages → Build and deployment → Source = “GitHub Actions”**

- ตอน dev (`npm run dev`) ยังเปิดที่ `http://localhost:5173` ตามเดิม
- ควร commit `package-lock.json` ขึ้นไปด้วย (ให้เวอร์ชัน package ตรงกับเครื่อง dev)
- ข้อมูลทั้งหมดเป็น mock — บนเว็บก็ใช้งานได้ครบ แต่รีเฟรชแล้วข้อมูลที่บันทึกจะหาย
